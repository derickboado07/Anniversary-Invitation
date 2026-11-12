import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { ArrowLeft, ArrowRight, Heart, Maximize2, X } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { anniversary } from '../data/anniversary'
import type { Memory } from '../data/anniversary'
import { hasImage } from '../lib/images'
import '../styles/memories.css'

const palette = [
  ['#e9d7cf', '#9c6462'], ['#e7d9d2', '#8a5f67'], ['#e8dfd0', '#91836a'],
  ['#efced1', '#a45667'], ['#dce0d2', '#75806b'], ['#e8d2ca', '#a57069'],
]

function MemoryArtwork({ index }: { index: number }) {
  const kind = index % 3
  return (
    <svg className="memory-artwork" viewBox="0 0 280 330" fill="none" aria-hidden="true">
      <path d="M45 250V126a95 95 0 0 1 190 0v124" stroke="currentColor" strokeOpacity=".18" />
      {kind === 0 && <g stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
        <path d="M135 271c9-40 12-84 5-126m3 85c-31 0-48-18-49-38 25 0 44 15 49 38Zm1-29c28-1 43-18 44-39-25 3-40 17-44 39Z" />
        <path d="M140 154c-28-10-44-25-39-43 4-13 15-18 26-12-3-19 10-34 24-28 8 3 12 12 10 22 14-10 30-5 31 9 2 20-28 45-52 52Z" />
        <path d="M140 154c-12-23-20-38-13-55m13 55c21-29 26-47 21-61m-39 39c15 8 30 8 46-1M132 87c11 5 17 18 19 30" />
        <path d="M145 260c-20-11-37-8-47 6 19 11 35 9 47-6Z" />
      </g>}
      {kind === 1 && <g stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
        <path d="M123 254c-10-49-9-79 9-119m24 119c13-36 14-69 0-102M117 221c-24-3-37-18-36-36 24 1 36 16 36 36Zm45-7c24-1 36-12 38-31-24 0-37 14-38 31Z" />
        <path d="M132 141c-33-4-39-30-26-42 5-5 12-5 18-1-1-19 19-25 25-10 16-16 32-1 23 15 24 3 23 26 4 29 0 18-22 27-34 11" />
        <path d="M145 115c-14-17-24 4-9 10 9 6 17-8 9-10Zm12 43c-12-17-5-32 7-32 8 0 11 8 9 13 17-2 20 18 4 24-8 3-13 0-20-5Z" />
        <path d="m123 249 33 1m-31 5 33 1m-32 5 29 0" />
      </g>}
      {kind === 2 && <g stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
        <path d="M139 172s-43-27-43-53c0-21 29-29 43-8 14-21 43-13 43 8 0 26-43 53-43 53Z" />
        <path d="M139 172c-1 28 6 64-7 93m7-34c-24 0-39-12-41-30 22-1 38 12 41 30Zm2-28c22-1 34-14 35-32-22 1-34 15-35 32Z" />
        <path d="M82 249c28 11 88 12 115-1m-87 12c20 5 46 6 64 2M184 80v13m-6-6h12M85 163v9m-4-4h8" />
      </g>}
      <circle cx="65" cy="104" r="2" fill="currentColor" opacity=".35" />
      <circle cx="211" cy="222" r="2" fill="currentColor" opacity=".35" />
      <path d="m203 125 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill="currentColor" opacity=".4" />
    </svg>
  )
}

function MemoryPhoto({ memory, index, large = false }: { memory: Memory; index: number; large?: boolean }) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const colors = palette[index % palette.length]
  return (
    <div className={`memory-photo ${loaded && !failed ? 'has-photo' : ''}`} style={{ '--memory-bg': colors[0], '--memory-ink': colors[1] } as CSSProperties}>
      <div className="memory-placeholder" role="img" aria-label={`${memory.month} ${memory.year}: ${anniversary.memories.placeholder}`} aria-hidden={loaded && !failed}>
        <span className="memory-placeholder-month">{memory.shortMonth} <span>{memory.year}</span></span>
        <MemoryArtwork index={index} />
        <span className="memory-placeholder-note">{anniversary.memories.placeholder}</span>
      </div>
      {!failed && hasImage(memory.src) && <img
        src={memory.src}
        alt={memory.alt}
        aria-hidden={!loaded}
        loading={large ? 'eager' : 'lazy'}
        decoding="async"
        sizes={large ? '(max-width: 600px) 90vw, 480px' : '(max-width: 600px) 85vw, (max-width: 900px) 42vw, 28vw'}
        style={{ objectPosition: memory.position || '50% 50%', objectFit: large ? 'contain' : 'cover' }}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />}
    </div>
  )
}

