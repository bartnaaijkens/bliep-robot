export interface HistoryItem {
  q: string
  a: string
  topic: string
  ts: number
}

const KEY = 'bliep_history'
const MAX = 50

export function loadHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as HistoryItem[]
  } catch {
    return []
  }
}

export function saveItem(item: HistoryItem): void {
  const current = loadHistory()
  const updated = [item, ...current].slice(0, MAX)
  localStorage.setItem(KEY, JSON.stringify(updated))
}

export function relativeTime(ts: number): string {
  const diffMs = Date.now() - ts
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'nu'
  if (diffMin < 60) return `${diffMin} min geleden`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} uur geleden`
  return `${Math.floor(diffHr / 24)} dag geleden`
}
