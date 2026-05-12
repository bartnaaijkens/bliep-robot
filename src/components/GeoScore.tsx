import { loadGeoLevel } from '../lib/geo'
import type { BliepPalette, BgPalette } from '../lib/palettes'
import type { GeoSession } from '../lib/geo'

interface Props {
  session: GeoSession
  onReplay: () => void
  c: BliepPalette
  bg: BgPalette
}

export function GeoScore({ session, onReplay, c, bg }: Props) {
  const pct = session.correct / session.questions.length
  const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1
  const level = loadGeoLevel()

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Stars */}
      <div style={{ fontSize: 40, letterSpacing: 4, lineHeight: 1 }}>
        {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
      </div>

      {/* Score */}
      <div style={{
        fontFamily: '"Patrick Hand", cursive', fontSize: 26,
        color: c.deepBlue, textAlign: 'center', lineHeight: 1.3,
      }}>
        Je had <strong>{session.correct}</strong> van de{' '}
        <strong>{session.questions.length}</strong> goed!
      </div>

      {/* Level indicator */}
      <div style={{
        fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 700,
        color: bg.ink, opacity: 0.55,
        background: bg.soft, padding: '4px 14px', borderRadius: 99,
      }}>
        Niveau {level}
      </div>

      {/* Replay button */}
      <div style={{ width: '100%', maxWidth: 280 }}>
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
          Opnieuw spelen
        </button>
      </div>
    </div>
  )
}
