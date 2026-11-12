import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, CalendarHeart, Clock3, Heart, MapPin, Palette, Sparkles, Utensils } from 'lucide-react'
import { anniversary as data } from '../data/anniversary'
import { isValidMapsUrl } from '../lib/maps'
import { RevealText } from './RevealText'
import { VenueGallery } from './VenueGallery'
import { DressCodeGuide } from './DressCodeGuide'
import { MuseumPhotoStack } from './MuseumPhotoStack'
import '../styles/dining.css'
import '../styles/art-lounge.css'

export { isValidMapsUrl } from '../lib/maps'

export function ItineraryTimeline() {
  const reduced = useReducedMotion()
  return <section id="itinerary" className="itinerary section-shell dining-experience" aria-labelledby="itinerary-title">
    <div className="dining-heading">
      <p className="eyebrow"><span/>{data.itinerary.eyebrow}<span/></p>
      <RevealText id="itinerary-title" className="section-heading">{data.itinerary.title}</RevealText>
      <p>{data.itinerary.subtitle}</p>
    </div>
    {data.itinerary.entries.map((entry, index) => entry.kind === 'gallery' ? <motion.article key={entry.id} className="art-lounge-stop" aria-labelledby={'itinerary-stop-title-' + entry.id} initial={reduced ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .65 }}>
      <div className="art-lounge-copy">
        <p className="art-lounge-eyebrow"><span>{String(index + 1).padStart(2, '0')}</span><Palette size={13} aria-hidden="true"/>OUR AFTERNOON BEGINS</p>
        <h3 id={'itinerary-stop-title-' + entry.id}>{entry.title}</h3>
        <p className="art-lounge-place"><MapPin size={15} aria-hidden="true"/>{entry.place}</p>
        <div className="art-lounge-time"><Clock3 size={21} strokeWidth={1.3} aria-hidden="true"/><span>{entry.period} together<strong>{entry.time}</strong></span></div>
        <p className="art-lounge-date"><CalendarHeart size={13} aria-hidden="true"/>{data.celebrationLabel}</p>
        <p className="art-lounge-description">{entry.description}</p>
        {isValidMapsUrl(entry.mapsUrl) && <a className="art-lounge-directions" href={entry.mapsUrl} target="_blank" rel="noopener noreferrer">{data.itinerary.mapsLabel}<ArrowUpRight size={15} aria-hidden="true"/><span className="sr-only"> (opens a new tab)</span></a>}
        <p className="art-lounge-signature handwritten">art, little conversations & us.<Heart size={13} aria-hidden="true"/></p>
      </div>
      <MuseumPhotoStack images={entry.gallery || (entry.image ? [entry.image] : [])} label={entry.place}/>
    </motion.article> : <motion.article key={entry.id} className="itinerary-row dining-booking" aria-labelledby={'dining-title-' + entry.id} initial={reduced ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .65 }}>
      <div className="dining-preview">
        <div className="dining-preview-heading"><span><Utensils size={14} aria-hidden="true"/>THE SETTING</span><span>City lights. Good company.</span></div>
        <VenueGallery images={entry.gallery || (entry.image ? [entry.image] : [])} intervalMs={5000}/>
      </div>
      <div className="dining-reservation">
        <div className="dining-ticket-heading"><span className="dining-ticket-monogram">M <i>&</i> Y</span><span className="dining-ticket-status"><span/>Reservation booked</span></div>
        <p className="dining-ticket-eyebrow">{String(index + 1).padStart(2, '0')} / OUR ANNIVERSARY DINNER</p>
        <h3 id={'dining-title-' + entry.id}>{entry.title}</h3>
        <p className="dining-ticket-place"><MapPin size={15} aria-hidden="true"/>{entry.place}</p>
        <div className="dining-ticket-details">
          <div><CalendarHeart size={17} aria-hidden="true"/><span>THE DATE<strong>{data.celebrationLabel}</strong></span></div>
          <div><Clock3 size={17} aria-hidden="true"/><span>OUR TABLE IS WAITING<strong>{entry.time}</strong></span></div>
        </div>
        <p className="dining-ticket-description">{entry.description}</p>
        {isValidMapsUrl(entry.mapsUrl) && <a className="dining-directions" href={entry.mapsUrl} target="_blank" rel="noopener noreferrer">{data.itinerary.mapsLabel}<ArrowUpRight size={15} aria-hidden="true"/><span className="sr-only"> (opens a new tab)</span></a>}
        <p className="dining-ticket-signature handwritten">a table for two. always you.<Heart size={13} aria-hidden="true"/></p>
      </div>
      {entry.dressCode && <section className="dining-attire" aria-labelledby={'dress-code-title-' + entry.id}>
        <div className="dining-attire-heading"><div><p className="eyebrow"><Sparkles size={12} aria-hidden="true"/>LET'S DRESS UP A LITTLE</p><h3 id={'dress-code-title-' + entry.id}>A little style inspiration</h3></div><p>{entry.dressCode}<span>Choose the look that feels most like you.</span></p></div>
        {entry.attireOptions && <DressCodeGuide options={entry.attireOptions}/>}
      </section>}
    </motion.article>)}
    <p className="itinerary-note dining-note handwritten"><Heart size={17} strokeWidth={1} aria-hidden="true"/>{data.itinerary.note}</p>
  </section>
}
