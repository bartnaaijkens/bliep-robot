import { robotScoreStars, robotScoreText, MISSIONS, CATEGORIES, CATEGORY_ORDER, partScoreForMission } from '../lib/robot'
import type { RobotSession } from '../lib/robot'
import type { BliepPalette, BgPalette } from '../lib/palettes'

interface Props {
  session: RobotSession
  onReplay: () => void
  onChangeMission: () => void
  c: BliepPalette
  bg: BgPalette
}

function scoreColor(score: number): string {
  if (score === 3) return '#1a7c38'
  if (score === 2) return '#b85c00'
  if (score === 1) return '#c0392b'
  return '#9b0000'
}

export function RobotScore({ session, onReplay, onChangeMission, c, bg }: Props) {
  const stars = robotScoreStars(session.totalScore)
  const mission = MISSIONS.find(m => m.id === session.mission)!

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      {/* Stars */}
      <div style={{ fontSize: 40, letterSpacing: 4, lineHeight: 1 }}>
        {stars === 0
          ? '🤖'
          : `${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}`
        }
      </div>

      {/* Mission badge */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ fontSize: 56, lineHeight: 1 }}>{mission.emoji}</div>
        <div style={{
          fontFamily: '"Patrick Hand", cursive', fontSize: 18,
          color: c.deepBlue, opacity: 0.7,
        }}>{mission.name}</div>
      </div>

      {/* Score text */}
      <div style={{
        fontFamily: '"Patrick Hand", cursive', fontSize: 22,
        color: c.deepBlue, textAlign: 'center', lineHeight: 1.3,
      }}>
        {robotScoreText(session)}
      </div>

      {/* Score chip */}
      <div style={{
        fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 700,
        color: bg.ink, opacity: 0.55,
        background: bg.soft, padding: '4px 14px', borderRadius: 99,
      }}>
        Punten: {session.totalScore} / 15
      </div>

      {/* Per-part breakdown */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {CATEGORY_ORDER.map(catId => {
          const cat = CATEGORIES.find(c => c.id === catId)!
          const partKey = session.picks[catId]
          if (!partKey) return null
          const part = cat.options.find(o => o.key === partKey)!
          const score = partScoreForMission(partKey, session.mission)
          return (
            <div key={catId} style={{
              background: bg.soft, borderRadius: 10,
              padding: '6px 12px',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                fontFamily: '"Nunito", system-ui', fontSize: 11, fontWeight: 800,
                color: bg.ink, opacity: 0.5, width: 70, flexShrink: 0, lineHeight: 1.2,
              }}>{cat.label}</span>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{part.emoji}</span>
              <span style={{
                fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 700,
                color: bg.ink, flex: 1, minWidth: 0,
              }}>{part.name}</span>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: scoreColor(score),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 800,
                color: '#fff',
              }}>
                {score}
              </div>
            </div>
          )
        })}
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
          onClick={onChangeMission}
          style={{
            width: '100%', height: 44, borderRadius: 16, border: `1.5px solid ${bg.line}`,
            cursor: 'pointer', background: 'transparent',
            fontFamily: '"Nunito", system-ui', fontSize: 15, fontWeight: 800,
            color: c.deepBlue, opacity: 0.7,
          }}
        >
          Andere missie
        </button>
      </div>
    </div>
  )
}
