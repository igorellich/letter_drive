# letter_drive — заметки для разработки и тестирования

Игра «🦈 Ешь стейк!»: R3F + Vite + Частично nipplejs. Акула ест «стейки» (ответы на вопросы теста) или гоняется за дайверами.

## Запуск и проверка
- dev: `npm run dev` (Vite `--host`). Порт 5173; при занятости сам уходит на 5174/5175+.
- lint: `npm run lint`; typecheck+build: `npm run build` (`tsc -b && vite build`).
- Тесты: vitest (`@vitest/ui` в devDeps), покрытие мелкое — чаще проверяй в браузере.

## Архитектура управления акулой
- `src/main.tsx:16` — `joystickData = {x,y,active}` — mutable-объект, живёт в App и передаётся в сцены по ссылке (никаких re-render).
- `Joystick.tsx` — nipplejs (static, угол 200×200 внизу справа). Пишет `joystickData` прямо из событий `move`/`end`.
- `ControlledMesh.tsx` `useFrame` (строки ~59–133) — единственный «двигатель»:
  - если `joystickData.active`: `targetPos += vector * 10 * delta`; поворот `atan2(x,y)` вокруг Z;
  - позиция `lerp(targetPos, 0.3)`, вращение `slerp(0.4)`;
  - clamp к границам `[-width/2+0.5, width/2-0.5]` и т.д.;
  - анимация плавания: timeScale 11 при движении, 0.6 в покое.
- Физики нет: Rapier в зависимостях НЕ используется для акулы.
- Камера — `useFollowingCamera` (lerp к sharkRef).

## Режимы и «гейт» на дайверов
- Тесты (`Scene.tsx`): из 10 вопросов >7 правильных => `diversTimeLeftSec += 30` (60 при 10/10).
- `AppStateController.tsx`: состояние в `localStorage['eat_steak']` = `{diversEaten, diversTimeLeftSec, coins, ownedSkins}` (getState мигрирует старое хранилище, по умолчанию `coins:0`, `ownedSkins:['classic']`).
- Кнопка «Дайверы 🏄» (`main.tsx:82`) активна **только** если `diversTimeLeftSec > 0`. Свежее время можно подсеять прямо в localStorage.
- `DiversScene.tsx`: дайверы убегают (target-пойнты + lerp), при попадании в радиус съедания (≈0.8) `diversEaten++`, дайвер телепортируется в (100,100,100) на ~1с.
- Поедание дайвера (2026-08-30): кроме взрыва `EatFx` — ещё и брызги частиц `food/DiverEatParticles.tsx` (THREE.Points, 80 частиц orange/cyan, разлёт + затухание ~0.6с). Вызывается через `eatParticlesRef.burstAt(p)` в **useFrame** DiversScene (в блоке обработки `eaten`), а НЕ в `onEaten`: useFrame в тот же кадр обнуляет `eaten` и телепортирует дайвера, поэтому колбэк `onEaten` из FoodManager (ищет `eaten===true`) не успевает сработать — награды/эффекта не было. Счётчик съеденных дайверов в сцене и в `MainMenu.tsx` — эмодзи 🤿 (не 🐟).

## Экономика (2026-08-29): монеты и покупка скинов
- Цепочка: тест → время дайверов → ловля дайверов → монеты → покупка скинов.
- Константы в `src/components/puzo_shark/food/economy.ts`: `COINS_PER_DIVER=1`, `TEST_TIME_REWARD_GOOD=30`, `TEST_TIME_REWARD_PERFECT=60`, `BONUS_TIME_REWARD=5` (награда за съеденную рыбку-«приманку» без вопроса). Цены скинов — поле `price` в `sharkSkins.ts` (classic=0, далее 50–120).
- Модель: ~6 тестов за 20 мин → ~3 мин ловли → ~25–30 монет/день → скин (среднее ~79) раз в ~2,5–3 дня.
- `localStorage['eat_steak_skin']` — выбранный скин; `loadSkinId()` отдаёт сохранённый только если он в `ownedSkins`.
- `SkinPicker.tsx`: купленные скины чип «✓», некупленные — «🪙 цена · название» (клик покупает, если хватает); `buySkin` в `main.tsx` списывает монеты и сохраняет. balance живёт в App-состоянии и в localStorage.

