import { expect, test, type Page } from 'playwright/test'

const answerKey = 'maki-yen-first-anniversary-accepted'

async function openLetter(page: Page) {
  await page.getByRole('button', { name: 'Open My Letter', exact: true }).click()
  await expect(page.getByRole('button', { name: /YES, MAKI!/ })).toBeVisible()
}

test('the requested development replay clears an older Yes once and preserves later acceptance', async ({ page }) => {
  await page.addInitScript(key => {
    localStorage.setItem(key, 'true')
    sessionStorage.setItem(`${key}-opened`, 'true')
    localStorage.setItem('unrelated-preview-value', 'keep this')
  }, answerKey)
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Open My Letter', exact: true })).toBeVisible()
  await expect(page.locator('#itinerary')).toHaveCount(0)
  await expect.poll(() => page.evaluate(key => localStorage.getItem(key), answerKey)).toBeNull()
  expect(await page.evaluate(() => localStorage.getItem('unrelated-preview-value'))).toBe('keep this')
  await openLetter(page)
  await page.getByRole('button', { name: /YES, MAKI!/ }).click()
  await expect(page.getByRole('heading', { name: "Yay, Yen! It's a date!" })).toBeVisible()
  await expect(page.locator('#itinerary')).toHaveCount(1)
  await page.reload()
  await expect(page.getByRole('heading', { name: "Yay, Yen! It's a date!" })).toBeVisible()
  await expect(page.locator('#itinerary')).toHaveCount(1)
})

test('ordinary local rehearsals never request an email', async ({ page }) => {
  const emailRequests: string[] = []
  await page.route('https://api.emailjs.com/**', route => {
    emailRequests.push(route.request().url())
    return route.abort()
  })
  await page.goto('/')
  await openLetter(page)
  await page.getByRole('button', { name: /YES, MAKI!/ }).click()
  await expect(page.getByText('Preview only — no email was sent.', { exact: true })).toBeVisible()
  expect(emailRequests).toEqual([])
  await page.getByRole('button', { name: 'Restart invitation', exact: true }).click()
  await openLetter(page)
  await page.getByRole('button', { name: /YES, MAKI!/ }).click()
  await expect(page.getByText('Preview only — no email was sent.', { exact: true })).toBeVisible()
  expect(emailRequests).toEqual([])
})

test('the local restart control replays the envelope and clears only this invitation', async ({ page }) => {
  await page.goto('/')
  await openLetter(page)
  await page.evaluate(key => {
    localStorage.setItem('unrelated-preview-value', 'keep this')
    localStorage.setItem(`${key}-itinerary-email`, 'test email status')
  }, answerKey)
  await page.getByRole('button', { name: /YES, MAKI!/ }).click()
  await expect(page.getByRole('heading', { name: "Yay, Yen! It's a date!" })).toBeVisible()
  await expect(page.locator('#itinerary')).toHaveCount(1)
  await page.getByRole('button', { name: 'Restart invitation', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Open My Letter', exact: true })).toBeVisible()
  await expect(page.locator('#itinerary')).toHaveCount(0)
  expect(await page.evaluate(key => ({ answer: localStorage.getItem(key), opened: sessionStorage.getItem(`${key}-opened`), email: localStorage.getItem(`${key}-itinerary-email`), other: localStorage.getItem('unrelated-preview-value') }), answerKey)).toEqual({ answer: null, opened: null, email: null, other: 'keep this' })
  await openLetter(page)
  await expect(page.getByRole('button', { name: 'No', exact: true })).toBeVisible()
  await page.getByRole('button', { name: /YES, MAKI!/ }).click()
  await page.reload()
  await expect(page.getByRole('heading', { name: "Yay, Yen! It's a date!" })).toBeVisible()
})

test('an explicit reset URL is consumed once without removing other URL or browser state', async ({ page }) => {
  await page.goto('/') // Consume the one-time development replay first.
  await page.evaluate(key => {
    localStorage.setItem(key, 'true')
    sessionStorage.setItem(`${key}-opened`, 'true')
    localStorage.setItem('unrelated-preview-value', 'keep this')
  }, answerKey)
  await page.goto('/?reset=1&chapter=one#invitation')
  await expect(page.getByRole('button', { name: 'Open My Letter', exact: true })).toBeVisible()
  await expect(page).toHaveURL(/\?chapter=one#invitation$/)
  expect(await page.evaluate(key => localStorage.getItem(key), answerKey)).toBeNull()
  expect(await page.evaluate(() => localStorage.getItem('unrelated-preview-value'))).toBe('keep this')
  await openLetter(page)
  await page.getByRole('button', { name: /YES, MAKI!/ }).click()
  await page.reload()
  await expect(page.getByRole('heading', { name: "Yay, Yen! It's a date!" })).toBeVisible()
})
