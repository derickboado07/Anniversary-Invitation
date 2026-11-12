/** A small, dependency-free burst. It creates no listeners and removes itself. */
export function celebrateHearts(): void {
  if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !Element.prototype.animate) return

  const layer = document.createElement('div')
  layer.setAttribute('aria-hidden', 'true')
  Object.assign(layer.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '1000', overflow: 'hidden' })
  const colors = ['#6B2235', '#D58A9E', '#E7C99A', '#C0637F']
  const animations: Animation[] = []

  for (let index = 0; index < 30; index += 1) {
    const particle = document.createElement('span')
    particle.textContent = index % 5 === 0 ? '✦' : '♥'
    Object.assign(particle.style, {
      position: 'absolute', left: '50%', top: '68%', lineHeight: '1',
      fontSize: `${10 + Math.random() * 13}px`, color: colors[index % colors.length],
    })
    layer.appendChild(particle)
    const distanceX = (Math.random() - 0.5) * Math.min(window.innerWidth * 0.85, 740)
    const distanceY = 100 + Math.random() * 240
    const rotation = (Math.random() - 0.5) * 160
    animations.push(particle.animate([
      { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0, offset: 0 },
      { opacity: 1, offset: 0.1 },
      { transform: `translate(calc(-50% + ${distanceX * 0.8}px), calc(-50% - ${distanceY}px)) rotate(${rotation * 0.8}deg) scale(1)`, opacity: 0.95, offset: 0.65 },
      { transform: `translate(calc(-50% + ${distanceX}px), calc(-50% - ${distanceY * 0.7}px)) rotate(${rotation}deg) scale(0.7)`, opacity: 0, offset: 1 },
    ], { duration: 1100 + Math.random() * 700, delay: Math.random() * 90, easing: 'cubic-bezier(.15,.6,.4,1)', fill: 'forwards' }))
  }

  document.body.appendChild(layer)
  let removed = false
  const cleanup = () => {
    if (removed) return
    removed = true
    animations.forEach((animation) => animation.cancel())
    layer.remove()
  }
  // The timeout also bounds the lifetime if a background tab suspends animations.
  const timeout = window.setTimeout(cleanup, 4000)
  void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
    window.clearTimeout(timeout)
    cleanup()
  })
}
