export type MissionId = 'hospital' | 'space' | 'fire'
export type CategoryId = 'sensors' | 'arms' | 'drive' | 'power' | 'extra'
export type PartKey =
  | 'sensors-camera' | 'sensors-thermal' | 'sensors-medical'
  | 'arms-strong'    | 'arms-precise'    | 'arms-hose'
  | 'drive-wheels'   | 'drive-legs'      | 'drive-fly'
  | 'power-solar'    | 'power-battery'   | 'power-hydrogen'
  | 'extra-antenna'  | 'extra-shield'    | 'extra-lab'

export interface MissionDef {
  id: MissionId
  emoji: string
  name: string
  description: string
}

export interface PartOption {
  key: PartKey
  emoji: string
  name: string
  description: string
  fact: string
}

export interface CategoryDef {
  id: CategoryId
  label: string
  options: PartOption[]
}

export interface RobotSession {
  mission: MissionId
  picks: Partial<Record<CategoryId, PartKey>>
  currentStep: number
  totalScore: number
  done: boolean
}

export const MISSIONS: MissionDef[] = [
  {
    id: 'hospital',
    emoji: '🏥',
    name: 'Ziekenhuis',
    description: 'Help dokters en verpleegsters om patiënten beter te maken.',
  },
  {
    id: 'space',
    emoji: '🚀',
    name: 'Ruimteverkenner',
    description: 'Verken verre planeten en stuur informatie terug naar de aarde.',
  },
  {
    id: 'fire',
    emoji: '🔥',
    name: 'Brandweer',
    description: 'Blus branden en red mensen uit gevaarlijke situaties.',
  },
]

export const CATEGORY_ORDER: CategoryId[] = ['sensors', 'arms', 'drive', 'power', 'extra']

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'sensors',
    label: 'Hoofd & Sensoren',
    options: [
      {
        key: 'sensors-camera',
        emoji: '📷',
        name: "Camera's",
        description: 'Ziet scherp, herkent gezichten en kleuren.',
        fact: "Camera's kunnen meer zien dan onze ogen! Ze herkennen gezichten, kleuren en bewegingen — zelfs in het donker!",
      },
      {
        key: 'sensors-thermal',
        emoji: '🌡️',
        name: 'Warmtesensor',
        description: 'Voelt hitte van ver weg.',
        fact: 'Een warmtesensor voelt hitte van ver weg. Brandweerrobots kunnen zo mensen vinden in een brandend gebouw!',
      },
      {
        key: 'sensors-medical',
        emoji: '🩺',
        name: 'Medische sensoren',
        description: 'Meet hartslag en zuurstof in het bloed.',
        fact: 'Medische sensoren meten je hartslag en hoeveel zuurstof in je bloed zit — zonder dat het pijn doet!',
      },
    ],
  },
  {
    id: 'arms',
    label: 'Armen',
    options: [
      {
        key: 'arms-strong',
        emoji: '🦾',
        name: 'Sterke armen',
        description: 'Kan tot vijftig kilo tillen.',
        fact: 'Robotarmen kunnen soms wel duizend kilo tillen! Dat is zo zwaar als een kleine auto.',
      },
      {
        key: 'arms-precise',
        emoji: '✋',
        name: 'Precieze handen',
        description: 'Werkt met millimeter nauwkeurigheid.',
        fact: 'Chirurgierobot-armen bewegen met een nauwkeurigheid van minder dan een millimeter. Dat is kleiner dan een stofje!',
      },
      {
        key: 'arms-hose',
        emoji: '🧯',
        name: 'Blusarmen',
        description: 'Spuit water en schuim met grote kracht.',
        fact: 'Brandblus-armen kunnen water spuiten met zoveel kracht dat het een hele straat overspant!',
      },
    ],
  },
  {
    id: 'drive',
    label: 'Aandrijving',
    options: [
      {
        key: 'drive-wheels',
        emoji: '🚗',
        name: 'Wielen',
        description: 'Snel op vlakke vloeren.',
        fact: 'Wielen zijn de snelste manier om te rijden op een vlakke vloer. Sommige robots rijden wel vijftig kilometer per uur!',
      },
      {
        key: 'drive-legs',
        emoji: '🦿',
        name: 'Loopbenen',
        description: 'Klimt over puin en trappen.',
        fact: 'Loopbenen kunnen over puin klimmen, trappen op lopen en zelfs vallen zonder te breken — net als een echte astronaut!',
      },
      {
        key: 'drive-fly',
        emoji: '🚁',
        name: 'Vliegmodule',
        description: 'Zweeft boven moeilijke plekken.',
        fact: 'Vliegende robots heten drones. Ze kunnen op moeilijk bereikbare plekken komen, zoals hoge gebouwen of verre planeten!',
      },
    ],
  },
  {
    id: 'power',
    label: 'Energiebron',
    options: [
      {
        key: 'power-solar',
        emoji: '☀️',
        name: 'Zonnepanelen',
        description: 'Stil en nooit op, ideaal in de ruimte.',
        fact: 'Zonnepanelen zetten zonlicht om in elektriciteit. In de ruimte schijnt de zon altijd, dus dat is perfect!',
      },
      {
        key: 'power-battery',
        emoji: '🔋',
        name: 'Superaccu',
        description: 'Snel opladen, acht uur meegaan.',
        fact: 'Een superaccu laadt in twintig minuten op en gaat acht uur mee. Ideaal als je snel moet reageren!',
      },
      {
        key: 'power-hydrogen',
        emoji: '⚡',
        name: 'Waterstofcel',
        description: 'Heel schoon, alleen water als uitlaat.',
        fact: 'Een waterstofcel maakt stroom door waterstof en zuurstof te combineren. De enige uitstoot is water — heel schoon!',
      },
    ],
  },
  {
    id: 'extra',
    label: 'Speciale Module',
    options: [
      {
        key: 'extra-antenna',
        emoji: '📡',
        name: 'Communicatiemodule',
        description: 'Praat met mensen op grote afstand.',
        fact: 'Met een communicatiemodule kan een robot praten met mensen op honderden kilometers afstand — zelfs vanuit de ruimte!',
      },
      {
        key: 'extra-shield',
        emoji: '🛡️',
        name: 'Brandwerend pantser',
        description: 'Verdraagt 600 graden Celsius.',
        fact: 'Brandwerend pantser kan temperaturen van 600 graden weerstaan. Dat is zes keer zo heet als kokend water!',
      },
      {
        key: 'extra-lab',
        emoji: '🔬',
        name: 'Analysemodule',
        description: 'Herkent ziektes in één druppel bloed.',
        fact: 'Een analysemodule kan duizenden ziektes herkennen in één druppel bloed. Dat is sneller dan een heel ziekenhuis!',
      },
    ],
  },
]

