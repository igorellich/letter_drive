import type { IQuestion, ITest } from "./interfaces";

// Подсказки для понятного детям заголовка темы по типу вопросов
const THEME_HINT: Array<[RegExp, string]> = [
  [/\bреши уравнени/i, 'Уравнения'],
  [/\b(вычисли|сколько будет|посчитай|найди произведение|найди частное)\b/i, 'Счёт в уме'],
  [/\bнайди (значение|сумму|разность|целую и дробную части|площадь|периметр)\b/i, 'Значение выражений'],
  [/\bсравни\b/i, 'Сравнение'],
  [/\b(задача|сколько всего|стоят|стоил|ученик|тетрад|зорной|масса|длин|ширин)\b/i, 'Задачи'],
  [/\bупрости\b/i, 'Упрощение'],
]

export function themeTitle(questions: IQuestion[]): string {
  const counts: Record<string, number> = {}
  for (const q of questions) {
    const t = q.question.toLowerCase()
    for (const [re, name] of THEME_HINT) {
      if (re.test(t)) { counts[name] = (counts[name] || 0) + 1; break }
    }
  }
  let best = 'Тренировка', bestN = 0
  for (const [name, n] of Object.entries(counts)) {
    if (n > bestN) { bestN = n; best = name }
  }
  return best
}

// Разбивка банка вопросов на темы по ~10-15 вопросов (в каждой теме >= 10).
function splitSizes(total: number): number[] {
  const maxChunks = Math.floor(total / 10)
  const m = Math.max(1, Math.min(maxChunks, Math.round(total / 12)))
  const sizes: number[] = []
  let left = total
  for (let k = 0; k < m; k++) {
    const size = Math.ceil(left / (m - k))
    sizes.push(size)
    left -= size
  }
  return sizes
}

// Банк вопросов (например, четверть) -> несколько тем, каждая >= 10 вопросов.
// Заголовки тем угадываются по типу вопросов («Счёт в уме», «Задачи» и т.п.).
export function partitionIntoThemes(questions: IQuestion[]): ITest[] {
  const sizes = splitSizes(questions.length)
  const out: ITest[] = []
  let i = 0
  for (let k = 0; k < sizes.length; k++) {
    const chunk = questions.slice(i, i + sizes[k])
    i += sizes[k]
    const title = sizes.length > 1 ? `${themeTitle(chunk)} ${k + 1}` : themeTitle(chunk)
    out.push({ title, questions: chunk })
  }
  return out
}

// Простая обёртка: тема из готового блока вопросов (не режет).
export function themeFromBank(title: string, questions: IQuestion[]): ITest {
  return { title, questions }
}