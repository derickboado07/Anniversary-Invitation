import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Heart, Mail } from 'lucide-react'
import { anniversary as data } from '../data/anniversary'
import { Rose } from './Rose'
import { RevealText } from './RevealText'
import { LetterEnvelope } from './LetterEnvelope'
import '../styles/love-letter.css'

export function LoveLetter() {
  const reduced = useReducedMotion()
  const [state, setState] = useState<'closed' | 'opening' | 'open'>('closed')
  const section = useRef<HTMLElement>(null)
  const paper = useRef<HTMLElement>(null)
  const greeting = useRef<HTMLParagraphElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const returnFocus = useRef(false)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  useEffect(() => {
    if (state === 'open') {
      const frame = requestAnimationFrame(() => {
        greeting.current?.focus({ preventScroll: true })
        paper.current?.scrollIntoView({ block: 'start', behavior: reduced ? 'instant' : 'smooth' })
      })
      return () => cancelAnimationFrame(frame)
    }
    if (state === 'closed' && returnFocus.current) {
      returnFocus.current = false
      const frame = requestAnimationFrame(() => {
        section.current?.querySelector<HTMLButtonElement>('.letter-envelope-seal')?.focus({ preventScroll: true })
        section.current?.scrollIntoView({ block: 'start', behavior: reduced ? 'instant' : 'smooth' })
      })
      return () => cancelAnimationFrame(frame)
    }
  }, [state, reduced])

  function openLetter() {
    if (state !== 'closed') return
    if (reduced) { setState('open'); return }
    setState('opening')
    timer.current = setTimeout(() => { timer.current = null; setState('open') }, 2200)
  }

  function closeLetter() {
    returnFocus.current = true
    setState('closed')
  }

  return <section ref={section} id="letter" className="love-letter-section section-shell" aria-labelledby="letter-title">
    <div className="section-intro">
      <p className="eyebrow">{data.letter.eyebrow}</p>
      <RevealText className="section-heading" id="letter-title">{data.letter.title}</RevealText>
    </div>
    {state !== 'open' && <LetterEnvelope opening={state === 'opening'} onOpen={openLetter}/>}
    <div id="personal-letter-content" className="love-letter-reader" hidden={state !== 'open'}>
      {state === 'open' && <>
        <motion.article ref={paper} className="letter-paper" aria-labelledby="personal-letter-greeting"
          initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}>
          <span className="letter-date">{data.hero.date}</span>
          <Heart className="letter-heart" size={24} strokeWidth={1} aria-hidden="true"/>
          <p ref={greeting} id="personal-letter-greeting" tabIndex={-1} className="letter-greeting handwritten">{data.letter.greeting}</p>
          <div className="letter-paragraphs">{data.letter.paragraphs.map(text => <p key={text}>{text}</p>)}</div>
          <div className="letter-signoff"><p>{data.letter.signoff}</p><p className="handwritten letter-signature">{data.letter.signature}<Heart size={18} strokeWidth={1.4} aria-hidden="true"/></p></div>
          <Rose className="letter-rose"/>
        </motion.article>
        <div className="love-letter-actions"><button type="button" onClick={closeLetter} aria-controls="personal-letter-content" aria-expanded="true"><Mail size={16} aria-hidden="true"/>Close the letter</button></div>
      </>}
    </div>
  </section>
}
