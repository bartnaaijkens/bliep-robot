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
  // Animals
  { label: 'Kunnen vissen slapen?' },
  { label: 'Wat dromen dieren?' },
  { label: 'Hoe slim zijn dolfijnen?' },
  { label: 'Waarom spinnen katten?' },
  { label: 'Kunnen katten in het donker zien?' },
  { label: 'Hoe slapen walvissen?' },
  { label: 'Waarom zijn flamingo\'s roze?' },
  { label: 'Hoe navigeren bijen?' },
  { label: 'Waarom miauwen katten?' },
  { label: 'Hoe oud wordt een schildpad?' },
  { label: 'Kunnen vissen verdrinken?' },
  { label: 'Hoe weven spinnen een web?' },
  { label: 'Waarom migreren vogels?' },
  { label: 'Slapen haaien ooit?' },
  { label: 'Hoe ruiken honden zo goed?' },
  { label: 'Waarom kwaken kikkers?' },
  { label: 'Kan een octopus denken?' },
  { label: 'Wat is het snelste dier?' },
  { label: 'Kunnen dieren vrienden zijn?' },
  { label: 'Hoe zien vleermuizen in het donker?' },
  // Nature / Earth
  { label: 'Hoe werkt regen?' },
  { label: 'Hoe oud zijn bomen?' },
  { label: 'Hoe oud is de aarde?' },
  { label: 'Hoe diep is de zee?' },
  { label: 'Hoe ontstaan bergen?' },
  { label: 'Hoe groeien paddestoelen?' },
  { label: 'Praten planten met elkaar?' },
  { label: 'Waarom kleuren bladeren?' },
  { label: 'Hoe werkt een vulkaan?' },
  { label: 'Hoe ontstaat een regenboog?' },
  { label: 'Waarom is de zee zout?' },
  { label: 'Kunnen planten denken?' },
  // Space
  { label: 'Hoe groot is de zon?' },
  { label: 'Hoe ver is de maan?' },
  { label: 'Is er leven op Mars?' },
  { label: 'Wat is een meteoor?' },
  { label: 'Hoe groot is Jupiter?' },
  { label: 'Waarom schijnt de maan?' },
  { label: 'Wat zijn sterren?' },
  { label: 'Hoeveel sterren zijn er?' },
  { label: 'Hoe werkt zwaartekracht?' },
  { label: 'Wat is een zwart gat?' },
  { label: 'Zijn we alleen in het heelal?' },
  { label: 'Hoe snel draait de aarde?' },
  { label: 'Wat is een supernova?' },
  // Science / Physics
  { label: 'Hoe werkt een magneet?' },
  { label: 'Hoe werkt bliksem?' },
  { label: 'Hoe snel is het licht?' },
  { label: 'Hoe groot is een atoom?' },
  { label: 'Hoe werkt elektriciteit?' },
  { label: 'Hoe werkt zonne-energie?' },
  { label: 'Waarom is ijs glad?' },
  { label: 'Hoe werkt geluid?' },
  { label: 'Hoe werkt een telescoop?' },
  { label: 'Waarom wordt water warm?' },
  // Human body
  { label: 'Waarom gapen we?' },
  { label: 'Waarom dromen we?' },
  { label: 'Hoe werkt het geheugen?' },
  { label: 'Waarom lachen we?' },
  { label: 'Hoe werkt het brein?' },
  { label: 'Waarom huilen we?' },
  { label: 'Hoe snel groeit haar?' },
  { label: 'Hoe werken onze ogen?' },
  { label: 'Waarom worden we moe?' },
  { label: 'Hoe werkt het hart?' },
  { label: 'Waarom groeien we?' },
  { label: 'Hoe werkt de neus?' },
  { label: 'Waarom niezen we?' },
  { label: 'Waarom lijk ik op mijn ouders?' },
  { label: 'Waarom heeft eten energie?' },
  { label: 'Waarom lijkt tijd soms snel?' },
  // Gross / funny
  { label: 'Waarom stinken scheten?' },
  { label: 'Waar komt snot vandaan?' },
  { label: 'Waarom boeren we?' },
  { label: 'Hoe groot was een T-rex poep?' },
  { label: 'Waarom jeukt het soms?' },
  { label: 'Waarom worden vingers rimpelig?' },
  // What if
  { label: 'Wat als je onzichtbaar was?' },
  { label: 'Wat als mensen konden vliegen?' },
  { label: 'Wat als de zon uitging?' },
  { label: 'Wat als dieren konden praten?' },
  { label: 'Wat als je superkrachten had?' },
  { label: 'Wat als de aarde stopte?' },
  // Food / everyday
  { label: 'Hoe wordt kaas gemaakt?' },
  { label: 'Waarom prikt frisdrank?' },
  { label: 'Waarom rijst brood?' },
  { label: 'Waarom is honing zoet?' },
  { label: 'Hoe wordt chocola gemaakt?' },
  { label: 'Waarom smelt ijs?' },
  // Technology
  { label: 'Hoe werkt wifi?' },
  { label: 'Hoe werkt een computer?' },
  { label: 'Hoe werkt een telefoon?' },
  { label: 'Hoe werkt een raket?' },
  { label: 'Hoe werkt een zonnepaneel?' },
  // History
  { label: 'Wie bouwde de piramides?' },
  { label: 'Waren er echte piraten?' },
  { label: 'Hoe leefden Vikingen?' },
  { label: 'Bestonden draken echt?' },
  { label: 'Hoe leefden dinosaurussen?' },
  { label: 'Wie waren de Romeinen?' },
  { label: 'Hoe ontdekten we vuur?' },
  { label: 'Hoe oud zijn de piramides?' },
  // Fantasy / mystery
  { label: 'Zijn spoken echt?' },
  { label: 'Bestaan eenhoorns?' },
  { label: 'Bestaat Bigfoot echt?' },
  { label: 'Zijn elfjes echt?' },
  { label: 'Wat zijn dromen eigenlijk?' },
]
