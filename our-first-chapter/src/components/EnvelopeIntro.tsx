import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Heart } from 'lucide-react'
import { anniversary as data } from '../data/anniversary'
import { Rose } from './Rose'
import { DuduBubu } from './DuduBubu'
import '../styles/envelope.css'

export function EnvelopeIntro({ onOpen }: { onOpen: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [opening, setOpening] = useState(false)
  const reduced = useReducedMotion()
  useEffect(() => {
    dialog.current?.showModal()
    heading.current?.focus({ preventScroll: true })
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous; if (timer.current) clearTimeout(timer.current) }
  }, [])
  function open() {
    if (opening) return
    setOpening(true)
    timer.current = setTimeout(onOpen, reduced ? 0 : 2700)
  }
  return <dialog ref={dialog} className="envelope-dialog" aria-labelledby="opening-title" onCancel={(event) => { event.preventDefault(); open() }}>
    <motion.div className={`opening-inner${opening ? ' is-opening' : ''}`} animate={{ opacity: opening ? 0 : 1 }} transition={{ duration: reduced ? 0 : .35, delay: opening && !reduced ? 2.35 : 0 }}>
      <div className="envelope-stage">
        <div className="envelope">
          <div className="envelope-lining" aria-hidden="true"/>
          <div className="envelope-cavity-shadow" aria-hidden="true"/>
          <div className="envelope-letter" aria-hidden="true">
            <Heart className="envelope-letter-heart" size={22}/>
            <span className="envelope-letter-greeting">{data.invitation.greeting}</span>
            <span className="envelope-letter-message">One year of us.<br/>So many beautiful chapters to come.</span>
            <span className="envelope-letter-signoff">All my love,<strong className="handwritten">{data.names.sender}</strong></span>
            <Rose className="envelope-letter-rose"/>
          </div>
          <div className="envelope-pocket" aria-hidden="true"/>
          <div className="envelope-fold-left" aria-hidden="true"/>
          <div className="envelope-fold-right" aria-hidden="true"/>
          <div className="envelope-flap">
            <div className="envelope-flap-front">
              <div className="opening-heading"><p className="eyebrow">{data.opening.eyebrow}</p><h1 ref={heading} tabIndex={-1} id="opening-title">{data.opening.title}</h1><p className="opening-subtitle">{data.opening.subtitle}</p></div>
            </div>
            <div className="envelope-flap-back" aria-hidden="true"/>
          </div>
          <div className="envelope-rim" aria-hidden="true"/>
        </div>
        <button type="button" className="wax-seal" onClick={open} disabled={opening} aria-label={data.opening.button} aria-describedby="opening-instruction"><span className="wax-seal-monogram" aria-hidden="true">{data.names.monogram}</span></button>
        <p id="opening-instruction" className="opening-instruction"><span className="seal-instruction-desktop">{data.opening.instruction}</span><span className="seal-instruction-touch">{data.opening.touchInstruction}</span></p>
        <div className="envelope-bears" aria-hidden="true"><DuduBubu pose="letter"/></div>
        <div className="envelope-addressee" aria-hidden="true"><small>FOR</small><span className="handwritten">{data.names.recipient}</span></div>
        <p className="opening-footnote">{data.opening.footnote}</p>
      </div>
    </motion.div>
  </dialog>
}
