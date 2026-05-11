export type PaletteName = 'classic' | 'blue' | 'sunset' | 'mint'

export interface BliepPalette {
  blue: string
  deepBlue: string
  face: string
  glow: string
  cyan: string
}

export interface BgPalette {
  bg: string
  bgGlow: string
  ink: string
  soft: string
  line: string
}

export const BLIEP_PALETTES: Record<PaletteName, BliepPalette> = {
  classic: { blue: '#A044C8', deepBlue: '#7A28A8', face: '#190728', glow: '#F5C0FF', cyan: '#DC78F0' },
  blue:    { blue: '#2E6FD8', deepBlue: '#1B4FB8', face: '#0A1633', glow: '#8FDBFF', cyan: '#5FC8FF' },
  sunset:  { blue: '#E6743A', deepBlue: '#BF4E1F', face: '#2A0F12', glow: '#FFD194', cyan: '#FFB36B' },
  mint:    { blue: '#2BA37A', deepBlue: '#1B7A5A', face: '#08241C', glow: '#A8F0CE', cyan: '#6FE0AE' },
}

export const PALETTE_BG: Record<PaletteName, BgPalette> = {
  classic: { bg: '#F6EEF9', bgGlow: '#EDD8F7', ink: '#3A1050', soft: '#FBF5FD', line: '#E5CDF2' },
  blue:    { bg: '#F4EFE4', bgGlow: '#DDE9FF', ink: '#1B2748', soft: '#FAF6EC', line: '#E3DCC9' },
  sunset:  { bg: '#FAEFE3', bgGlow: '#FFD9C0', ink: '#3A1A12', soft: '#FFF6EC', line: '#EDD7C2' },
  mint:    { bg: '#EFF6EE', bgGlow: '#C9F0DC', ink: '#0E2A20', soft: '#F6FBF4', line: '#D4E6D5' },
}

export const TOPIC_ICONS: Record<string, string> = {
  'Frankrijk': '🇫🇷', 'De lucht': '☁️', 'Spinnen': '🕷️', 'Rekenen': '🔢',
  'De maan': '🌙', 'Egels': '🦔', 'Vissen': '🐟', 'Regenbogen': '🌈',
  'Dieren': '🐾', 'Sterren': '⭐', 'Natuur': '🌿', 'Wetenschap': '🔬',
  'Geschiedenis': '📜', 'Aardrijkskunde': '🌍', 'Sport': '⚽', 'Muziek': '🎵',
}

export const EXAMPLE_PROMPTS = [
  { label: 'Wat eten egels?' },
  { label: 'Waarom is de lucht blauw?' },
  { label: 'Hoe ver is de maan?' },
]