## Известные фиксы (2026-08-30)
- **Белый экран при входе в тест** (React 19): `Loader.tsx` — Fallback Suspense внутри Canvas. Раньше использовал drei `useProgress()` (zustand-подписка через DefaultLoadingManager), который синхронно вызывал `set()` во время render на cold-load моделей → «Cannot update a component (Loader) while rendering a different component». Теперь статичная панель с CSS `ldr-slide`, без подписки на прогресс.
- **Сериализация поедания**: `FoodManager.tsx` `canEat` раньше был `eaten.length===0` — съеденная и уже отвеченная рыбка блокировала поедание, создавая «мёртвую зону» ~1.5с. Теперь `!foodItems.some(i => i.eaten && i.right!==true && i.right!==false)` (блокирует только НЕотвеченный вопрос).
- **Бонус-рыбка** (без вопроса, 4 шт/раунд): даёт +5 сек дайверам (`BONUS_TIME_REWARD`); награда показывается тостом `hud/RewardToast.tsx` («+5 сек! ⏰»), самопропадает ~1.6с. Грант в `Scene.tsx onEaten` через AppStateController.
- **Дубликаты id рыбок**: `useFoodItemsGridSpawner.ts` id = `${question}__${index}` — иначе совпадающие тексты вопросов ломали `onEat` find/React keys.

## Тестирование в браузере (важное)
- `opencode-browser` (Browser MCP) нестабилен и в середине сессии может пропасть (инструменты `browsermcp_*` станут «unavailable»). Fallback: отдельный Chrome с `--remote-debugging-port=9222 --user-data-dir=<temp>`, драйвинг по CDP через Node (global WebSocket).

### opencode-browser (Browser MCP) — как пользоваться
- **Что это**: плагин `opencode-browser` + MCP-сервер `@browsermcp/mcp@0.1.3`, подключён через MCP (`mcp.browsermcp`, `type: "cdp"`, порт 9222). Это «Chrome Control Tool»: драйвит реальный Chrome через CDP. Инструменты называются `browsermcp_*`.
- **ГЛАВНОЕ ПРАВИЛО**: у нас модель без поддержки чтения изображений — `browsermcp_screenshot` вернёт «Cannot read image». Скриншоты делай только если партнёр-человек просит их посмотреть. Всю отладку веди через снапшот-текст, `browsermcp_extract` и CDP `Runtime.evaluate` (числа — только так).

#### 1. ПОДГОТОВКА (делать всегда, в этом порядке)
1. **Dev-сервер**: `npm run dev` (Vite, `--host`). Дефолтный порт 5173, при занятости уходит на 5174/5175+ — смотри лог Vite. Если сервер уже запущен кем-то другим (например, был поднят «в фоне» через Shell и убит по таймауту — Vite продолжает жить), НЕ запускай второй раз, определи порт: `Get-NetTCPConnection -LocalPort 5173,5174,5175 -State Listen` или `netstat -ano | findstr 517`.
2. **Chrome под CDP** (отдельный профиль, порт 9222). Команда через PowerShell `&` (НЕ через `start` — он не парсит аргументы!):
   ```
   & "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\Users\Admin\AppData\Local\Temp\opencode\chrome_profile" --new-window
   ```
   Профиль-папку создать не надо — Chrome создаст сам. Проверка, что CDP жив:
   ```
   Invoke-RestMethod http://localhost:9222/json/version   # должен вернуться JSON с версией Chrome
   ```
   Если `ERR` — Chrome не поднят/порт занят → повтори запуск.
3. **Перейти на игру**: открой `http://localhost:PORT` в этом Chrome.

#### 2. РАБОТА ЧЕРЕЗ `browsermcp_*` (если работает)
- **Проверить доступность**: сначала сделай `browsermcp_snapshot` или MCP list («unavailable»/«No connection to browser extension» → см. п.4).
- **Базовые инструменты** (имена слегка разнятся по версии — сверься с MCP list):
  - навигация: `browsermcp_navigate` (прямой URL предпочитай клик-флоу);
  - снапшот дерева: `browsermcp_observe_snapshot` / `browsermcp_snapshot` — кнопки, тексты, ref-области для кликов;
  - клик: `browsermcp_click` (ref строго из снапшота); ввод: `browsermcp_type`; ожидание: `browsermcp_wait`;
  - извлечение: `browsermcp_extract`; консоль: `browsermcp_browser_get_console_logs`.
- **Режим одной вкладки**: сервер работает с активной вкладкой — переиспользуй текущую, не плоди новые (быстрее и стабильнее).
- **Рабочий флоу для этой игры**:
  1. `browsermcp_navigate` http://localhost:PORT → снапшот (главное меню: кнопки «2 класс», «Дайверы 🏄», «Скин акулы 🎨»).
  2. Если надо открыть «Дайверы 🏄» — кнопка активна только при `diversTimeLeftSec > 0`; подсеять время через CDP (см. п.3-пример).
  3. Клик нужного скина в пикере → снапшот (проверить превью) → клик «Дайверы 🏄»/«Тесты» → снапшот игрового экрана.
  4. Числовую верификацию (боксы, позиции, движение) — ТОЛЬКО CDP-скриптами с временными хуками (`window.__threeScene`, `window.__three`), НЕ из снапшотов/скриншотов.
