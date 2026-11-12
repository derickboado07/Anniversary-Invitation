import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import { ArrowUpRight, Camera, ChevronLeft, ChevronRight, Pause, Play, Sparkles } from 'lucide-react'
import type { PhotoAsset } from '../data/anniversary'
import '../styles/venue-gallery.css'

interface VenueGalleryProps {
  images: PhotoAsset[]
  intervalMs?: number
}

export function VenueGallery({ images, intervalMs = 4000 }: VenueGalleryProps) {
  const gallery = useRef<HTMLElement>(null)
  const stageId = useId()
  const inView = useInView(gallery, { amount: .25 })
  const reduced = useReducedMotion() !== false
  // Public uploads can be added while Vite is running, after its image list was
  // generated. Try the configured paths and let onError skip missing photos.
  const knownImages = useMemo(() => images.filter((image, index) =>
    (image.src.startsWith('/') && !image.src.startsWith('//') || image.src.startsWith('https://'))
      && images.findIndex(candidate => candidate.src === image.src) === index), [images])
  const [failed, setFailed] = useState<string[]>([])
  const photos = knownImages.filter(image => !failed.includes(image.src))
  const [selected, setSelected] = useState(0)
  const activeIndex = Math.min(selected, Math.max(0, photos.length - 1))
  const active = photos[activeIndex]
  const [playPreference, setPlayPreference] = useState<boolean | null>(null)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [pageVisible, setPageVisible] = useState(() => typeof document !== 'undefined' && document.visibilityState === 'visible')
  const [announcement, setAnnouncement] = useState('')
  const wantsPlayback = playPreference ?? !reduced
  const playing = wantsPlayback && !hovered && !focused && pageVisible && inView && photos.length > 1

  useEffect(() => {
    const visibility = () => setPageVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', visibility)
    return () => document.removeEventListener('visibilitychange', visibility)
  }, [])

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => setSelected((activeIndex + 1) % photos.length), Math.max(1000, intervalMs))
    return () => window.clearInterval(timer)
  }, [playing, photos.length, intervalMs, activeIndex])

  function select(index: number) {
    const next = (index + photos.length) % photos.length
    setSelected(next)
    setAnnouncement(`Photo ${next + 1} of ${photos.length}: ${photos[next].caption || photos[next].alt}`)
  }

  function failedPhoto(src: string) {
    setFailed(previous => previous.includes(src) ? previous : [...previous, src])
  }

  if (!active) return <div className="venue-gallery-empty"><Camera size={30} strokeWidth={1}/><p>A beautiful evening awaits.</p><span>The Nest Dining in the Sky</span></div>

  return <section
    ref={gallery}
    className="venue-gallery"
    role="region"
    aria-roledescription="carousel"
    aria-label="The Nest venue photos"
    onPointerEnter={event => { if (event.pointerType !== 'touch') setHovered(true) }}
    onPointerLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)}
    onBlurCapture={event => { if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}
  >
    <div className="venue-gallery-stage" id={stageId} aria-live="off">
      {photos.map((photo, index) => <div key={photo.src} className={`venue-gallery-slide${index === activeIndex ? ' is-active' : ''}${photo.fit === 'contain' ? ' is-contained' : ''}`} style={photo.fit === 'contain' ? { backgroundImage: 'url("' + photo.src + '")' } : undefined} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${photos.length}`} aria-hidden={index !== activeIndex}>
        <img src={photo.src} alt={photo.alt} width={1200} height={628} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" style={{ objectPosition: photo.position || '50% 50%', objectFit: photo.fit || 'cover' }} onError={() => failedPhoto(photo.src)}/>
      </div>)}
      <span className="venue-gallery-badge"><Sparkles size={12} aria-hidden="true"/>A little look around</span>
      <span className="venue-gallery-count" aria-hidden="true">{String(activeIndex + 1).padStart(2, '0')}<i/>{String(photos.length).padStart(2, '0')}</span>
      {photos.length > 1 && <>
        <button type="button" className="venue-gallery-arrow venue-gallery-prev" aria-label="Previous photo" aria-controls={stageId} onClick={() => select(activeIndex - 1)}><ChevronLeft size={19} aria-hidden="true"/></button>
        <button type="button" className="venue-gallery-arrow venue-gallery-next" aria-label="Next photo" aria-controls={stageId} onClick={() => select(activeIndex + 1)}><ChevronRight size={19} aria-hidden="true"/></button>
      </>}
    </div>
    <div className="venue-gallery-meta">
      <div className="venue-gallery-caption">
        <p>{active.caption || 'A glimpse of our dinner setting'}</p>
        {active.sourceUrl && <a href={active.sourceUrl} target="_blank" rel="noopener noreferrer">{active.sourceLabel || 'Photo source'}<ArrowUpRight size={11} aria-hidden="true"/><span className="venue-gallery-visually-hidden"> (opens a new tab)</span></a>}
      </div>
      {photos.length > 1 && <button type="button" className="venue-gallery-playback" aria-label={wantsPlayback ? 'Pause slideshow' : 'Play slideshow'} aria-controls={stageId} onClick={() => setPlayPreference(!wantsPlayback)}>
        {wantsPlayback ? <Pause size={14} aria-hidden="true"/> : <Play size={14} aria-hidden="true"/>}
        <span>{wantsPlayback ? 'Pause' : 'Play'}</span>
      </button>}
    </div>
    {photos.length > 1 && <div className="venue-gallery-thumbnails" style={{ gridTemplateColumns: 'repeat(' + Math.min(photos.length, 4) + ', minmax(0, 1fr))' }} aria-label="Choose a venue photo">
      {photos.map((photo, index) => <button key={photo.src} type="button" className={`venue-gallery-thumbnail${index === activeIndex ? ' is-active' : ''}`} aria-label={`Show venue photo ${index + 1}: ${photo.caption || photo.alt}`} aria-current={index === activeIndex ? 'true' : undefined} aria-controls={stageId} onClick={() => select(index)}>
        <img src={photo.src} alt="" aria-hidden="true" loading="lazy" decoding="async" style={{ objectPosition: photo.position || '50% 50%' }} onError={() => failedPhoto(photo.src)}/>
        <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      </button>)}
    </div>}
    <p className="venue-gallery-visually-hidden" aria-live="polite" aria-atomic="true">{announcement}</p>
  </section>
}
