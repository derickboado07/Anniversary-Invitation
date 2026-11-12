import { expect, test, type Page } from 'playwright/test'

const letterText = [
  'A year ago, we began a beautiful chapter together. Since then, the simplest moments have become special because I get to share them with you.',
  "Thank you for the love, the laughter, and all the little memories we've made along the way. I know our story is still being written, and that's what makes it even more exciting.",
  "I can't wait to celebrate this milestone with you and create even more memories together.",
  'Happy first anniversary, my love.',
]

async function showPersonalLetter(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route('https://api.emailjs.com/**', route => route.abort())
  await page.goto('/')
  await page.getByRole('button', { name: 'Open My Letter', exact: true }).click()
  const section = page.locator('#letter')
  await section.scrollIntoViewIfNeeded()
  await page.evaluate(() => document.fonts.ready)
  await expect(section.getByRole('button', { name: 'Open your love letter', exact: true })).toBeVisible()
  return section
}

test('My Letter stays sealed until its own wax seal reveals the complete letter', async ({ page }) => {
  const section = await showPersonalLetter(page)
  const content = section.locator('#personal-letter-content')
  const seal = section.getByRole('button', { name: 'Open your love letter', exact: true })
  await expect(section.getByRole('heading', { name: 'A Little Letter for You', exact: true })).toBeVisible()
  await expect(content).toBeHidden()
  await expect(page.locator('#itinerary')).toHaveCount(0)
  await expect(seal).toHaveAttribute('aria-controls', 'personal-letter-content')

  // Reading the section heading does not accidentally open the sealed letter.
  await section.getByRole('heading', { name: 'A Little Letter for You', exact: true }).click()
  await expect(content).toBeHidden()
  await seal.click()
  await expect(content).toBeVisible({ timeout: 1000 })
  await expect(content.locator('.letter-paragraphs > p')).toHaveText(letterText)
  await expect(content.locator('.letter-greeting')).toHaveText('To my Yen,')
  await expect(content.locator('.letter-signature')).toContainText('Maki')
  await expect(page.locator('#itinerary')).toHaveCount(0)

  await section.getByRole('button', { name: 'Close the letter', exact: true }).click()
  await expect(content).toBeHidden()
  await expect(seal).toBeVisible()
  await seal.click()
  await expect(content.locator('.letter-paragraphs > p')).toHaveText(letterText)
})

test('the personal wax seal works with the keyboard and restart seals the letter again', async ({ page }) => {
  const section = await showPersonalLetter(page)
  const seal = section.getByRole('button', { name: 'Open your love letter', exact: true })
  await seal.focus()
  await page.keyboard.press('Enter')
  await expect(section.locator('#personal-letter-content .letter-greeting')).toBeFocused()
  await page.getByRole('button', { name: 'Restart invitation', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Open My Letter', exact: true })).toBeVisible()
  await expect(section.locator('#personal-letter-content')).toBeHidden()
  await page.getByRole('button', { name: 'Open My Letter', exact: true }).click()
  await section.scrollIntoViewIfNeeded()
  await expect(seal).toBeVisible()
  await expect(section.locator('#personal-letter-content')).toBeHidden()
})

test('the sealed envelope and readable letter fit small phones and desktop screens', async ({ page }) => {
  const section = await showPersonalLetter(page)
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    const seal = section.getByRole('button', { name: 'Open your love letter', exact: true })
    await seal.scrollIntoViewIfNeeded()
    const closed = await seal.evaluate(button => {
      const box = button.getBoundingClientRect()
      return { width: box.width, height: box.height, left: box.left, right: box.right, viewport: innerWidth }
    })
    expect(closed.width).toBeGreaterThanOrEqual(44)
    expect(closed.height).toBeGreaterThanOrEqual(44)
    expect(closed.left).toBeGreaterThanOrEqual(0)
    expect(closed.right).toBeLessThanOrEqual(closed.viewport + 1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy()
    await seal.click()
    const content = section.locator('#personal-letter-content')
    await expect(content).toBeVisible()
    await expect(content.locator('.letter-paragraphs > p')).toHaveText(letterText)
    const open = await content.evaluate(paper => {
      const box = paper.getBoundingClientRect()
      return { left: box.left, right: box.right, viewport: innerWidth, overflow: document.documentElement.scrollWidth > innerWidth + 1 }
    })
    expect(open.left).toBeGreaterThanOrEqual(0)
    expect(open.right).toBeLessThanOrEqual(open.viewport + 1)
    expect(open.overflow).toBeFalsy()
    await section.getByRole('button', { name: 'Close the letter', exact: true }).click()
    await expect(content).toBeHidden()
  }
})

test('the personal envelope finishes its physical opening before revealing the full letter', async ({ page }) => {
  await showPersonalLetter(page)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  // Reload with the invitation already opened so the personal envelope mounts in
  // normal-motion mode without replaying the separate full-screen introduction.
  await page.reload()
  const section = page.locator('#letter')
  const content = section.locator('#personal-letter-content')
  const seal = section.getByRole('button', { name: 'Open your love letter', exact: true })
  await seal.click()
  await expect(seal).toBeDisabled()
  await expect(content).toBeHidden()
  await expect(content).toBeVisible({ timeout: 5000 })
  await expect(content.locator('.letter-paragraphs > p')).toHaveText(letterText)
  await expect(content.locator('.letter-greeting')).toBeFocused()
})
