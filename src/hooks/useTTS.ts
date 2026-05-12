import { useCallback, useRef } from 'react'

interface TTSResult {
  speak: (text: string, onEnd?: () => void) => void
  stop: () => void
  supported: boolean
}

export function useTTS(): TTSResult {
  const supported = 'speechSynthesis' in window
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Detach handlers from the previous utterance before cancel(), so the
  // cancel-induced onend/onerror doesn't fire a stale callback (e.g. an
  // old `() => setPhase('result')` that would race the caller's next setPhase).
  const detachPrev = () => {
    const prev = utteranceRef.current
    if (prev) {
      prev.onend = null
      prev.onerror = null
      utteranceRef.current = null
    }
  }

  const stop = useCallback(() => {
    detachPrev()
    if (supported) window.speechSynthesis.cancel()
  }, [supported])

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!supported) { onEnd?.(); return }

    detachPrev()
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'nl-NL'
    utterance.rate = 0.95
    utterance.pitch = 1.05

    // Pick the best available Dutch voice
    const voices = window.speechSynthesis.getVoices()
    const nlVoice = voices.find(v => v.lang.startsWith('nl')) ?? null
    if (nlVoice) utterance.voice = nlVoice

    let done = false
    const finish = () => {
      if (done) return
      done = true
      if (utteranceRef.current === utterance) utteranceRef.current = null
      // Defer onEnd to a future task so any pending React state updates
      // (e.g. setPhase) have time to render before the callback triggers
      // the next state transition. Also works around Chrome batching the
      // current-phase and next-phase updates together when onerror fires
      // quickly after speak() (a known Web Speech API quirk on Windows).
      if (onEnd) setTimeout(onEnd, 0)
    }
    utterance.onend = finish
    utterance.onerror = finish

    utteranceRef.current = utterance
    // Resume synthesis first — Chrome can enter a paused/stuck state after
    // repeated cancel() calls, causing subsequent speak() calls to silently fail.
    if (window.speechSynthesis.paused) window.speechSynthesis.resume()
    window.speechSynthesis.speak(utterance)
  }, [supported])

  return { speak, stop, supported }
}
