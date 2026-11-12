import { Heart } from 'lucide-react'
import { anniversary as data } from '../data/anniversary'
import '../styles/letter-envelope.css'

export function LetterEnvelope({ opening, onOpen }: { opening: boolean; onOpen: () => void }) {
  return <div className={`letter-envelope${opening ? ' is-opening' : ''}`} aria-busy={opening}>
    <div className="letter-envelope-scene">
      <div className="letter-envelope-stage">
        <div className="letter-envelope-body" aria-hidden="true">
          <div className="letter-envelope-lining"/>
          <div className="letter-envelope-peek">
            <Heart size={19} strokeWidth={1}/>
            <span>{data.letter.greeting}</span>
            <small>With all my love,</small>
            <strong className="handwritten">{data.names.sender}</strong>
          </div>
          <div className="letter-envelope-pocket"/>
          <div className="letter-envelope-fold-left"/>
          <div className="letter-envelope-fold-right"/>
          <div className="letter-envelope-flap">
            <div className="letter-envelope-flap-front">
              <span className="letter-envelope-eyebrow">A LITTLE MORE OF MY HEART</span>
              <p className="letter-envelope-greeting">{data.letter.greeting}</p>
              <span className="letter-envelope-note">Some things are better written.</span>
            </div>
            <div className="letter-envelope-flap-back"/>
          </div>
          <div className="letter-envelope-rim"/>
        </div>
        <span className="letter-envelope-sender" aria-hidden="true"><small>FROM</small><strong className="handwritten">{data.names.sender}</strong></span>
        <span className="letter-envelope-dedication" aria-hidden="true">with all my love.<Heart size={12} strokeWidth={1}/></span>
        <button type="button" className="letter-envelope-seal" onClick={onOpen} disabled={opening}
          aria-label="Open your love letter" aria-controls="personal-letter-content" aria-describedby="personal-letter-instruction">
          <span className="letter-envelope-monogram" aria-hidden="true">{data.names.monogram}</span>
        </button>
      </div>
    </div>
    <p id="personal-letter-instruction" className="letter-envelope-instruction">
      <span className="letter-envelope-instruction-click">Click the wax seal to read my letter.</span>
      <span className="letter-envelope-instruction-tap">Tap the wax seal to read my letter.</span>
    </p>
  </div>
}
