import { expect, test, type Page } from 'playwright/test'

async function openLetter(page: Page) {
  await page.goto('/')
  const opener = page.getByRole('button', { name: 'Open My Letter', exact: true })
  if (await opener.isVisible()) await opener.click()
  await expect(page.getByRole('button', { name: 'Play our song', exact: true })).toBeVisible()
}

test('music remains off and does not download before the visitor chooses play', async ({ page }) => {
  const requests: string[] = []
  page.on('request', request => { if (request.url().includes('/audio/our-song.mp3')) requests.push(request.url()) })
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Open My Letter', exact: true })).toBeVisible()
  await expect(page.getByTestId('background-audio')).toHaveCount(0)
  await page.getByRole('button', { name: 'Open My Letter', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Play our song', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await page.waitForTimeout(300)
  expect(requests).toEqual([])
  expect(await page.getByTestId('background-audio').evaluate((audio: HTMLAudioElement) => ({ paused: audio.paused, autoplay: audio.autoplay, time: audio.currentTime }))).toEqual({ paused: true, autoplay: false, time: 0 })
})

test('the supplied song plays, stays available while scrolling, pauses, resumes, and resets on refresh', async ({ page }) => {
  await openLetter(page)
  const audio = page.getByTestId('background-audio')
  await page.getByRole('button', { name: 'Play our song', exact: true }).click()
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(0.15)
  await expect(page.getByRole('button', { name: 'Pause our song', exact: true })).toHaveAttribute('aria-pressed', 'true')
  expect(await audio.evaluate((element: HTMLAudioElement) => ({ loop: element.loop, volume: element.volume }))).toEqual({ loop: true, volume: 0.3 })
  await page.locator('#letter').scrollIntoViewIfNeeded()
  await expect(page.getByRole('button', { name: 'Pause our song', exact: true })).toBeInViewport()
  await page.getByRole('button', { name: 'Pause our song', exact: true }).click()
  const pausedTime = await audio.evaluate((element: HTMLAudioElement) => element.currentTime)
  await expect(page.getByRole('button', { name: 'Play our song', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await page.waitForTimeout(200)
  expect(await audio.evaluate((element: HTMLAudioElement) => element.currentTime)).toBe(pausedTime)
  await page.getByRole('button', { name: 'Play our song', exact: true }).click()
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(pausedTime + 0.1)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Play our song', exact: true })).toHaveAttribute('aria-pressed', 'false')
  expect(await page.getByTestId('background-audio').evaluate((element: HTMLAudioElement) => element.paused && element.currentTime === 0)).toBeTruthy()
})

test('a failed audio load gives honest feedback and keeps the invitation usable', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/audio/our-song.mp3', route => route.fulfill({ status: 200, contentType: 'audio/mpeg', body: 'Invalid audio for the failure scenario.' }))
  await openLetter(page)
  await page.getByRole('button', { name: 'Play our song', exact: true }).click()
  await expect(page.getByText("Our song couldn't play. Please try again.", { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Play our song', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('button', { name: /YES, MAKI!/ })).toBeEnabled()
  expect(errors).toEqual([])
})

test('pausing while the song loads cancels the request to start playback', async ({ page }) => {
  let release!: () => void
  const pending = new Promise<void>(resolve => { release = resolve })
  await page.route('**/audio/our-song.mp3', async route => {
    await pending
    await route.fulfill({ path: 'public/audio/our-song.mp3', contentType: 'audio/mpeg' })
  })
  await openLetter(page)
  await page.getByRole('button', { name: 'Play our song', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Pause our song', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Pause our song', exact: true }).click()
  release()
  await expect(page.getByRole('button', { name: 'Play our song', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await page.waitForTimeout(300)
  expect(await page.getByTestId('background-audio').evaluate((element: HTMLAudioElement) => element.paused)).toBeTruthy()
  await expect(page.locator('.music-feedback')).toHaveText('')
})
