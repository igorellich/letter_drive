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
- `AppStateController.tsx`: состояние в `localStorage['eat_steak']` = `{diversEaten, diversTimeLeftSec}`.
- Кнопка «Дайверы 🏄» (`main.tsx:82`) активна **только** если `diversTimeLeftSec > 0`. Свежее время можно подсеять прямо в localStorage.
- `DiversScene.tsx`: дайверы убегают (target-пойнты + lerp), при попадании в радиус съедания (≈0.8) `diversEaten++`, дайвер телепортируется в (100,100,100) на ~1с.

## Тестирование в браузере (важное)
- `opencode-browser` (Browser MCP) нестабилен и в середине сессии может пропасть (инструменты `browsermcp_*` станут «unavailable»). Fallback: отдельный Chrome с `--remote-debugging-port=9222 --user-data-dir=<temp>`, драйвинг по CDP через Node (global WebSocket).
- **«Всё висит, ничего не двигается»**: это не баг игры — фоновое/перекрытое окно Chrome замораживает requestAnimationFrame. Лечится CDP `Page.bringToFront()` (повторять и в цикле погони).
- Управление акулой из CDP:
  - прямое: временно `window.__joy = joystickData` в `main.tsx`, затем ставишь `__joy.x/y/active` — двигается через ту же `ControlledMesh`; после — откатить.
  - через реальный вход: вычислить зону джойстика (`div` с `pointerEvents:auto`, width 200px), центр стика = `zone.left+100, zone.bottom-80`; слать синтетические `PointerEvent` (pointerId фиксированный, `buttons:1`) — nipplejs их принимает (`dataOnly` not set — front движется, vector считается).
  - проверка движения: читать `#shark-debug` (временный HUD) или позицию через временный `window.__sharkPos`.
- **Кандидат-баг**: в nipplejs 0.10.2 коллекция, судя по коду (`bindCollection` слушает только `dir/plain`), не всплывает `move` до `manager.on('move')`. `manager.trigger('move', …)` не дёргал app-хендлер в тестах. Джойстик реальным вводом может быть сломан — проверять/чинить при доработке.
- Синтетическая JS-инъекция через URL (`javascript:…`) в Chrome заблокирована; используй CDP `Runtime.evaluate`.
- Порт дев-сервера после нескольких стартов: проверяй свободные порты 5173–5175 перед подключением.

## Скины акулы (пикер и «подгонка размеров») — СТАТУС 2026-08-29 (незавершено)
Задача: пикер скинов (готов) + подгонка 10 новых `.glb`-скинов к эталону классической акулы (размер/ориентация/центр).

### Эталон и конвенции
- Классическая (classic) акула: raw fileWorld size `(248.72, 580.83, 255.81)`, center `(0, −5.64, −0.65)`. При `scale 0.003` + rotation `[π/2, π, 0]` (three.js «XYZ») даёт group-local box `[0.7462, 0.7674, 1.7425]`, center `[0, −0.0019, −0.0169]`. **Target maxDim (бо́льшая из осей после трансформа) = 1.7425.**
- Конвенция осей: game forward = мировой +Y, up = +Z. Камера `PerspectiveCamera [0,0,5]`, форвард −Z. У классики самая длинная ось (Z≈1.74) — это ВЫСОТА (спинной плавник), НЕ длина. Длина нос-хвост ≈ 0.767 вдоль +Y.
- Анатомия моделей: shark нос = raw +Z (глаза/зубы на z≈121), движение вперёд без потери = nose→мир +Y. dinos (trex/triceratops): нос +Z, up +Y. whale нос +X, up +Y. octopus/ufo/robot: up +Y. hamburger/donut: плоскость, up = Z. rocket: длинная ось raw Y, tip +Y.
- Проверка конвенции three 0.182.0 (euler «XYZ»): классическая quat `[0,0.707,0.707,0]` = euler `[−π/2,0,−π]`; raw +X→мир (−1,0,0), +Y→(0,0,1), +Z→(0,1,0).

### Вычисленные трансформы (compute2.mjs, реальный three; уже записаны в `sharkSkins.ts` gameplay)
format: id: `scale`, `rotation`, `position`
- hamburger: `0.13686`, `[0,0,π/2]`, `[0.6961, −0.0009, 0.0095]`
- donut: `0.17409`, `[0,0,π/2]`, `[0.3786, 0.0004, −0.0144]`
- octopus: `0.00331`, `[−π/2,0,π/2]`, `[−0.5541, 0.0356, −0.0169]`
- whale: `1.55519`, `[−π/2,0,π/2]`, `[−0.1718, 0.3411, −0.2798]`
- triceratops: `0.07741`, `[−π/2,0,−π]`, `[0, 0.0816, −0.3071]`
- trex: `0.05616`, `[−π/2,0,−π]`, `[0, 0.0591, −0.4442]`
- ufo: `0.00411`, `[−π/2,0,π/2]`, `[0.1191, −0.0019, −0.0169]`
- robot: `0.26327`, `[−π/2,0,−π]`, `[−0.0007, 0.0022, −0.6216]`
- rocket: `1.29208`, `[0,0,0]`, `[0.0115, −0.3779, −0.0138]`
- duck: `0.24329`, `[−π/2,0,−π]`, `[0, −0.0019, −0.7143]`
- Код в `src/components/puzo_shark/skins/sharkSkins.ts`: добавлено необяз. `position` в `gameplay`, `fitSize` у новых скинов УБРАН (превью использует gameplay-rotation, WYSIWYG).

