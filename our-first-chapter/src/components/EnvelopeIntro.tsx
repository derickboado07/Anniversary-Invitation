import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, Heart } from 'lucide-react'
import { anniversary as data } from '../data/anniversary'
import { Rose } from './Rose'

export function EnvelopeIntro({ onOpen }: { onOpen: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [opening, setOpening] = useState(false)
  const reduced = useReducedMotion()
  useEffect(() => {
    dialog.current?.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous; if (timer.current) clearTimeout(timer.current) }
  }, [])
  function open() {
    if (opening) return
    setOpening(true)
    timer.current = setTimeout(onOpen, reduced ? 0 : 720)
  }
  return <dialog ref={dialog} className="envelope-dialog" aria-labelledby="opening-title" onCancel={(event) => { event.preventDefault(); open() }}>
    <motion.div className="opening-inner" animate={{ opacity: opening ? 0 : 1, y: opening && !reduced ? -18 : 0 }} transition={{ duration: .6, delay: opening ? .25 : 0 }}>
      <p className="eyebrow">{data.opening.eyebrow}</p>
      <div className={`envelope ${opening ? 'is-opening' : ''}`} aria-hidden="true">
        <div className="envelope-letter"><Rose /><span className="handwritten">{data.names.recipient},</span><Heart size={20}/></div>
        <div className="envelope-pocket"/>
        <div className="envelope-flap"/>
        <div className="wax-seal"><Heart size={24} strokeWidth={1.1}/></div>
        <span className="envelope-address handwritten">{data.names.recipient}</span>
      </div>
      <h1 id="opening-title">{data.opening.title}</h1>
      <p className="opening-subtitle">{data.opening.subtitle}</p>
      <button autoFocus className="button button-primary" onClick={open} disabled={opening}>{data.opening.button}<ArrowUpRight size={16}/></button>
      <p className="opening-footnote">{data.opening.footnote}</p>
    </motion.div>
  </dialog>
}
