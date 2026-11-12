import { expect, test, type Page } from 'playwright/test'
import { readFile } from 'node:fs/promises'
import type { ItineraryEmailStop } from '../src/lib/itineraryEmailContent'

const endpoint = 'https://api.emailjs.com/api/v1.0/email/send'
const success = 'Your itinerary is on its way. Please check your inbox and spam folder.'
const uncertain = "I couldn't confirm the email copy. Please check your inbox before trying again."
const storageKey = 'maki-yen-first-anniversary-accepted'
const dinnerVenue = 'The Nest Dining in the Sky · Vivere Hotel, Alabang'
const dinnerMapsUrl = 'https://www.google.com/maps/search/?api=1&query=The+Nest+Dining+in+the+Sky+Vivere+Hotel+Alabang'
const planningNote = 'Our anniversary dinner is booked for 6:00 PM. Just you, me, and a beautiful evening together.'
const dressCode = 'A dress, formal attire, or smart semi-formal attire.'
const attireExamples = [
  { label: 'Dress', example: 'A midi or maxi dress with heels or dressy flats.' },
  { label: 'Formal', example: 'A tailored suit or an elegant evening dress.' },
  { label: 'Semi-formal', example: 'A blazer with tailored trousers, or a blouse with a skirt.' },
]

// Every external email call is intercepted. These tests never deliver email.
test.beforeEach(async ({ page }) => {
  await page.route('https://api.emailjs.com/**', route => route.abort())
})

async function openLetter(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open My Letter', exact: true }).click()
  await expect(page.getByRole('button', { name: /YES, MAKI!/ })).toBeVisible()
}

