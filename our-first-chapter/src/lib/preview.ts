const previewResetRevision = '2026-11-11-rsvp-replay-2'

function storageValue(storage: 'localStorage' | 'sessionStorage', key: string) {
  try { return window[storage].getItem(key) } catch { return null }
}

function revisionKey(storageKey: string) {
  return `${storageKey}-preview-reset-revision`
}

export function readInitialInvitationState(storageKey: string) {
  const resetRequested = new URL(window.location.href).searchParams.get('reset') === '1'
  const automaticReplay = import.meta.env.DEV && storageValue('localStorage', revisionKey(storageKey)) !== previewResetRevision
  return {
    opened: !resetRequested && !automaticReplay && storageValue('sessionStorage', `${storageKey}-opened`) === 'true',
    accepted: !resetRequested && !automaticReplay && storageValue('localStorage', storageKey) === 'true',
    resetRequested,
  }
}

/** Clear this invitation's answer and email status, never unrelated browser data. */
export function clearInvitationState(storageKey: string) {
  try { localStorage.removeItem(storageKey) } catch { /* Preview remains usable without storage. */ }
  try { sessionStorage.removeItem(`${storageKey}-opened`) } catch { /* The state also resets in memory. */ }
  for (const storage of ['localStorage', 'sessionStorage'] as const) {
    try { window[storage].removeItem(`${storageKey}-itinerary-email`) } catch { /* Storage can be unavailable. */ }
  }
}

/** One development-only replay for the requested reset; later refreshes preserve Yes. */
export function consumeAutomaticPreviewReset(storageKey: string) {
  if (!import.meta.env.DEV || storageValue('localStorage', revisionKey(storageKey)) === previewResetRevision) return false
  try { localStorage.setItem(revisionKey(storageKey), previewResetRevision) } catch { /* No persisted answer exists when storage is blocked. */ }
  return true
}

export function consumeResetParameter() {
  const url = new URL(window.location.href)
  if (url.searchParams.get('reset') !== '1') return
  url.searchParams.delete('reset')
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
}
