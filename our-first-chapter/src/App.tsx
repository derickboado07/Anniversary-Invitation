import { useEffect, useRef, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { anniversary as data } from './data/anniversary'
import { EnvelopeIntro } from './components/EnvelopeIntro'
import { Navigation } from './components/Navigation'
import { HeroSection } from './components/HeroSection'
import { DateInvitation } from './components/DateInvitation'
import { Countdown } from './components/Countdown'
import { MemoriesGallery } from './components/MemoriesGallery'
import { ItineraryTimeline } from './components/ItineraryTimeline'
import { GiftExchange } from './components/GiftExchange'
import { LoveLetter } from './components/LoveLetter'
import { Footer } from './components/Footer'
import { BackgroundMusic } from './components/BackgroundMusic'
import { PreviewControls } from './components/PreviewControls'
import { clearInvitationState, consumeAutomaticPreviewReset, consumeResetParameter, readInitialInvitationState } from './lib/preview'
import { useItineraryEmail } from './hooks/useItineraryEmail'

export default function App() {
  const [initialState] = useState(() => readInitialInvitationState(data.storageKey))
  const [opened, setOpened] = useState(initialState.opened)
  const [accepted, setAccepted] = useState(initialState.accepted)
  const [acceptanceSaved, setAcceptanceSaved] = useState(true)
  const [previewRun, setPreviewRun] = useState(0)
  const itineraryEmail = useItineraryEmail()
  const acceptedRef = useRef(initialState.accepted)
  const resetHandled = useRef(false)
  const main = useRef<HTMLElement>(null)
  useEffect(() => {
    if (resetHandled.current) return
    resetHandled.current = true
    if (consumeAutomaticPreviewReset(data.storageKey) || initialState.resetRequested) {
      restart()
      consumeResetParameter()
    }
  }, [initialState.resetRequested])
  useEffect(() => {
    document.title = data.title
    if (data.siteUrl) {
      const url = new URL('/social-card.png', data.siteUrl).href
      document.querySelector('meta[property="og:image"]')?.setAttribute('content', url)
      let element = document.querySelector('meta[property="og:url"]')
      if (!element) { element = document.createElement('meta'); element.setAttribute('property', 'og:url'); document.head.appendChild(element) }
      element.setAttribute('content', data.siteUrl)
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === data.storageKey) {
        acceptedRef.current = event.newValue === 'true'
        setAccepted(acceptedRef.current)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
  function open() {
    try { sessionStorage.setItem(`${data.storageKey}-opened`, 'true') } catch { /* The letter works without browser storage. */ }
    setOpened(true)
    requestAnimationFrame(() => { document.getElementById('hero-title')?.setAttribute('tabindex', '-1'); document.getElementById('hero-title')?.focus({ preventScroll: true }) })
  }
  function accept() {
    if (acceptedRef.current) return
    acceptedRef.current = true
    setAccepted(true)
    try { localStorage.setItem(data.storageKey, 'true'); setAcceptanceSaved(true) } catch { setAcceptanceSaved(false) }
    void itineraryEmail.send()
  }
  function restart() {
    itineraryEmail.reset()
    clearInvitationState(data.storageKey)
    acceptedRef.current = false
    setAccepted(false)
    setAcceptanceSaved(true)
    setOpened(false)
    setPreviewRun(previous => previous + 1)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  return <MotionConfig reducedMotion="user">
    <div key={previewRun} inert={!opened} className={opened ? 'invitation-site is-revealed' : 'invitation-site'}>
      <a className="skip-link" href="#main">Skip to the letter</a>
      <Navigation/>
      <main ref={main} id="main">
        {opened && <HeroSection/>}
        <DateInvitation accepted={accepted} onAccept={accept} acceptanceSaved={acceptanceSaved} emailStatus={itineraryEmail.status} onRetryEmail={() => { void itineraryEmail.send() }}/>
        <Countdown/>
        {accepted && <ItineraryTimeline/>}
        <MemoriesGallery/>
        <GiftExchange/>
        <LoveLetter/>
      </main>
      <Footer accepted={accepted}/>
      {opened && data.audio.enabled && <BackgroundMusic/>}
      {import.meta.env.DEV && opened && <PreviewControls onRestart={restart}/>}
    </div>
    {!opened && <EnvelopeIntro onOpen={open}/>}
  </MotionConfig>
}
