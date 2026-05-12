export type GeoQuestionType = 'province-capital' | 'capital-province' | 'locate' | 'feature'

export interface GeoQuestion {
  id: string
  type: GeoQuestionType
  difficulty: 1 | 2 | 3
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface GeoAnswer {
  questionId: string
  isCorrect: boolean
  chosenIndex: number
}

export interface GeoSession {
  questions: GeoQuestion[]
  currentIndex: number
  correct: number
  wrong: number
  answers: GeoAnswer[]
}

const LEVEL_KEY = 'bliep_geo_level'

export function loadGeoLevel(): 1 | 2 | 3 {
  try {
    const raw = localStorage.getItem(LEVEL_KEY)
    const n = parseInt(raw ?? '1', 10)
    return n === 2 ? 2 : n === 3 ? 3 : 1
  } catch {
    return 1
  }
}

export function saveGeoLevel(level: 1 | 2 | 3): void {
  localStorage.setItem(LEVEL_KEY, String(level))
}

export function advanceGeoLevel(session: GeoSession): void {
  const current = loadGeoLevel()
  const pct = session.correct / session.questions.length
  let next: 1 | 2 | 3 = current
  if (pct >= 0.9 && current < 3) next = (current + 1) as 1 | 2 | 3
  if (pct <= 0.5 && current > 1) next = (current - 1) as 1 | 2 | 3
  saveGeoLevel(next)
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function shuffleOptions(q: GeoQuestion): GeoQuestion {
  const correctAnswer = q.options[q.correctIndex]
  const shuffled = shuffle([...q.options])
  return { ...q, options: shuffled, correctIndex: shuffled.indexOf(correctAnswer) }
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function buildGeoSession(level: 1 | 2 | 3): GeoSession {
  const d1 = QUESTION_BANK.filter(q => q.difficulty === 1)
  const d2 = QUESTION_BANK.filter(q => q.difficulty === 2)
  const d3 = QUESTION_BANK.filter(q => q.difficulty === 3)

  let pool: GeoQuestion[]
  if (level === 1) {
    pool = shuffle(d1).slice(0, 10)
  } else if (level === 2) {
    pool = [...shuffle(d1).slice(0, 3), ...shuffle(d2).slice(0, 7)]
  } else {
    pool = [...shuffle(d2).slice(0, 3), ...shuffle(d3).slice(0, 7)]
  }

  const questions = shuffle(pool).map(q => shuffleOptions(q))
  return { questions, currentIndex: 0, correct: 0, wrong: 0, answers: [] }
}

export function recordGeoAnswer(
  session: GeoSession,
  chosenIndex: number,
): { isCorrect: boolean; nextSession: GeoSession } {
  const q = session.questions[session.currentIndex]
  const isCorrect = chosenIndex === q.correctIndex
  const answer: GeoAnswer = { questionId: q.id, isCorrect, chosenIndex }
  return {
    isCorrect,
    nextSession: {
      ...session,
      correct: isCorrect ? session.correct + 1 : session.correct,
      wrong: isCorrect ? session.wrong : session.wrong + 1,
      answers: [...session.answers, answer],
    },
  }
}

const CORRECT_PREFIXES = ['Super!', 'Goed zo!', 'Helemaal goed!', 'Ja, klopt!', 'Toppie!', 'Geweldig!']
const WRONG_PREFIXES = ['Bijna!', 'Niet helemaal.', 'Dat is nog niet goed.', 'Goed geprobeerd.']

export function geoEncouragementText(isCorrect: boolean, q: GeoQuestion): string {
  return `${pick(isCorrect ? CORRECT_PREFIXES : WRONG_PREFIXES)} ${q.explanation}`
}

export function geoScoreText(session: GeoSession): string {
  const { correct, questions } = session
  const total = questions.length
  const pct = correct / total
  if (pct >= 0.9) return `Je had ${correct} van de ${total} goed! Jij bent een echte kaartjeskenner!`
  if (pct >= 0.7) return `Je had ${correct} van de ${total} goed! Heel goed, je kent Nederland al goed!`
  return `Je had ${correct} van de ${total} goed! Goed geprobeerd, oefen nog een keer!`
}

export function formatGeoQuestion(q: GeoQuestion): string {
  return q.prompt
}

export const GEO_STATUS: Record<string, string> = {
  'geo-question': 'Weet jij het?',
  'geo-correct':  'Dat klopt!',
  'geo-wrong':    'Bijna goed!',
  'geo-done':     'Klaar!',
}

// compact builder helpers
function pc(id: string, d: 1|2|3, prompt: string, options: string[], ci: number, explanation: string): GeoQuestion {
  return { id, type: 'province-capital', difficulty: d, prompt, options, correctIndex: ci, explanation }
}
function cp(id: string, d: 1|2|3, prompt: string, options: string[], ci: number, explanation: string): GeoQuestion {
  return { id, type: 'capital-province', difficulty: d, prompt, options, correctIndex: ci, explanation }
}
function lo(id: string, d: 1|2|3, prompt: string, options: string[], ci: number, explanation: string): GeoQuestion {
  return { id, type: 'locate', difficulty: d, prompt, options, correctIndex: ci, explanation }
}
function ft(id: string, d: 1|2|3, prompt: string, options: string[], ci: number, explanation: string): GeoQuestion {
  return { id, type: 'feature', difficulty: d, prompt, options, correctIndex: ci, explanation }
}

export const QUESTION_BANK: GeoQuestion[] = [
  // ── Province → Capital level 1 — alleen "zelfde naam" of zeer bekende steden ──
  pc('pc-01', 1, 'Welke stad is de hoofdstad van Groningen?',
    ['Assen', 'Groningen', 'Leeuwarden', 'Zwolle'], 1,
    'Groningen is de hoofdstad van de provincie Groningen. Ze hebben dezelfde naam.'),
  pc('pc-07', 1, 'Welke stad is de hoofdstad van Utrecht?',
    ['Amsterdam', 'Utrecht', 'Haarlem', 'Den Haag'], 1,
    'Utrecht is zowel de naam van de provincie als van de hoofdstad. Het is een stad met veel grachten.'),
  pc('pc-09', 1, 'Welke stad is de hoofdstad van Zuid-Holland?',
    ['Rotterdam', 'Leiden', 'Den Haag', 'Dordrecht'], 2,
    'Den Haag is de hoofdstad van Zuid-Holland. In Den Haag zitten ook de Nederlandse regering en het parlement.'),
  pc('pc-12', 1, 'Welke stad is de hoofdstad van Limburg?',
    ['Venlo', 'Roermond', 'Maastricht', 'Sittard'], 2,
    'Maastricht is de hoofdstad van Limburg. Het is de meest zuidelijke grote stad van Nederland.'),

  // ── Province → Capital level 2 — bekende hoofdsteden die je leert ──────────
  pc('pc-02', 2, 'Welke stad is de hoofdstad van Friesland?',
    ['Groningen', 'Assen', 'Leeuwarden', 'Zwolle'], 2,
    'Leeuwarden is de hoofdstad van Friesland. In Friesland spreken veel mensen ook Fries.'),
  pc('pc-03', 2, 'Welke stad is de hoofdstad van Drenthe?',
    ['Groningen', 'Assen', 'Zwolle', 'Leeuwarden'], 1,
    'Assen is de hoofdstad van Drenthe. In Drenthe vind je ook de beroemde hunebedden.'),
  pc('pc-04', 2, 'Welke stad is de hoofdstad van Overijssel?',
    ['Assen', 'Arnhem', 'Zwolle', 'Lelystad'], 2,
    'Zwolle is de hoofdstad van Overijssel. De stad ligt aan de rivier de IJssel.'),
  pc('pc-06', 2, 'Welke stad is de hoofdstad van Gelderland?',
    ['Utrecht', 'Zwolle', 'Nijmegen', 'Arnhem'], 3,
    'Arnhem is de hoofdstad van Gelderland. De Rijn stroomt vlak langs Arnhem.'),
  pc('pc-16', 2, 'Welke stad is de hoofdstad van Noord-Holland — niet Amsterdam, maar?',
    ['Amsterdam', 'Haarlem', 'Alkmaar', 'Hoorn'], 1,
    'Haarlem is de hoofdstad van Noord-Holland. Veel mensen denken dat Amsterdam de hoofdstad is, maar dat klopt niet.'),
  pc('pc-17', 2, 'Van welke provincie is Den Haag de hoofdstad?',
    ['Noord-Holland', 'Utrecht', 'Zeeland', 'Zuid-Holland'], 3,
    'Den Haag is de hoofdstad van Zuid-Holland. Den Haag is ook de stad van de Nederlandse regering.'),
  pc('pc-18', 2, 'Welke provinciehoofdstad ligt in het zuiden van Nederland aan de Maas?',
    ['Arnhem', 'Breda', 'Maastricht', 'Tilburg'], 2,
    'Maastricht, de hoofdstad van Limburg, ligt aan de rivier de Maas. Het is de meest zuidelijke grote stad van Nederland.'),
  pc('pc-20', 2, 'De hoofdstad van Flevoland is niet Almere. Welke stad is het wel?',
    ['Dronten', 'Emmeloord', 'Lelystad', 'Urk'], 2,
    'Lelystad is de hoofdstad van Flevoland. Almere is groter, maar Lelystad is de officiële hoofdstad.'),

  // ── Province → Capital level 3 — valstrikken en minder bekende steden ───────
  pc('pc-21', 3, 'Welke stad is de hoofdstad van Drenthe?',
    ['Emmen', 'Hoogeveen', 'Assen', 'Meppel'], 2,
    'Assen is de hoofdstad van Drenthe. Emmen is wel groter, maar Assen is de officiële hoofdstad.'),
  pc('pc-22', 3, 'Welke stad is de hoofdstad van Zeeland?',
    ['Vlissingen', 'Goes', 'Terneuzen', 'Middelburg'], 3,
    'Middelburg is de hoofdstad van Zeeland. Het heeft een mooi historisch centrum met een abdij.'),
  pc('pc-23', 3, 'Welke stad is de hoofdstad van Noord-Brabant?',
    ['Tilburg', 'Eindhoven', 'Breda', "'s-Hertogenbosch"], 3,
    "'s-Hertogenbosch is de officiële hoofdstad van Noord-Brabant. De stad wordt ook wel Den Bosch genoemd."),
  pc('pc-24', 3, 'Welke stad is de hoofdstad van Friesland?',
    ['Sneek', 'Harlingen', 'Drachten', 'Leeuwarden'], 3,
    'Leeuwarden is de hoofdstad van Friesland. De andere steden zijn ook Friese steden, maar geen hoofdstad.'),
  pc('pc-25', 3, 'Welke stad is de hoofdstad van Flevoland, de nieuwste provincie?',
    ['Almere', 'Emmeloord', 'Lelystad', 'Urk'], 2,
    'Lelystad is de hoofdstad van Flevoland. Almere is groter, maar werd later gesticht dan Lelystad.'),

  // ── Capital → Province level 1 — alleen "zelfde naam" of zeer bekende steden ─
  cp('cp-01', 1, 'Bij welke provincie hoort de hoofdstad Groningen?',
    ['Friesland', 'Groningen', 'Drenthe', 'Overijssel'], 1,
    'Groningen is de hoofdstad van de gelijknamige provincie Groningen.'),
  cp('cp-07', 1, 'Bij welke provincie hoort de hoofdstad Utrecht?',
    ['Noord-Holland', 'Utrecht', 'Zuid-Holland', 'Gelderland'], 1,
    'Utrecht is de hoofdstad van de provincie Utrecht.'),
  cp('cp-09', 1, 'Bij welke provincie hoort de hoofdstad Den Haag?',
    ['Noord-Holland', 'Utrecht', 'Zeeland', 'Zuid-Holland'], 3,
    'Den Haag is de hoofdstad van Zuid-Holland.'),
  cp('cp-12', 1, 'Bij welke provincie hoort de hoofdstad Maastricht?',
    ['Noord-Brabant', 'Zeeland', 'Gelderland', 'Limburg'], 3,
    'Maastricht is de hoofdstad van Limburg.'),

  // ── Capital → Province level 2 — bekende hoofdsteden die je leert ──────────
  cp('cp-02', 2, 'Bij welke provincie hoort de hoofdstad Leeuwarden?',
    ['Groningen', 'Drenthe', 'Friesland', 'Overijssel'], 2,
    'Leeuwarden is de hoofdstad van Friesland. In Friesland is ook het Fries een officiële taal.'),
  cp('cp-04', 2, 'Bij welke provincie hoort de hoofdstad Zwolle?',
    ['Drenthe', 'Gelderland', 'Overijssel', 'Utrecht'], 2,
    'Zwolle is de hoofdstad van Overijssel. De stad ligt aan de rivier de IJssel.'),
  cp('cp-06', 2, 'Bij welke provincie hoort de hoofdstad Arnhem?',
    ['Utrecht', 'Overijssel', 'Gelderland', 'Limburg'], 2,
    'Arnhem is de hoofdstad van Gelderland.'),
  cp('cp-15', 2, 'Haarlem is de hoofdstad van welke provincie?',
    ['Zuid-Holland', 'Utrecht', 'Noord-Holland', 'Zeeland'], 2,
    'Haarlem is de hoofdstad van Noord-Holland. Veel mensen denken dat Amsterdam de hoofdstad is, maar dat klopt niet.'),
  cp('cp-16', 2, 'Assen is de hoofdstad van welke provincie?',
    ['Friesland', 'Drenthe', 'Overijssel', 'Groningen'], 1,
    'Assen is de hoofdstad van Drenthe. Emmen is groter, maar Assen is de officiële hoofdstad.'),
  cp('cp-17', 2, 'Middelburg is de hoofdstad van welke provincie?',
    ['Noord-Brabant', 'Zuid-Holland', 'Limburg', 'Zeeland'], 3,
    'Middelburg is de hoofdstad van Zeeland. Zeeland ligt in het zuidwesten van Nederland.'),
  cp('cp-18', 2, 'Lelystad is de hoofdstad van welke provincie?',
    ['Noord-Holland', 'Utrecht', 'Flevoland', 'Overijssel'], 2,
    'Lelystad is de hoofdstad van Flevoland. Deze provincie werd in de twintigste eeuw drooggelegd.'),

  // ── Capital → Province level 3 — valstrikken en minder bekende steden ───────
  cp('cp-21', 3, "Welke provincie heeft 's-Hertogenbosch als hoofdstad?",
    ['Zeeland', 'Gelderland', 'Limburg', 'Noord-Brabant'], 3,
    "'s-Hertogenbosch, ook wel Den Bosch, is de hoofdstad van Noord-Brabant."),
  cp('cp-22', 3, 'Welke provincie heeft Leeuwarden als hoofdstad?',
    ['Groningen', 'Drenthe', 'Friesland', 'Overijssel'], 2,
    'Leeuwarden is de hoofdstad van Friesland. Het is ook een bekende cultuurstad.'),
  cp('cp-23', 3, 'Welke provincie heeft Middelburg als hoofdstad?',
    ['Noord-Holland', 'Zuid-Holland', 'Noord-Brabant', 'Zeeland'], 3,
    'Middelburg is de hoofdstad van Zeeland. Het ligt op het eiland Walcheren.'),
  cp('cp-24', 3, 'Welke provincie heeft Lelystad als hoofdstad?',
    ['Utrecht', 'Noord-Holland', 'Flevoland', 'Overijssel'], 2,
    'Lelystad is de hoofdstad van Flevoland, de nieuwste provincie van Nederland.'),
  cp('cp-25', 3, 'Welke provincie heeft Assen als hoofdstad?',
    ['Groningen', 'Friesland', 'Overijssel', 'Drenthe'], 3,
    'Assen is de hoofdstad van Drenthe. De provincie staat bekend om de hunebedden.'),

  // ── Locate level 1 — windrichtingen van provincies en grote steden ──────────
  lo('lo-01', 1, 'In welk deel van Nederland ligt de provincie Groningen?',
    ['Zuiden', 'Westen', 'Oosten', 'Noorden'], 3,
    'Groningen ligt in het noorden van Nederland, vlak aan de grens met Duitsland.'),
  lo('lo-02', 1, 'In welk deel van Nederland ligt de provincie Limburg?',
    ['Noorden', 'Westen', 'Zuiden', 'Oosten'], 2,
    'Limburg ligt in het zuiden van Nederland. Het is een smalle provincie ingeklemd tussen België en Duitsland.'),
  lo('lo-03', 1, 'In welk deel van Nederland ligt de provincie Noord-Holland?',
    ['Oosten', 'Zuiden', 'Westen', 'Noorden'], 2,
    'Noord-Holland ligt in het westen van Nederland. Amsterdam, de hoofdstad van Nederland, ligt ook in Noord-Holland.'),
  lo('lo-04', 1, 'In welk deel van Nederland ligt de provincie Zeeland?',
    ['Noorden', 'Oosten', 'Zuiden', 'Westen'], 2,
    'Zeeland ligt in het zuidwesten van Nederland, aan de grens met België.'),
  lo('lo-05', 1, 'In welk deel van Nederland ligt Amsterdam?',
    ['Zuiden', 'Oosten', 'Westen', 'Noorden'], 2,
    'Amsterdam ligt in het westen van Nederland, in de provincie Noord-Holland.'),
  lo('lo-06', 1, 'In welk deel van Nederland ligt de provincie Drenthe?',
    ['Westen', 'Noorden', 'Zuiden', 'Oosten'], 1,
    'Drenthe ligt in het noorden van Nederland, maar iets meer naar het midden dan Groningen.'),
  lo('lo-07', 1, 'In welk deel van Nederland ligt de provincie Gelderland?',
    ['Noorden', 'Westen', 'Zuiden', 'Oosten'], 3,
    'Gelderland ligt in het oosten van Nederland, aan de grens met Duitsland.'),
  lo('lo-n1', 1, 'In welk deel van Nederland ligt de provincie Friesland?',
    ['Zuiden', 'Oosten', 'Westen', 'Noorden'], 3,
    'Friesland ligt in het noorden van Nederland. De provincie is bekend om de Friese taal en het schaatsen.'),
  lo('lo-n2', 1, 'In welk deel van Nederland ligt de provincie Noord-Brabant?',
    ['Noorden', 'Oosten', 'Zuiden', 'Westen'], 2,
    "Noord-Brabant ligt in het zuiden van Nederland, boven België. De hoofdstad is 's-Hertogenbosch."),
  lo('lo-n3', 1, 'In welk deel van Nederland ligt de provincie Overijssel?',
    ['Westen', 'Noorden', 'Zuiden', 'Oosten'], 3,
    'Overijssel ligt in het oosten van Nederland, aan de grens met Duitsland. Zwolle is de hoofdstad.'),

  // ── Locate level 2 — steden in provincies, ligging aan kust of grens ────────
  lo('lo-09', 2, 'De Waddeneilanden liggen voor welke kust van Nederland?',
    ['Zuidkust', 'Oostkust', 'Westkust', 'Noordkust'], 3,
    'De Waddeneilanden liggen voor de noordkust van Nederland, in de Waddenzee.'),
  lo('lo-10', 2, 'In welke provincie ligt de stad Nijmegen?',
    ['Utrecht', 'Overijssel', 'Limburg', 'Gelderland'], 3,
    'Nijmegen ligt in de provincie Gelderland. Het is een van de oudste steden van Nederland.'),
  lo('lo-11', 2, 'In welke provincie ligt de stad Eindhoven?',
    ['Zeeland', 'Limburg', 'Noord-Brabant', 'Gelderland'], 2,
    'Eindhoven ligt in Noord-Brabant. Het is bekend als stad van design en technologie.'),
  lo('lo-12', 2, 'Welke van deze provincies grenst NIET aan de Noordzee?',
    ['Noord-Holland', 'Friesland', 'Overijssel', 'Zeeland'], 2,
    'Overijssel grenst niet aan de Noordzee. Dat doen wel Groningen, Friesland, Noord-Holland, Zuid-Holland en Zeeland.'),
  lo('lo-13', 2, 'In welke provincie ligt Rotterdam?',
    ['Noord-Holland', 'Utrecht', 'Zeeland', 'Zuid-Holland'], 3,
    'Rotterdam ligt in Zuid-Holland. Het is de grootste haven van Europa.'),
  lo('lo-14', 2, 'In welke provincie ligt de stad Breda?',
    ['Zeeland', 'Limburg', 'Noord-Brabant', 'Gelderland'], 2,
    'Breda ligt in Noord-Brabant. Het is een historische stad met een groot kasteel.'),
  lo('lo-15', 2, 'In welke provincie ligt de stad Enschede?',
    ['Drenthe', 'Gelderland', 'Overijssel', 'Friesland'], 2,
    'Enschede ligt in Overijssel, vlak aan de grens met Duitsland.'),
  lo('lo-16', 2, 'Het IJsselmeer ligt in het midden van Nederland. Welke provincie is er speciaal voor drooggelegd?',
    ['Utrecht', 'Noord-Holland', 'Flevoland', 'Friesland'], 2,
    'Flevoland is drooggelegd vanuit het IJsselmeer. De provincie is letterlijk uit het water gewonnen.'),
  lo('lo-17', 2, 'In welke provincie ligt de stad Maastricht?',
    ['Noord-Brabant', 'Zeeland', 'Gelderland', 'Limburg'], 3,
    'Maastricht ligt in Limburg, helemaal in het zuiden van Nederland.'),
  lo('lo-18', 2, 'In welke provincie ligt de stad Leeuwarden?',
    ['Groningen', 'Drenthe', 'Overijssel', 'Friesland'], 3,
    'Leeuwarden ligt in Friesland. Het is de hoofdstad van die provincie.'),
  lo('lo-19', 2, 'In welke provincie ligt de stad Arnhem?',
    ['Utrecht', 'Overijssel', 'Limburg', 'Gelderland'], 3,
    'Arnhem ligt in Gelderland. Het is de hoofdstad van die provincie.'),
  lo('lo-20', 2, 'In welke provincie ligt Texel, het grootste Waddeneiland?',
    ['Friesland', 'Groningen', 'Noord-Holland', 'Zeeland'], 2,
    'Texel ligt in de provincie Noord-Holland. Het is het grootste en meest westelijke Waddeneiland.'),

  // ── Locate level 3 — rivieren, delta, specifieke ligging ───────────────────
  lo('lo-21', 3, 'Welke rivier stroomt door de stad Arnhem?',
    ['Maas', 'IJssel', 'Waal', 'Rijn'], 3,
    'De Rijn stroomt door Arnhem. Net na Arnhem splitst de Rijn zich in de Waal en de IJssel.'),
  lo('lo-22', 3, 'De delta van Nederland ligt in het zuidwesten. Welke rivieren monden daar uit?',
    ['Rijn en Eems', 'Maas en Waal', 'Rijn, Maas en Schelde', 'IJssel en Vecht'], 2,
    'De Rijn, de Maas en de Schelde monden uit in de Zeeuwse delta, het zuidwesten van Nederland.'),
  lo('lo-23', 3, 'In welk deel van Nederland ligt het IJsselmeer?',
    ['Zuidwesten', 'Noorden', 'Midden', 'Oosten'], 2,
    'Het IJsselmeer ligt in het midden van Nederland, omringd door Noord-Holland, Friesland en Flevoland.'),
  lo('lo-24', 3, 'Welke provincie heeft geen grens met een ander land of de zee?',
    ['Utrecht', 'Limburg', 'Zeeland', 'Groningen'], 0,
    'Utrecht grenst niet aan de zee of aan een buitenlands land. Het ligt ingesloten door andere provincies.'),
  lo('lo-25', 3, 'De rivier de IJssel stroomt van Arnhem naar het IJsselmeer. Door welke provincie stroomt hij?',
    ['Noord-Brabant', 'Drenthe', 'Overijssel', 'Friesland'], 2,
    'De IJssel stroomt door Overijssel richting het noorden. De rivier begint in Gelderland bij Arnhem waar hij afsplitst van de Rijn.'),
  lo('lo-26', 3, 'Welke Waddeneilanden horen bij de provincie Friesland?',
    ['Texel en Vlieland', 'Terschelling, Ameland en Schiermonnikoog', 'Schiermonnikoog en Texel', 'Vlieland en Terschelling'], 1,
    'Terschelling, Ameland en Schiermonnikoog horen bij Friesland. Texel en Vlieland horen bij Noord-Holland.'),
  lo('lo-27', 3, 'In welke provincie ligt de Veluwe, het grote natuurgebied?',
    ['Utrecht', 'Overijssel', 'Gelderland', 'Drenthe'], 2,
    'De Veluwe ligt in Gelderland. Het is het grootste aaneengesloten natuurgebied van Nederland.'),
  lo('lo-28', 3, 'De stad Nijmegen ligt aan welke rivier?',
    ['Rijn', 'IJssel', 'Maas', 'Waal'], 3,
    'Nijmegen ligt aan de Waal. De Waal is de zuidelijke aftakking van de Rijn bij Arnhem.'),
  lo('lo-29', 3, 'Het nationale park de Biesbosch ligt in twee provincies. Welke zijn dat?',
    ['Zeeland en Noord-Brabant', 'Noord-Brabant en Zuid-Holland', 'Gelderland en Utrecht', 'Zuid-Holland en Zeeland'], 1,
    'De Biesbosch ligt deels in Noord-Brabant en deels in Zuid-Holland. Het is een uniek rivierengebied vol kreken en rieteilanden.'),
  lo('lo-30', 3, 'Welke provincie ligt helemaal in het uiterste zuidoosten van Nederland?',
    ['Noord-Brabant', 'Zeeland', 'Gelderland', 'Limburg'], 3,
    'Limburg ligt in het uiterste zuidoosten van Nederland. De provincie grenst aan zowel België als Duitsland.'),

  // ── Feature level 1 — basisfeiten die een kind al (half) weet ───────────────
  ft('ft-01', 1, 'Welke zee ligt ten westen van Nederland?',
    ['Waddenzee', 'Middellandse Zee', 'Noordzee', 'Baltische Zee'], 2,
    'De Noordzee ligt ten westen van Nederland. Veel Nederlandse vissers vissen op de Noordzee.'),
  ft('ft-02', 1, 'Welk land grenst aan de oostkant van Nederland?',
    ['België', 'Frankrijk', 'Duitsland', 'Denemarken'], 2,
    'Duitsland grenst aan de oostkant van Nederland. Het is het grootste buurland van Nederland.'),
  ft('ft-03', 1, 'Welk land grenst aan de zuidkant van Nederland?',
    ['Duitsland', 'België', 'Luxemburg', 'Frankrijk'], 1,
    'België grenst aan de zuidkant van Nederland. Ten oosten grenst Nederland aan Duitsland.'),
  ft('ft-04', 1, 'Hoeveel provincies heeft Nederland?',
    ['10', '11', '12', '13'], 2,
    'Nederland heeft 12 provincies. De nieuwste is Flevoland, die pas in 1986 een provincie werd.'),
  ft('ft-05', 1, 'Wat is de hoofdstad van Nederland?',
    ['Den Haag', 'Rotterdam', 'Utrecht', 'Amsterdam'], 3,
    'Amsterdam is de hoofdstad van Nederland. De regering zit echter in Den Haag.'),
  ft('ft-06', 1, 'Hoe heet de zee die ten noorden van Nederland ligt, tussen de Waddeneilanden en het vasteland?',
    ['Noordzee', 'IJsselmeer', 'Waddenzee', 'Zuiderzee'], 2,
    'De Waddenzee ligt tussen de Waddeneilanden en het vasteland van Nederland. Het is een beschermd natuurgebied.'),
  ft('ft-07', 1, 'Welke rivier stroomt door Rotterdam naar de zee?',
    ['Rijn', 'IJssel', 'Maas', 'Schelde'], 2,
    'De Maas stroomt door Rotterdam naar de Noordzee. Rotterdam heeft de grootste haven van Europa.'),
  ft('ft-08', 1, 'Wat zijn de Waddeneilanden?',
    ['Bergen in het noorden', 'Eilanden voor de noordkust', 'Meren in Friesland', 'Steden in Groningen'], 1,
    'De Waddeneilanden zijn eilanden voor de noordkust van Nederland. Ze liggen in de Waddenzee.'),
  ft('ft-09', 1, 'Welke stad is de grootste haven van Europa?',
    ['Amsterdam', 'Antwerpen', 'Rotterdam', 'Hamburg'], 2,
    'Rotterdam heeft de grootste haven van Europa. Elk jaar komen er duizenden schepen aan.'),
  ft('ft-10', 1, 'Wat is een polder?',
    ['Een soort berg', 'Een drooggelegd stuk land', 'Een rivier', 'Een bos'], 1,
    'Een polder is een stuk land dat drooggelegd is. Nederland heeft heel veel polders, vaak onder de zeespiegel.'),
  ft('ft-22', 1, 'Welke stad is de zetel van de Nederlandse regering?',
    ['Amsterdam', 'Utrecht', 'Den Haag', 'Rotterdam'], 2,
    'De Nederlandse regering zit in Den Haag, niet in Amsterdam. Amsterdam is wel de officiële hoofdstad.'),
  ft('ft-n1', 1, 'Welke rivier stroomt vanuit Duitsland Nederland binnen en loopt via Arnhem naar zee?',
    ['Maas', 'IJssel', 'Rijn', 'Schelde'], 2,
    'De Rijn stroomt vanuit Duitsland via Arnhem door Nederland. Bij Arnhem splitst de Rijn zich in de Waal en de IJssel.'),

  // ── Feature level 2 — rivieren, zeeën, dijken, grote feiten ────────────────
  ft('ft-11', 2, 'Welke rivier stroomt door de stad Utrecht?',
    ['Rijn', 'Maas', 'IJssel', 'Vecht'], 0,
    'De Rijn (de Kromme Rijn en de Oude Rijn) stroomt door Utrecht. De stad heeft veel mooie grachten.'),
  ft('ft-12', 2, 'De Rijn splitst bij Arnhem in twee rivieren. Welke zijn dat?',
    ['Maas en IJssel', 'Waal en IJssel', 'Schelde en Maas', 'Vecht en Lek'], 1,
    'Bij Arnhem splitst de Rijn in de Waal (naar het zuiden) en de IJssel (naar het noorden).'),
  ft('ft-13', 2, 'Welke rivier stroomt vanuit België door Zeeland naar de Noordzee?',
    ['Rijn', 'Waal', 'Schelde', 'Maas'], 2,
    'De Schelde stroomt vanuit België door Zeeland naar de zee. Antwerpen in België ligt ook aan de Schelde.'),
  ft('ft-14', 2, 'Wat is het IJsselmeer?',
    ['Een meer in Friesland', 'Een groot meer in het midden van Nederland', 'Een rivier in Overijssel', 'Een zee bij de Wadden'], 1,
    'Het IJsselmeer is een groot meer in het midden van Nederland. Het was vroeger de Zuiderzee, maar werd in 1932 afgesloten door de Afsluitdijk.'),
  ft('ft-15', 2, 'Door welke provincies stroomt de rivier de Maas?',
    ['Groningen en Drenthe', 'Utrecht en Noord-Holland', 'Limburg en Noord-Brabant', 'Overijssel en Gelderland'], 2,
    'De Maas stroomt door Limburg en Noord-Brabant voordat hij uitmondt in de Noordzee. Maastricht ligt ook aan de Maas.'),
  ft('ft-16', 2, 'Hoe heet de dijk die het IJsselmeer afsloot van de Waddenzee?',
    ['Deltawerken', 'Houtribdijk', 'Afsluitdijk', 'Markerwaarddijk'], 2,
    'De Afsluitdijk sluit het IJsselmeer af van de Waddenzee. Hij werd voltooid in 1932 en verbindt Noord-Holland met Friesland.'),
  ft('ft-17', 2, 'Welke provincie grenst aan zowel België als Duitsland?',
    ['Noord-Brabant', 'Zeeland', 'Gelderland', 'Limburg'], 3,
    'Limburg grenst aan zowel België als Duitsland. Het is de meest zuidoostelijke provincie van Nederland.'),
  ft('ft-18', 2, 'Wat zijn de Deltawerken?',
    ['Dijken in het noorden', 'Stormvloedkeringen in het zuidwesten', 'Sluizen bij Rotterdam', 'Polders in Flevoland'], 1,
    'De Deltawerken zijn stormvloedkeringen in Zeeland en Zuid-Holland. Ze beschermen Nederland tegen overstromingen.'),
  ft('ft-19', 2, 'Welke rivier stroomt van Arnhem naar Kampen en mondt uit in het IJsselmeer?',
    ['Rijn', 'Waal', 'Maas', 'IJssel'], 3,
    'De IJssel stroomt van Arnhem via Deventer en Zwolle naar Kampen, waar hij uitmondt in het IJsselmeer.'),
  ft('ft-20', 2, 'In welke provincie ligt de Hoge Veluwe, het bekende nationale park?',
    ['Utrecht', 'Overijssel', 'Gelderland', 'Drenthe'], 2,
    'De Hoge Veluwe ligt in Gelderland. Er staat ook het beroemde Kröller-Müller museum.'),
  ft('ft-21', 2, 'Welk groot meer ligt tussen de provincies Friesland, Flevoland en Noord-Holland?',
    ['Markermeer', 'IJsselmeer', 'Waddenzee', 'Veluwerandmeer'], 1,
    'Het IJsselmeer ligt tussen Friesland, Flevoland en Noord-Holland. Het is het grootste meer van Nederland.'),

  // ── Feature level 3 — details, verbanden, lastigere feiten ─────────────────
  ft('ft-23', 3, 'Welke provincie is het nieuwst en werd pas in 1986 een officiële provincie?',
    ['Utrecht', 'Zeeland', 'Flevoland', 'Drenthe'], 2,
    'Flevoland is de nieuwste provincie van Nederland. Het land werd drooggelegd vanuit het IJsselmeer.'),
  ft('ft-24', 3, 'Wat betekent het dat Flevoland is drooggelegd?',
    ['Het land is verbrand', 'Het water is weggepompt om land te maken', 'Er zijn bomen gekapt', 'Er zijn polders overstroomd'], 1,
    'Droogleggen betekent dat het water is weggepompt zodat er land ontstaat. Flevoland was vroeger de bodem van de Zuiderzee.'),
  ft('ft-25', 3, 'De Waal is de grootste rivier van Nederland. Waar begint de Waal?',
    ['Bij Rotterdam', 'Bij Nijmegen', 'Bij Arnhem', 'Bij Utrecht'], 2,
    'De Waal begint bij Arnhem, waar de Rijn zich splitst. De Waal is de zuidelijkste en grootste aftakking.'),
  ft('ft-26', 3, 'Welke provincie heeft geen directe grens met de Noordzee of een buurland?',
    ['Drenthe', 'Utrecht', 'Overijssel', 'Gelderland'], 1,
    'Utrecht heeft geen grens met de zee of een buurland. Het is omringd door andere Nederlandse provincies.'),
  ft('ft-27', 3, 'Door welke Nederlandse stad stroomt de rivier de Maas?',
    ['Utrecht', 'Arnhem', 'Maastricht', 'Zwolle'], 2,
    'Maastricht ligt aan de Maas. De stad heeft een rijke geschiedenis en is de meest zuidelijke grote stad van Nederland.'),
  ft('ft-28', 3, 'De Zuiderzee werd in 1932 afgesloten. Hoe heet dit binnenwater nu?',
    ['Waddenzee', 'Markermeer', 'Zuiderzee', 'IJsselmeer'], 3,
    'Na de afsluiting door de Afsluitdijk in 1932 heet de vroegere Zuiderzee nu het IJsselmeer. Flevoland is later uit dit meer drooggelegd.'),
  ft('ft-29', 3, 'Hoeveel Waddeneilanden heeft Nederland?',
    ['3', '4', '5', '6'], 2,
    'Nederland heeft vijf Waddeneilanden: Texel, Vlieland, Terschelling, Ameland en Schiermonnikoog.'),
  ft('ft-30', 3, 'Wat zijn de Deltawerken, gebouwd na de watersnoodramp van 1953?',
    ['Tunnels onder de rivieren', 'Dijken en dammen in Zeeland', 'Polders in Noord-Holland', 'Bruggen over de Rijn'], 1,
    'De Deltawerken zijn een reeks dammen, sluizen en stormvloedkeringen in Zeeland. Ze werden gebouwd na de grote overstroming van 1953.'),
  ft('ft-31', 3, 'De Afsluitdijk verbindt welke twee provincies?',
    ['Friesland en Groningen', 'Noord-Holland en Friesland', 'Overijssel en Friesland', 'Noord-Holland en Flevoland'], 1,
    'De Afsluitdijk verbindt Noord-Holland met Friesland. Hij sluit het IJsselmeer af van de Waddenzee.'),
  ft('ft-32', 3, 'Door welke rivier stroomt het water vanuit België door Maastricht?',
    ['Rijn', 'Schelde', 'IJssel', 'Maas'], 3,
    'De Maas stroomt vanuit België door Maastricht en verder door Noord-Brabant richting de zee.'),
  ft('ft-33', 3, 'In Nederland liggen veel gebieden onder de zeespiegel. Hoe worden die laaggelegen gebieden beschermd?',
    ['Door hoge bergen', 'Door dijken en duinen', 'Door bossen', 'Door ondergrondse pompen'], 1,
    'Nederland gebruikt dijken en duinen om het land te beschermen tegen het water. Zonder deze dijken zou een groot deel van Nederland onder water staan.'),
  ft('ft-34', 3, 'Welke provincie heeft de meeste inwoners van Nederland?',
    ['Noord-Holland', 'Zuid-Holland', 'Noord-Brabant', 'Utrecht'], 1,
    'Zuid-Holland is de dichtstbevolkte provincie. Den Haag en Rotterdam, twee grote steden, liggen allebei in Zuid-Holland.'),
  ft('ft-35', 3, 'Het Groene Hart is een groot weidelandgebied. Tussen welke steden ligt het?',
    ['Arnhem, Nijmegen en Utrecht', 'Amsterdam, Den Haag en Utrecht', 'Rotterdam, Breda en Tilburg', 'Haarlem, Alkmaar en Hoorn'], 1,
    'Het Groene Hart ligt tussen Amsterdam, Den Haag en Utrecht. Het is een open polderlandschap in het drukke westen van Nederland.'),
]
