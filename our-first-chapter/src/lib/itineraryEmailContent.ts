import { anniversary } from '../data/anniversary'
import { isValidMapsUrl } from './maps'

export interface ItineraryEmailStop {
  number: string
  period: string
  time: string
  place: string
  title: string
  description: string
  maps_url: string
}

/** No recipient email address or visitor information is sent by the website. */
export interface ItineraryEmailParameters {
  email_subject: string
  email_eyebrow: string
  email_heading: string
  to_name: string
  from_name: string
  greeting: string
  thank_you: string
  intro: string
  date_label: string
  celebration_date: string
  occasion_label: string
  itinerary_heading: string
  itinerary_eyebrow: string
  maps_label: string
  return_label: string
  footer_note: string
  planning_note: string
  itinerary: ItineraryEmailStop[]
  closing: string
  signature: string
  site_url: string
}

function publicInvitationUrl(value: string): string {
  if (!value) return ''
  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase().replace(/\.$/, '')
    const local = host === 'localhost' || !host.includes('.')
      || /\.(localhost|local|internal|test|invalid|example)$/.test(host)
      || /^[\d.]+$/.test(host) || host.includes(':')
    if (url.protocol !== 'https:' || url.username || url.password || local) return ''
    // Keep rehearsal/reset parameters and page fragments out of a shared email.
    url.search = ''
    url.hash = ''
    return url.href
  } catch { return '' }
}

function filenamePart(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/** Both the email and the local download use the exact same central itinerary. */
export function createItineraryEmail(): {
  parameters: ItineraryEmailParameters
  text: string
  filename: string
} {
  const data = anniversary
  const parameters: ItineraryEmailParameters = {
    email_subject: data.email.subject,
    email_eyebrow: data.email.eyebrow,
    email_heading: data.email.heading,
    to_name: data.names.recipient,
    from_name: data.names.sender,
    greeting: data.email.greeting,
    thank_you: data.email.thankYou,
    intro: data.email.intro,
    date_label: data.email.dateLabel,
    celebration_date: data.celebrationLabel,
    occasion_label: data.hero.occasion,
    itinerary_heading: data.itinerary.title,
    itinerary_eyebrow: data.email.itineraryEyebrow,
    maps_label: data.itinerary.mapsLabel,
    return_label: data.email.returnLabel,
    footer_note: data.footer.subtitle,
    planning_note: data.itinerary.note,
    itinerary: data.itinerary.entries.map((entry, index) => ({
      number: String(index + 1).padStart(2, '0'),
      period: entry.period,
      time: entry.time,
      place: entry.place,
      title: entry.title,
      description: entry.description,
      maps_url: isValidMapsUrl(entry.mapsUrl) ? entry.mapsUrl! : '',
    })),
    closing: data.email.closing,
    signature: data.email.signature,
    site_url: publicInvitationUrl(data.siteUrl),
  }

  const stops = parameters.itinerary.flatMap((entry, index) => [
    `${index + 1}. ${entry.title}`,
    `${entry.period} · ${entry.time}`,
    entry.place,
    entry.description,
    ...(entry.maps_url ? [entry.maps_url] : []),
    '',
  ])
  const text = [
    parameters.email_subject,
    '',
    parameters.greeting,
    '',
    parameters.thank_you,
    '',
    parameters.intro,
    '',
    parameters.occasion_label,
    parameters.celebration_date,
    parameters.planning_note,
    '',
    parameters.itinerary_heading,
    '',
    ...stops,
    parameters.closing,
    '',
    parameters.signature,
    ...(parameters.site_url ? ['', `${data.title}: ${parameters.site_url}`] : []),
    '',
  ].join('\n')
  const couple = filenamePart(`${data.names.sender} ${data.names.recipient}`) || 'our-anniversary'
  const date = filenamePart(data.celebrationDate) || 'special-day'
  return { parameters, text, filename: `${couple}-itinerary-${date}.txt` }
}
