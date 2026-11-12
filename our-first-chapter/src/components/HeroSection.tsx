import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowDown, ArrowUpRight, Heart, Sparkles } from 'lucide-react'
import { anniversary as data } from '../data/anniversary'
import { hasImage } from '../lib/images'
import { Rose } from './Rose'

export function HeroSection() {
  const reduced = useReducedMotion()
  const [failed, setFailed] = useState(false)
  const date = new Date(`${data.anniversaryDate}T12:00:00+08:00`)
  const day = new Intl.DateTimeFormat('en', { day: '2-digit', timeZone: data.timeZone }).format(date)
  const month = new Intl.DateTimeFormat('en', { month: 'short', timeZone: data.timeZone }).format(date)
  return <section className="hero section-shell" id="home" aria-labelledby="hero-title">
    <motion.div className="hero-copy" initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }}>
      <p className="eyebrow hero-eyebrow"><span/>{data.hero.eyebrow}</p>
      <h1 id="hero-title" aria-label={data.hero.title.join(' ')}><motion.span initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75, delay: .1 }}>{data.hero.title[0]}</motion.span><motion.em initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75, delay: .26 }}>{data.hero.title[1]}<span className="hero-star" aria-hidden="true">✧</span></motion.em></h1>
      <motion.p className="hero-subtitle" initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: .7, delay: .45 }}>{data.hero.subtitle}</motion.p>
      <a className="button button-primary hero-cta" href="#invitation">{data.hero.cta}<ArrowUpRight size={17}/></a>
      <div className="hero-names"><span className="tiny-line"/><p>{data.names.together}</p><Heart size={14} fill="currentColor" strokeWidth={0}/></div>
      <p className="handwritten hero-note">{data.hero.note}</p>
    </motion.div>
    <motion.div className="hero-art" initial={{ opacity: reduced ? 1 : 0, rotate: reduced ? 0 : -3, y: reduced ? 0 : 25 }} animate={{ opacity: 1, rotate: 0, y: 0 }} transition={{ duration: 1, delay: .18 }}>
      <div className="hero-orbit" aria-hidden="true"/>
      <span className="hero-art-spark" aria-hidden="true">✧</span>
      <div className="back-paper"><span>{data.hero.occasion}</span><Heart size={36} strokeWidth={.7}/></div>
      <figure className="hero-polaroid">
        <div className="photo-tape" aria-hidden="true"/>
        <div className="hero-photo">
          {hasImage(data.hero.photo.src) && !failed ? <img src={data.hero.photo.src} alt={data.hero.photo.alt} style={{ objectPosition: data.hero.photo.position }} fetchPriority="high" onError={() => setFailed(true)}/> : <div className="hero-photo-placeholder" role="img" aria-label={data.hero.placeholder}>
            <div className="art-sun"/><Rose className="hero-rose"/><span className="placeholder-caption">{data.hero.placeholder}</span>
          </div>}
        </div>
        <figcaption className="handwritten">{data.hero.photoNote}<Heart size={16}/></figcaption>
      </figure>
      <div className="anniversary-stamp"><span>{day}</span><span>{month.toUpperCase()} · {data.anniversaryDate.slice(0,4)}</span><Heart size={12}/></div>
      <p className="hero-side-note" aria-hidden="true">{data.hero.occasion} <Sparkles size={12}/></p>
    </motion.div>
    <div className="hero-bottom"><a href="#invitation">{data.hero.scroll}<ArrowDown size={15}/></a><span>{data.hero.occasion}<i/> {data.hero.date}</span><span className="hero-page">01 / 09</span></div>
  </section>
}
