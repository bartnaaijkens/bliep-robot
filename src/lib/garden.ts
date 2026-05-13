export type PlantId = 'sunflower' | 'tomato' | 'cactus'
export type CareAction = 'water-little' | 'water-much' | 'sunlight' | 'nutrients'

export interface PlantDefinition {
  id: PlantId
  name: string
  description: string
  idealWater: number
  idealLight: number
  idealNutrients: number
  tolerance: number
  stageEmojis: string[]
}

export interface PlantSession {
  plant: PlantId
  stage: number
  turn: number
  health: number
  waterLevel: number
  lightLevel: number
  nutrientLevel: number
  history: CareAction[]
  stagesCompleted: number
}

export interface ActionResult {
  feedback: string
  hintText: string
  nextSession: PlantSession
  stageComplete: boolean
  stageFailed: boolean   // turn 3 and health < 30 — game over
  stageStalled: boolean  // turn 3 and health 30–59 — restart stage, not game over
  healthWarning: boolean
}

export const PLANT_TYPES: Record<PlantId, PlantDefinition> = {
  sunflower: {
    id: 'sunflower',
    name: 'Zonnebloem',
    description: 'Houdt van veel zon en een beetje water.',
    idealWater: 40, idealLight: 85, idealNutrients: 50, tolerance: 20,
    stageEmojis: ['🌰', '🌱', '🌿', '🌾', '🌻'],
  },
  tomato: {
    id: 'tomato',
    name: 'Tomaat',
    description: 'Heeft evenveel zon als water nodig — de perfecte beginnerplant!',
    idealWater: 60, idealLight: 65, idealNutrients: 60, tolerance: 25,
    stageEmojis: ['🌰', '🌱', '🪴', '🌿', '🍅'],
  },
  cactus: {
    id: 'cactus',
    name: 'Cactus',
    description: 'Komt uit de woestijn: weinig water, maar zoveel mogelijk zon!',
    idealWater: 15, idealLight: 95, idealNutrients: 25, tolerance: 20,
    stageEmojis: ['🌰', '🟤', '🌱', '🪨', '🌵'],
  },
}

export const STAGE_NAMES = ['Zaad', 'Kiem', 'Plantje', 'Plant', 'Bloem']

export const STAGE_CONGRATULATIONS: string[] = [
  'Wauw, het zaadje is ontkiemd! Het worteltje groeit nu de grond in.',
  'Kijk, het eerste blaadje! De plant begint aan fotosynthese.',
  'De plant groeit steeds groter. De stengel wordt sterker!',
  'Een echte plant nu! Binnenkort komen er bloemen of vruchten.',
  'Gefeliciteerd! De plant heeft zijn levenscyclus voltooid!',
]

export const WILT_FEEDBACK: Record<PlantId, string> = {
  sunflower: 'Oh nee, de zonnebloem hangt zijn hoofd! Hij heeft te weinig of te veel gekregen. Probeer het nog een keer!',
  tomato: 'De tomatenplant wordt slap. Te veel of te weinig water kan dit veroorzaken. Probeer het opnieuw!',
  cactus: 'De cactus ziet er niet goed uit. Waarschijnlijk te veel water! Cactussen houden daar echt niet van.',
}

export const WARNING_FEEDBACK: Record<PlantId, string> = {
  sunflower: 'Pas op! De zonnebloem ziet er niet zo blij uit. Zorg beter voor hem!',
  tomato: 'Let op! De tomatenplant heeft het moeilijk. Denk goed na wat hij nodig heeft.',
  cactus: 'Hmm, de cactus is niet blij. Denk aan waar cactussen vandaan komen!',
}

export const GARDEN_STATUS: Record<string, string> = {
  'games-menu':     'Kies een spel!',
  'garden-select':  'Kies een plant!',
  'garden-growing': 'Vertel Bliep wat hij moet doen!',
  'garden-action':  'Bliep doet het!',
  'garden-done':    'Klaar!',
}

