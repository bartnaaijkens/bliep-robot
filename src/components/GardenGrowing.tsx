import { useState, useEffect } from 'react'
import { PLANT_TYPES, STAGE_NAMES } from '../lib/garden'
import type { PlantSession, CareAction } from '../lib/garden'
import type { BliepPalette, BgPalette } from '../lib/palettes'
import { CareParticles } from './CareParticles'

interface Props {
  session: PlantSession
  phase: string
  onAction: (action: CareAction) => void
  onHint: () => void
  c: BliepPalette
  bg: BgPalette
}

const ACTIONS: { id: CareAction; label: string }[] = [
  { id: 'water-little', label: '💧 Geef water' },
  { id: 'water-much',   label: '🚿 Veel water geven' },
  { id: 'sunlight',     label: '☀️ In de zon zetten' },
  { id: 'nutrients',    label: '🌱 Voeding geven' },
]

function resourceColor(value: number, ideal: number, tolerance: number): string {
  const dist = Math.abs(value - ideal)
  if (dist < tolerance * 0.5) return '#1a7c38'
  if (dist < tolerance) return '#b85c00'
  return '#c0392b'
}

export function GardenGrowing({ session, phase, onAction, onHint, c, bg }: Props) {
  const [plantBouncing, setPlantBouncing] = useState(false)
  const isAction = phase === 'garden-action'
  const def = PLANT_TYPES[session.plant]
  const stageEmoji = def.stageEmojis[Math.min(session.stage, def.stageEmojis.length - 1)]
  const progress = session.stage / 5

  const healthFilter =
    session.health >= 60 ? 'none' :
    session.health >= 40 ? 'saturate(0.5)' :
    'saturate(0.15) brightness(0.75)'

  function handleParticleDone() {
    setPlantBouncing(true)
    setTimeout(() => setPlantBouncing(false), 400)
  }

  // Reset bounce when phase changes back to growing
  useEffect(() => {
    if (phase === 'garden-growing') setPlantBouncing(false)
  }, [phase])

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      {/* Stage progress */}
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <span style={{
            fontFamily: '"Nunito", system-ui', fontSize: 12, fontWeight: 800,
            color: c.deepBlue, opacity: 0.6,
          }}>
            {STAGE_NAMES[Math.min(session.stage, STAGE_NAMES.length - 1)]}
          </span>
          <span style={{
            fontFamily: '"Nunito", system-ui', fontSize: 12, fontWeight: 700,
            color: bg.ink, opacity: 0.45,
          }}>
            {session.stagesCompleted}/5 stadia
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

      {/* Plant visual + particles */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CareParticles
          action={isAction ? session.history[session.history.length - 1] ?? null : null}
          onDone={handleParticleDone}
        />
        <div style={{
          fontSize: 80, lineHeight: 1, userSelect: 'none',
          filter: healthFilter,
          transform: plantBouncing ? 'scale(1.22)' : 'scale(1)',
          transition: 'filter 0.5s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          {stageEmoji}
        </div>
      </div>

      {/* Resource chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { emoji: '💧', value: session.waterLevel,    ideal: def.idealWater,    label: 'water' },
          { emoji: '☀️', value: session.lightLevel,    ideal: def.idealLight,    label: 'licht' },
          { emoji: '🌿', value: session.nutrientLevel, ideal: def.idealNutrients, label: 'voeding' },
        ].map(({ emoji, value, ideal, label }) => (
          <div key={label} style={{
            fontFamily: '"Nunito", system-ui', fontSize: 12, fontWeight: 800,
            padding: '3px 10px', borderRadius: 99,
            background: bg.soft,
            color: resourceColor(value, ideal, def.tolerance),
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span>{emoji}</span>
            <span>{Math.round(value)}</span>
          </div>
        ))}
        <div style={{
          fontFamily: '"Nunito", system-ui', fontSize: 12, fontWeight: 800,
          padding: '3px 10px', borderRadius: 99,
          background: bg.soft,
          color: session.health >= 60 ? '#1a7c38' : session.health >= 40 ? '#b85c00' : '#c0392b',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span>❤️</span>
          <span>{session.health}</span>
        </div>
      </div>

      {/* Turn indicator */}
      <div style={{
        fontFamily: '"Nunito", system-ui', fontSize: 12, fontWeight: 700,
        color: bg.ink, opacity: 0.45,
      }}>
        Beurt {Math.min(session.turn + 1, 3)} van 3
      </div>

      {/* Action prompt */}
      <div style={{
        fontFamily: '"Patrick Hand", cursive', fontSize: 18,
        color: c.deepBlue, opacity: 0.7, textAlign: 'center',
      }}>
        Vertel Bliep wat hij moet doen!
      </div>

      {/* 2×2 action grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 8, width: '100%', maxWidth: 320,
      }}>
        {ACTIONS.map(({ id, label }) => (
          <button
            key={id}
            disabled={isAction}
            onClick={() => onAction(id)}
            style={{
              minHeight: 56, borderRadius: 14, border: 'none',
              cursor: isAction ? 'default' : 'pointer',
              fontFamily: '"Nunito", system-ui', fontSize: 14, fontWeight: 800,
              color: c.deepBlue,
              background: bg.soft,
              boxShadow: `0 2px 0 ${bg.line}`,
              opacity: isAction ? 0.4 : 1,
              transition: 'opacity 0.2s, transform 0.1s',
              padding: '10px 8px',
              lineHeight: 1.2,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Hint button */}
      <button
        onClick={onHint}
        disabled={isAction}
        style={{
          border: `1.5px solid ${bg.line}`,
          background: 'transparent',
          borderRadius: 99, cursor: isAction ? 'default' : 'pointer',
          fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 800,
          color: c.deepBlue, opacity: isAction ? 0.35 : 0.7,
          padding: '6px 18px',
          transition: 'opacity 0.2s',
        }}
      >
        💡 Vraag Bliep
      </button>
    </div>
  )
}
