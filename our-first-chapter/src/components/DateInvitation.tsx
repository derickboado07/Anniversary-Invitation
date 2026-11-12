import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowDown, CalendarHeart, Heart, Sparkles } from 'lucide-react'
import { anniversary } from '../data/anniversary'
import { celebrateHearts } from '../lib/celebrate'
import { createEscapeDeck } from '../lib/noButton'
import type { EscapeSpot } from '../lib/noButton'
import type { ItineraryEmailStatus } from '../lib/itineraryEmail'
import { InvitationEmail } from './InvitationEmail'
import '../styles/invitation.css'

interface DateInvitationProps { accepted: boolean; onAccept: () => void; acceptanceSaved?: boolean; emailStatus?: ItineraryEmailStatus; onRetryEmail?: () => void }
interface HeartEcho { id: number; x: number; y: number }

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function DateInvitation({ accepted, onAccept, acceptanceSaved = true, emailStatus = 'idle', onRetryEmail }: DateInvitationProps) {
  const content = anniversary.invitation
  const reducedMotion = useReducedMotion()
  const [deferred, setDeferred] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [keyboardFocus, setKeyboardFocus] = useState(false)
  const [echoes, setEchoes] = useState<HeartEcho[]>([])
  const keyboardMode = useRef(false)
  const escapeDeck = useRef<EscapeSpot[]>([])
  const echoSequence = useRef(0)
  const playground = useRef<HTMLDivElement>(null)
  const noButton = useRef<HTMLButtonElement>(null)
  const bounds = useRef({ width: 0, height: 0, inset: 0, buttonWidth: 0, buttonHeight: 0 })
  const lastEscape = useRef(-Infinity)

  useEffect(() => {
    if (accepted || deferred || !playground.current || !noButton.current) return
    const area = playground.current
    const button = noButton.current
    let measured = false
    const measure = () => {
      const maxX = Math.max(0, area.clientWidth - button.offsetWidth)
      const maxY = Math.max(0, area.clientHeight - button.offsetHeight)
      const inset = Math.min(12, maxX / 2, maxY / 2)
      bounds.current = { width: maxX, height: maxY, inset, buttonWidth: button.offsetWidth, buttonHeight: button.offsetHeight }
      escapeDeck.current = createEscapeDeck()
      setEchoes([])
      // Preserve a focused target on resize, clamping only when it would leave the lane.
      const alreadyMeasured = measured
      setPosition(previous => alreadyMeasured ? {
        x: clamp(previous.x, inset, maxX - inset),
        y: clamp(previous.y, inset, maxY - inset),
      } : { x: maxX / 2, y: maxY / 2 })
      measured = true
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(area)
    return () => observer.disconnect()
  }, [accepted, deferred])

  const escape = (pointer?: { clientX: number; clientY: number; pointerType?: string }) => {
    if (keyboardMode.current || !playground.current || !noButton.current) return
    const now = performance.now()
    if (now - lastEscape.current < 260) return
    lastEscape.current = now
    const { width, height, inset, buttonWidth, buttonHeight } = bounds.current
    if (width <= 0 && height <= 0) return
    const area = playground.current.getBoundingClientRect()
    const button = noButton.current.getBoundingClientRect()
    // A finger lifts after tapping. Let touch explore every hideout instead of
    // rejecting the middle of a narrow phone layout as if a cursor stayed there.
    const cursor = pointer && pointer.pointerType !== 'touch' && pointer.pointerType !== 'pen'
      ? { x: pointer.clientX - area.left, y: pointer.clientY - area.top } : null
    const pointFor = (spot: EscapeSpot) => ({ x: inset + spot.x * (width - inset * 2), y: inset + spot.y * (height - inset * 2) })
    if (!escapeDeck.current.length) escapeDeck.current = createEscapeDeck()
    // Deal an unused hideout instead of repeatedly picking opposing corners.
    // Prefer one outside the pointer's reach, without a mousemove listener.
    let nextIndex = escapeDeck.current.findIndex(spot => {
      const point = pointFor(spot)
      const moved = Math.hypot(point.x - position.x, point.y - position.y) > 22
      const away = !cursor || Math.abs(point.x + buttonWidth / 2 - cursor.x) > buttonWidth / 2 + 12 || Math.abs(point.y + buttonHeight / 2 - cursor.y) > buttonHeight / 2 + 12
      return moved && away
    })
    if (nextIndex < 0) {
      // Near the end of a deck, use the farthest remaining hideout.
      let distance = -1
      escapeDeck.current.forEach((spot, index) => {
        const point = pointFor(spot)
        const candidate = Math.hypot(point.x - position.x, point.y - position.y)
        if (candidate > distance) { distance = candidate; nextIndex = index }
      })
    }
    const [hideout] = escapeDeck.current.splice(nextIndex, 1)
    const next = pointFor(hideout)
    const jitter = (range: number) => (Math.random() - .5) * Math.min(6, range * .025)
    setPosition({ x: clamp(next.x + jitter(width), inset, width - inset), y: clamp(next.y + jitter(height), inset, height - inset) })
    if (!reducedMotion) {
      const echo = { id: ++echoSequence.current, x: button.left - area.left + button.width / 2 - 8, y: button.top - area.top + button.height / 2 - 8 }
      setEchoes(previous => [...previous.slice(-2), echo])
    }
    setAttempts((previous) => previous + 1)
  }

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    // Prevent touch from turning the playful tap into a synthesized click.
    if (event.pointerType !== 'mouse') event.preventDefault()
    keyboardMode.current = false
    setKeyboardFocus(false)
    escape(event)
  }

  const accept = () => {
    onAccept()
    if (reducedMotion) return
    celebrateHearts()
  }

  return (
    <section id="invitation" className="date-invitation section-shell" aria-labelledby="invitation-heading">
      <motion.div
        className="invitation-card"
        initial={reducedMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.65 }}
      >
        <span className="invitation-corner invitation-corner-tl" aria-hidden="true" />
        <span className="invitation-corner invitation-corner-br" aria-hidden="true" />
        <p className="eyebrow">{content.eyebrow}</p>
        <div className="invitation-emblem" aria-hidden="true"><Heart size={22} strokeWidth={1.2} /></div>
        <AnimatePresence mode="wait" initial={false}>
          {accepted ? (
            <motion.div key="accepted" className="invitation-state invitation-accepted" initial={reducedMotion ? false : { opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <div role="status">
                <span className="invitation-success-icon" aria-hidden="true"><Sparkles size={28} strokeWidth={1.2} /></span>
                <h2 id="invitation-heading" className="section-heading">{content.acceptedTitle}</h2>
                <p className="invitation-body">{content.acceptedMessage}</p>
                <p className="invitation-date">{content.acceptedDate}</p>
                <p className="handwritten invitation-signature">{content.signature}</p>
              </div>
              <a className="button button-primary" href="#itinerary">{content.acceptedCta}<ArrowDown size={16} aria-hidden="true" /></a>
              <p className="invitation-local-note">{acceptanceSaved ? content.localNote : content.sessionNote}</p>
              {anniversary.email.enabled && <InvitationEmail status={emailStatus} onRetry={() => onRetryEmail?.()}/>}
            </motion.div>
          ) : deferred ? (
            <motion.div key="deferred" className="invitation-state invitation-deferred" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <h2 id="invitation-heading" className="section-heading">{content.greeting}</h2>
              <p className="invitation-body" role="status">{content.deferred}</p>
              <button type="button" className="button button-secondary" onClick={() => { setDeferred(false); setAttempts(0); setKeyboardFocus(false); keyboardMode.current = false; lastEscape.current = -Infinity }}>{content.returnLabel}</button>
            </motion.div>
          ) : (
            <motion.div key="question" className="invitation-state" initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <p className="handwritten invitation-greeting">{content.greeting}</p>
              <h2 id="invitation-heading" className="section-heading invitation-question">{content.question}</h2>
              <p className="invitation-date"><CalendarHeart size={17} aria-hidden="true" />{anniversary.celebrationLabel}</p>
              <p className="invitation-body">{content.subtitle}</p>
              <div className="invitation-actions">
                <div className="invitation-yes-zone">
                  <motion.button type="button" className="button button-primary invitation-yes" onClick={accept} whileHover={reducedMotion ? undefined : { scale: 1.035 }} whileTap={reducedMotion ? undefined : { scale: 0.98 }}>
                    {content.yes}<Heart size={17} aria-hidden="true" />
                  </motion.button>
                </div>
                <div ref={playground} data-testid="no-playground" className="invitation-no-zone" onPointerEnter={(event) => { if (event.pointerType === 'mouse') escape(event) }}>
                  <svg className="invitation-wander-line" viewBox="0 0 360 140" preserveAspectRatio="none" fill="none" aria-hidden="true"><path d="M20 92C62 13 108 136 169 61S276 9 340 94" stroke="currentColor" strokeWidth=".8" strokeDasharray="3 7"/><path d="M294 30s-9-6-9-11c0-5 6-6 9-2 3-4 9-3 9 2 0 5-9 11-9 11Z" stroke="currentColor" strokeWidth=".8"/></svg>
                  {echoes.map(echo => <motion.span key={echo.id} className="invitation-heart-echo" aria-hidden="true" style={{ left: echo.x, top: echo.y }} initial={{ opacity: .5, scale: .7, y: 0 }} animate={{ opacity: 0, scale: 1.15, y: -8 }} transition={{ duration: .6 }} onAnimationComplete={() => setEchoes(previous => previous.filter(item => item.id !== echo.id))}><Heart size={16} strokeWidth={1.1}/></motion.span>)}
                  <motion.button
                    ref={noButton}
                    data-testid="no-button"
                    type="button"
                    className="invitation-no"
                    aria-label={content.no}
                    animate={{ x: position.x, y: position.y, rotate: reducedMotion || keyboardFocus || !attempts ? 0 : attempts % 2 ? -3 : 3 }}
                    transition={reducedMotion || keyboardFocus ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 34, mass: .7 }}
                    onPointerEnter={(event) => { if (event.pointerType === 'mouse') escape(event) }}
                    onPointerDown={handlePointerDown}
                    onFocus={(event) => {
                      if (event.currentTarget.matches(':focus-visible')) {
                        keyboardMode.current = true
                        setKeyboardFocus(true)
                      }
                    }}
                    onBlur={() => { keyboardMode.current = false; setKeyboardFocus(false) }}
                    onClick={(event) => { if (event.detail === 0) setDeferred(true); else escape(event) }}
                  ><span>{attempts ? content.noLabels[(attempts - 1) % content.noLabels.length] : content.no}</span></motion.button>
                </div>
              </div>
              <p className="invitation-playful handwritten" aria-live="polite" aria-atomic="true">{attempts > 0 ? content.playfulMessages[(attempts - 1) % content.playfulMessages.length] : '\u00a0'}</p>
              <button className="invitation-later" type="button" onClick={() => setDeferred(true)}>{content.later}</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
