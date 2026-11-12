import { useState } from 'react'
import { ArrowUpRight, Heart, Palette } from 'lucide-react'
import type { PhotoAsset } from '../data/anniversary'

export function MuseumPhotoStack({ images, label }: { images: PhotoAsset[]; label: string }) {
  const [failed, setFailed] = useState<string[]>([])
  // Try new uploads directly, including ones added after the dev server starts.
  const photos = images.filter((photo, index) =>
    !failed.includes(photo.src) && images.findIndex(candidate => candidate.src === photo.src) === index,
  ).slice(0, 2)
  const sources = photos.filter((photo, index) => photo.sourceUrl
    && photos.findIndex(candidate => candidate.sourceUrl === photo.sourceUrl) === index)

  if (!photos.length) return <div className="museum-photo-empty" role="img" aria-label={label}>
    <Palette size={34} strokeWidth={1}/><p>A little art awaits.</p><span>{label}</span>
  </div>

  return <div className="museum-photo-gallery">
    <div className={`museum-photo-stack${photos.length === 1 ? ' has-one-photo' : ''}`} role="group" aria-label={`${label} venue photos`}>
      <span className="museum-photo-spark" aria-hidden="true">✧</span>
      {photos.map((photo, index) => <figure key={photo.src} className={`museum-photo museum-photo-${index === 0 ? 'back' : 'front'}`}>
        <span className="museum-photo-tape" aria-hidden="true"/>
        <img src={photo.src} alt={photo.alt} width={1200} height={900} loading="lazy" decoding="async"
          style={{ objectPosition: photo.position || '50% 50%', objectFit: photo.fit || 'cover' }}
          onError={() => setFailed(previous => previous.includes(photo.src) ? previous : [...previous, photo.src])}/>
        <figcaption><span>{photo.caption || (index === 0 ? 'A little look around' : 'A new memory with you')}</span><Heart size={13} strokeWidth={1} aria-hidden="true"/></figcaption>
      </figure>)}
    </div>
    {!!sources.length && <div className="museum-photo-sources">{sources.map(photo => <a key={photo.sourceUrl} href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">
      {photo.sourceLabel || 'Photo source'}<ArrowUpRight size={11} aria-hidden="true"/><span className="sr-only"> (opens a new tab)</span>
    </a>)}</div>}
  </div>
}
