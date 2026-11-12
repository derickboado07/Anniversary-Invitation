import { useState } from 'react'
import { ArrowUp, Heart, Share2 } from 'lucide-react'
import { anniversary as data } from '../data/anniversary'

export function Footer({ accepted }: { accepted: boolean }) {
  const [feedback, setFeedback] = useState('')
  async function share() {
    try {
      const url = data.siteUrl || location.href.split('#')[0]
      if (navigator.share) { await navigator.share({ title: data.title, text: data.hero.subtitle, url }); setFeedback(data.footer.shared) }
      else { await navigator.clipboard.writeText(url); setFeedback(data.footer.copied) }
    } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setFeedback(data.footer.shareFailed) }
  }
  return <footer className="site-footer"><div className="footer-inner section-shell"><div className="floating-heart" aria-hidden="true"><Heart size={32} strokeWidth={1}/><span>✧</span></div><p className="eyebrow">{data.footer.eyebrow}</p><h2>{data.footer.title}</h2><p className="footer-subtitle">{data.footer.subtitle}</p><p className="handwritten footer-signature">{data.footer.signature}</p><p className="footer-status">{accepted && <Heart size={12} fill="currentColor"/>}{accepted ? data.footer.accepted : data.footer.invited}</p><div className="footer-actions"><button onClick={share}><Share2 size={14}/>{data.footer.share}</button><a href="#home">{data.footer.backToTop}<ArrowUp size={14}/></a></div><p className="share-feedback" role="status">{feedback}</p><div className="footer-bottom"><span>{data.names.monogram}</span><p>{data.footer.madeWith}</p><Heart size={14}/></div></div></footer>
}
