export interface TablesConfig {
  selectedTables: number[]
}

export interface TableQuestion {
  a: number
  b: number
  answer: number
}

export interface TablesSession {
  questions: TableQuestion[]
  currentIndex: number
  correct: number
  wrong: number
  wrongQuestions: TableQuestion[]
}

const CONFIG_KEY = 'bliep_tables_config'
const DEFAULT_CONFIG: TablesConfig = { selectedTables: [2, 5, 10] }

export function loadTablesConfig(): TablesConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return DEFAULT_CONFIG
    const parsed = JSON.parse(raw) as TablesConfig
    return parsed.selectedTables?.length ? parsed : DEFAULT_CONFIG
  } catch {
    return DEFAULT_CONFIG
  }
}

export function saveTablesConfig(config: TablesConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function buildSession(selectedTables: number[]): TablesSession {
  const questions: TableQuestion[] = []
  for (const a of selectedTables) {
    for (let b = 1; b <= 10; b++) {
      questions.push({ a, b, answer: a * b })
    }
  }
  return {
    questions: shuffle(questions),
    currentIndex: 0,
    correct: 0,
    wrong: 0,
    wrongQuestions: [],
  }
}

export function recordAnswer(
  session: TablesSession,
  givenAnswer: number,
): { isCorrect: boolean; nextSession: TablesSession } {
  const q = session.questions[session.currentIndex]
  const isCorrect = givenAnswer === q.answer
  return {
    isCorrect,
    nextSession: {
      ...session,
      currentIndex: session.currentIndex + 1,
      correct: isCorrect ? session.correct + 1 : session.correct,
      wrong: isCorrect ? session.wrong : session.wrong + 1,
      wrongQuestions: isCorrect ? session.wrongQuestions : [...session.wrongQuestions, q],
    },
  }
}

export function formatQuestion(q: TableQuestion): string {
  return `Hoeveel is ${q.a} keer ${q.b}?`
}

const CORRECT_PHRASES = [
  '%a keer %b is %c, goed zo!',
  'Super! %a keer %b is %c!',
  'Toppie! %c is het goede antwoord!',
  'Wauw, dat klopt! %a keer %b = %c',
  'Ja! Heel goed, %c!',
]
const WRONG_PHRASES = [
  'Bijna! %a keer %b is %c.',
  'Niet helemaal. Het antwoord is %c.',
  'Oeps! %a keer %b = %c — probeer de volgende!',
]

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}

function fill(template: string, q: TableQuestion): string {
  return template
    .replace('%a', String(q.a))
    .replace('%b', String(q.b))
    .replace('%c', String(q.answer))
}

export function encouragementText(isCorrect: boolean, q: TableQuestion): string {
  return fill(pick(isCorrect ? CORRECT_PHRASES : WRONG_PHRASES), q)
}

export function scoreText(session: TablesSession): string {
  const pct = session.correct / session.questions.length
  const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1
  const starStr = '⭐'.repeat(stars)
  return `Je had ${session.correct} van de ${session.questions.length} goed! ${starStr}`
}

export const ALL_TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10]

export const TABLES_STATUS: Record<string, string> = {
  'tables-setup':    'Kies jouw tafels!',
  'tables-question': 'Wat is het antwoord?',
  'tables-correct':  'Super goed!',
  'tables-wrong':    'Bijna!',
  'tables-done':     'Klaar!',
}
