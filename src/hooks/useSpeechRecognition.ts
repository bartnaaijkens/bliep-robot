import { useState, useRef, useCallback, useEffect } from 'react'

export interface SpeechRecognitionResult {
  partial: string
  supported: boolean
  start: () => void
  /** Ask the engine to stop and flush. The hook will deliver onResult or onEndWithoutResult. */
  stop: () => void
  /** Hard reset — abort recognition, fire NO callbacks. Used by clearThread / unmount. */
  abort: () => void
}

interface SpeechRecognitionOptions {
  onResult: (transcript: string) => void
  onEndWithoutResult?: () => void
  /** Fired when recognition fails with no usable transcript. `error` is the SpeechRecognitionErrorEvent type ('network', 'not-allowed', 'audio-capture', etc.). */
  onError?: (error: string) => void
}

interface ISpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onstart: ((ev: Event) => void) | null
  onend: ((ev: Event) => void) | null
  onerror: ((ev: Event) => void) | null
  onresult: ((ev: SpeechRecognitionEvent) => void) | null
}

interface ISpeechRecognitionConstructor {
  new(): ISpeechRecognition
}

function getSpeechRecognitionAPI(): ISpeechRecognitionConstructor | null {
  const w = window as Window & {
    SpeechRecognition?: ISpeechRecognitionConstructor
    webkitSpeechRecognition?: ISpeechRecognitionConstructor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

const DEBUG = true
const log = (...args: unknown[]) => { if (DEBUG) console.log('[stt]', ...args) }

const STOP_WATCHDOG_MS = 2500

export function useSpeechRecognition({ onResult, onEndWithoutResult, onError }: SpeechRecognitionOptions): SpeechRecognitionResult {
  const supported = getSpeechRecognitionAPI() !== null
  const [partial, setPartial] = useState('')

  // Stable callback refs — the start() closure always calls the latest version
  const onResultRef = useRef(onResult)
  const onEndWithoutResultRef = useRef(onEndWithoutResult)
  const onErrorRef = useRef(onError)
  useEffect(() => { onResultRef.current = onResult }, [onResult])
  useEffect(() => { onEndWithoutResultRef.current = onEndWithoutResult }, [onEndWithoutResult])
  useEffect(() => { onErrorRef.current = onError }, [onError])

  const recognitionRef = useRef<ISpeechRecognition | null>(null)
  // Mirror of `partial` for synchronous read inside the watchdog
  const partialRef = useRef('')
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearWatchdog = () => {
    if (watchdogRef.current !== null) {
      clearTimeout(watchdogRef.current)
      watchdogRef.current = null
    }
  }

  const abort = useCallback(() => {
    log('abort()')
    const r = recognitionRef.current
    if (r) {
      recognitionRef.current = null
      try { r.abort() } catch { /* ignore */ }
    }
    clearWatchdog()
    partialRef.current = ''
    setPartial('')
  }, [])

  const stop = useCallback(() => {
    const r = recognitionRef.current
    log('stop() called, partialRef=', JSON.stringify(partialRef.current), 'recognition?', !!r)
    if (!r) return
    try { r.stop() } catch (e) { log('r.stop threw', e) }

    // Watchdog for the Chrome bug where neither onresult nor onend fires after stop().
    clearWatchdog()
    watchdogRef.current = setTimeout(() => {
      watchdogRef.current = null
      if (recognitionRef.current !== r) { log('watchdog: session already ended naturally'); return }
      const late = partialRef.current.trim()
      log('watchdog fired, late=', JSON.stringify(late))
      recognitionRef.current = null
      try { r.abort() } catch { /* ignore */ }
      partialRef.current = ''
      setPartial('')
      if (late) onResultRef.current(late)
      else onEndWithoutResultRef.current?.()
    }, STOP_WATCHDOG_MS)
  }, [])

  const start = useCallback(() => {
    const API = getSpeechRecognitionAPI()
    if (!API) return
    log('start()')

    // Detach + abort any previous session. Its onend will be ignored via identity check.
    const prev = recognitionRef.current
    if (prev) {
      recognitionRef.current = null
      try { prev.abort() } catch { /* ignore */ }
    }
    clearWatchdog()
    partialRef.current = ''
    setPartial('')

    // Per-session closure state
    let lastPartial = ''
    let ended = false

    const handleSessionEnd = (cause: string, error?: string) => {
      if (ended) { log('handleSessionEnd skipped (already ended)', cause); return }
      ended = true
      clearWatchdog()
      partialRef.current = ''
      setPartial('')
      const fallback = lastPartial.trim()
      log('handleSessionEnd', cause, 'fallback=', JSON.stringify(fallback), 'error=', error)
      if (fallback) {
        // We have something usable from interim — deliver it even if there was an error.
        onResultRef.current(fallback)
      } else if (error && error !== 'no-speech' && error !== 'aborted') {
        // Real failure: surface to the app so it can show a message.
        onErrorRef.current?.(error)
      } else {
        // Genuinely nothing heard.
        onEndWithoutResultRef.current?.()
      }
    }

    const recognition = new API()
    recognition.lang = 'nl-NL'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      if (recognitionRef.current !== recognition) return
      log('onstart')
      partialRef.current = ''
      setPartial('')
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (recognitionRef.current !== recognition) { log('onresult ignored (stale session)'); return }
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i]
        if (r.isFinal) final += r[0].transcript
        else interim += r[0].transcript
      }
      log('onresult interim=', JSON.stringify(interim), 'final=', JSON.stringify(final))
      if (interim) {
        lastPartial = interim
        partialRef.current = interim
        setPartial(interim)
      }
      if (final && !ended) {
        lastPartial = final
        ended = true
        clearWatchdog()
        partialRef.current = ''
        setPartial('')
        onResultRef.current(final.trim())
      }
    }

    recognition.onerror = (ev: Event) => {
      if (recognitionRef.current !== recognition) return
      const errorType = (ev as { error?: string }).error ?? 'unknown'
      log('onerror', errorType)
      handleSessionEnd('onerror', errorType)
    }

    // onend always fires (even after onerror) — `ended` flag prevents double-handling.
    // We deliberately do NOT null recognitionRef here, so if Chrome fires onend BEFORE
    // onresult(final) (it sometimes does), the final still gets through via the
    // `!ended` guard in onresult.
    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return
      log('onend')
      handleSessionEnd('onend')
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch (e) {
      log('recognition.start threw', e)
      if (recognitionRef.current === recognition) recognitionRef.current = null
      onEndWithoutResultRef.current?.()
    }
  }, [])

  useEffect(() => () => {
    const r = recognitionRef.current
    if (r) {
      recognitionRef.current = null
      try { r.abort() } catch { /* ignore */ }
    }
    if (watchdogRef.current !== null) {
      clearTimeout(watchdogRef.current)
      watchdogRef.current = null
    }
  }, [])

  return { partial, supported, start, stop, abort }
}