const ACTION_FEEDBACK: Record<PlantId, Record<CareAction, string[]>> = {
  sunflower: {
    'water-little': [
      'Een beetje water is goed! Water helpt de wortels om voedingsstoffen uit de grond op te nemen.',
      'Planten nemen water op via hun wortels. Het gaat omhoog door het stengeltje naar de bladeren!',
      'Water is de "bloedstroom" van een plant. Zonder water kunnen de bladeren niet werken.',
    ],
    'water-much': [
      'Pas op! Te veel water zorgt voor wortelrot. De wortels hebben ook lucht nodig in de grond.',
      'Als de grond te nat is, kunnen de wortels niet ademen. Dan gaat de plant langzaam dood.',
      'Zonnebloemzaden houden van vochtige grond, maar niet te nat. Let goed op hoeveel je geeft!',
    ],
    'sunlight': [
      'Zonnebloemen heten zo omdat ze van de zon houden! Ze draaien hun kop altijd naar de zon toe.',
      'Zonlicht is het eten van een plant! Met zon, water en lucht maakt de plant zijn eigen suiker.',
      'Dit proces heet fotosynthese. De groene kleur van bladeren helpt daarbij!',
    ],
    'nutrients': [
      'Voeding zit in de grond en bevat stoffen zoals stikstof en kalium. Die helpen de plant groeien.',
      'Goede grond zit vol leven! Kleine beestjes en schimmels helpen de plant voedingsstoffen te vinden.',
      'Planten halen hun "eten" uit de grond. Dat is heel anders dan wij — wij eten met onze mond!',
    ],
  },
  tomato: {
    'water-little': [
      'Tomatenplanten zijn dol op regelmatig water. Niet te veel, niet te weinig — net goed!',
      'Water helpt de tomaten om te groeien. Zonder water worden de vruchten klein en droog.',
      'Als de grond een beetje vochtig aanvoelt, is dat perfect voor een tomatenplant.',
    ],
    'water-much': [
      'Oei, dat is veel water! Tomaten kunnen wortelrot krijgen als de grond te lang nat blijft.',
      'Te veel water spoelt ook de voedingsstoffen weg uit de grond. Dan heeft de plant minder te eten.',
      'Tomaten groeien het best in grond die goed droogt. Geef liever vaker een klein beetje dan één keer heel veel.',
    ],
    'sunlight': [
      'Tomaten hebben zon nodig om hun vruchten rood te kleuren. Zonder zon blijven ze groen!',
      'Zonlicht geeft de plant energie. Met die energie kunnen de bladeren zuurstof maken voor ons.',
      'Fotosynthese is eigenlijk zonne-energie opslaan in suiker. Slimme plant!',
    ],
    'nutrients': [
      'Tomatenplanten zijn echte hongeraars! Ze gebruiken veel voedingsstoffen om alle vruchten te laten groeien.',
      'Stikstof helpt de bladeren groeien. Kalium helpt de vruchten sterk worden. Samen zijn ze een goed team!',
      'Zonder genoeg voedingsstoffen worden de bladeren geel. Dat is een teken dat de plant meer nodig heeft.',
    ],
  },
  cactus: {
    'water-little': [
      'Een beetje water is prima voor een cactus! Hij slaat water op in zijn dikke stengel.',
      'Cactussen hebben speciale cellen om water in te bewaren. Zo overleven ze droge periodes.',
      'In de woestijn regent het soms maanden niet. Cactussen zijn zo gebouwd dat ze dat overleven!',
    ],
    'water-much': [
      'Stop! Cactussen zijn helemaal niet gewend aan veel water. Nu kan hij wortelrot krijgen!',
      'De wortels van een cactus zijn dun en gevoelig voor te veel vocht. Geef hem liever heel weinig water.',
      'In de woestijn regent het maar heel soms. Een cactus schrikt van zoveel water tegelijk!',
    ],
    'sunlight': [
      'Cactussen zijn echte zonliefhebbers! In de woestijn schijnt de zon elke dag heel sterk.',
      'De doornen van een cactus zijn eigenlijk kleine blaadjes. Ze houden de plant koel in de zon.',
      'Hoe meer zon, hoe beter voor een cactus! De zon geeft hem energie om te groeien.',
    ],
    'nutrients': [
      'Cactussen groeien in arme woestijngrond. Ze hebben veel minder voeding nodig dan andere planten.',
      'Een cactus groeit heel langzaam. Sommige cactussen worden wel 200 jaar oud!',
      'In de woestijn zijn weinig voedingsstoffen in de grond. Cactussen hebben geleerd met weinig te doen.',
    ],
  },
}

const ACTION_DELTAS: Record<CareAction, { water: number; light: number; nutrients: number }> = {
  'water-little': { water: 15, light: 0, nutrients: 0 },
  'water-much':   { water: 35, light: 0, nutrients: 0 },
  'sunlight':     { water: 0,  light: 25, nutrients: 0 },
  'nutrients':    { water: 0,  light: 0, nutrients: 20 },
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, v))
}

