import { chromium } from 'playwright'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const svg = await readFile(resolve(root, 'public/social-card.svg'), 'utf8')
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  await page.setContent(`<style>body{margin:0}svg{display:block}</style>${svg}`)
  await page.screenshot({ path: resolve(root, 'public/social-card.png') })
  console.log('Created public/social-card.png (1200 × 630).')
} finally { await browser.close() }
