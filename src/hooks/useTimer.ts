'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

export function useCountdown() {
  const [seconds, setSeconds] = useState(0)
  const [total, setTotal] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          setRunning(false)
          if (navigator.vibrate) navigator.vibrate([200, 100, 200])
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  const start = useCallback((s: number) => {
    setTotal(s)
    setSeconds(s)
    setRunning(true)
  }, [])

  const stop = useCallback(() => {
    setRunning(false)
    setSeconds(0)
    setTotal(0)
  }, [])

  return { seconds, total, running, start, stop }
}

export function useStopwatch() {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  const start = useCallback(() => setRunning(true), [])
  const stop = useCallback(() => setRunning(false), [])
  const reset = useCallback(() => { setRunning(false); setSeconds(0) }, [])

  return { seconds, running, start, stop, reset }
}