function calcHealth(session: PlantSession): number {
  const def = PLANT_TYPES[session.plant]
  const cw = Math.max(0, 1 - Math.abs(session.waterLevel - def.idealWater) / def.tolerance)
  const cl = Math.max(0, 1 - Math.abs(session.lightLevel - def.idealLight) / def.tolerance)
  const cn = Math.max(0, 1 - Math.abs(session.nutrientLevel - def.idealNutrients) / def.tolerance)
  return Math.round(cw * 34 + cl * 33 + cn * 33)
}

export function generateHintText(session: PlantSession): string {
  const def = PLANT_TYPES[session.plant]
  if (session.waterLevel < def.idealWater - 15) return 'Je plant heeft dorst! Geef hem wat water.'
  if (session.waterLevel > def.idealWater + 20) return 'Stop met water geven! De wortels hebben lucht nodig.'
  if (session.lightLevel < def.idealLight - 15) return 'Je plant wil meer zon! Zet hem in het licht.'
  if (session.nutrientLevel < def.idealNutrients - 15) return 'Je plant heeft honger! Geef hem wat voeding.'
  return 'Je plant ziet er goed uit! Ga zo door.'
}

export function buildGardenSession(plant: PlantId): PlantSession {
  const def = PLANT_TYPES[plant]
  return {
    plant,
    stage: 0,
    turn: 0,
    health: 70,
    waterLevel: Math.max(0, def.idealWater - 10),
    lightLevel: Math.max(0, def.idealLight - 15),
    nutrientLevel: Math.max(0, def.idealNutrients - 10),
    history: [],
    stagesCompleted: 0,
  }
}

export function applyGardenAction(session: PlantSession, action: CareAction): ActionResult {
  const def = PLANT_TYPES[session.plant]
  const delta = ACTION_DELTAS[action]

  let waterLevel   = clamp(session.waterLevel   + delta.water)
  let lightLevel   = clamp(session.lightLevel   + delta.light)
  let nutrientLevel = clamp(session.nutrientLevel + delta.nutrients)

  // Gentle decay: plant uses resources between turns
  waterLevel    = clamp(waterLevel    * 0.95)
  lightLevel    = clamp(lightLevel    * 0.95)
  nutrientLevel = clamp(nutrientLevel * 0.97)

  const newTurn = session.turn + 1
  const feedbackIndex = session.turn % 3
  const feedback = ACTION_FEEDBACK[session.plant][action][feedbackIndex]

  let next: PlantSession = {
    ...session,
    waterLevel,
    lightLevel,
    nutrientLevel,
    turn: newTurn,
    health: 0,
    history: [...session.history, action],
  }
  next.health = calcHealth(next)

  // Outcomes only evaluated at end of 3-turn stage; mid-stage never ends the game
  const atStageEnd    = newTurn >= 3
  const stageComplete = atStageEnd && next.health >= 60
  const stageFailed   = atStageEnd && next.health < 30
  const stageStalled  = atStageEnd && next.health >= 30 && next.health < 60
  const healthWarning = !atStageEnd && next.health < 45

  if (stageComplete) {
    const nextStage = session.stage + 1
    next = {
      ...next,
      stage: nextStage,
      turn: 0,
      stagesCompleted: session.stagesCompleted + 1,
      waterLevel: Math.max(0, def.idealWater - 10),
      lightLevel: Math.max(0, def.idealLight - 15),
      nutrientLevel: Math.max(0, def.idealNutrients - 10),
    }
    next.health = calcHealth(next)
  } else if (stageStalled) {
    // Not healthy enough — restart this stage with fresh resources
    next = {
      ...next,
      turn: 0,
      waterLevel: Math.max(0, def.idealWater - 10),
      lightLevel: Math.max(0, def.idealLight - 15),
      nutrientLevel: Math.max(0, def.idealNutrients - 10),
    }
    next.health = calcHealth(next)
  }

  const hintText = generateHintText(next)

  return { feedback, hintText, nextSession: next, stageComplete, stageFailed, stageStalled, healthWarning }
}

export function gardenScoreStars(session: PlantSession): 1 | 2 | 3 {
  if (session.stagesCompleted >= 5) return 3
  if (session.stagesCompleted >= 3) return 2
  return 1
}

export function gardenScoreText(session: PlantSession): string {
  const name = PLANT_TYPES[session.plant].name
  const s = session.stagesCompleted
  if (s >= 5) return `Geweldig! Jouw ${name} is helemaal gegroeid tot bloem! Je bent een echte tuinman!`
  if (s >= 3) return `Goed gedaan! Jouw ${name} is gegroeid tot ${STAGE_NAMES[s - 1]}! Wil je het nog een keer proberen?`
  return `Jammer, jouw ${name} had het zwaar. Maar je hebt wel iets geleerd! Probeer het nog een keer!`
}
