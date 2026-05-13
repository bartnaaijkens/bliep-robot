import { gardenScoreStars, PLANT_TYPES, STAGE_NAMES } from '../lib/garden'
import type { PlantSession } from '../lib/garden'
import type { BliepPalette, BgPalette } from '../lib/palettes'

interface Props {
  session: PlantSession
  onReplay: () => void
  onChangeSetup: () => void
  c: BliepPalette
  bg: BgPalette
}

export function GardenScore({ session, onReplay, onChangeSetup, c, bg }: Props) {
  const wilted = session.health < 20 && session.stagesCompleted < 1
  const stars = wilted ? 0 : gardenScoreStars(session)
  const plant = PLANT_TYPES[session.plant]
  const reachedStage = STAGE_NAMES[Math.max(0, session.stagesCompleted - 1)]

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Stars / wilt */}
      <div style={{ fontSize: 40, letterSpacing: 4, lineHeight: 1 }}>
        {wilted
          ? '🥀'
          : `${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}`
        }
      </div>

      {/* Final plant emoji */}
      <div style={{ fontSize: 64, lineHeight: 1 }}>
        {plant.stageEmojis[Math.min(session.stage, plant.stageEmojis.length - 1)]}
      </div>

      {/* Score text */}
      <div style={{
        fontFamily: '"Patrick Hand", cursive', fontSize: 24,
        color: c.deepBlue, textAlign: 'center', lineHeight: 1.3,
      }}>
        {wilted
          ? `Je ${plant.name} is verwelkt… Probeer het nog eens!`
          : session.stagesCompleted >= 5
            ? `Jouw ${plant.name} is helemaal gegroeid! 🎉`
            : `Jouw ${plant.name} is gegroeid tot ${reachedStage}!`
        }
      </div>

      {/* Stats */}
      <div style={{
        fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 700,
        color: bg.ink, opacity: 0.55,
        background: bg.soft, padding: '4px 14px', borderRadius: 99,
      }}>
        {session.stagesCompleted} van de 5 stadia gehaald
      </div>

      {/* Buttons */}
      <div style={{ width: '100%', maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={onReplay}
          style={{
            width: '100%', height: 54, borderRadius: 16, border: 'none', cursor: 'pointer',
            fontFamily: '"Patrick Hand", cursive', fontSize: 24, letterSpacing: 0.3,
            background: `linear-gradient(135deg, ${c.blue} 0%, ${c.deepBlue} 100%)`,
            color: '#fff',
            boxShadow: `0 4px 14px ${c.blue}55`,
          }}
        >
          Opnieuw proberen
        </button>
        <button
          onClick={onChangeSetup}
          style={{
            width: '100%', height: 44, borderRadius: 16, border: `1.5px solid ${bg.line}`,
            cursor: 'pointer', background: 'transparent',
            fontFamily: '"Nunito", system-ui', fontSize: 15, fontWeight: 800,
            color: c.deepBlue, opacity: 0.7,
          }}
        >
          Andere plant kiezen
        </button>
      </div>
    </div>
  )
}
