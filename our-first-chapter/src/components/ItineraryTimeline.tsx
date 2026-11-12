import { useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll } from 'motion/react'
import { Compass, Heart, MapPin, Moon, Sunrise, Utensils } from 'lucide-react'
import { anniversary as data } from '../data/anniversary'
import type { PhotoAsset } from '../data/anniversary'
import { hasImage } from '../lib/images'
import { isValidMapsUrl } from '../lib/maps'
import { RevealText } from './RevealText'

export { isValidMapsUrl } from '../lib/maps'

const icons = { sunrise: Sunrise, utensils: Utensils, compass: Compass, moon: Moon }
function OptionalPhoto({ asset }: { asset: PhotoAsset }) {
  const [failed, setFailed] = useState(false)
  return hasImage(asset.src) && !failed ? <img className="itinerary-photo" src={asset.src} alt={asset.alt} loading="lazy" style={{ objectPosition: asset.position }} onError={() => setFailed(true)}/> : null
}
export function ItineraryTimeline() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 65%'] })
  return <section id="itinerary" className="itinerary section-shell" aria-labelledby="itinerary-title">
    <div className="section-intro"><p className="eyebrow">{data.itinerary.eyebrow}</p><RevealText id="itinerary-title" className="section-heading">{data.itinerary.title}</RevealText><p>{data.itinerary.subtitle}</p></div>
    <div className="itinerary-date"><Heart size={14}/><span>{data.celebrationLabel}</span></div>
    <div ref={ref} className="itinerary-list"><div className="itinerary-track" aria-hidden="true"><motion.div style={{ scaleY: reduced ? 1 : scrollYProgress }}/></div>
      {data.itinerary.entries.map((entry, index) => {const Icon = icons[entry.icon]; return <motion.article key={entry.id} className="itinerary-row" initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .5 }}>
        <div className="itinerary-time"><span>{entry.period}</span><small>{entry.time}</small></div><div className="itinerary-icon"><Icon size={22} strokeWidth={1.3}/></div>
        <div className="itinerary-card"><span className="chapter-number">0{index + 1}</span><p className="itinerary-place">{entry.place}</p><h3>{entry.title}</h3><p>{entry.description}</p>{entry.image && <OptionalPhoto asset={entry.image}/>} {isValidMapsUrl(entry.mapsUrl) && <a className="maps-link" href={entry.mapsUrl} target="_blank" rel="noopener noreferrer"><MapPin size={14}/>{data.itinerary.mapsLabel}<span className="sr-only"> (opens a new tab)</span></a>}</div>
      </motion.article>})}
    </div><p className="itinerary-note handwritten">{data.itinerary.note}</p>
  </section>
}
