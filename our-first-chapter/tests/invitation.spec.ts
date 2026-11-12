import { expect, test, type Page } from 'playwright/test'

async function openLetter(page: Page) {
  await page.goto('/')
  const opener = page.getByRole('button', { name: 'Open My Letter', exact: true })
  if (await opener.isVisible()) {
    await opener.click()
    await expect(opener).toBeHidden()
  }
  await expect(page.locator('main')).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
}

async function noGeometry(page: Page) {
  return page.evaluate(() => {
    const rectangle = (element: Element) => {
      const { x, y, width, height } = element.getBoundingClientRect()
      return { x, y, width, height }
    }
    return {
      button: rectangle(document.querySelector('[data-testid="no-button"]')!),
      bounds: rectangle(document.querySelector('[data-testid="no-playground"]')!),
      yes: rectangle(document.querySelector('.invitation-yes')!),
      viewportWidth: innerWidth,
    }
  })
}

function expectNoIsSafe({ button, bounds, yes, viewportWidth }: Awaited<ReturnType<typeof noGeometry>>) {
  expect(button.x).toBeGreaterThanOrEqual(bounds.x - 1)
  expect(button.y).toBeGreaterThanOrEqual(bounds.y - 1)
  expect(button.x + button.width).toBeLessThanOrEqual(bounds.x + bounds.width + 1)
  expect(button.y + button.height).toBeLessThanOrEqual(bounds.y + bounds.height + 1)
  expect(button.x).toBeGreaterThanOrEqual(-1)
  expect(button.x + button.width).toBeLessThanOrEqual(viewportWidth + 1)
  const overlaps = button.x < yes.x + yes.width && button.x + button.width > yes.x && button.y < yes.y + yes.height && button.y + button.height > yes.y
  expect(overlaps).toBeFalsy()
}

async function approachNo(page: Page, isMobile: boolean) {
  const no = page.getByTestId('no-button')
  const button = (await noGeometry(page)).button
  const pointer = { pointerType: isMobile ? 'touch' : 'mouse', isPrimary: true, clientX: button.x + button.width / 2, clientY: button.y + button.height / 2 }
  await no.dispatchEvent(isMobile ? 'pointerdown' : 'pointerover', pointer)
}

test('a sealed letter opens into the complete first anniversary experience', async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('response', response => { if (response.status() >= 400 && response.url().startsWith('http://127.0.0.1:5173')) errors.push(`${response.status()} ${response.url()}`) })
  await page.goto('/')
  await expect(page.getByText('To my favorite person, Yen', { exact: true })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('opening.png') })
  await page.getByRole('button', { name: 'Open My Letter', exact: true }).click()
  await expect(page.locator('main')).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: testInfo.outputPath('hero.png') })
  for (const title of [
    '12 Months. Countless Memories.',
    'Our Little Adventure Awaits',
    'A Little Letter for You',
    'This Is Only Our First Chapter.',
  ]) {
    await expect(page.getByRole('heading', { name: title, exact: true })).toHaveCount(1)
  }
  await expect(page.getByText('Sunday, November 22, 2026', { exact: true }).first()).toBeVisible()
  await page.locator('footer').scrollIntoViewIfNeeded()
  expect(errors).toEqual([])
})

test('acceptance is saved only locally and survives a refresh', async ({ page }) => {
  await openLetter(page)
  await page.getByRole('button', { name: /YES, MAKI!/ }).click()
  await expect(page.getByRole('heading', { name: "Yay, Yen! It's a date!" })).toBeVisible()
  await expect(page.getByText('Saved on this browser only. Give Maki a little heads-up, too.')).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('maki-yen-first-anniversary-accepted'))).toBeTruthy()
  await page.reload()
  const opener = page.getByRole('button', { name: 'Open My Letter', exact: true })
  if (await opener.isVisible()) await opener.click()
  await expect(page.getByRole('heading', { name: "Yay, Yen! It's a date!" })).toBeVisible()
  await page.getByRole('link', { name: 'See Our Special Day', exact: true }).click()
  await expect(page).toHaveURL(/#itinerary$/)
})