- **Известные грабли при работе через MCP**:
  - MCP может отвалиться в середине сессии (`browsermcp_*` → «unavailable» или «No connection to browser extension»). Лечение: перезапуск CDP-Chrome (убить процесс Chrome с этим профилем, поднять заново). При упорных отказах — сразу fallback на CDP-скрипты (п.4), для долгих циклов они надёжнее.
  - «No connection to browser extension» также означает, что в Chrome не нажата кнопка Connect у расширения Browser MCP (нужен человек): кликнуть иконку расширения → Connect. Инструментами это не решить.
  - «Всё висит, ничего не двигается» — фоновое/перекрытое окно Chrome замораживает requestAnimationFrame (это НЕ баг игры). Окно должно быть на виду/поверх. Лечится CDP `Page.bringToFront()` (повторять и в цикле погони).
  - Синтетическая JS-инъекция через URL (`javascript:…`) в Chrome заблокирована — только CDP `Runtime.evaluate`.
  - Порт дев-сервера после нескольких стартов: проверяй занятость 5173–5175, прежде чем подключаться.

#### 3. FALLBACK: CDP-скрипты через Node — ОСНОВНОЙ ИНСТРУМЕНТ ОТЛАДКИ
Когда `browsermcp_*` недоступен или нужно управляться в цикле/числами — используем хелпер:
`Temp\opencode\cdp.js` (Node ≥22, глобальный WebSocket, запуск через `& "C:\Program Files\nodejs\node.exe" ...`).
- Хелпер сам находит вкладку `page` (любой URL на http) в Chrome на 9222 и подключается к её WS. Не требует правок в игре.
- Команды:
  - `cdp.js snapshot` — bringToFront + текст страницы (title/url/кнопки/первые 1500 символов body).
  - `cdp.js nav http://localhost:5173` — перейти на URL (ждёт 3с).
  - `cdp.js eval "<JS>"` — выполнить JS на странице, вывести `JSON.stringify` результата. Эквивалент `Runtime.evaluate` с `returnByValue` и `awaitPromise`.
  - `cdp.js clickbtn "Дайверы"` — клик по кнопке, текст которой содержит подстроку (возвращает ok/найденные кнопки).
  - `cdp.js screenshot` — сохранить PNG в `Temp/opencode/shot.png` (читать моделью НЕЛЬЗЯ, только для человека).
  - `cdp.js urls` — список вкладок Chrome (type/url), когда нужная страница не в активной вкладке.
- Подготовка стейта для «Дайверы 🏄»:
  ```
  cdp.js eval "localStorage['eat_steak']=JSON.stringify({diversEaten:0,diversTimeLeftSec:9999}); 'ok'"
  cdp.js eval "location.reload(); 'ok'"
  ```
- Пример: попал в сцену → `eval "typeof window.__threeScene !== 'undefined'"` → true, значит хук на месте и можно мерить скины (метод в секции «Скины акулы»).
- Если хелпера нет (папка `Temp\opencode` пуста/удалена) — напиши его заново по описанию выше; алгоритм единый: GET `http://localhost:9222/json/list` → найти tab c type `page` и url-префиксом http → `new WebSocket(tab.webSocketDebuggerUrl)` (глобальный в Node 22) → слать `{id, method:"Runtime.evaluate", params:{expression, returnByValue, awaitPromise}}` → сопоставлять ответы по id.

#### 4. УПРАВЛЕНИЕ АКУЛОЙ ИЗ CDP
- **Прямое**: временно `window.__joy = joystickData` в `main.tsx`, затем через eval ставишь `__joy.x/y/active` — движения идут через ту же `ControlledMesh`. После — откатить.
- **Через реальный вход**: вычислить зону джойстика (`div` с `pointerEvents:auto`, width 200px), центр стика = `zone.left+100, zone.bottom-80`; слать синтетические `PointerEvent` (pointerId фиксированный, `buttons:1`) — nipplejs их принимает (`dataOnly` not set — front движется, vector считается).
- **Проверка движения**: читать `#shark-debug` (временный HUD) или позицию через временный `window.__sharkPos`.
- **Кандидат-баг**: в nipplejs 0.10.2 коллекция, судя по коду (`bindCollection` слушает только `dir/plain`), не всплывает `move` до `manager.on('move')`. `manager.trigger('move', …)` не дёргал app-хендлер в тестах. Джойстик реальным вводом может быть сломан — проверять/чинить при доработке.

