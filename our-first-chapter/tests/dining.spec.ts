import { expect, test, type Page } from 'playwright/test'

test.use({ reducedMotion: 'reduce' })

async function showDinner(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open My Letter', exact: true }).click()
  await expect(page.locator('.hero-art')).toBeVisible()
  await page.locator('.venue-gallery-stage').scrollIntoViewIfNeeded()
  await page.mouse.move(0, 0)
  await page.locator('.venue-gallery-slide.is-active img').evaluate(image => (image as HTMLImageElement).decode())
}

test('venue photos stay still with reduced motion and all three attire examples are available', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await showDinner(page)
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBeTruthy()
  const gallery = page.getByRole('region', { name: 'The Nest venue photos' })
  await expect(gallery.getByRole('button', { name: 'Play slideshow', exact: true })).toBeVisible()
  await expect(page.locator('.venue-gallery-slide.is-active')).toHaveAttribute('aria-label', '1 of 4')
  await gallery.getByRole('button', { name: 'Next photo', exact: true }).click()
  await expect(page.locator('.venue-gallery-slide.is-active')).toHaveAttribute('aria-label', '2 of 4')
  await gallery.getByRole('button', { name: 'Previous photo', exact: true }).click()
  await expect(page.locator('.venue-gallery-slide.is-active')).toHaveAttribute('aria-label', '1 of 4')
  for (const label of ['Dress', 'Formal', 'Semi-formal']) {
    await expect(page.getByRole('heading', { name: label, exact: true })).toHaveCount(1)
  }
  await expect(page.locator('.attire-card-example')).toHaveText([
    'A midi or maxi dress with heels or dressy flats.',
    'A tailored suit or an elegant evening dress.',
    'A blazer with tailored trousers, or a blouse with a skirt.',
  ])
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy()
  }
})

test('a missing venue photo is skipped and the remaining photos stay usable', async ({ page }) => {
  await page.route('**/the-nest-table.webp', route => route.abort())
  await showDinner(page)
  await expect(page.locator('.venue-gallery-slide')).toHaveCount(3)
  await page.getByRole('button', { name: 'Next photo', exact: true }).click()
  await expect(page.locator('.venue-gallery-slide.is-active')).toHaveAttribute('aria-label', '2 of 3')
  await expect(page.locator('.venue-gallery-slide.is-active img')).toHaveAttribute('src', '/images/venues/the-nest-lobby.webp')
})

test.describe('slideshow playback', () => {
  test.use({ reducedMotion: 'no-preference' })
  test('photos advance every five seconds and pause for interaction or an explicit pause', async ({ page }) => {
    await page.clock.install()
    await page.goto('/')
    await page.getByRole('button', { name: 'Open My Letter', exact: true }).click()
    await page.clock.runFor(3000)
    await page.locator('.venue-gallery-stage').scrollIntoViewIfNeeded()
    await page.clock.runFor(1000)
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000))
    const gallery = page.getByRole('region', { name: 'The Nest venue photos' })
    const active = page.locator('.venue-gallery-slide.is-active')
    // Reset playback at a known first photo, then leave the controls.
    await gallery.getByRole('button', { name: 'Pause slideshow', exact: true }).click()
    await gallery.getByRole('button', { name: /^Show venue photo 1:/ }).click()
    await gallery.getByRole('button', { name: 'Play slideshow', exact: true }).click()
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur())
    await page.mouse.move(0, 0)
    await page.clock.runFor(50)
    await page.clock.runFor(4800)
    await expect(active).toHaveAttribute('aria-label', '1 of 4')
    await page.clock.runFor(300)
    await expect(active).toHaveAttribute('aria-label', '2 of 4')
    await gallery.getByRole('button', { name: 'Pause slideshow', exact: true }).click()
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur())
    await page.mouse.move(0, 0)
    await page.clock.runFor(11000)
    await expect(active).toHaveAttribute('aria-label', '2 of 4')
    await gallery.getByRole('button', { name: 'Next photo', exact: true }).click()
    await expect(active).toHaveAttribute('aria-label', '3 of 4')
    await expect(gallery.getByRole('button', { name: 'Play slideshow', exact: true })).toBeVisible()
  })
})
