import { useState } from 'react'
import { ArrowUp, Heart, Share2 } from 'lucide-react'
import { anniversary as data } from '../data/anniversary'
import { DuduBubu } from './DuduBubu'
import { RevealText } from './RevealText'

export function Footer({ accepted }: { accepted: boolean }) {
  const [feedback, setFeedback] = useState('')
  async function share() {
    try {
      const url = data.siteUrl || location.href.split('#')[0]
      if (navigator.share) { await navigator.share({ title: data.title, text: data.hero.subtitle, url }); setFeedback(data.footer.shared) }
      else { await navigator.clipboard.writeText(url); setFeedback(data.footer.copied) }
    } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setFeedback(data.footer.shareFailed) }
  }
  return <footer className="site-footer"><div className="footer-inner section-shell"><div className="footer-bears"><DuduBubu pose="dance"/></div><p className="eyebrow">{data.footer.eyebrow}</p><RevealText>{data.footer.title}</RevealText><p className="footer-subtitle">{data.footer.subtitle}</p><p className="handwritten footer-signature">{data.footer.signature}</p><p className="footer-status">{accepted && <Heart size={12} fill="currentColor"/>}{accepted ? data.footer.accepted : data.footer.invited}</p><div className="footer-actions"><button onClick={share}><Share2 size={14}/>{data.footer.share}</button><a href="#home">{data.footer.backToTop}<ArrowUp size={14}/></a></div><p className="share-feedback" role="status">{feedback}</p><div className="footer-bottom"><span>{data.names.monogram}</span><p>{data.footer.madeWith}</p><Heart size={14}/></div></div></footer>
}