test('Yes requests the full itinerary once while acceptance is immediate', async ({ page }) => {
  const payloads: Record<string, unknown>[] = []
  let release!: () => void
  const waiting = new Promise<void>(resolve => { release = resolve })
  await page.route(endpoint, async route => {
    payloads.push(route.request().postDataJSON())
    await waiting
    await route.fulfill({ status: 200, body: 'OK' })
  })
  await openLetter(page)
  await page.getByRole('button', { name: /YES, MAKI!/ }).dblclick()
  await expect(page.getByRole('heading', { name: "Yay, Yen! It's a date!" })).toBeVisible()
  await expect(page.getByText('Sending a little copy of our day…', { exact: true })).toBeVisible()
  await expect.poll(() => payloads.length).toBe(1)
  const payload = payloads[0]
  expect(payload.service_id).toBe('service_test_only')
  expect(payload.template_id).toBe('template_test_only')
  const parameters = payload.template_params as Record<string, unknown>
  expect(parameters.to_name).toBe('Yen')
  expect(parameters.from_name).toBe('Maki')
  expect(parameters.greeting).toBe('My dearest Yen,')
  expect(parameters.thank_you).toBe('Thank you for saying yes to our special anniversary date. Sharing this first chapter with you means so much to me.')
  expect(parameters.email_heading).toBe("It's a date, my love.")
  expect(parameters.itinerary_heading).toBe('Our Little Adventure Awaits')
  expect(parameters.celebration_date).toBe('Sunday, November 22, 2026')
  expect(parameters.site_url).toBe('')
  expect(parameters).not.toHaveProperty('to_email')
  expect(parameters).not.toHaveProperty('user_email')
  const stops = parameters.itinerary as ItineraryEmailStop[]
  expect(stops.map(stop => stop.title)).toEqual(['Anniversary Dinner in the Sky'])
  expect(stops.map(stop => stop.number)).toEqual(['01'])
  expect(stops[0]).toMatchObject({ period: 'Evening', time: '6:00 PM', place: dinnerVenue, maps_url: dinnerMapsUrl, dress_code: dressCode, image_source_label: 'Photo: Vivere Hotel' })
  expect(stops[0].image_url).toMatch(/^https:\/\//)
  expect(stops[0].image_source_url).toMatch(/^https:\/\//)
  expect(stops[0].image_alt).toBeTruthy()
  expect(stops[0].attire_examples).toMatchObject(attireExamples)
  expect(stops[0].attire_examples?.every(option => option.detail.trim().length > 0)).toBeTruthy()
  expect(JSON.stringify(stops)).not.toMatch(/Time to be announced|Surprise Stop #1|Our Food Date|A Little Adventure/)
  expect(parameters.planning_note).toBe(planningNote)
  release()
  await expect(page.getByText(success, { exact: true })).toBeVisible()
  expect(payloads).toHaveLength(1)
})

test('refreshing an accepted invitation never automatically sends another copy', async ({ page }) => {
  let sends = 0
  await page.route(endpoint, route => { sends += 1; return route.fulfill({ status: 200, body: 'OK' }) })
  await openLetter(page)
  await page.getByRole('button', { name: /YES, MAKI!/ }).click()
  await expect(page.getByText(success, { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText(success, { exact: true })).toBeVisible()
  expect(sends).toBe(1)
  await expect(page.getByRole('button', { name: /YES, MAKI!/ })).toHaveCount(0)
})

test('an unconfirmed provider response preserves Yes and offers an explicit retry', async ({ page }) => {
  let sends = 0
  await page.route(endpoint, route => {
    sends += 1
    return sends === 1 ? route.fulfill({ status: 503, body: 'Temporarily unavailable' }) : route.fulfill({ status: 200, body: 'OK' })
  })
  await openLetter(page)
  await page.getByRole('button', { name: /YES, MAKI!/ }).click()
  await expect(page.getByText(uncertain, { exact: true })).toBeVisible()
  await expect(page.getByText(success, { exact: true })).toHaveCount(0)
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBe('true')
  await page.getByRole('button', { name: 'Try email again', exact: true }).click()
  await expect(page.getByText(success, { exact: true })).toBeVisible()
  expect(sends).toBe(2)
})

test('a successful HTTP page without the provider acknowledgement never claims submission', async ({ page }) => {
  await page.route(endpoint, route => route.fulfill({ status: 200, body: '<html>Something went wrong</html>' }))
  await openLetter(page)
  await page.getByRole('button', { name: /YES, MAKI!/ }).click()
  await expect(page.getByText(uncertain, { exact: true })).toBeVisible()
  await expect(page.getByText(success, { exact: true })).toHaveCount(0)
})

test('lost responses stay uncertain after refresh instead of automatically retrying', async ({ page }) => {
  let sends = 0
  await page.route(endpoint, route => { sends += 1; return route.abort('failed') })
  await openLetter(page)
  await page.getByRole('button', { name: /YES, MAKI!/ }).click()
  await expect(page.getByText(uncertain, { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText(uncertain, { exact: true })).toBeVisible()
  expect(sends).toBe(1)
})

test('resetting during submission ignores a late response and clears the old email state', async ({ page }) => {
  let release!: () => void
  const waiting = new Promise<void>(resolve => { release = resolve })
  await page.route(endpoint, async route => {
    await waiting
    await route.fulfill({ status: 200, body: 'OK' }).catch(() => { /* The reset can abort the browser request first. */ })
  })
  await openLetter(page)
  await page.getByRole('button', { name: /YES, MAKI!/ }).click()
  await expect(page.getByText('Sending a little copy of our day…', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Restart invitation', exact: true }).click()
  release()
  await expect(page.getByRole('button', { name: 'Open My Letter', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Open My Letter', exact: true }).click()
  await expect(page.getByRole('button', { name: /YES, MAKI!/ })).toBeVisible()
  expect(await page.evaluate(key => localStorage.getItem(`${key}-itinerary-email`), storageKey)).toBeNull()
  await expect(page.getByText(success, { exact: true })).toHaveCount(0)
})

test('the saved itinerary contains the same complete schedule without exposing local or reset links', async ({ page }) => {
  await page.route(endpoint, route => route.fulfill({ status: 200, body: 'OK' }))
  await openLetter(page)
  await page.getByRole('button', { name: /YES, MAKI!/ }).click()
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Save our itinerary', exact: true }).click()
  const download = await downloadEvent
  expect(download.suggestedFilename()).toBe('maki-yen-itinerary-2026-11-22.txt')
  const downloadPath = await download.path()
  expect(downloadPath).toBeTruthy()
  const text = await readFile(downloadPath!, 'utf8')
  expect(text).toContain('Sunday, November 22, 2026')
  expect(text).toContain('My dearest Yen,')
  expect(text).toContain('Thank you for saying yes to our special anniversary date.')
  expect(text).toContain('1. Anniversary Dinner in the Sky')
  expect(text.match(/^\d+\. /gm)).toHaveLength(1)
  expect(text).not.toMatch(/Time to be announced|Surprise Stop #1|Our Food Date|A Little Adventure|\/images\/venues\//)
  expect(text).toContain('Evening · 6:00 PM')
  expect(text).toContain(dinnerVenue)
  expect(text).toContain(dinnerMapsUrl)
  expect(text).toContain(planningNote)
  expect(text).toContain(`Dress code: ${dressCode}`)
  for (const option of attireExamples) expect(text).toContain(`${option.label}: ${option.example}`)
  expect(text).toMatch(/Venue photo: https:\/\//)
  expect(text).toMatch(/Photo: Vivere Hotel — https:\/\//)
  expect(text).not.toMatch(/localhost|127\.0\.0\.1|reset=1/)
  expect(text).toContain('Love, Maki.')
})
