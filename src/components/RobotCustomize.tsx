import type { BliepPalette, BgPalette } from '../lib/palettes'

interface Props {
  phase: string
  onRecord: () => void
  onSkip: () => void
  c: BliepPalette
  bg: BgPalette
}

export function RobotCustomize({ phase, onRecord, onSkip, c, bg }: Props) {
  const isListening = phase === 'robot-listening'

  return (
    <>
      <style>{`
        @keyframes mic-pulse {
          0%, 100% { box-shadow: 0 0 0 0 var(--pulse-color); }
          50%       { box-shadow: 0 0 0 16px transparent; }
        }
      `}</style>
      <div style={{
        width: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 14,
      }}>
        <div style={{
          fontFamily: '"Patrick Hand", cursive', fontSize: 22,
          color: c.deepBlue, textAlign: 'center', lineHeight: 1.3,
        }}>
          Vertel Bliep hoe je robot er uit moet zien!
        </div>
        <div style={{
          fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 600,
          color: bg.ink, opacity: 0.6, textAlign: 'center',
        }}>
          Wil je hem een speciale kleur of iets extra's?
        </div>

        {/* Mic button */}
        <button
          onClick={onRecord}
          style={{
            width: 88, height: 88, borderRadius: '50%', border: 'none',
            cursor: 'pointer',
            background: isListening
              ? `linear-gradient(135deg, ${c.blue} 0%, ${c.deepBlue} 100%)`
              : bg.soft,
            boxShadow: isListening
              ? `0 4px 20px ${c.blue}66`
              : `0 2px 0 ${bg.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36,
            transition: 'background 0.2s, box-shadow 0.2s',
            // @ts-ignore
            '--pulse-color': `${c.blue}55`,
            animation: isListening ? 'mic-pulse 1.2s ease-out infinite' : 'none',
          }}
        >
          {isListening ? '⏹' : '🎤'}
        </button>

        <div style={{
          fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 700,
          color: c.deepBlue, opacity: isListening ? 1 : 0,
          transition: 'opacity 0.2s',
          minHeight: 20,
        }}>
          {isListening ? 'Ik luister… tik om te stoppen' : ''}
        </div>

        {/* Skip button */}
        <button
          onClick={onSkip}
          disabled={isListening}
          style={{
            border: `1.5px solid ${bg.line}`,
            background: 'transparent',
            borderRadius: 99, cursor: isListening ? 'default' : 'pointer',
            fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 800,
            color: c.deepBlue, opacity: isListening ? 0.3 : 0.65,
            padding: '7px 20px',
            transition: 'opacity 0.2s',
          }}
        >
          Sla over →
        </button>
      </div>
    </>
  )
}
