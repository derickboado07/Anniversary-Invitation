import { Download, LoaderCircle, Mail, RefreshCw } from 'lucide-react'
import { anniversary } from '../data/anniversary'
import { createItineraryEmail } from '../lib/itineraryEmailContent'
import type { ItineraryEmailStatus } from '../lib/itineraryEmail'

export function InvitationEmail({ status, onRetry }: { status: ItineraryEmailStatus; onRetry: () => void }) {
  const content = anniversary.email
  const message = status === 'sending' ? content.sendingLabel
    : status === 'submitted' ? content.submittedLabel
    : status === 'preview' ? content.previewLabel
    : status === 'unknown' ? content.unknownLabel
    : content.unavailableLabel

  function download() {
    const itinerary = createItineraryEmail()
    const url = URL.createObjectURL(new Blob([itinerary.text], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = itinerary.filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return <div className="invitation-email">
    <p className="invitation-email-message" role="status" aria-live="polite">
      {status === 'sending' ? <LoaderCircle className="email-spinner" size={17} aria-hidden="true"/> : <Mail size={17} aria-hidden="true"/>}
      <span>{message}</span>
    </p>
    <div className="invitation-email-actions">
      <button type="button" onClick={download}><Download size={13} aria-hidden="true"/>{content.saveLabel}</button>
      {status === 'unknown' && <button type="button" onClick={onRetry}><RefreshCw size={13} aria-hidden="true"/>{content.retryLabel}</button>}
    </div>
  </div>
}