test('Maybe later offers a calm way to defer and return', async ({ page }) => {
  await openLetter(page)
  await page.getByRole('button', { name: 'Maybe later', exact: true }).click()
  await expect(page.getByText('Of course, my love. Take your time. Your invitation will be right here.')).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('maki-yen-first-anniversary-accepted'))).toBeNull()
  await page.getByRole('button', { name: 'Back to my invitation', exact: true }).click()
  await expect(page.getByRole('button', { name: /YES, MAKI!/ })).toBeVisible()
})

test('acceptance stays usable and honest when browser storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function(key, value) {
      if (this === window.localStorage) throw new DOMException('Storage unavailable', 'SecurityError')
      original.call(this, key, value)
    }
  })
  await openLetter(page)
  await page.getByRole('button', { name: /YES, MAKI!/ }).click()
  await expect(page.getByRole('heading', { name: "Yay, Yen! It's a date!" })).toBeVisible()
  await expect(page.getByText("It's a date! This browser couldn't save your answer for next time. Give Maki a little heads-up, too.")).toBeVisible()
})

test('No stays still for keyboard focus and can defer without chasing', async ({ page }) => {
  await openLetter(page)
  const no = page.getByTestId('no-button')
  await page.getByRole('button', { name: /YES, MAKI!/ }).focus()
  await page.keyboard.press('Tab')
  await expect(no).toBeFocused()
  await expect(no).toBeInViewport()
  const localPosition = () => no.evaluate(element => {
    const button = element.getBoundingClientRect()
    const area = element.parentElement!.getBoundingClientRect()
    return { x: button.x - area.x, y: button.y - area.y }
  })
  const before = await localPosition()
  await page.waitForTimeout(200)
  expect(await localPosition()).toEqual(before)
  await page.keyboard.press('Enter')
  await expect(page.getByText('Of course, my love. Take your time. Your invitation will be right here.')).toBeVisible()
})

test('the playful No button visits many places while staying within its area and away from Yes', async ({ page, isMobile }) => {
  await openLetter(page)
  const region = page.getByTestId('no-playground')
  await region.scrollIntoViewIfNeeded()
  await page.mouse.move(0, 0)
  const positions: Array<{ x: number; y: number }> = []
  for (let attempt = 0; attempt < 12; attempt++) {
    const before = await noGeometry(page)
    await approachNo(page, isMobile)
    await expect.poll(async () => {
      const after = await noGeometry(page)
      return Math.abs((after.button.x - after.bounds.x) - (before.button.x - before.bounds.x)) + Math.abs((after.button.y - after.bounds.y) - (before.button.y - before.bounds.y))
    }).toBeGreaterThan(4)
    const geometry = await noGeometry(page)
    expectNoIsSafe(geometry)
    positions.push({
      x: (geometry.button.x - geometry.bounds.x) / Math.max(1, geometry.bounds.width - geometry.button.width),
      y: (geometry.button.y - geometry.bounds.y) / Math.max(1, geometry.bounds.height - geometry.button.height),
    })
    await page.waitForTimeout(380)
  }
  expect(new Set(positions.map(({ x, y }) => `${Math.round(x * 100)}:${Math.round(y * 100)}`)).size).toBeGreaterThanOrEqual(10)
  const band = (value: number) => Math.min(2, Math.max(0, Math.floor(value * 3)))
  expect(new Set(positions.map(position => band(position.x))).size).toBe(3)
  expect(new Set(positions.map(position => band(position.y))).size).toBe(3)
})

