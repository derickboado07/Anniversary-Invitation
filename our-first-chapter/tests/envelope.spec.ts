import { expect, test, type Page } from 'playwright/test'

async function showEnvelope(page: Page, reducedMotion: 'reduce' | 'no-preference' = 'reduce') {
  await page.emulateMedia({ reducedMotion })
  await page.route('https://api.emailjs.com/**', route => route.abort())
  await page.goto('/')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
}

test('the paper envelope fills phones, laptops, desktops, and landscape screens', async ({ page }) => {
  await showEnvelope(page)
  for (const [width, height] of [[320, 568], [390, 844], [1366, 768], [1920, 1080], [844, 390]]) {
    await page.setViewportSize({ width, height })
    const geometry = await page.evaluate(() => {
      const rect = (selector: string) => {
        const { x, y, width, height } = document.querySelector(selector)!.getBoundingClientRect()
        return { x, y, width, height }
      }
      return {
        dialog: rect('.envelope-dialog'),
        envelope: rect('.envelope'),
        seal: rect('.wax-seal'),
        instruction: rect('#opening-instruction'),
        scrollWidth: document.querySelector('.envelope-dialog')!.scrollWidth,
        scrollHeight: document.querySelector('.envelope-dialog')!.scrollHeight,
      }
    })
    for (const box of [geometry.dialog, geometry.envelope]) {
      expect(Math.abs(box.x), `left edge at ${width}×${height}`).toBeLessThanOrEqual(1)
      expect(Math.abs(box.y), `top edge at ${width}×${height}`).toBeLessThanOrEqual(1)
      expect(Math.abs(box.width - width), `full width at ${width}×${height}`).toBeLessThanOrEqual(1)
      expect(Math.abs(box.height - height), `full height at ${width}×${height}`).toBeLessThanOrEqual(1)
    }
    for (const box of [geometry.seal, geometry.instruction]) {
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.y).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(width + 1)
      expect(box.y + box.height).toBeLessThanOrEqual(height + 1)
    }
    expect(geometry.seal.width).toBeGreaterThanOrEqual(44)
    expect(geometry.seal.height).toBeGreaterThanOrEqual(44)
    expect(geometry.scrollWidth).toBeLessThanOrEqual(width + 1)
    expect(geometry.scrollHeight).toBeLessThanOrEqual(height + 1)
    await expect(page.locator('.opening-instruction > span:visible')).toHaveCount(1)
    await expect(page.locator('.opening-instruction > span:visible')).toHaveText(/^(Click|Tap) the wax seal to open your letter\.$/)
  }
})

test('only the monogrammed wax seal opens the letter when clicked or tapped', async ({ page, isMobile }) => {
  await showEnvelope(page)
  const dialog = page.getByRole('dialog')
  const seal = dialog.getByRole('button', { name: 'Open My Letter', exact: true })
  await expect(dialog.getByRole('button')).toHaveCount(1)
  await expect(seal.locator('.wax-seal-monogram')).toHaveText('M & Y')
  await expect(seal).toHaveAttribute('aria-describedby', 'opening-instruction')
  // The surrounding paper is decorative; an accidental background tap stays sealed.
  await page.mouse.click(8, 8)
  await expect(dialog).toBeVisible()
  await expect(seal).toBeEnabled()
  if (isMobile) await seal.tap()
  else await seal.click()
  await expect(dialog).toBeHidden()
  await expect(page.locator('#hero-title')).toBeVisible()
})

test('the wax seal opens with the keyboard and sends focus into the letter', async ({ page }) => {
  await showEnvelope(page)
  const seal = page.getByRole('button', { name: 'Open My Letter', exact: true })
  await seal.focus()
  await expect(seal).toBeFocused()
  await page.keyboard.press('Space')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.locator('#hero-title')).toBeFocused()
})

test('the animated seal and flap transition still opens the invitation', async ({ page }) => {
  await showEnvelope(page, 'no-preference')
  const seal = page.getByRole('button', { name: 'Open My Letter', exact: true })
  await seal.click()
  await expect(page.locator('.opening-inner')).toHaveClass(/is-opening/)
  await expect(seal).toBeDisabled()
  await expect(page.getByRole('dialog')).toBeHidden({ timeout: 5000 })
  await expect(page.locator('#hero-title')).toBeVisible()
})

test('the opening lifts a double-sided flap in depth before extracting the letter', async ({ page }) => {
  await page.clock.install()
  await showEnvelope(page, 'no-preference')
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000))
  await page.getByRole('button', { name: 'Open My Letter', exact: true }).click()
  await expect(page.locator('.opening-inner')).toHaveClass(/is-opening/)

  // Seek the physical sequence while the application clock holds the dialog open.
  // This checks the moving paper geometry without depending on machine frame rate.
  const sampleAt = async (elapsed: number) => page.evaluate(elapsed => {
    const dialog = document.querySelector('.envelope-dialog')!
    dialog.getAnimations({ subtree: true }).forEach(animation => {
      animation.pause()
      animation.currentTime = elapsed
    })
    const flap = document.querySelector<HTMLElement>('.envelope-flap')!
    const letter = document.querySelector<HTMLElement>('.envelope-letter')!
    const flapMatrix = new DOMMatrixReadOnly(getComputedStyle(flap).transform)
    const letterStyle = getComputedStyle(letter)
    const letterMatrix = new DOMMatrixReadOnly(letterStyle.transform)
    return {
      flapDepth: Math.abs(flapMatrix.m23),
      frontBackface: getComputedStyle(document.querySelector('.envelope-flap-front')!).backfaceVisibility,
      backBackface: getComputedStyle(document.querySelector('.envelope-flap-back')!).backfaceVisibility,
      backFacesOutward: new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.envelope-flap-back')!).transform).m33 < 0,
      stageWidth: document.querySelector('.envelope-stage')!.getBoundingClientRect().width,
      viewportWidth: innerWidth,
      letterY: letterMatrix.m42,
      letterHeight: letter.offsetHeight,
      letterOpacity: Number(letterStyle.opacity),
    }
  }, elapsed)

  const lifting = await sampleAt(800)
  expect(lifting.flapDepth).toBeGreaterThan(.05)
  expect(lifting.frontBackface).toBe('hidden')
  expect(lifting.backBackface).toBe('hidden')
  expect(lifting.backFacesOutward).toBeTruthy()
  expect(lifting.stageWidth).toBeLessThan(lifting.viewportWidth * .95)

  const extracted = await sampleAt(2200)
  expect(extracted.letterY).toBeLessThan(lifting.letterY - extracted.letterHeight * .1)
  expect(extracted.letterOpacity).toBeGreaterThan(.8)
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.clock.runFor(3000)
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.locator('#hero-title')).toBeVisible()
})

test('reduced motion reveals the invitation without waiting for the physical opening', async ({ page }) => {
  await page.clock.install()
  await showEnvelope(page, 'reduce')
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000))
  await page.getByRole('button', { name: 'Open My Letter', exact: true }).click()
  await page.clock.runFor(1)
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.locator('#hero-title')).toBeVisible()
  // Focus follows the mounted invitation on the next animation frame.
  await page.clock.runFor(20)
  await expect(page.locator('#hero-title')).toBeFocused()
})
