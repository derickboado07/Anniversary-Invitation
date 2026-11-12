import { motion, useReducedMotion } from 'motion/react'
import { Heart } from 'lucide-react'
import { anniversary as data } from '../data/anniversary'
import { Rose } from './Rose'
import { RevealText } from './RevealText'

export function LoveLetter() {
  const reduced = useReducedMotion()
  return <section id="letter" className="love-letter-section section-shell" aria-labelledby="letter-title"><div className="section-intro"><p className="eyebrow">{data.letter.eyebrow}</p><RevealText className="section-heading" id="letter-title">{data.letter.title}</RevealText></div>
    <motion.article className="letter-paper" initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .7 }}><span className="letter-date">{data.hero.date}</span><Heart className="letter-heart" size={24} strokeWidth={1}/><p className="letter-greeting handwritten">{data.letter.greeting}</p><div className="letter-paragraphs">{data.letter.paragraphs.map(text => <p key={text}>{text}</p>)}</div><div className="letter-signoff"><p>{data.letter.signoff}</p><p className="handwritten letter-signature">{data.letter.signature}<Heart size={18} strokeWidth={1.4}/></p></div><Rose className="letter-rose"/></motion.article>
  </section>
}
