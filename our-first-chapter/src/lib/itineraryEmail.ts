import { anniversary } from '../data/anniversary'
import type { ItineraryEmailParameters } from './itineraryEmailContent'

export type ItineraryEmailStatus = 'idle' | 'preview' | 'unconfigured' | 'sending' | 'submitted' | 'unknown'
export interface EmailSettings { serviceId: string; templateId: string; publicKey: string; sendInPreview: boolean }

export function getEmailSettings(): EmailSettings {
  return {
    serviceId: String(import.meta.env.VITE_EMAILJS_SERVICE_ID || '').trim(),
    templateId: String(import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '').trim(),
    publicKey: String(import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '').trim(),
    sendInPreview: import.meta.env.VITE_EMAIL_SEND_IN_PREVIEW === 'true',
  }
}

export function emailMode(settings = getEmailSettings()): 'disabled' | 'preview' | 'unconfigured' | 'ready' {
  if (!anniversary.email.enabled) return 'disabled'
  if (import.meta.env.DEV && !settings.sendInPreview) return 'preview'
  if (!settings.serviceId || !settings.templateId || !settings.publicKey) return 'unconfigured'
  return 'ready'
}

/** EmailJS's public browser API triggers a template with a fixed private recipient. */
export async function submitItineraryEmail(settings: EmailSettings, parameters: ItineraryEmailParameters, signal: AbortSignal): Promise<void> {
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ service_id: settings.serviceId, template_id: settings.templateId, user_id: settings.publicKey, template_params: parameters }),
    signal,
    credentials: 'omit',
  })
  const acknowledgement = (await response.text()).trim()
  if (response.status !== 200 || !['OK', '"OK"'].includes(acknowledgement)) {
    throw new Error('Email submission was not confirmed.')
  }
}