## Скины акулы (пикер и «подгонка размеров») — СТАТУС 2026-08-29
Задача: пикер скинов (готов) + подгонка 10 `.glb`-скинов под gameplay-размер и превью в пикере.

### Целевой размер (итог, исправлен)
- Реальный дайвер в мире = **0.416** (raw 1.981 × scale 0.21 в `Diver.tsx`).
- **Целевой размер скина = 1.5 × дайвера = 0.624** (maxDim после gameplay-трансформа). Проверено в браузере: whale sharkMax=0.624, diverMax=0.416, ratio=1.5 ✓. Ранее ошибочно целились в 1.7425 — исправлено.
- Классика (эталон): scale 0.003, rotation `[π/2, π, 0]` (three.js euler «XYZ»).
- Конвенция осей в игре: forward = мировой +Y, up = +Z (левосторонняя). Камера игры `PerspectiveCamera [0,0,5]`.

### Gameplay-трансформы (актуальные, записаны в `sharkSkins.ts`)
format: id: `scale`, `rotation`, `position`
- classic: `0.003`, `[π/2, π, 0]`, без position
- hamburger: `0.04901`, `[π/2, π/2, 0]`, `[0.00945, −0.00151, −0.26618]`
- donut: `0.06234`, `[π/2, π/2, 0]`, `[0.00091, −0.00105, −0.15249]`
- octopus: `0.00118`, `[π/2, π/2, 0]`, `[0.01344, −0.0019, 0.18152]`
- whale: `0.55694`, `[π/2, π/2, 0]`, `[0.12284, 0.09226, 0.04462]`
- triceratops: `0.02772`, `[−π/2, 0, −π]`, `[0, 0.02801, −0.12082]`
- trex: `0.02011`, `[−π/2, 0, −π]`, `[0, 0.01996, −0.16991]`
- ufo: `0.00147`, `[π/2, π/2, 0]`, `[0, −0.0019, −0.05954]`
- robot: `0.09428`, `[−π/2, 0, −π]`, `[−0.00026, −0.0004, −0.23346]`
- rocket: `0.46272`, `[0, 0, 0]`, `[0.00411, −0.13656, −0.01577]`
- duck: `0.08712`, `[−π/2, 0, −π]`, `[0, −0.0019, −0.26664]`

### Превью в пикере (`SkinPreview.tsx`)
- НЕ использует gameplay-rotation: своя `preview.rotation` (модель «стоит», up→+Y экрана, нос→+Z к камере); `fitSize` у новых скинов УБРАН.
- Камера фиксирована `[4.5, 2.2, 4.5]` (сбоку на уровне глаз, НЕ снизу), target `[0,0,0]`, FOV 45.
- Автоподгонка: три `Bounds` УБРАН (он ставил камеру под модель y=−1.6 → «видно снизу»). Вместо него `useFrame`: пока maxDim(rootRef) ≠ FIT_SIZE — сброс holder scale/pos, измерение raw-бокса `innerRef`, `scale=FIT_SIZE/maxDim`. Самопочиняется при async-загрузке glTF/draco (`useLayoutEffect` ловил пустой/недогруженный бокс — источник «what случилось с масштабом»).
- FIT_SIZE=3; OrbitControls autoRotate, enablePan=false.
- Иерархия: `<rootRef><group ref={holder}><group ref={innerRef} rotation=preview{cam}/><primitive scene/></group></group>`.

### Анатомия/конвенции моделей
- shark нос = raw +Z; dinos (trex/triceratops) нос +Z, up +Y; whale нос +X, up +Y; octopus/ufo/robot up +Y; **hamburger/donut — плоскость, толщина/«стопка» вдоль raw Y** (лежат плашмя, ротация `[π/2,π/2,0]`); rocket длинная ось raw Y, tip +Y.
- three 0.182 euler «XYZ».

### Измерение скинов в браузере (метод)
- Временные хуки (`window.__threeScene=useThree(s=>s.scene)`, `window.__three=THREE`) в `DiversScene.tsx`; числа — ТОЛЬКО через CDP `Runtime.evaluate` (снапшоты/скриншоты не для чисел).
- Метод: `sceneObj.children[3]` = мировой контейнер (вода + shark). Для суб-дерева шарка: `rel = inv(ch.matrixWorld) * o.matrixWorld` → `decompose` (в r182 нет getPosition/getScale у Matrix4). Дайверы в мировой системе — сотни тысяч: только rel.
- Скрипты: `Temp\opencode\cdp_tree5.js` (верный замер), `cdp_measure_skins.js` — НЕ ДОВЕРЯТЬ (читал битый `__skinBox`, двойной scale). Node: `compute2.mjs`, `measure_glb.js` (box через accessor min/max, работает и для draco), three через `file:///E:/threejs/letter_drive/node_modules/three/build/three.module.js`.

