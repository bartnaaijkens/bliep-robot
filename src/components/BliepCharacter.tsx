import type { PaletteName } from '../lib/palettes'
import { BLIEP_PALETTES } from '../lib/palettes'

export type BliepState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'confused'

interface Props {
  state?: BliepState
  palette?: PaletteName
  size?: number
}

export function BliepCharacter({ state = 'idle', palette = 'classic', size = 222 }: Props) {
  const c = BLIEP_PALETTES[palette]
  const s = size
  const px = (n: number) => n * (s / 240)

  const bodyAnim =
    state === 'listening' ? 'bliep-listen 1.2s ease-in-out infinite' :
    state === 'thinking'  ? 'bliep-think 1.6s ease-in-out infinite'  :
    state === 'speaking'  ? 'bliep-speak 0.45s ease-in-out infinite' :
    state === 'confused'  ? 'bliep-confused-tilt 2.4s ease-in-out infinite' :
    'bliep-breathe 4.2s ease-in-out infinite'

  const eyeH =
    state === 'confused' ? px(28) :
    state === 'thinking' ? px(34) :
    state === 'listening' ? px(40) :
    px(38)

  const mouthPath = (() => {
    const w = px(54)
    if (state === 'speaking' || state === 'thinking') return null
    if (state === 'confused') return `M ${-px(18)} ${px(8)} Q ${-px(6)} 0 0 ${px(6)} Q ${px(6)} ${px(12)} ${px(18)} ${px(4)}`
    return `M ${-w / 2} ${-px(2)} Q 0 ${px(22)} ${w / 2} ${-px(2)}`
  })()

  return (
    <div style={{ position: 'relative', width: s, height: s * 1.02, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
      <style>{`
        @keyframes bliep-breathe { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(${px(-4)}px) scale(1.012);} }
        @keyframes bliep-listen  { 0%,100%{transform:translateY(0) rotate(-1.2deg);} 50%{transform:translateY(${px(-3)}px) rotate(1.2deg);} }
        @keyframes bliep-think   { 0%,100%{transform:translateY(0) rotate(0deg);} 25%{transform:translateY(${px(-2)}px) rotate(-1deg);} 75%{transform:translateY(${px(-2)}px) rotate(1deg);} }
        @keyframes bliep-speak   { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(${px(-2)}px) scale(1.02);} }
        @keyframes bliep-confused-tilt { 0%,100%{transform:rotate(-3deg);} 50%{transform:rotate(3deg);} }
        @keyframes bliep-antenna { 0%,100%{transform:rotate(-6deg);} 50%{transform:rotate(6deg);} }
        @keyframes bliep-glow    { 0%,100%{box-shadow:0 0 ${px(18)}px ${c.glow},0 0 ${px(34)}px ${c.glow}aa,inset 0 0 ${px(8)}px #fff;} 50%{box-shadow:0 0 ${px(28)}px ${c.glow},0 0 ${px(54)}px ${c.glow}cc,inset 0 0 ${px(8)}px #fff;} }
        @keyframes bliep-blink   { 0%,92%,100%{transform:scaleY(1);} 95%,97%{transform:scaleY(0.08);} }
        @keyframes bliep-look    { 0%,38%,100%{transform:translateX(0);} 42%,56%{transform:translateX(${px(-5)}px);} 60%,74%{transform:translateX(${px(5)}px);} 78%,92%{transform:translateX(0);} }
        @keyframes bliep-eye-pulse { 0%,100%{transform:scale(1);filter:drop-shadow(0 0 ${px(6)}px ${c.glow});} 50%{transform:scale(1.06);filter:drop-shadow(0 0 ${px(12)}px ${c.glow});} }
        @keyframes bliep-mouth-talk { 0%{transform:scaleY(0.4);border-radius:100% 100% ${px(20)}px ${px(20)}px/60% 60% ${px(20)}px ${px(20)}px;} 25%{transform:scaleY(1.0);} 50%{transform:scaleY(0.7);} 75%{transform:scaleY(1.1);} 100%{transform:scaleY(0.4);} }
        @keyframes bliep-think-dots { 0%,100%{opacity:0.25;transform:translateY(0);} 50%{opacity:1;transform:translateY(${px(-3)}px);} }
        @keyframes bliep-ripple { 0%{transform:scale(0.85);opacity:0.55;} 100%{transform:scale(1.55);opacity:0;} }
        @keyframes bliep-qmark  { 0%,100%{transform:translateY(0) rotate(-8deg);opacity:0.85;} 50%{transform:translateY(${px(-4)}px) rotate(8deg);opacity:1;} }
      `}</style>

      {state === 'listening' && [0, 0.4, 0.8].map((d, i) => (
        <div key={i} style={{
          position: 'absolute', left: '50%', top: '52%',
          width: px(220), height: px(220), marginLeft: -px(110), marginTop: -px(110),
          borderRadius: '50%', border: `${px(2)}px solid ${c.cyan}`,
          animation: `bliep-ripple 1.6s ease-out ${d}s infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      <div style={{ position: 'relative', width: s, height: s, animation: bodyAnim, transformOrigin: '50% 80%' }}>
        {/* Antenna stem */}
        <div style={{
          position: 'absolute', left: '50%', top: px(-2), width: px(2.5), height: px(34),
          background: c.deepBlue, marginLeft: -px(1.25), borderRadius: px(2),
          transformOrigin: 'bottom center', animation: 'bliep-antenna 3.6s ease-in-out infinite',
        }} />
        {/* Antenna ball */}
        <div style={{
          position: 'absolute', left: '50%', top: px(-14), width: px(16), height: px(16),
          marginLeft: -px(8), borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, #fff 0%, ${c.glow} 55%, ${c.cyan} 100%)`,
          animation: 'bliep-glow 2.4s ease-in-out infinite',
        }} />

        {/* Top blue cap */}
        <div style={{
          position: 'absolute', left: '50%', top: px(22), width: px(150), height: px(46),
          marginLeft: -px(75),
          borderRadius: `${px(75)}px ${px(75)}px ${px(40)}px ${px(40)}px / ${px(34)}px ${px(34)}px ${px(20)}px ${px(20)}px`,
          background: `linear-gradient(180deg, ${c.blue} 0%, ${c.deepBlue} 100%)`,
          boxShadow: `inset 0 ${px(2)}px ${px(4)}px rgba(255,255,255,0.25), inset 0 ${px(-4)}px ${px(6)}px rgba(0,0,0,0.18)`,
          zIndex: 2,
        }} />

        {/* Body */}
        <div style={{
          position: 'absolute', left: '50%', top: px(38), width: px(206), height: px(186),
          marginLeft: -px(103), borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #fbfbfb 55%, #e8eaee 100%)',
          boxShadow: `0 ${px(12)}px ${px(24)}px rgba(80,20,120,0.18), inset 0 ${px(-8)}px ${px(20)}px rgba(100,30,150,0.08)`,
          zIndex: 1,
        }} />

        {/* Feet */}
        <div style={{
          position: 'absolute', left: '50%', bottom: px(-4), width: px(140), height: px(28),
          marginLeft: -px(70), borderRadius: `${px(20)}px ${px(20)}px ${px(40)}px ${px(40)}px`,
          background: `linear-gradient(180deg, ${c.blue} 0%, ${c.deepBlue} 100%)`, zIndex: 0,
        }} />

        {/* Speaker disk */}
        <div style={{
          position: 'absolute', right: px(-2), top: px(98), width: px(46), height: px(46),
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, ${c.blue} 0%, ${c.deepBlue} 100%)`,
          boxShadow: `inset 0 0 ${px(8)}px rgba(0,0,0,0.25), 0 ${px(2)}px ${px(4)}px rgba(0,0,0,0.15)`,
          zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"Patrick Hand", system-ui', fontSize: px(11), color: c.glow,
          letterSpacing: px(0.5), fontWeight: 700,
        }}>BLIEP</div>

        {/* Heart */}
        <div style={{
          position: 'absolute', left: '50%', bottom: px(18), width: px(22), height: px(22),
          marginLeft: -px(11), borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, ${c.blue}, ${c.deepBlue})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 4, boxShadow: `0 ${px(1)}px ${px(2)}px rgba(0,0,0,0.2)`,
        }}>
          <span style={{ color: c.glow, fontSize: px(11), lineHeight: 1 }}>♥</span>
        </div>

        {/* Face screen */}
        <div style={{
          position: 'absolute', left: '50%', top: px(58), width: px(134), height: px(134),
          marginLeft: -px(67), borderRadius: '50%',
          background: `radial-gradient(circle at 50% 50%, #190730 0%, ${c.face} 70%, #0C0418 100%)`,
          border: `${px(3)}px solid ${c.cyan}`,
          boxShadow: `0 0 ${px(14)}px ${c.glow}aa, inset 0 0 ${px(20)}px rgba(0,0,0,0.6)`,
          zIndex: 5, overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          {state === 'confused' && (
            <div style={{
              position: 'absolute', left: '50%', top: px(10), marginLeft: px(18),
              fontFamily: '"Patrick Hand", cursive', fontSize: px(22), color: c.glow, fontWeight: 700,
              animation: 'bliep-qmark 1.4s ease-in-out infinite',
              filter: `drop-shadow(0 0 ${px(6)}px ${c.glow})`,
            }}>?</div>
          )}

          {/* Eyes */}
          <div style={{
            display: 'flex', gap: px(20), alignItems: 'center',
            marginTop: state === 'thinking' ? px(-12) : 0,
            marginBottom: px(8),
            transition: 'margin 0.3s ease',
            animation: state === 'idle' ? 'bliep-look 12s ease-in-out infinite' : 'none',
          }}>
            {[0, 1].map((i) => (
              <div key={i} style={{
                width: px(26), height: eyeH, borderRadius: '50%',
                background: `radial-gradient(circle at 50% 40%, #fff 0%, ${c.glow} 30%, ${c.cyan} 70%, ${c.blue} 100%)`,
                boxShadow: `0 0 ${px(8)}px ${c.glow}, 0 0 ${px(16)}px ${c.cyan}aa`,
                transformOrigin: 'center',
                animation: state === 'listening'
                  ? `bliep-eye-pulse 0.9s ease-in-out infinite ${i * 0.1}s`
                  : `bliep-blink 5.4s ease-in-out ${1 + i * 0.05}s infinite`,
                transition: 'height 0.3s ease',
              }} />
            ))}
          </div>

          {/* Mouth */}
          {state === 'thinking' ? (
            <div style={{ display: 'flex', gap: px(5), marginTop: px(4) }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: px(7), height: px(7), borderRadius: '50%',
                  background: `radial-gradient(circle, ${c.glow}, ${c.cyan})`,
                  boxShadow: `0 0 ${px(6)}px ${c.glow}`,
                  animation: `bliep-think-dots 1.2s ease-in-out infinite ${i * 0.18}s`,
                }} />
              ))}
            </div>
          ) : state === 'speaking' ? (
            <div style={{
              width: px(40), height: px(20),
              background: `radial-gradient(ellipse at 50% 30%, ${c.glow}, ${c.cyan} 70%, ${c.blue} 100%)`,
              borderRadius: `100% 100% ${px(20)}px ${px(20)}px / 60% 60% ${px(20)}px ${px(20)}px`,
              boxShadow: `0 0 ${px(10)}px ${c.glow}, inset 0 ${px(-2)}px ${px(4)}px rgba(0,0,0,0.3)`,
              animation: 'bliep-mouth-talk 0.42s ease-in-out infinite',
              transformOrigin: 'center top',
            }} />
          ) : mouthPath && (
            <svg width={px(60)} height={px(30)} viewBox={`${-px(30)} ${-px(4)} ${px(60)} ${px(30)}`} style={{ overflow: 'visible' }}>
              <path d={mouthPath} stroke={c.cyan} strokeWidth={px(4)} strokeLinecap="round" fill="none"
                style={{ filter: `drop-shadow(0 0 ${px(4)}px ${c.glow})` }} />
            </svg>
          )}

          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: `radial-gradient(circle at 50% 110%, ${c.cyan}22, transparent 60%)`,
            pointerEvents: 'none',
          }} />
        </div>
      </div>
    </div>
  )
}