const SCORES: Record<PartKey, Record<MissionId, number>> = {
  'sensors-camera':  { hospital: 2, space: 3, fire: 2 },
  'sensors-thermal': { hospital: 1, space: 1, fire: 3 },
  'sensors-medical': { hospital: 3, space: 0, fire: 0 },
  'arms-strong':     { hospital: 1, space: 3, fire: 2 },
  'arms-precise':    { hospital: 3, space: 2, fire: 0 },
  'arms-hose':       { hospital: 0, space: 0, fire: 3 },
  'drive-wheels':    { hospital: 2, space: 0, fire: 2 },
  'drive-legs':      { hospital: 1, space: 1, fire: 3 },
  'drive-fly':       { hospital: 1, space: 3, fire: 2 },
  'power-solar':     { hospital: 1, space: 3, fire: 1 },
  'power-battery':   { hospital: 2, space: 2, fire: 3 },
  'power-hydrogen':  { hospital: 3, space: 0, fire: 2 },
  'extra-antenna':   { hospital: 3, space: 3, fire: 1 },
  'extra-shield':    { hospital: 0, space: 1, fire: 3 },
  'extra-lab':       { hospital: 3, space: 2, fire: 0 },
}

export const ROBOT_STATUS: Record<string, string> = {
  'robot-select':     'Kies een missie!',
  'robot-building':   'Bouw je robot!',
  'robot-fact':       'Bliep vertelt iets!',
  'robot-customize':  'Vertel het Bliep!',
  'robot-listening':  'Ik luister naar je…',
  'robot-generating': 'Bliep is aan het bouwen…',
  'robot-done':       'Klaar!',
}

export function buildRobotSession(mission: MissionId): RobotSession {
  return { mission, picks: {}, currentStep: 0, totalScore: 0, done: false }
}

export function applyRobotPick(
  session: RobotSession,
  category: CategoryId,
  partKey: PartKey,
): RobotSession {
  const newPicks = { ...session.picks, [category]: partKey }
  const nextStep = session.currentStep + 1
  const done = nextStep >= 5
  const totalScore = done
    ? (Object.values(newPicks) as PartKey[]).reduce((acc, key) => acc + (SCORES[key]?.[session.mission] ?? 0), 0)
    : 0
  return { ...session, picks: newPicks, currentStep: nextStep, done, totalScore }
}

export function robotScoreStars(score: number): 0 | 1 | 2 | 3 {
  if (score >= 13) return 3
  if (score >= 9)  return 2
  if (score >= 5)  return 1
  return 0
}

export function robotScoreText(session: RobotSession): string {
  const stars = robotScoreStars(session.totalScore)
  const mission = MISSIONS.find(m => m.id === session.mission)!
  if (stars === 3) return `Perfecte robot voor de ${mission.name}! Jij bent een echte robotbouwer!`
  if (stars === 2) return `Goede robot! Een paar onderdelen kunnen nóg beter voor de ${mission.name}.`
  if (stars === 1) return `Je robot kan de ${mission.name} helpen, maar er zijn betere keuzes mogelijk!`
  return `Deze robot past niet zo goed bij de ${mission.name}. Probeer het nog een keer!`
}

export function partScoreForMission(partKey: PartKey, mission: MissionId): number {
  return SCORES[partKey]?.[mission] ?? 0
}

export function slotEmoji(picks: RobotSession['picks'], categoryId: CategoryId): string {
  const key = picks[categoryId]
  if (!key) return '❓'
  return CATEGORIES.find(c => c.id === categoryId)!.options.find(o => o.key === key)!.emoji
}
