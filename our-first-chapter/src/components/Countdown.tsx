import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { anniversary } from '../data/anniversary'
import '../styles/invitation.css'

const target = Date.parse(anniversary.countdownTarget)
const getSecondsRemaining = () => Math.max(0, Math.ceil((target - Date.now()) / 1000))

export function Countdown() {
  const [remaining, setRemaining] = useState(getSecondsRemaining)
  useEffect(() => {
    if (!Number.isFinite(target)) return
    const refresh = () => setRemaining(getSecondsRemaining())
    const timer = window.setInterval(refresh, 1000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  const values = [Math.floor(remaining / 86400), Math.floor(remaining / 3600) % 24, Math.floor(remaining / 60) % 60, remaining % 60]
  const content = anniversary.countdown

  return (
    <section id="countdown" className="anniversary-countdown section-shell" aria-labelledby="countdown-heading">
      <p className="eyebrow">{content.eyebrow}</p>
      <h2 id="countdown-heading" className="section-heading">{content.title}</h2>
      <p className="countdown-subtitle">{content.subtitle}</p>
      {remaining <= 0 ? (
        <p data-testid="countdown-complete" className="countdown-complete handwritten" role="status"><Heart size={24} aria-hidden="true" />{content.complete}</p>
      ) : (
        <div data-testid="countdown-values" className="countdown-values" role="timer" aria-label={content.title} aria-live="off">
          {values.map((value, index) => (
            <div key={content.labels[index]} className="countdown-unit">
              <span className="countdown-number">{Number.isFinite(value) ? String(value).padStart(2, '0') : '—'}</span>
              <span className="countdown-label">{content.labels[index]}</span>
            </div>
          ))}
        </div>
      )}
      <div className="countdown-date"><span /><time dateTime={anniversary.countdownTarget}>{anniversary.celebrationLabel}</time><span /></div>
    </section>
  )
}