### НАЙДЕННЫЕ БАГИ (причины расхождения расчёт ↔ «измеренный в браузере»)
1. **`position` не прокидывается в игру**: и в `DiversScene.tsx` (строки ~171–178), и в `Scene.tsx` (~115–121) `<Shark …>` передают только `rotation`/`scale`/`fitSize`, НО НЕ `position`. В `Shark.tsx` дефолт `[0,0,0]`. → Чинить: добавить `position={skin.gameplay.position}` в ОБА монтирования.
2. **Хук `window.__skinBox` в `Shark.tsx` НЕПРАВИЛЬНЫЙ** (даёт левые размеры): `scene.clone(true)` копирует уже применённые R3F-пропсы (scale/то и противотрансформы sit) на корень gltf-сцены, а затем хук дополнительно применяет `holder.scale.setScalar(effectiveScale)` → **двойной scale**. Пример: donut замер 0.30 вместо 1.74 (1.74×0.174). Все цифры `cdp_measure_skins.js` — с этого хука (двойной scale + перепутанные оси) — НЕ ДОВЕРЯТЬ.
3. **Rotation на самом деле работает**: verify — живой бокс показывал swap осей (x∋0.74=raw y, y∋1.71=raw x) ⇒ euler z=+π/2 применился. Пробник «цепочка родителей» не печатал rotation у подуровней — не смущаться, если не видно.
4. Ранние провалы `cdp_tree2`/«loaded:false» — гонка: ждать кнопку «Дайверы 🏄», кликать, затем поллить `window.__threeScene` и кожу.

### Правильный метод измерения в браузере (подтверждён)
- Временный хук в `DiversScene.tsx`: `window.__threeScene = useThree(s=>s.scene)`; `window.__three = THREE` (импорт `useThree` из `@react-three/fiber`). Типы — `window` через `Record<string, unknown>`.
- Метод: `sceneObj.children[3]` = мировой контейнер (в нём плоскость воды + shark). Для поддерева шарка: каждый mesh `o`, `rel = inv(ch.matrixWorld) * o.matrixWorld`, разложить через `decompose(pos,quat,scl)` (в r182 нет `getPosition/getScale` у Matrix4), применить к углам `geometry.boundingBox` — получить group-local union box. Так donut дал верный `[0.74, 1.71, 1.7425]` центр z≈0.30 (с группами [0,0,0.45] и [0,0,−0.15]).
- Дайверы (= top children 4..18) в мировой системе имеют огромные координаты (сотни тысяч) — при расчёте суб-дерева НЕ использовать `getWorldPosition`, только `rel`-матрицу.
- Скрипты: `Temp\opencode\cdp_tree5.js` (суб-дерево шарка, верный замер), `cdp_probe9.js` (цепочка родителей/матрицы), `cdp_tree4.js` (весь top), `cdp_measure_skins.js` (НЕ ДОВЕРЯТЬ — читал `__skinBox`).
- Node-математика: `Temp\opencode\compute2.mjs` (итоговые трансформы), `measure_glb.js` (raw box через accessor min/max, работает и для draco — у draco в JSON есть min/max), `isolate.mjs`, `node_dump.mjs`, `joints.mjs`. three подключать `file:///E:/threejs/letter_drive/node_modules/three/build/three.module.js`.

### TODO (на будущее)
1. Прокинуть `position` в `<Shark/>` в `Scene.tsx` и `DiversScene.tsx`.
2. Удалить/починить `__skinBox`-хук в `Shark.tsx` и `__threeScene`-хук в `DiversScene.tsx` (перед сдачей — обязательно).
3. Прогнать замер по методу cdp_tree5 для ВСЕХ 10 скинов (не через `__skinBox`): сравнить size maxDim=1.7425, центр (0,−0.0019,−0.0169) group-local. Для trex/triceratops учёт: rest-поза анимации может давать ±небольшую дельту против bind-pose.
4. Проверить направление «носа» каждого скина (растёт ли мир +Y при движении вперёд без отличий).
5. `npm run build` (tsc+vite) зелёный на 2026-08-29; `npm run lint` по репо сломан pre-existing, файлы скинов при этом чистые.

## Полезные файлы
- `src/main.tsx` — App, `joystickData`, выбор режима, пауза/fullscreen.
- `src/components/puzo_shark/ControlledMesh.tsx` — движение акулы.
- `src/components/puzo_shark/Joystick.tsx` — ввод.
- `src/components/puzo_shark/Scene.tsx` / `DiversScene.tsx` — режимы.
- `src/components/puzo_shark/food/AppStateController.tsx` — localStorage.
- `src/components/puzo_shark/hud/TimerSceen.tsx` — таймер дайверов (пишет в localStorage каждую секунду).