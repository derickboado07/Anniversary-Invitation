import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createServer } from 'vite'
import { chromium } from 'playwright'

const root = resolve(import.meta.dirname, '..')
const server = await createServer({ root, configFile: false, appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, watch: null } })
let content
try {
  const module = await server.ssrLoadModule('/src/lib/itineraryEmailContent.ts')
  content = module.createItineraryEmail()
} finally { await server.close() }

const escape = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')

// Render just the escaped variables, sections, and loops used by this template.
// EmailJS does the actual rendering when it sends; this is a local preview only.
function render(html, values) {
  return html.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, inside) => {
    const value = values[key]
    return Array.isArray(value) ? value.map(item => render(inside, { ...values, ...item })).join('') : value ? render(inside, values) : ''
  }).replace(/\{\{(\w+)\}\}/g, (_, key) => {
    assert(Object.hasOwn(values, key), `Unknown email variable: ${key}`)
    return escape(values[key])
  })
}

const template = await readFile(resolve(root, 'email/emailjs-template.html'), 'utf8')
const preview = render(template, content.parameters)
assert(!preview.includes('{{'), 'The preview has unresolved template variables.')
assert(!/<script\b/i.test(preview), 'The email must not contain scripts.')
await writeFile(resolve(root, 'email/email-preview.html'), preview)
await writeFile(resolve(root, 'email/email-preview.txt'), content.text)

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
try {
  for (const width of [720, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 })
    const requests = []
    await page.route('**/*', route => { requests.push(route.request().url()); return route.abort() })
    await page.setContent(preview)
    const text = await page.locator('body').innerText()
    assert(text.includes(content.parameters.greeting))
    assert(text.includes(content.parameters.thank_you))
    assert(text.includes(content.parameters.celebration_date))
    assert(text.indexOf(content.parameters.greeting) < text.indexOf(content.parameters.thank_you))
    assert(text.indexOf(content.parameters.thank_you) < text.indexOf(content.parameters.celebration_date))
    assert(text.indexOf(content.parameters.celebration_date) < text.indexOf(content.parameters.itinerary_heading))
    for (const stop of content.parameters.itinerary) {
      for (const field of ['period', 'time', 'title', 'place', 'description']) assert(text.includes(stop[field]), `Missing ${field} at ${width}px`)
    }
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Email overflows at ${width}px`)
    assert.deepEqual(requests, [], 'The email preview should load without remote assets.')
    if (width !== 320) await page.screenshot({ path: resolve(root, width === 720 ? 'email/email-preview.png' : 'email/email-preview-mobile.png'), fullPage: true })
    await page.close()
  }
} finally { await browser.close() }
console.log('Created email-preview.html, text, and desktop/mobile images. Greeting, thank-you, date, all itinerary details, and 320/390/720px layouts verified. No email was sent.')
