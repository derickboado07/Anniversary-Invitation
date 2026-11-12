import { expect, test, type Page } from 'playwright/test'

test.use({ reducedMotion: 'reduce' })

test.beforeEach(async ({ page }) => {
  await page.route('https://api.emailjs.com/**', route => route.abort())
})

async function showDinner(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open My Letter', exact: true }).click()
  await expect(page.locator('.hero-art')).toBeVisible()
  await page.getByRole('button', { name: /YES, MAKI!/ }).click()
  await page.locator('.venue-gallery-stage').scrollIntoViewIfNeeded()
  await page.mouse.move(0, 0)
  await page.locator('.venue-gallery-slide.is-active img').evaluate(image => (image as HTMLImageElement).decode())
}

test('the day starts with a 4 PM art visit and overlapping photos before the 6 PM dinner', async ({ page }) => {
  await showDinner(page)
  const stops = page.locator('#itinerary > article')
  await expect(stops).toHaveCount(2)
  const art = stops.nth(0)
  await expect(art.getByRole('heading', { name: 'An Afternoon of Art Together' })).toBeVisible()
  await expect(art.locator('.art-lounge-place')).toHaveText('Art Lounge Manila – Molito · Alabang')
  await expect(art.locator('.art-lounge-time strong')).toHaveText('4:00 PM')
  await expect(art.getByRole('link', { name: /Find our way/ })).toHaveAttribute('href', /Art\+Lounge\+Manila\+Molito\+Alabang/)
  await expect(stops.nth(1).getByRole('heading', { name: 'Anniversary Dinner in the Sky' })).toBeVisible()
  await expect(stops.nth(1).locator('.dining-ticket-details')).toContainText('6:00 PM')
  await expect(page.locator('.dining-ticket-status')).toHaveCount(1)

  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    await art.locator('.museum-photo-stack').scrollIntoViewIfNeeded()
    await expect(art.locator('.museum-photo img')).toHaveCount(2)
    const geometry = await art.evaluate(async element => {
      const images = [...element.querySelectorAll<HTMLImageElement>('.museum-photo img')]
      await Promise.all(images.map(image => image.decode()))
      const boxes = [...element.querySelectorAll('.museum-photo')].map(frame => frame.getBoundingClientRect())
      const overlapWidth = Math.max(0, Math.min(boxes[0].right, boxes[1].right) - Math.max(boxes[0].left, boxes[1].left))
      const overlapHeight = Math.max(0, Math.min(boxes[0].bottom, boxes[1].bottom) - Math.max(boxes[0].top, boxes[1].top))
      return {
        loaded: images.every(image => image.naturalWidth > 0),
        overlap: overlapWidth * overlapHeight / Math.min(...boxes.map(box => box.width * box.height)),
        contained: boxes.every(box => box.left >= 0 && box.right <= innerWidth),
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
      }
    })
    expect(geometry.loaded).toBeTruthy()
    expect(geometry.overlap).toBeGreaterThan(.15)
    expect(geometry.contained).toBeTruthy()
    expect(geometry.overflow).toBeFalsy()
  }
})

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
    await page.getByRole('button', { name: /YES, MAKI!/ }).click()
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
