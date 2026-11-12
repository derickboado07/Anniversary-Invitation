import { useState } from 'react'
import { Gift, Heart, Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { anniversary as data } from '../data/anniversary'

export function GiftExchange() {
  const [opened, setOpened] = useState(false)
  const reduced = useReducedMotion()
  if (!data.gift.enabled) return null
  return <section className="gift-section section-shell" aria-labelledby="gift-title"><div className="gift-card">
    <div className="gift-art"><span className="gift-star star-one" aria-hidden="true">✧</span><button className={`gift-box ${opened ? 'gift-open' : ''}`} aria-label={data.gift.tapLabel} aria-expanded={opened} onClick={() => setOpened(!opened)}><motion.div className="gift-lid" animate={{ y: opened ? (reduced ? -10 : -32) : 0, rotate: opened && !reduced ? -9 : 0 }}><span className="gift-bow"/></motion.div><div className="gift-base"/><Heart className="gift-heart" size={30} fill="currentColor"/></button><span className="gift-star star-two" aria-hidden="true">✧</span><p className="handwritten" aria-live="polite">{opened ? data.gift.surprise : data.gift.tapLabel}</p></div>
    <div className="gift-copy"><p className="eyebrow"><Gift size={13}/>{data.gift.eyebrow}</p><h2 id="gift-title" className="section-heading">{data.gift.title}</h2><p className="gift-intro">{data.gift.intro}</p>{data.gift.paragraphs.map(text => <p key={text}>{text}</p>)}<div className="gift-ps handwritten"><Sparkles size={15}/>{data.gift.ps}</div></div>
  </div></section>
}