### Сделано / TODO
- [x] `position` прокинут в `<Shark/>` в `Scene.tsx` и `DiversScene.tsx` (d861dd5).
- [x] Убраны debug-хуки `__skinBox`/`__threeScene`/`__previewCam`/`__joy` (grep чистый по репо).
- [x] Камера gameplay: `useFollowingCamera` offset `[0, −1.8, 3.6]` — мягкий наклон, камера сзади-выше акулы (проверено: camera pos ~[0,−1.8,3.45], rot x≈0.464).
- [x] `npm run build` (tsc+vite) зелёный; `npm run lint` по репо сломан pre-existing, файлы скинов при этом чистые.
- [ ] Проверить направление «носа» каждого скина в gameplay (мир +Y при движении вперёд без отличий).

## Дизайн (2026-08-30): kid-стиль для детей 1–5 классов
- Главный экран = большое игровое меню: `hud/MainMenu.tsx` (чип монет + 3 кнопки-иконки 📚 Тесты / 🏄 Дайверы / 🎨 Скины); выбор теста отдельным экраном с кнопкой 🏠.
- Общие токены в `hud/kidStyle.ts`: градиенты (GRAD_TESTS/DIVERS/SKINS/GOOD/RED/GOLD), `panelCard`, `coinChip`, `pill()`, `backChip`, `ANSWERS_COLORS`.
- `QuestionLabel`: карточка вопроса + цветные варианты (палитра ANSWERS_COLORS; ✅/❌ при ответе), фикс `height: '100vw'` → `'100vh'` (в ландшафте больше не выступает за экран).
- `TestEndScreen`: эмодзи-итог (🏆/🎉/💪) + «🎁 Награда: +N сек дайверов!», кнопка «📚 К тестам».
- `TimerSceen`: часы «⏰ mm:ss» по центру сверху; `ProgressScale` — пилюли; `Loader` — 🦈 + градиент; `Joystick` — кольцо-подсказка и цвет #00d2ff; пикер скинов — эмодзи скинов на чипах; пауза — большие пилюли ▶ / 🏠.
- Размеры синхронно: реальный дайвер 0.416, target-размер скина 0.624 (=1.5×), checked в браузере.

## Полезные файлы
- `src/main.tsx` — App, `joystickData`, выбор режима, пауза/fullscreen.
- `src/components/puzo_shark/ControlledMesh.tsx` — движение акулы.
- `src/components/puzo_shark/Joystick.tsx` — ввод.
- `src/components/puzo_shark/Scene.tsx` / `DiversScene.tsx` — режимы.
- `src/components/puzo_shark/food/AppStateController.tsx` — localStorage.
- `src/components/puzo_shark/hud/TimerSceen.tsx` — таймер дайверов (пишет в localStorage каждую секунду).

## Банк вопросов 3 класса (2026-08-30): генераторы и объём
- Итог ~3800+ вопросов в `tests/grades/3grade/subjects/` (математика 1912, русский 807, английский 605, чтение 331, мир 193). Каждая тема ≥10 (нужно для `Scene.tsx` slice(0,10)); цель ~100 в теме, у фактоидных тем (чтение/мир) меньше — допустимо.
- **Генераторы** (CommonJS `.js`, запуск `node <файл>`; регенерируют файлы тем на месте, дедуп по `question`, обрезка до 100):
  `Temp\opencode\genmath.js`, `genenglish.js`, `genrussian.js`, `genreading.js`, `genworld.js`.
- Формат темы: `export default { "title": "...", "questions": [{question, variants[4], answer[1]}] }`; файлы-импорты: `threeMath/threeRussian/...`; `index.ts` в каждой папке предмета агрегирует темы по четвертям (структура уже переписана, при пересоздании файлов сохранять имена тем).
- Математика — статический банк (не runtime-генератор), гуманитарные — шаблонная генерация по спискам слов/фактов.
- Вопросы содержат русскую графику ««»» и эмотикон 🦈 в UI; в генераторах не использовать эмодзи в тексте вопроса.
- При регенерации следить за количеством в темах: цель ≥10 минимум (лучше 70–100); добавлять списки слов/фактов, если тема «худая».