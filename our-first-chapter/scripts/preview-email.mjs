import assert from 'node:assert/strict'
import { readFile, realpath, writeFile } from 'node:fs/promises'
import { extname, isAbsolute, relative, resolve, sep } from 'node:path'
import { createServer } from 'vite'
import { chromium } from 'playwright'

const root = resolve(import.meta.dirname, '..')
const server = await createServer({ root, configFile: false, appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, watch: null } })
let content
let itinerary
try {
  const module = await server.ssrLoadModule('/src/lib/itineraryEmailContent.ts')
  content = module.createItineraryEmail()
  const data = await server.ssrLoadModule('/src/data/anniversary.ts')
  itinerary = data.anniversary.itinerary.entries
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
const publicRoot = await realpath(resolve(root, 'public'))
const imageTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif' }
// Only configured venue images are embedded in the offline preview. The sent
// email and TXT keep their public HTTPS image URLs from the central itinerary.
const previewStops = await Promise.all(content.parameters.itinerary.map(async (stop, index) => {
  if (!stop.image_url) return stop
  const asset = itinerary[index]?.image
  assert(asset?.src?.startsWith('/') && !asset.src.startsWith('//'), 'A venue photo needs a local public image for previewing.')
  const imagePath = await realpath(resolve(publicRoot, asset.src.slice(1)))
  const pathWithinPublic = relative(publicRoot, imagePath)
  assert(pathWithinPublic && pathWithinPublic !== '..' && !pathWithinPublic.startsWith(`..${sep}`) && !isAbsolute(pathWithinPublic), 'Venue preview images must stay inside public/.')
  const mimeType = imageTypes[extname(imagePath).toLowerCase()]
  assert(mimeType, 'Unsupported venue preview image format.')
  const image = await readFile(imagePath)
  return { ...stop, image_url: `data:${mimeType};base64,${image.toString('base64')}` }
}))
const preview = render(template, { ...content.parameters, itinerary: previewStops })
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
    await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())))
    const text = await page.locator('body').innerText()
    assert(text.includes(content.parameters.greeting))
    assert(text.includes(content.parameters.thank_you))
    assert(text.includes(content.parameters.celebration_date))
    assert(text.indexOf(content.parameters.greeting) < text.indexOf(content.parameters.thank_you))
    assert(text.indexOf(content.parameters.thank_you) < text.indexOf(content.parameters.celebration_date))
    assert(text.indexOf(content.parameters.celebration_date) < text.indexOf(content.parameters.itinerary_heading))
    for (const stop of content.parameters.itinerary) {
      for (const field of ['period', 'time', 'title', 'place', 'description']) assert(text.includes(stop[field]), `Missing ${field} at ${width}px`)
      if (stop.dress_code) assert(text.includes(stop.dress_code), `Missing dress code at ${width}px`)
      for (const option of stop.attire_examples || []) {
        for (const field of ['label', 'example', 'detail']) assert(text.includes(option[field]), `Missing attire ${field} at ${width}px`)
      }
    }
    assert.equal(await page.locator('img').count(), previewStops.filter(stop => stop.image_url).length, 'Every configured venue photo should appear.')
    assert(await page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), 'Every venue photo should load.')
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Email overflows at ${width}px`)
    assert.deepEqual(requests, [], 'The email preview should load without remote assets.')
    if (width !== 320) await page.screenshot({ path: resolve(root, width === 720 ? 'email/email-preview.png' : 'email/email-preview-mobile.png'), fullPage: true })
    await page.close()
  }
} finally { await browser.close() }
console.log('Created email-preview.html, text, and desktop/mobile images. Greeting, thank-you, date, all itinerary details, and 320/390/720px layouts verified. No email was sent.')
