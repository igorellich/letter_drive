const KEY = 'eat_steak_sound'

function readStored(): boolean {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === null) return false
    return JSON.parse(raw) === true
  } catch {
    return false
  }
}

let muted = readStored()
const listeners = new Set<(muted: boolean) => void>()

export const soundBus = {
  getMuted: (): boolean => muted,
  setMuted(v: boolean) {
    if (muted === v) return
    muted = v
    try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* ignore */ }
    listeners.forEach(l => l(v))
  },
  toggle: (): boolean => {
    soundBus.setMuted(!muted)
    return muted
  },
  subscribe: (fn: (muted: boolean) => void): (() => void) => {
    listeners.add(fn)
    fn(muted)
    return () => { listeners.delete(fn) }
  }
}
