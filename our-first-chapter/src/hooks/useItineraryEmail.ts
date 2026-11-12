import { useEffect, useRef, useState } from 'react'
import { anniversary } from '../data/anniversary'
import { createItineraryEmail } from '../lib/itineraryEmailContent'
import { emailMode, getEmailSettings, submitItineraryEmail } from '../lib/itineraryEmail'
import type { ItineraryEmailStatus } from '../lib/itineraryEmail'

const receiptKey = `${anniversary.storageKey}-itinerary-email`
const receiptVersion = 1

function readReceipt(): ItineraryEmailStatus {
  try {
    const value = JSON.parse(localStorage.getItem(receiptKey) || 'null')
    if (!value || value.version !== receiptVersion) return 'idle'
    if (value.status === 'submitted') return 'submitted'
    // Reloading during a request cannot prove whether the email reached the service.
    if (value.status === 'sending' || value.status === 'unknown') return 'unknown'
  } catch { /* The invitation works without browser storage. */ }
  return 'idle'
}

function saveReceipt(status: ItineraryEmailStatus) {
  try { localStorage.setItem(receiptKey, JSON.stringify({ version: receiptVersion, status, updatedAt: new Date().toISOString() })) } catch { /* Best-effort browser-only duplicate protection. */ }
}

export function useItineraryEmail() {
  const [status, setStatus] = useState<ItineraryEmailStatus>(readReceipt)
  const current = useRef(status)
  const controller = useRef<AbortController | null>(null)
  const generation = useRef(0)

  useEffect(() => () => {
    generation.current += 1
    controller.current?.abort()
  }, [])

  function update(next: ItineraryEmailStatus) {
    current.current = next
    setStatus(next)
  }

  async function send() {
    if (current.current === 'sending' || current.current === 'submitted') return
    const settings = getEmailSettings()
    const mode = emailMode(settings)
    if (mode === 'disabled') return
    if (mode === 'preview' || mode === 'unconfigured') { update(mode); return }
    const attempt = ++generation.current
    const pending = new AbortController()
    controller.current = pending
    update('sending')
    saveReceipt('sending')
    const timer = window.setTimeout(() => pending.abort(), 15000)
    try {
      await submitItineraryEmail(settings, createItineraryEmail().parameters, pending.signal)
      if (attempt !== generation.current) return
      saveReceipt('submitted')
      update('submitted')
    } catch {
      if (attempt !== generation.current) return
      // A timeout or lost response can happen after submission. Never claim delivery.
      saveReceipt('unknown')
      update('unknown')
    } finally {
      window.clearTimeout(timer)
      if (controller.current === pending) controller.current = null
    }
  }

  function reset() {
    generation.current += 1
    controller.current?.abort()
    controller.current = null
    try { localStorage.removeItem(receiptKey) } catch { /* Reset also applies in memory. */ }
    update('idle')
  }

  return { status, send, reset }
}
