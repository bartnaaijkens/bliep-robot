export type ThinkingQuestionType = 'odd-one-out' | 'pattern' | 'true-false' | 'deduction'

export interface ThinkingQuestion {
  id: string
  type: ThinkingQuestionType
  difficulty: 1 | 2 | 3
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface ThinkingAnswer {
  questionId: string
  isCorrect: boolean
  chosenIndex: number
}

export interface ThinkingSession {
  questions: ThinkingQuestion[]
  currentIndex: number
  correct: number
  wrong: number
  answers: ThinkingAnswer[]
}

const LEVEL_KEY = 'bliep_thinking_level'

export function loadThinkingLevel(): 1 | 2 | 3 {
  try {
    const raw = localStorage.getItem(LEVEL_KEY)
    const n = parseInt(raw ?? '1', 10)
    return n === 2 ? 2 : n === 3 ? 3 : 1
  } catch {
    return 1
  }
}

export function saveThinkingLevel(level: 1 | 2 | 3): void {
  localStorage.setItem(LEVEL_KEY, String(level))
}

export function advanceThinkingLevel(session: ThinkingSession): void {
  const current = loadThinkingLevel()
  const pct = session.correct / session.questions.length
  let next: 1 | 2 | 3 = current
  if (pct >= 0.9 && current < 3) next = (current + 1) as 1 | 2 | 3
  if (pct <= 0.5 && current > 1) next = (current - 1) as 1 | 2 | 3
  saveThinkingLevel(next)
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function shuffleOptions(q: ThinkingQuestion): ThinkingQuestion {
  const correctAnswer = q.options[q.correctIndex]
  const shuffled = shuffle([...q.options])
  return { ...q, options: shuffled, correctIndex: shuffled.indexOf(correctAnswer) }
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function buildThinkingSession(level: 1 | 2 | 3): ThinkingSession {
  const d1 = QUESTION_BANK.filter(q => q.difficulty === 1)
  const d2 = QUESTION_BANK.filter(q => q.difficulty === 2)
  const d3 = QUESTION_BANK.filter(q => q.difficulty === 3)

  let pool: ThinkingQuestion[]
  if (level === 1) {
    pool = shuffle(d1).slice(0, 10)
  } else if (level === 2) {
    pool = [...shuffle(d1).slice(0, 3), ...shuffle(d2).slice(0, 7)]
  } else {
    pool = [...shuffle(d2).slice(0, 3), ...shuffle(d3).slice(0, 7)]
  }

  const questions = shuffle(pool).map(q =>
    q.type === 'true-false' ? q : shuffleOptions(q),
  )

  return { questions, currentIndex: 0, correct: 0, wrong: 0, answers: [] }
}

// currentIndex is NOT incremented here — it advances only when the next question
// is shown, so the feedback phase can still display the answered question.
export function recordThinkingAnswer(
  session: ThinkingSession,
  chosenIndex: number,
): { isCorrect: boolean; nextSession: ThinkingSession } {
  const q = session.questions[session.currentIndex]
  const isCorrect = chosenIndex === q.correctIndex
  const answer: ThinkingAnswer = { questionId: q.id, isCorrect, chosenIndex }
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

const CORRECT_PREFIXES = ['Super!', 'Goed zo!', 'Helemaal goed!', 'Ja, klopt!', 'Toppie!']
const WRONG_PREFIXES = ['Bijna!', 'Niet helemaal.', 'Dat is nog niet goed.', 'Goed geprobeerd.']

export function thinkingEncouragementText(isCorrect: boolean, q: ThinkingQuestion): string {
  return `${pick(isCorrect ? CORRECT_PREFIXES : WRONG_PREFIXES)} ${q.explanation}`
}

export function thinkingScoreText(session: ThinkingSession): string {
  const { correct, questions } = session
  const total = questions.length
  const pct = correct / total
  if (pct >= 0.9) return `Je had ${correct} van de ${total} goed! Geweldig, je bent een echte denker!`
  if (pct >= 0.7) return `Je had ${correct} van de ${total} goed! Heel goed gedaan!`
  return `Je had ${correct} van de ${total} goed! Goed geprobeerd, oefenen maakt de meester!`
}

export function formatThinkingQuestion(q: ThinkingQuestion): string {
  if (q.type === 'odd-one-out') {
    const items = q.options.slice(0, -1).join(', ')
    return `Welke hoort er niet bij: ${items} of ${q.options[q.options.length - 1]}?`
  }
  if (q.type === 'pattern') {
    // Emoji confuse Chrome's speech synthesis; use a generic prompt instead.
    const hasEmoji = /\p{Emoji_Presentation}/u.test(q.prompt)
    return hasEmoji ? 'Welk symbool of kleur komt er daarna?' : `Wat komt er daarna: ${q.prompt}`
  }
  if (q.type === 'true-false') return `Waar of niet waar: ${q.prompt}`
  return q.prompt
}

export const THINKING_STATUS: Record<string, string> = {
  'thinking-question': 'Wat denk jij?',
  'thinking-correct':  'Dat klopt!',
  'thinking-wrong':    'Bijna goed!',
  'thinking-done':     'Klaar!',
}

// compact helpers for building the question bank
function oo(id: string, d: 1|2|3, options: string[], ci: number, explanation: string): ThinkingQuestion {
  return { id, type: 'odd-one-out', difficulty: d, prompt: 'Welke hoort er niet bij?', options, correctIndex: ci, explanation }
}
function pt(id: string, d: 1|2|3, prompt: string, options: string[], ci: number, explanation: string): ThinkingQuestion {
  return { id, type: 'pattern', difficulty: d, prompt, options, correctIndex: ci, explanation }
}
function tf(id: string, d: 1|2|3, prompt: string, ci: number, explanation: string): ThinkingQuestion {
  return { id, type: 'true-false', difficulty: d, prompt, options: ['Waar', 'Niet waar'], correctIndex: ci, explanation }
}
function de(id: string, d: 1|2|3, prompt: string, options: string[], ci: number, explanation: string): ThinkingQuestion {
  return { id, type: 'deduction', difficulty: d, prompt, options, correctIndex: ci, explanation }
}

export const QUESTION_BANK: ThinkingQuestion[] = [
  // ── Odd-one-out level 1 ──────────────────────────────────────────────────
  oo('oo-01', 1, ['Hond', 'Kat', 'Goudvis', 'Auto'], 3,
    'Auto hoort er niet bij, want een hond, kat en goudvis zijn huisdieren.'),
  oo('oo-02', 1, ['Appel', 'Peer', 'Wortel', 'Banaan'], 2,
    'Wortel hoort er niet bij. Een appel, peer en banaan zijn fruit. Een wortel is een groente.'),
  oo('oo-03', 1, ['Maandag', 'Dinsdag', 'Mei', 'Vrijdag'], 2,
    'Mei hoort er niet bij. Maandag, dinsdag en vrijdag zijn weekdagen. Mei is een maand.'),
  oo('oo-04', 1, ['Piano', 'Gitaar', 'Viool', 'Stoel'], 3,
    'Stoel hoort er niet bij. Een piano, gitaar en viool zijn muziekinstrumenten. Een stoel is een meubel.'),
  oo('oo-05', 1, ['Zwemmen', 'Fietsen', 'Lopen', 'Slapen'], 3,
    'Slapen hoort er niet bij. Zwemmen, fietsen en lopen zijn sporten. Slapen is geen sport.'),
  oo('oo-06', 1, ['Neus', 'Oog', 'Oor', 'Hoed'], 3,
    'Hoed hoort er niet bij. Een neus, oog en oor zijn lichaamsdelen. Een hoed is kleding.'),
  oo('oo-07', 1, ['Brood', 'Melk', 'Boter', 'Steen'], 3,
    'Steen hoort er niet bij. Brood, melk en boter zijn eten of drinken. Een steen eet je niet.'),
  oo('oo-08', 1, ['Pen', 'Potlood', 'Liniaal', 'Fiets'], 3,
    'Fiets hoort er niet bij. Een pen, potlood en liniaal zijn schoolspullen. Een fiets is een vervoermiddel.'),
  oo('oo-09', 1, ['Lamp', 'Maan', 'Zon', 'Ster'], 0,
    'Lamp hoort er niet bij. De maan, zon en ster zijn in de ruimte. Een lamp is een lichtbron in huis.'),
  oo('oo-10', 1, ['Amsterdam', 'Rotterdam', 'Berlijn', 'Den Haag'], 2,
    'Berlijn hoort er niet bij. Amsterdam, Rotterdam en Den Haag zijn steden in Nederland. Berlijn is in Duitsland.'),
  oo('oo-11', 1, ['Oktober', 'Zomer', 'Winter', 'Lente'], 0,
    'Oktober hoort er niet bij. Zomer, winter en lente zijn seizoenen. Oktober is een maand.'),
  oo('oo-12', 1, ['Rood', 'Blauw', 'Groot', 'Groen'], 2,
    'Groot hoort er niet bij. Rood, blauw en groen zijn kleuren. Groot is een maat.'),
  oo('oo-13', 1, ['Beer', 'Leeuw', 'Wolf', 'Konijn'], 3,
    'Konijn hoort er niet bij. Een beer, leeuw en wolf zijn roofdieren. Een konijn is geen roofdier.'),
  oo('oo-14', 1, ['Bed', 'Bank', 'Stoel', 'Laptop'], 3,
    'Laptop hoort er niet bij. Een bed, bank en stoel zijn meubels. Een laptop is een computer.'),
  oo('oo-15', 1, ['Boot', 'Auto', 'Trein', 'Schoen'], 3,
    'Schoen hoort er niet bij. Een boot, auto en trein zijn vervoermiddelen. Een schoen draag je aan je voet.'),

  // ── Odd-one-out level 2 ──────────────────────────────────────────────────
  oo('oo-16', 2, ['Roos', 'Tulp', 'Eik', 'Zonnebloem'], 2,
    'Eik hoort er niet bij. Een roos, tulp en zonnebloem zijn bloemen. Een eik is een boom.'),
  oo('oo-17', 2, ['Cirkel', 'Driehoek', 'Blauw', 'Vierkant'], 2,
    'Blauw hoort er niet bij. Een cirkel, driehoek en vierkant zijn vormen. Blauw is een kleur.'),
  oo('oo-18', 2, ['Nederland', 'Duitsland', 'Parijs', 'Spanje'], 2,
    'Parijs hoort er niet bij. Nederland, Duitsland en Spanje zijn landen. Parijs is een stad.'),
  oo('oo-19', 2, ['Aarde', 'Mars', 'Maan', 'Jupiter'], 2,
    'Maan hoort er niet bij. De Aarde, Mars en Jupiter zijn planeten. De Maan is een maan, geen planeet.'),
  oo('oo-20', 2, ['Koe', 'Varken', 'Kip', 'Hond'], 3,
    'Hond hoort er niet bij. Een koe, varken en kip zijn boerderijdieren. Een hond is een huisdier.'),
  oo('oo-21', 2, ['Honger', 'Dorst', 'Blij', 'Eten'], 3,
    'Eten hoort er niet bij. Honger, dorst en blij zijn gevoelens. Eten is een bezigheid.'),
  oo('oo-22', 2, ['Centimeter', 'Meter', 'Kilo', 'Kilometer'], 2,
    'Kilo hoort er niet bij. Centimeter, meter en kilometer zijn lengtematen. Kilo is een gewichtsmaat.'),
  oo('oo-23', 2, ['Lente', 'Zomer', 'December', 'Herfst'], 2,
    'December hoort er niet bij. Lente, zomer en herfst zijn seizoenen. December is een maand.'),
  oo('oo-24', 2, ['Ei', 'Nest', 'Veer', 'Schub'], 3,
    'Schub hoort er niet bij. Een ei, nest en veer horen bij vogels. Een schub hoort bij vissen.'),
  oo('oo-25', 2, ['Poes', 'Hamster', 'Konijn', 'Haai'], 3,
    'Haai hoort er niet bij. Een poes, hamster en konijn zijn huisdieren. Een haai leeft in zee.'),
  oo('oo-26', 2, ['Bakker', 'Loodgieter', 'Timmerman', 'Brood'], 3,
    'Brood hoort er niet bij. Een bakker, loodgieter en timmerman zijn beroepen. Brood is een voedingsmiddel.'),
  oo('oo-27', 2, ['Sneeuw', 'Regen', 'Wind', 'Vuur'], 3,
    'Vuur hoort er niet bij. Sneeuw, regen en wind zijn weersomstandigheden. Vuur is geen weer.'),
  oo('oo-28', 2, ['Atlas', 'Woordenboek', 'Roman', 'Schaar'], 3,
    'Schaar hoort er niet bij. Een atlas, woordenboek en roman zijn boeken. Een schaar is gereedschap.'),
  oo('oo-29', 2, ['Fransen', 'Duitsers', 'Spanjaarden', 'Amsterdammers'], 3,
    'Amsterdammers hoort er niet bij. Fransen, Duitsers en Spanjaarden zijn nationaliteiten. Amsterdammers zijn mensen uit de stad Amsterdam.'),
  oo('oo-30', 2, ['Schommel', 'Glijbaan', 'Wip', 'Bank'], 3,
    'Bank hoort er niet bij. Een schommel, glijbaan en wip zijn speeltuigtoestellen. Een bank is een zitmeubel.'),

  // ── Odd-one-out level 3 ──────────────────────────────────────────────────
  oo('oo-31', 3, ['Dolfijn', 'Walvis', 'Haai', 'Orca'], 2,
    'Haai hoort er niet bij. Een dolfijn, walvis en orca zijn zoogdieren die in zee leven. Een haai is een vis.'),
  oo('oo-32', 3, ['IJzer', 'Goud', 'Hout', 'Zilver'], 2,
    'Hout hoort er niet bij. IJzer, goud en zilver zijn metalen. Hout is geen metaal.'),
  oo('oo-33', 3, ['IJskast', 'Wasmachine', 'Vaatwasser', 'Hamer'], 3,
    'Hamer hoort er niet bij. Een ijskast, wasmachine en vaatwasser zijn huishoudapparaten. Een hamer is gereedschap.'),
  oo('oo-34', 3, ['Koorts', 'Hoofdpijn', 'Griep', 'Pijnstiller'], 3,
    'Pijnstiller hoort er niet bij. Koorts, hoofdpijn en griep zijn klachten. Een pijnstiller is een medicijn.'),
  oo('oo-35', 3, ['Bijl', 'Zaag', 'Hamer', 'Schroef'], 3,
    'Schroef hoort er niet bij. Een bijl, zaag en hamer zijn gereedschappen. Een schroef is een bevestigingsmiddel.'),
  oo('oo-36', 3, ['Olifant', 'Nijlpaard', 'Neushoorn', 'Giraf'], 3,
    'Giraf hoort er niet bij. Een olifant, nijlpaard en neushoorn zijn dikhuiders. Een giraf is dat niet.'),
  oo('oo-37', 3, ['Democratie', 'Monarchie', 'Republiek', 'Eiland'], 3,
    'Eiland hoort er niet bij. Democratie, monarchie en republiek zijn staatsvormen. Een eiland is een stuk land omringd door water.'),
  oo('oo-38', 3, ['Kilogram', 'Celsius', 'Meter', 'Liter'], 1,
    'Celsius hoort er niet bij. Kilogram, meter en liter zijn eenheden voor hoeveelheid. Celsius is een eenheid voor temperatuur.'),
  oo('oo-39', 3, ['Sonate', 'Symfonie', 'Portret', 'Nocturne'], 2,
    'Portret hoort er niet bij. Een sonate, symfonie en nocturne zijn muziekstukken. Een portret is een schilderij of foto.'),
  oo('oo-40', 3, ['Robijn', 'Smaragd', 'Kwarts', 'Diamant'], 2,
    'Kwarts hoort er niet bij. Een robijn, smaragd en diamant zijn edelstenen. Kwarts is een gewoon mineraal.'),

  // ── Pattern level 1 ──────────────────────────────────────────────────────
  pt('pa-01', 1, '2 — 4 — 6 — 8 — ?', ['9', '10', '12', '11'], 1,
    'Het patroon is steeds plus twee. Na acht komt tien.'),
  pt('pa-02', 1, '10 — 20 — 30 — 40 — ?', ['45', '50', '60', '55'], 1,
    'Het patroon is steeds plus tien. Na veertig komt vijftig.'),
  pt('pa-03', 1, '1 — 3 — 5 — 7 — ?', ['8', '9', '10', '11'], 1,
    'Dit zijn de oneven getallen. Het patroon is steeds plus twee. Na zeven komt negen.'),
  pt('pa-04', 1, '5 — 10 — 15 — 20 — ?', ['22', '24', '25', '30'], 2,
    'Dit is de tafel van vijf. Het patroon is steeds plus vijf. Na twintig komt vijfentwintig.'),
  pt('pa-05', 1, '🔴 🔵 🔴 🔵 — ?', ['🟢', '🔴', '🔵', '🟡'], 1,
    'Het patroon is rood — blauw — rood — blauw. Na blauw komt rood.'),
  pt('pa-06', 1, '⭐ ⭐ 🌙 ⭐ ⭐ — ?', ['⭐', '🌙', '☁️', '💫'], 1,
    'Het patroon is twee sterren dan een maan. Na twee sterren komt de maan.'),
  pt('pa-07', 1, '🐱 🐶 🐱 🐶 — ?', ['🐟', '🐱', '🐶', '🐰'], 1,
    'Het patroon is kat — hond — kat — hond. Na hond komt kat.'),
  pt('pa-08', 1, '100 — 90 — 80 — 70 — ?', ['65', '60', '50', '55'], 1,
    'Het patroon is steeds min tien. Na zeventig komt zestig.'),
  pt('pa-09', 1, '🟠 🟠 🟢 🟠 🟠 — ?', ['🟠', '🟢', '🔵', '🔴'], 1,
    'Het patroon is twee oranje dan één groen. Na twee oranje komt groen.'),
  pt('pa-10', 1, '3 — 6 — 9 — 12 — ?', ['14', '15', '16', '13'], 1,
    'Dit is de tafel van drie. Het patroon is steeds plus drie. Na twaalf komt vijftien.'),
  pt('pa-11', 1, '🟡 🔴 🔵 🟡 🔴 — ?', ['🟡', '🔴', '🔵', '🟢'], 2,
    'Het patroon is geel — rood — blauw, steeds opnieuw. Na rood komt blauw.'),
  pt('pa-12', 1, '4 — 8 — 12 — 16 — ?', ['18', '20', '22', '24'], 1,
    'Dit is de tafel van vier. Het patroon is steeds plus vier. Na zestien komt twintig.'),

  // ── Pattern level 2 ──────────────────────────────────────────────────────
  pt('pa-13', 2, '2 — 4 — 8 — 16 — ?', ['20', '24', '32', '18'], 2,
    'Het patroon is steeds keer twee. Na zestien komt tweeëndertig.'),
  pt('pa-14', 2, '1 — 2 — 4 — 7 — 11 — ?', ['14', '15', '16', '17'], 2,
    'Je telt steeds één meer op: plus één, plus twee, plus drie, plus vier, plus vijf. Na elf komt zestien.'),
  pt('pa-15', 2, '🔴 🔵 🟢 🔴 🔵 — ?', ['🔴', '🔵', '🟢', '🟡'], 2,
    'Het patroon is rood — blauw — groen, steeds opnieuw. Na blauw komt groen.'),
  pt('pa-16', 2, '50 — 45 — 40 — 35 — ?', ['32', '28', '30', '25'], 2,
    'Het patroon is steeds min vijf. Na vijfendertig komt dertig.'),
  pt('pa-17', 2, '1 — 4 — 9 — 16 — ?', ['20', '22', '25', '36'], 2,
    'Het patroon zijn de kwadraten: één, twee, drie, vier keer zichzelf. Vijf keer vijf is vijfentwintig.'),
  pt('pa-18', 2, '🌕 🌔 🌓 🌒 — ?', ['🌕', '🌑', '🌓', '🌔'], 1,
    'Het patroon zijn de maanfases van vol naar nieuw. Na de smalle maan komt de nieuwe maan.'),
  pt('pa-19', 2, '10 — 9 — 7 — 4 — ?', ['3', '2', '1', '0'], 3,
    'Je haalt steeds één meer af: min één, min twee, min drie, min vier. Na vier komt nul.'),
  pt('pa-20', 2, '2 — 3 — 5 — 8 — 13 — ?', ['18', '19', '21', '23'], 2,
    'Je telt steeds de twee vorige getallen op: twee plus drie is vijf, acht plus dertien is eenentwintig.'),
  pt('pa-21', 2, '🍎 🍊 🍌 🍎 🍊 — ?', ['🍎', '🍊', '🍌', '🍇'], 2,
    'Het patroon is appel — sinaasappel — banaan, steeds opnieuw. Na sinaasappel komt banaan.'),
  pt('pa-22', 2, '25 — 36 — 49 — 64 — ?', ['72', '81', '100', '70'], 1,
    'Het patroon zijn de kwadraten: vijf, zes, zeven, acht keer zichzelf. Negen keer negen is eenentachtig.'),
  pt('pa-23', 2, '1 — 1 — 2 — 3 — 5 — 8 — ?', ['10', '11', '13', '16'], 2,
    'Je telt steeds de twee vorige getallen op: vijf plus acht is dertien.'),
  pt('pa-24', 2, '🔴 🔴 🔵 🔴 🔴 🔴 — ?', ['🔵', '🔴', '🟢', '🟡'], 0,
    'Het patroon is twee rode dan één blauwe, dan drie rode dan één blauwe. Na drie rode komt blauw.'),
  pt('pa-25', 2, '6 — 12 — 24 — 48 — ?', ['72', '96', '100', '86'], 1,
    'Het patroon is steeds keer twee. Na achtenveertig komt zesennegentig.'),

  // ── Pattern level 3 ──────────────────────────────────────────────────────
  pt('pa-26', 3, 'A — B — C — A — B — ?', ['A', 'B', 'C', 'D'], 2,
    'Het patroon is A — B — C, steeds opnieuw. Na B komt C.'),
  pt('pa-27', 3, '1 — 8 — 27 — 64 — ?', ['100', '125', '128', '216'], 1,
    'Het patroon zijn derdemachten: één, twee, drie, vier tot de derde macht. Vijf tot de derde is honderdvijfentwintig.'),
  pt('pa-28', 3, '🔴 🔵 🔵 🔴 🔵 🔵 🔴 — ?', ['🔴', '🔵', '🟢', '🟡'], 1,
    'Het patroon is één rood dan twee blauw. Na rood komen twee blauwe, dus de volgende is blauw.'),
  pt('pa-29', 3, '2 — 6 — 12 — 20 — ?', ['28', '30', '32', '36'], 1,
    'Het patroon is één keer twee, twee keer drie, drie keer vier, vier keer vijf. Vijf keer zes is dertig.'),
  pt('pa-30', 3, '10 — 5 — 15 — 10 — 20 — ?', ['15', '25', '10', '30'], 0,
    'Het patroon is afwisselend min vijf en plus tien. Na twintig min vijf is vijftien.'),
  pt('pa-31', 3, '1 — 3 — 7 — 15 — 31 — ?', ['47', '55', '63', '61'], 2,
    'Je verdubbelt het getal en telt er één bij op. Twee keer 31 plus één is drieënzestig.'),
  pt('pa-32', 3, 'Januari — April — Juli — Oktober — ?', ['November', 'Januari', 'December', 'Februari'], 1,
    'Het patroon is om de drie maanden. Na oktober zijn er weer drie maanden verder, en dat is januari.'),
  pt('pa-33', 3, '0 — 1 — 1 — 2 — 3 — 5 — 8 — ?', ['10', '11', '13', '16'], 2,
    'Dit is de rij van Fibonacci: je telt steeds de twee vorige getallen op. Vijf plus acht is dertien.'),
  pt('pa-34', 3, '64 — 32 — 16 — 8 — ?', ['6', '4', '2', '1'], 1,
    'Het patroon is steeds gedeeld door twee. Na acht komt vier.'),
  pt('pa-35', 3, '2 — 5 — 11 — 23 — ?', ['35', '41', '47', '46'], 2,
    'Het patroon is steeds keer twee plus één. Twee keer 23 plus één is zevenenveertig.'),

  // ── True/false level 1 ───────────────────────────────────────────────────
  tf('tf-01', 1, 'Spinnen hebben acht poten.', 0,
    'Spinnen hebben precies acht poten. Insecten hebben er zes.'),
  tf('tf-02', 1, 'Een week heeft zeven dagen.', 0,
    'Klopt! Een week heeft zeven dagen: maandag tot en met zondag.'),
  tf('tf-03', 1, 'Vissen leven op het land.', 1,
    'Vissen leven in het water, niet op het land. Ze ademen door kieuwen.'),
  tf('tf-04', 1, 'Water kookt bij honderd graden Celsius.', 0,
    'Bij precies honderd graden gaat water koken en komen er bubbels.'),
  tf('tf-05', 1, 'Een koe geeft sinaasappelsap.', 1,
    'Een koe geeft melk, geen sinaasappelsap. Sinaasappelsap komt van sinaasappels.'),
  tf('tf-06', 1, 'Je hebt twee longen in je lichaam.', 0,
    'Je hebt een linkerlong en een rechterlong. Samen ademen ze lucht in en uit.'),
  tf('tf-07', 1, 'Plantjes hebben zonlicht nodig om te groeien.', 0,
    'Planten gebruiken zonlicht om voedsel te maken. Zonder zon worden ze geel en gaan ze dood.'),
  tf('tf-08', 1, 'Honden hebben vier poten.', 0,
    'Honden hebben vier poten. Ze zijn viervoetigen, net als katten en paarden.'),
  tf('tf-09', 1, 'Rijst groeit op bomen.', 1,
    'Rijst groeit aan kleine planten die in ondiep water staan, niet op bomen.'),
  tf('tf-10', 1, 'Vogels hebben vleugels.', 0,
    'Alle vogels hebben vleugels, maar niet alle vogels kunnen vliegen. Pinguïns hebben ook vleugels.'),
  tf('tf-11', 1, 'Sneeuw is koud.', 0,
    'Sneeuw is bevroren water. Het is altijd kouder dan nul graden.'),
  tf('tf-12', 1, 'Vissen hebben longen.', 1,
    'Vissen hebben geen longen maar kieuwen. Daarmee halen ze zuurstof uit het water.'),

  // ── True/false level 2 ───────────────────────────────────────────────────
  tf('tf-13', 2, 'Alle vogels kunnen vliegen.', 1,
    'Niet alle vogels kunnen vliegen. Een pinguïn en een struisvogel zijn vogels maar kunnen niet vliegen.'),
  tf('tf-14', 2, 'De zon is een planeet.', 1,
    'De zon is een ster, geen planeet. Onze aarde draait om de zon heen.'),
  tf('tf-15', 2, 'Haaien zijn zoogdieren.', 1,
    'Haaien zijn vissen, geen zoogdieren. Zoogdieren zoals dolfijnen ademen lucht en haaien niet.'),
  tf('tf-16', 2, 'Nederland heeft vier seizoenen.', 0,
    'Nederland heeft lente, zomer, herfst en winter. Dat zijn vier seizoenen.'),
  tf('tf-17', 2, 'Ijs wordt warmer van de zon.', 0,
    'De zon geeft warmte. Daardoor smelt ijs en wordt het vloeibaar water.'),
  tf('tf-18', 2, 'Nederland is groter dan Rusland.', 1,
    'Rusland is het grootste land ter wereld. Nederland is veel kleiner dan Rusland.'),
  tf('tf-19', 2, 'De maan geeft zelf licht.', 1,
    'De maan geeft zelf geen licht. De maan weerkaatst het licht van de zon, net als een spiegel.'),
  tf('tf-20', 2, 'Chocolade wordt gemaakt van cacao.', 0,
    'Chocolade wordt gemaakt van cacaobonen. Die groeien aan de cacaoboom.'),
  tf('tf-21', 2, 'Alle insecten hebben zes poten.', 0,
    'Alle insecten hebben precies zes poten. Spinnen hebben er acht, maar spinnen zijn geen insecten.'),
  tf('tf-22', 2, 'Kikkers leven alleen in het water.', 1,
    'Kikkers leven zowel in het water als op het land. Ze zijn amfibieën.'),
  tf('tf-23', 2, 'Zuurstof is nodig om te kunnen leven.', 0,
    'Bijna alle levende wezens hebben zuurstof nodig. Mensen halen het uit de lucht die ze inademen.'),
  tf('tf-24', 2, 'De Amazone is de langste rivier ter wereld.', 1,
    'De Nijl is de langste rivier ter wereld. De Amazone is de rivier met de meeste watertoevoer.'),
  tf('tf-25', 2, 'Dolfijnen zijn vissen.', 1,
    'Dolfijnen zijn zoogdieren, geen vissen. Ze ademen lucht en geven melk aan hun jongen.'),

  // ── True/false level 3 ───────────────────────────────────────────────────
  tf('tf-26', 3, 'Goud is zwaarder dan ijzer.', 0,
    'Goud is veel zwaarder dan ijzer. Een blokje goud weegt bijna vier keer zoveel als hetzelfde blokje van ijzer.'),
  tf('tf-27', 3, 'Een struisvogel kan harder rennen dan een paard.', 0,
    'Een struisvogel kan wel zeventig kilometer per uur rennen. Een paard haalt maximaal zestig kilometer per uur.'),
  tf('tf-28', 3, 'Mensen zijn de enige dieren die kunnen lachen.', 1,
    'Ratten, honden en chimpansees maken ook geluidjes die lijken op lachen als ze spelen.'),
  tf('tf-29', 3, 'Licht reist sneller dan geluid.', 0,
    'Licht gaat bijna driehonderdduizend kilometer per seconde. Geluid gaat slechts driehonderd meter per seconde. Daarom zie je bliksem eerder dan je de donder hoort.'),
  tf('tf-30', 3, 'De Chinese Muur is zichtbaar vanuit de ruimte met het blote oog.', 1,
    'De Chinese Muur is te smal om vanuit de ruimte met het blote oog te zien. Dit is een bekende mythe.'),
  tf('tf-31', 3, 'Een octopus heeft drie harten.', 0,
    'Een octopus heeft inderdaad drie harten! Twee pompen bloed naar de kieuwen, en één naar de rest van het lichaam.'),
  tf('tf-32', 3, 'Bananen groeien aan bomen.', 1,
    'Bananen groeien aan grote kruidachtige planten, niet aan echte bomen. De stam is eigenlijk een dikke steel van bladeren.'),
  tf('tf-33', 3, 'IJsberen leven op de Zuidpool.', 1,
    'IJsberen leven op de Noordpool. Op de Zuidpool leven pinguïns.'),
  tf('tf-34', 3, 'Bliksem slaat nooit twee keer op dezelfde plek in.', 1,
    'Bliksem slaat heel vaak meerdere keren in op dezelfde plek. Hoge gebouwen worden soms wel honderd keer per jaar getroffen.'),
  tf('tf-35', 3, 'De menselijke huid is het grootste orgaan van het lichaam.', 0,
    'De huid is inderdaad het grootste orgaan. Bij een volwassene is de huid gemiddeld twee vierkante meter groot.'),

  // ── Deduction level 1 ────────────────────────────────────────────────────
  de('de-01', 1, 'Sara heeft meer geld dan Tom. Tom heeft meer geld dan Lisa. Wie heeft het minste geld?',
    ['Sara', 'Tom', 'Lisa', 'Ze hebben evenveel'], 2,
    'Lisa heeft het minste geld. Tom heeft meer dan Lisa, en Sara heeft meer dan Tom.'),
  de('de-02', 1, 'Alle katten zijn dieren. Poes is een kat. Is Poes een dier?',
    ['Nee', 'Ja', 'Misschien', 'Dat weet ik niet'], 1,
    'Ja, Poes is een dier! Alle katten zijn dieren, en Poes is een kat.'),
  de('de-03', 1, 'Een meloen is zwaarder dan een appel. Een appel is zwaarder dan een druif. Wat is het zwaarst?',
    ['Druif', 'Appel', 'Meloen', 'Ze wegen hetzelfde'], 2,
    'De meloen is het zwaarst. Een appel is zwaarder dan een druif, en een meloen is nog zwaarder.'),
  de('de-04', 1, 'Roos is ouder dan Finn. Finn is ouder dan Bo. Wie is het jongst?',
    ['Roos', 'Finn', 'Bo', 'Ze zijn even oud'], 2,
    'Bo is het jongst. Finn is ouder dan Bo, en Roos is nog ouder dan Finn.'),
  de('de-05', 1, 'Alleen rode ballen gaan in de doos. Ik heb een blauwe bal. Gaat mijn bal in de doos?',
    ['Ja', 'Nee', 'Misschien', 'Soms wel'], 1,
    'Nee! Alleen rode ballen gaan in de doos, en jouw bal is blauw.'),
  de('de-06', 1, 'Als het regent, worden de stoepen nat. Het regent nu. Zijn de stoepen nat?',
    ['Nee', 'Ja', 'Misschien', 'Soms'], 1,
    'Ja! Als het regent worden de stoepen nat, en het regent nu.'),
  de('de-07', 1, 'Er zijn 4 stoelen en 5 kinderen. Hoeveel kinderen moeten staan?',
    ['Geen', '1', '2', '3'], 1,
    'Één kind moet staan. Er zijn vijf kinderen maar maar vier stoelen.'),
  de('de-08', 1, 'Lena loopt sneller dan Pieter. Sam loopt langzamer dan Pieter. Wie loopt het langzaamst?',
    ['Lena', 'Pieter', 'Sam', 'Ze zijn even snel'], 2,
    'Sam loopt het langzaamst. Sam loopt langzamer dan Pieter, en Pieter loopt langzamer dan Lena.'),
  de('de-09', 1, 'Mia is kleiner dan Noah. Noah is kleiner dan Jip. Wie is het grootst?',
    ['Mia', 'Noah', 'Jip', 'Ze zijn even groot'], 2,
    'Jip is het grootst. Noah is groter dan Mia, en Jip is nog groter dan Noah.'),
  de('de-10', 1, 'Als je hard werkt, word je beter. Sam werkt heel hard. Wat gebeurt er met Sam?',
    ['Sam wordt lui', 'Sam wordt beter', 'Niets verandert', 'Sam stopt'], 1,
    'Sam wordt beter! Als je hard werkt word je beter, en Sam werkt heel hard.'),
  de('de-11', 1, 'Er zijn 3 koekjes en 2 kinderen. Krijgt elk kind er minstens één?',
    ['Nee', 'Ja', 'Misschien', 'Dat weet ik niet'], 1,
    'Ja! Er zijn drie koekjes voor twee kinderen. Elk kind krijgt er minstens één, en er is zelfs één over.'),
  de('de-12', 1, 'Als A groter is dan B, en B groter dan C, is A dan groter dan C?',
    ['Nee', 'Ja', 'Soms', 'Dat weet ik niet'], 1,
    'Ja! Als A groter is dan B en B groter dan C, dan is A zeker groter dan C.'),
  de('de-13', 1, 'Tim heeft 5 euro. Hij koopt iets voor 3 euro. Hoeveel heeft hij nog?',
    ['1 euro', '2 euro', '3 euro', '8 euro'], 1,
    'Tim heeft twee euro over. Vijf min drie is twee.'),
  de('de-14', 1, 'Elke hond is een dier. Rex is een hond. Is Rex een dier?',
    ['Nee', 'Ja', 'Misschien', 'Soms'], 1,
    'Ja! Elke hond is een dier, en Rex is een hond. Dus is Rex een dier.'),
  de('de-15', 1, 'Als vandaag dinsdag is, wat is dan overmorgen?',
    ['Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'], 1,
    'Overmorgen is donderdag. Morgen is woensdag, en de dag daarna is donderdag.'),

  // ── Deduction level 2 ────────────────────────────────────────────────────
  de('de-16', 2, 'Alle vogels hebben vleugels. Een vliegtuig heeft ook vleugels. Is een vliegtuig een vogel?',
    ['Ja', 'Nee', 'Misschien', 'Soms'], 1,
    'Nee! Niet alles met vleugels is een vogel. Een vliegtuig heeft vleugels maar is een machine.'),
  de('de-17', 2, 'A is groter dan B. B is groter dan C. C is groter dan D. Wie is het kleinst?',
    ['A', 'B', 'C', 'D'], 3,
    'D is het kleinst. C is groter dan D, B is groter dan C, en A is groter dan B.'),
  de('de-18', 2, 'Jan is even oud als Kim. Kim is jonger dan Saar. Is Jan jonger dan Saar?',
    ['Nee', 'Ja', 'Dat weet ik niet', 'Ze zijn even oud'], 1,
    'Ja! Jan is even oud als Kim, en Kim is jonger dan Saar. Dus is Jan ook jonger dan Saar.'),
  de('de-19', 2, 'Alle zoogdieren ademen lucht. Walvissen zijn zoogdieren. Ademen walvissen lucht?',
    ['Nee', 'Ja', 'Misschien', 'Alleen in het water'], 1,
    'Ja! Alle zoogdieren ademen lucht, en walvissen zijn zoogdieren. Walvissen moeten naar de oppervlakte om adem te halen.'),
  de('de-20', 2, 'Als ik elke dag 1 euro spaar, hoeveel heb ik dan na een week?',
    ['5 euro', '6 euro', '7 euro', '8 euro'], 2,
    'Na een week heb je zeven euro. Een week heeft zeven dagen, en je spaart elke dag één euro.'),
  de('de-21', 2, 'Er zijn 3 dozen. In elke doos zitten 4 ballen. Hoeveel ballen zijn er in totaal?',
    ['7', '10', '12', '16'], 2,
    'Er zijn twaalf ballen in totaal. Drie dozen keer vier ballen per doos is twaalf.'),
  de('de-22', 2, 'Lieke fietst twee keer zo snel als haar broer. Haar broer doet 10 minuten over één kilometer. Hoe lang doet Lieke erover?',
    ['20 minuten', '10 minuten', '5 minuten', '2 minuten'], 2,
    'Lieke doet er vijf minuten over. Ze fietst twee keer zo snel, dus heeft ze de helft van de tijd nodig.'),
  de('de-23', 2, 'Roos heeft rode en blauwe stiften. Ze geeft alle rode stiften weg. Wat heeft ze nog?',
    ['Rode stiften', 'Blauwe stiften', 'Alle stiften', 'Geen stiften'], 1,
    'Roos heeft alleen nog blauwe stiften. Ze heeft alle rode stiften weggegeven.'),
  de('de-24', 2, 'Op de berg waait het altijd harder dan in de stad. Vandaag waait het hard in de stad. Waait het op de berg ook hard?',
    ['Nee', 'Ja', 'Misschien', 'Soms'], 1,
    'Ja! Op de berg waait het altijd harder dan in de stad. Als het hard waait in de stad, waait het zeker hard op de berg.'),
  de('de-25', 2, 'Alle katten van mevrouw Jansen zijn zwart. Ze heeft 4 katten. Zijn ze allemaal zwart?',
    ['Nee', 'Misschien', 'Ja', 'Sommige wel'], 2,
    'Ja, ze zijn allemaal zwart! Alle katten van mevrouw Jansen zijn zwart, en ze heeft vier katten.'),
  de('de-26', 2, 'Is een getal dat deelbaar is door 2 altijd een even getal?',
    ['Nee', 'Ja', 'Soms', 'Alleen grote getallen'], 1,
    'Ja! Een even getal is een getal dat deelbaar is door twee. Dat is altijd zo.'),
  de('de-27', 2, 'Als je twee gelijke getallen bij elkaar optelt, is het antwoord altijd even?',
    ['Nee', 'Ja', 'Soms', 'Alleen bij grote getallen'], 1,
    'Ja! Als je een getal bij zichzelf optelt, krijg je twee keer dat getal, en twee keer iets is altijd even.'),
  de('de-28', 2, 'Bo heeft meer boeken dan Sam. Sam heeft meer boeken dan Pip. Pip heeft 3. Bo heeft er 8. Hoeveel heeft Sam minstens?',
    ['3 boeken', '4 boeken', '5 boeken', '8 boeken'], 1,
    'Sam heeft minstens vier boeken. Sam heeft meer dan Pip die er drie heeft, dus minstens vier.'),
  de('de-29', 2, 'Alleen kinderen die lid zijn, mogen meedoen. Sofie is lid. Mag Sofie meedoen?',
    ['Nee', 'Misschien', 'Ja', 'Dat hangt ervan af'], 2,
    'Ja! Sofie is lid, en alleen leden mogen meedoen.'),
  de('de-30', 2, 'Kees heeft evenveel snoepjes als Lotte. Lotte heeft meer dan Floor. Wie heeft de meeste snoepjes?',
    ['Floor', 'Lotte', 'Kees of Lotte', 'Ze hebben evenveel'], 2,
    'Kees of Lotte heeft de meeste. Ze hebben evenveel snoepjes, en dat is meer dan Floor heeft.'),

  // ── Deduction level 3 ────────────────────────────────────────────────────
  de('de-31', 3, 'Als het regent, pak je een paraplu. Je hebt geen paraplu gepakt. Regent het?',
    ['Ja', 'Nee', 'Misschien', 'Dat weet ik niet'], 1,
    'Nee! Als het regende, had je een paraplu gepakt. Je hebt er geen gepakt, dus regent het niet.'),
  de('de-32', 3, 'Lisa is de jongste van 4 kinderen. De anderen zijn 9, 11 en 13 jaar. Hoe oud is Lisa hoogstens?',
    ['7 jaar', '8 jaar', '9 jaar', '10 jaar'], 1,
    'Lisa is hoogstens 8 jaar. Ze is jonger dan het jongste andere kind, dat 9 jaar is. Dus is ze maximaal 8.'),
  de('de-33', 3, 'Er zijn 5 vrienden. Iedereen geeft iedereen één kaartje. Hoeveel kaartjes zijn er in totaal?',
    ['10', '15', '20', '25'], 2,
    'Er zijn 20 kaartjes. Elk van de vijf kinderen geeft aan de vier anderen een kaartje: vijf keer vier is twintig.'),
  de('de-34', 3, 'Als alle A ook B zijn, en alle B ook C zijn, zijn dan alle A ook C?',
    ['Nee', 'Ja', 'Soms', 'Dat hangt ervan af'], 1,
    'Ja! Dit heet een ketting van redeneren. Als alle A ook B zijn, en alle B ook C zijn, dan zijn alle A ook C.'),
  de('de-35', 3, 'Een trein rijdt van A naar B in 30 minuten. De conducteur zegt dat de eerste helft 20 minuten duurde. Klopt dat?',
    ['Ja', 'Nee', 'Misschien', 'Dat weet ik niet'], 1,
    'Nee! De helft van dertig minuten is vijftien minuten, niet twintig. De conducteur heeft het fout.'),
  de('de-36', 3, 'Drie vrienden hebben samen 30 snoepjes gelijk verdeeld. Hoeveel heeft er één?',
    ['3', '5', '10', '15'], 2,
    'Elk kind heeft 10 snoepjes. Dertig gedeeld door drie is tien.'),
  de('de-37', 3, 'Emma zegt altijd leugens. Ze zegt: "Het is dag." Is het dan dag?',
    ['Ja', 'Nee', 'Misschien', 'Soms'], 1,
    'Nee! Emma zegt altijd leugens. Als ze zegt dat het dag is, is het in werkelijkheid nacht.'),
  de('de-38', 3, 'Als je een getal door zichzelf deelt, wat is dan altijd het antwoord?',
    ['0', '1', '2', 'Het getal zelf'], 1,
    'Het antwoord is altijd 1. Elk getal gedeeld door zichzelf is 1, want je past het getal precies één keer in zichzelf.'),
  de('de-39', 3, 'Een doos heeft 3 lagen, en elke laag heeft 4 bij 4 blokjes. Hoeveel blokjes zitten er in de doos?',
    ['12', '16', '48', '64'], 2,
    'Er zitten 48 blokjes in de doos. Vier keer vier is zestien blokjes per laag. Zestien keer drie lagen is achtenveertig.'),
  de('de-40', 3, 'Alleen kinderen die aanwezig zijn, mogen meedoen. Tom is niet aanwezig. Mag Tom meedoen?',
    ['Ja', 'Nee', 'Misschien', 'Dat hangt ervan af'], 1,
    'Nee! Tom is niet aanwezig, en alleen kinderen die aanwezig zijn, mogen meedoen.'),
]