test('No stays bounded after a phone resize and remains steady when keyboard focus follows pointer play', async ({ page, isMobile }) => {
  await openLetter(page)
  const no = page.getByTestId('no-button')
  await page.getByTestId('no-playground').scrollIntoViewIfNeeded()
  await page.mouse.move(0, 0)
  for (let attempt = 0; attempt < 4; attempt++) {
    await approachNo(page, isMobile)
    await page.waitForTimeout(380)
  }
  await page.setViewportSize({ width: 320, height: 900 })
  // Finish the viewport's ResizeObserver/motion layout pass before testing focus.
  await no.scrollIntoViewIfNeeded()
  await expect.poll(async () => {
    const { button, bounds } = await noGeometry(page)
    return button.x >= bounds.x - 1 && button.y >= bounds.y - 1 && button.x + button.width <= bounds.x + bounds.width + 1 && button.y + button.height <= bounds.y + bounds.height + 1
  }).toBeTruthy()
  expectNoIsSafe(await noGeometry(page))
  await page.getByRole('button', { name: /YES, MAKI!/ }).focus()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'No', exact: true })).toBeFocused()
  const position = async () => {
    const { button, bounds } = await noGeometry(page)
    return { x: button.x - bounds.x, y: button.y - bounds.y }
  }
  const before = await position()
  await approachNo(page, false)
  await page.waitForTimeout(380)
  const after = await position()
  // Allow subpixel reflow after a viewport resize, while rejecting an actual escape.
  expect(Math.abs(after.x - before.x)).toBeLessThan(1.5)
  expect(Math.abs(after.y - before.y)).toBeLessThan(1.5)
  await page.keyboard.press('Enter')
  await expect(page.getByText('Of course, my love. Take your time. Your invitation will be right here.')).toBeVisible()
})

test('all twelve memories open in an accessible lightbox with keyboard navigation', async ({ page }) => {
  await openLetter(page)
  const firstFrame = page.getByRole('button', { name: 'View November 2025 memory', exact: true })
  await expect(page.getByRole('button', { name: /^View .+ 20\d\d memory$/ })).toHaveCount(12)
  await firstFrame.click()
  await expect(page.getByRole('dialog', { name: 'November 2025', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Next memory', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'December 2025', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(firstFrame).toBeFocused()
})

test('countdown uses Manila midnight regardless of the device timezone and completes', async ({ page }) => {
  await page.addInitScript(() => {
    Date.now = () => Date.parse('2026-11-21T15:59:58Z')
  })
  await openLetter(page)
  await expect(page.getByTestId('countdown-values')).toContainText('02')
  const values = await page.getByTestId('countdown-values').innerText()
  expect(values.match(/\d+/g)?.map(Number)).toEqual([0, 0, 0, 2])
  await page.evaluate(() => { Date.now = () => Date.parse('2026-11-21T16:00:00Z') })
  await expect(page.getByTestId('countdown-complete')).toHaveText(/Today is our special day!/)
})

test('small phones, tablets, and desktop do not overflow horizontally', async ({ page }) => {
  await openLetter(page)
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.locator('footer').scrollIntoViewIfNeeded()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `overflow at ${width}px`).toBeTruthy()
    await expect(page.getByRole('button', { name: /YES, MAKI!/ })).toHaveCount(1)
  }
})

test.describe('motion enabled', () => {
  test.use({ reducedMotion: 'no-preference' })
  test('No remains inside its playground throughout its animated escape routes', async ({ page, isMobile }) => {
    await openLetter(page)
    await page.getByTestId('no-playground').scrollIntoViewIfNeeded()
    await page.mouse.move(0, 0)
    for (let attempt = 0; attempt < 4; attempt++) {
      await approachNo(page, isMobile)
      for (let frame = 0; frame < 24; frame++) {
        expectNoIsSafe(await noGeometry(page))
        await page.waitForTimeout(20)
      }
    }
  })

  test('the opening transition and acceptance celebration stay usable', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await openLetter(page)
    await page.getByRole('button', { name: /YES, MAKI!/ }).click()
    await expect(page.getByRole('heading', { name: "Yay, Yen! It's a date!" })).toBeVisible()
    await page.waitForTimeout(600)
    expect(errors).toEqual([])
  })
})
