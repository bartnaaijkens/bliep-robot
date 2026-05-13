const MAX_QUESTIONS = 10
export const WARNING_QUESTIONS = 3
const WINDOW_MS = 4 * 60 * 60 * 1000
const VIP_KEY = 'bliep_vip'
const RATE_KEY = 'bliep_rate_limit'

interface RateState {
  used: number
  windowStart: number
}

function getState(): RateState {
  try {
    const raw = localStorage.getItem(RATE_KEY)
    if (raw) {
      const s = JSON.parse(raw) as RateState
      if (Date.now() - s.windowStart > WINDOW_MS) {
        return { used: 0, windowStart: Date.now() }
      }
      return s
    }
  } catch { /* ignore */ }
  return { used: 0, windowStart: Date.now() }
}

function saveState(s: RateState): void {
  localStorage.setItem(RATE_KEY, JSON.stringify(s))
}

export function loadVip(): boolean {
  return localStorage.getItem(VIP_KEY) === '1'
}

export function setVip(): void {
  localStorage.setItem(VIP_KEY, '1')
}

export function getRemainingQuestions(): number {
  if (loadVip()) return Infinity
  const s = getState()
  return Math.max(0, MAX_QUESTIONS - s.used)
}

export function consumeQuestion(): number {
  if (loadVip()) return Infinity
  const s = getState()
  const updated = { ...s, used: s.used + 1 }
  saveState(updated)
  return Math.max(0, MAX_QUESTIONS - updated.used)
}

export function hoursUntilResetLabel(): string {
  const s = getState()
  const msLeft = s.windowStart + WINDOW_MS - Date.now()
  if (msLeft <= 0) return 'zo meteen'
  const hours = Math.ceil(msLeft / (60 * 60 * 1000))
  if (hours < 1) return 'over minder dan een uur'
  return `over ${hours} uur`
}
