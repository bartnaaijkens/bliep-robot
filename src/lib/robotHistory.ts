import type { MissionId, CategoryId, PartKey } from './robot'

export interface RobotHistoryItem {
  id: string
  ts: number
  mission: MissionId
  picks: Partial<Record<CategoryId, PartKey>>
  customization: string
  imageDataUrl: string
  totalScore: number
  stars: 0 | 1 | 2 | 3
}

const KEY = 'bliep_robots'
const MAX = 20

export function loadRobotHistory(): RobotHistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as RobotHistoryItem[]
  } catch {
    return []
  }
}

export function saveRobotImage(item: RobotHistoryItem): void {
  const current = loadRobotHistory()
  const updated = [item, ...current].slice(0, MAX)
  localStorage.setItem(KEY, JSON.stringify(updated))
}
