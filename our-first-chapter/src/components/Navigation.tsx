import { useState } from 'react'
import { Heart, Menu, X } from 'lucide-react'
import { anniversary as data } from '../data/anniversary'

export function Navigation() {
  const [menu, setMenu] = useState(false)
  const [secret, setSecret] = useState(false)
  return <header className="site-header">
    <div className="nav-inner">
      <div className="monogram-wrap"><button className="monogram" aria-label={`${data.names.together} — a little secret`} onClick={() => setSecret(!secret)}>{data.names.sender}<span>&</span>{data.names.recipient}<Heart size={12}/></button>
        {secret && <div role="status" className="secret-note handwritten">{data.footer.easterEgg}<button aria-label="Close secret note" onClick={() => setSecret(false)}><X size={14}/></button></div>}
      </div>
      <button className="mobile-menu" aria-label={menu ? 'Close navigation' : 'Open navigation'} aria-expanded={menu} aria-controls="main-navigation" onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button>
      <nav aria-label="Main navigation" id="main-navigation" className={menu ? 'is-open' : ''}>
        {[[data.navigation.home, '#home'],[data.navigation.story, '#story'],[data.navigation.date, '#invitation'],[data.navigation.letter, '#letter']].map(([label,href]) => <a key={href} href={href} onClick={() => setMenu(false)}>{label}</a>)}
      </nav>
      <span className="nav-edition">{data.hero.occasion}<span>EST. {data.relationshipStart.slice(0,4)}</span></span>
    </div>
  </header>
}
