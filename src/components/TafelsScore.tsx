import type { BliepPalette, BgPalette } from '../lib/palettes'
import type { TafelsSession } from '../lib/tafels'

interface Props {
  session: TafelsSession
  onReplay: () => void
  onChangeSetup: () => void
  c: BliepPalette
  bg: BgPalette
}

export function TafelsScore({ session, onReplay, onChangeSetup, c, bg }: Props) {
  const pct = session.correct / session.questions.length
  const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1

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

      {/* Missed questions */}
      {session.wrongQuestions.length > 0 && (
        <div style={{ width: '100%', maxWidth: 280 }}>
          <div style={{
            fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 700,
            color: bg.ink, opacity: 0.6, marginBottom: 8,
          }}>
            Dit waren de lastige sommen:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {session.wrongQuestions.map((q, i) => (
              <span key={i} style={{
                fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 800,
                background: '#fde8d0', color: '#b85c00',
                padding: '3px 10px', borderRadius: 99,
              }}>
                {q.a} × {q.b} = {q.answer}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
        <button
          onClick={onReplay}
          style={{
            height: 54, borderRadius: 16, border: 'none', cursor: 'pointer',
            fontFamily: '"Patrick Hand", cursive', fontSize: 24, letterSpacing: 0.3,
            background: `linear-gradient(135deg, ${c.blue} 0%, ${c.deepBlue} 100%)`,
            color: '#fff',
            boxShadow: `0 4px 14px ${c.blue}55`,
          }}
        >
          Nog een keer
        </button>
        <button
          onClick={onChangeSetup}
          style={{
            height: 48, borderRadius: 16, border: `1.5px solid ${c.blue}55`,
            cursor: 'pointer', background: 'transparent',
            fontFamily: '"Patrick Hand", cursive', fontSize: 20,
            color: c.deepBlue, opacity: 0.8,
          }}
        >
          Andere tafels
        </button>
      </div>
    </div>
  )
}
