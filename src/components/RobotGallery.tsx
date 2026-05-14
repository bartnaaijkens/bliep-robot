import { useState } from 'react'
import type { RobotHistoryItem } from '../lib/robotHistory'
import type { BliepPalette, BgPalette } from '../lib/palettes'
import { MISSIONS } from '../lib/robot'
import { relativeTime } from '../lib/history'
import { robotScoreStars } from '../lib/robot'

interface Props {
  history: RobotHistoryItem[]
  onClose: () => void
  c: BliepPalette
  bg: BgPalette
}

export function RobotGallery({ history, onClose, c, bg }: Props) {
  const [selected, setSelected] = useState<RobotHistoryItem | null>(null)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: bg.bg,
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
      paddingBottom: 'env(safe-area-inset-bottom, 24px)',
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: bg.bg,
        padding: '14px 18px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${bg.line}`,
      }}>
        <div style={{
          fontFamily: '"Patrick Hand", cursive', fontSize: 26,
          color: c.deepBlue,
        }}>
          🤖 Mijn Robots
        </div>
        <button
          onClick={onClose}
          style={{
            width: 36, height: 36, borderRadius: '50%', border: 'none',
            background: bg.soft, cursor: 'pointer',
            fontFamily: '"Nunito", system-ui', fontSize: 18, fontWeight: 800,
            color: c.deepBlue, opacity: 0.7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >×</button>
      </div>

      {/* Grid or empty state */}
      {history.length === 0 ? (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32,
        }}>
          <div style={{ fontSize: 64 }}>🤖</div>
          <div style={{
            fontFamily: '"Patrick Hand", cursive', fontSize: 20,
            color: c.deepBlue, opacity: 0.6, textAlign: 'center',
          }}>
            Nog geen robots gebouwd!
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 10, padding: 12,
        }}>
          {history.map(item => {
            const mission = MISSIONS.find(m => m.id === item.mission)
            const stars = robotScoreStars(item.totalScore)
            return (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                style={{
                  border: 'none', cursor: 'pointer', borderRadius: 14,
                  overflow: 'hidden', background: bg.soft,
                  boxShadow: `0 2px 0 ${bg.line}`,
                  position: 'relative', padding: 0,
                  aspectRatio: '1 / 1',
                  transition: 'transform 0.12s',
                }}
                onPointerDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)' }}
                onPointerUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
                onPointerLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
              >
                <img
                  src={item.imageDataUrl}
                  alt={`${mission?.name ?? ''} robot`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {/* Mission badge */}
                <div style={{
                  position: 'absolute', bottom: 5, left: 6,
                  background: 'rgba(0,0,0,0.55)', borderRadius: 99,
                  padding: '2px 7px', fontSize: 13,
                }}>
                  {mission?.emoji}
                </div>
                {/* Stars */}
                <div style={{
                  position: 'absolute', bottom: 5, right: 6,
                  background: 'rgba(0,0,0,0.55)', borderRadius: 99,
                  padding: '2px 7px',
                  fontFamily: '"Nunito", system-ui', fontSize: 11, fontWeight: 800,
                  color: '#fff',
                }}>
                  {'⭐'.repeat(stars)}
                </div>
                {/* Date */}
                <div style={{
                  position: 'absolute', top: 5, right: 6,
                  background: 'rgba(0,0,0,0.45)', borderRadius: 99,
                  padding: '2px 7px',
                  fontFamily: '"Nunito", system-ui', fontSize: 10, fontWeight: 700,
                  color: '#fff',
                }}>
                  {relativeTime(item.ts)}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Full-size modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.82)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
        >
          <img
            src={selected.imageDataUrl}
            alt="robot"
            style={{
              maxWidth: '100%', maxHeight: '65vh',
              borderRadius: 18, objectFit: 'contain',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
            }}
          />
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              fontFamily: '"Patrick Hand", cursive', fontSize: 22,
              color: '#fff', textAlign: 'center',
            }}>
              {MISSIONS.find(m => m.id === selected.mission)?.emoji}{' '}
              {MISSIONS.find(m => m.id === selected.mission)?.name}
              {' · '}{'⭐'.repeat(robotScoreStars(selected.totalScore))}
            </div>
            {selected.customization && (
              <div style={{
                fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 600,
                color: '#ffffffaa', textAlign: 'center',
              }}>
                "{selected.customization}"
              </div>
            )}
            <div style={{
              fontFamily: '"Nunito", system-ui', fontSize: 12, fontWeight: 600,
              color: '#ffffff66',
            }}>
              {relativeTime(selected.ts)}
            </div>
          </div>
          <div style={{
            marginTop: 10,
            fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 700,
            color: '#ffffff88',
          }}>Tik om te sluiten</div>
        </div>
      )}
    </div>
  )
}