export function MemoriesGallery() {
  const { memories } = anniversary
  const reducedMotion = useReducedMotion()
  const [selected, setSelected] = useState<number | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const opened = selected !== null
  const activeMemory = selected !== null ? memories.items[selected] : null

  useEffect(() => {
    const dialog = dialogRef.current
    if (!opened || !dialog) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      triggerRef.current?.focus({ preventScroll: true })
    }
  }, [opened])

  const changeMemory = (direction: number) => {
    setSelected((current) => current === null ? null : (current + direction + memories.items.length) % memories.items.length)
  }

  const handleKey = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); changeMemory(1) }
    if (event.key === 'ArrowLeft') { event.preventDefault(); changeMemory(-1) }
  }

  return (
    <section id="story" className="memories-section section-shell" aria-labelledby="memories-heading">
      <motion.div className="memories-intro" initial={reducedMotion ? false : { opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .4 }} transition={{ duration: .6 }}>
        <span className="eyebrow">{memories.eyebrow}</span>
        <h2 id="memories-heading" className="section-heading">{memories.title}</h2>
        <p>{memories.description}</p>
        <span className="memories-flourish" aria-hidden="true"><i /><Heart size={16} strokeWidth={1.4} /><i /></span>
      </motion.div>
      <div className="memories-grid">
        {memories.items.map((memory, index) => (
          <motion.article key={memory.id} className="memory-leaf" initial={reducedMotion ? false : { opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .55, delay: reducedMotion ? 0 : index % 3 * .08 }}>
            <button className="memory-frame" style={{ '--frame-angle': `${[-2.5, 1.7, -1, 2, -1.8, 2.7][index % 6]}deg` } as CSSProperties} aria-label={`View ${memory.month} ${memory.year} memory`} onClick={(event) => { triggerRef.current = event.currentTarget; setSelected(index) }}>
              <span className="memory-tape" aria-hidden="true" />
              <MemoryPhoto memory={memory} index={index} />
              <span className="memory-frame-bottom">
                <span className="memory-month handwritten">{memory.month} <span>{memory.year}</span></span>
                <span className="memory-page">{String(index + 1).padStart(2, '0')}</span>
              </span>
              <span className="memory-expand" aria-hidden="true"><Maximize2 size={16} /></span>
            </button>
            <p className="memory-caption">{memory.caption}</p>
          </motion.article>
        ))}
      </div>
      <p className="memories-hint handwritten">{memories.hint}</p>
      <dialog ref={dialogRef} className="memory-dialog" aria-label={activeMemory ? `${activeMemory.month} ${activeMemory.year}` : 'Our memories'} onCancel={(event) => { event.preventDefault(); setSelected(null) }} onClick={(event) => { if (event.target === event.currentTarget) setSelected(null) }} onKeyDown={handleKey}>
        {activeMemory && selected !== null && <div className="memory-dialog-paper">
          <div className="memory-dialog-top">
            <span className="eyebrow">{String(selected + 1).padStart(2, '0')} / {String(memories.items.length).padStart(2, '0')}</span>
            <button type="button" className="memory-icon-button" aria-label="Close photo" onClick={() => setSelected(null)} autoFocus><X size={22} /></button>
          </div>
          <MemoryPhoto key={activeMemory.id} memory={activeMemory} index={selected} large />
          <div className="memory-dialog-caption">
            <h3 className="handwritten">{activeMemory.month} {activeMemory.year}</h3>
            <p>{activeMemory.caption}</p>
          </div>
          <div className="memory-dialog-controls">
            <button className="memory-icon-button" aria-label="Previous memory" onClick={() => changeMemory(-1)}><ArrowLeft size={21} /></button>
            <Heart size={16} strokeWidth={1.2} aria-hidden="true" />
            <button className="memory-icon-button" aria-label="Next memory" onClick={() => changeMemory(1)}><ArrowRight size={21} /></button>
          </div>
        </div>}
      </dialog>
    </section>
  )
}
