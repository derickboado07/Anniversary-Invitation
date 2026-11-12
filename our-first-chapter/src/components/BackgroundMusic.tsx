import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { anniversary } from '../data/anniversary'
import '../styles/music.css'

export function BackgroundMusic() {
  const config = anniversary.audio
  const audio = useRef<HTMLAudioElement>(null)
  const request = useRef(0)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    const player = audio.current
    if (!player) return
    player.volume = Math.min(1, Math.max(0, config.volume))
    return () => {
      request.current += 1
      player.pause()
    }
  }, [config.volume])

  async function toggle() {
    const player = audio.current
    if (!player) return
    const currentRequest = ++request.current
    setFeedback('')
    if (!player.paused || loading) {
      player.pause()
      setPlaying(false)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      if (player.error) player.load()
      await player.play()
      if (currentRequest === request.current) {
        setPlaying(!player.paused)
        setLoading(false)
      }
    } catch {
      if (currentRequest === request.current) {
        setPlaying(false)
        setLoading(false)
        setFeedback(config.unavailable)
      }
    }
  }

  function failed() {
    request.current += 1
    setPlaying(false)
    setLoading(false)
    setFeedback(config.unavailable)
  }

  const active = playing || loading
  return <aside className="background-music" aria-label={config.title}>
    <p className="music-feedback" role="status">{feedback}</p>
    <button
      type="button"
      className={`music-toggle${active ? ' is-active' : ''}`}
      onClick={() => { void toggle() }}
      aria-label={active ? config.pauseLabel : config.playLabel}
      aria-describedby="music-track"
      aria-pressed={active}
    >
      <span className="music-toggle-icon" aria-hidden="true">{active ? <Pause size={16} fill="currentColor"/> : <Play size={16} fill="currentColor"/>}</span>
      <span className="music-toggle-copy">
        <span id="music-track" className="music-track">{config.title}</span>
        <span className="music-action">{loading ? config.loadingLabel : playing ? config.pauseLabel : config.playLabel}</span>
      </span>
      <span className={`music-bars${playing && !loading ? ' is-playing' : ''}`} aria-hidden="true"><i/><i/><i/><i/></span>
    </button>
    <audio
      ref={audio}
      data-testid="background-audio"
      src={config.src}
      loop
      preload="none"
      onPlaying={() => { setPlaying(true); setLoading(false); setFeedback('') }}
      onPause={() => { if (audio.current?.paused) { setPlaying(false); setLoading(false) } }}
      onWaiting={() => { if (audio.current && !audio.current.paused) setLoading(true) }}
      onError={failed}
    />
  </aside>
}
