export interface TafelsConfig {
  selectedTafels: number[]
}

export interface TafelsQuestion {
  a: number
  b: number
  answer: number
}

export interface TafelsSession {
  questions: TafelsQuestion[]
  currentIndex: number
  correct: number
  wrong: number
  wrongQuestions: TafelsQuestion[]
}

const CONFIG_KEY = 'bliep_tafels_config'
const DEFAULT_CONFIG: TafelsConfig = { selectedTafels: [2, 5, 10] }

export function loadTafelsConfig(): TafelsConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return DEFAULT_CONFIG
    const parsed = JSON.parse(raw) as TafelsConfig
    return parsed.selectedTafels?.length ? parsed : DEFAULT_CONFIG
  } catch {
    return DEFAULT_CONFIG
  }
}

export function saveTafelsConfig(config: TafelsConfig): void {
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

export function buildSession(selectedTafels: number[]): TafelsSession {
  const questions: TafelsQuestion[] = []
  for (const a of selectedTafels) {
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
  session: TafelsSession,
  givenAnswer: number,
): { isCorrect: boolean; nextSession: TafelsSession } {
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

export function formatQuestion(q: TafelsQuestion): string {
  return `Hoeveel is ${q.a} keer ${q.b}?`
}

const CORRECT = [
  '%a keer %b is %c, goed zo!',
  'Super! %a keer %b is %c!',
  'Toppie! %c is het goede antwoord!',
  'Wauw, dat klopt! %a keer %b = %c',
  'Ja! Heel goed, %c!',
]
const WRONG = [
  'Bijna! %a keer %b is %c.',
  'Niet helemaal. Het antwoord is %c.',
  'Oeps! %a keer %b = %c — probeer de volgende!',
]

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}

function fill(template: string, q: TafelsQuestion): string {
  return template
    .replace('%a', String(q.a))
    .replace('%b', String(q.b))
    .replace('%c', String(q.answer))
}

export function encouragementText(isCorrect: boolean, q: TafelsQuestion): string {
  return fill(pick(isCorrect ? CORRECT : WRONG), q)
}

export function scoreText(session: TafelsSession): string {
  const pct = session.correct / session.questions.length
  const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1
  const starStr = '⭐'.repeat(stars)
  return `Je had ${session.correct} van de ${session.questions.length} goed! ${starStr}`
}

export const ALL_TAFELS = [2, 3, 4, 5, 6, 7, 8, 9, 10]

export const TAFELS_STATUS: Record<string, string> = {
  'tafels-keuze': 'Kies jouw tafels!',
  'tafels-vraag': 'Wat is het antwoord?',
  'tafels-goed':  'Super goed!',
  'tafels-fout':  'Bijna!',
  'tafels-klaar': 'Klaar!',
}
