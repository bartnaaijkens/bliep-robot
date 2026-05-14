import { useState, useEffect, useRef } from 'react'
import { CATEGORIES, CATEGORY_ORDER, slotEmoji } from '../lib/robot'
import type { RobotSession, CategoryId, PartKey } from '../lib/robot'
import type { BliepPalette, BgPalette } from '../lib/palettes'
import { BuildSparkle } from './BuildSparkle'

interface Props {
  session: RobotSession
  phase: string
  onPick: (category: CategoryId, partKey: PartKey) => void
  c: BliepPalette
  bg: BgPalette
}

export function RobotBuilding({ session, phase, onPick, c, bg }: Props) {
  const [slotBouncing, setSlotBouncing] = useState<CategoryId | null>(null)
  const [sparkleActive, setSparkleActive] = useState(false)
  const prevStepRef = useRef(session.currentStep)

  const isFact = phase === 'robot-fact'
  const currentCategoryIndex = Math.min(session.currentStep, CATEGORY_ORDER.length - 1)
  const currentCategory = CATEGORIES[currentCategoryIndex]
  const progress = session.currentStep / 5

  useEffect(() => {
    if (session.currentStep !== prevStepRef.current) {
      const prevCat = CATEGORY_ORDER[prevStepRef.current]
      prevStepRef.current = session.currentStep
      setSlotBouncing(prevCat)
      setSparkleActive(true)
      const id = setTimeout(() => setSlotBouncing(null), 400)
      return () => clearTimeout(id)
    }
  }, [session.currentStep])

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {/* Progress bar */}
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <span style={{
            fontFamily: '"Nunito", system-ui', fontSize: 12, fontWeight: 800,
            color: c.deepBlue, opacity: 0.6,
          }}>
            {currentCategory.label}
          </span>
          <span style={{
            fontFamily: '"Nunito", system-ui', fontSize: 12, fontWeight: 700,
            color: bg.ink, opacity: 0.45,
          }}>
            Stap {Math.min(session.currentStep + 1, 5)} van 5
          </span>
        </div>
        <div style={{ width: '100%', height: 6, borderRadius: 99, background: bg.soft, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${c.cyan}, ${c.blue})`,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Robot preview row with sparkle */}
      <div style={{ position: 'relative', width: '100%' }}>
        <BuildSparkle active={sparkleActive} onDone={() => setSparkleActive(false)} />
        <div style={{
          display: 'flex', gap: 6, justifyContent: 'center',
          padding: '6px 0',
        }}>
          {CATEGORY_ORDER.map((catId, i) => {
            const filled = catId in session.picks
            const isCurrent = i === session.currentStep
            const emoji = slotEmoji(session.picks, catId)
            const bouncing = slotBouncing === catId
            return (
              <div
                key={catId}
                style={{
                  width: 52, height: 52,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 12,
                  background: bg.soft,
                  boxShadow: `0 2px 0 ${bg.line}`,
                  border: isCurrent && !filled ? `2px solid ${c.blue}88` : `2px solid transparent`,
                  fontSize: 28, lineHeight: 1, userSelect: 'none',
                  transform: bouncing ? 'scale(1.18)' : 'scale(1)',
                  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s',
                  animation: isCurrent && !filled ? 'slot-pulse 2s ease-in-out infinite' : 'none',
                }}
              >
                {emoji}
              </div>
            )
          })}
        </div>
        <style>{`
          @keyframes slot-pulse {
            0%, 100% { border-color: transparent; }
            50% { border-color: var(--slot-pulse-color, #2E6FD888); }
          }
        `}</style>
      </div>

      {/* Category heading */}
      <div style={{
        fontFamily: '"Patrick Hand", cursive', fontSize: 20,
        color: c.deepBlue, opacity: 0.85, textAlign: 'center',
      }}>
        Kies: {currentCategory.label}
      </div>

      {/* Option cards (column) */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {currentCategory.options.map(option => (
          <button
            key={option.key}
            disabled={isFact}
            onClick={() => onPick(currentCategory.id, option.key)}
            style={{
              width: '100%', border: 'none', cursor: isFact ? 'default' : 'pointer',
              background: bg.soft,
              borderRadius: 14,
              boxShadow: `0 2px 0 ${bg.line}`,
              padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 12,
              textAlign: 'left',
              opacity: isFact ? 0.45 : 1,
              transition: 'opacity 0.2s, transform 0.1s',
            }}
            onPointerDown={e => { if (!isFact) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)' }}
            onPointerUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
            onPointerLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
          >
            <div style={{ fontSize: 52, lineHeight: 1, flexShrink: 0 }}>
              {option.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: '"Patrick Hand", cursive', fontSize: 20,
                color: c.deepBlue, lineHeight: 1.1,
              }}>{option.name}</div>
              <div style={{
                fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 600,
                color: bg.ink, opacity: 0.65, marginTop: 2, lineHeight: 1.3,
              }}>{option.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
