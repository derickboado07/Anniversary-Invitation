import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readdirSync, existsSync } from 'node:fs'
import { resolve, relative, sep } from 'node:path'
import { anniversary } from './src/data/anniversary'

// Rescan on startup/build so missing photos never cause broken image requests.
const publicDirectory = resolve(import.meta.dirname, 'public')
const images = existsSync(publicDirectory) ? readdirSync(publicDirectory, { recursive: true, withFileTypes: true })
  .filter((file) => file.isFile() && /\.(jpe?g|png|webp|avif|svg)$/i.test(file.name))
  .map((file) => '/' + relative(publicDirectory, resolve(file.parentPath, file.name)).split(sep).join('/')) : []

export default defineConfig({
  plugins: [react(), tailwindcss(), {
    name: 'invitation-metadata',
    transformIndexHtml(html) {
      const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
      let result = html.replace(/<title>.*?<\/title>/, `<title>${escape(anniversary.title)}</title>`)
        .replace(/(<meta property="og:title" content=")[^"]*/, `$1${escape(anniversary.title)}`)
        .replace(/(<meta name="description" content=")[^"]*/, `$1${escape(anniversary.description)}`)
        .replace(/(<meta property="og:description" content=")[^"]*/, `$1${escape(anniversary.shareDescription)}`)
      if (anniversary.siteUrl) {
        result = result.replace(/(<meta property="og:image" content=")[^"]*/, `$1${new URL('/social-card.png', anniversary.siteUrl).href}`)
        result = result.replace('</head>', `<meta property="og:url" content="${escape(anniversary.siteUrl)}" />\n  </head>`)
      }
      return result
    },
  }],
  define: { __PUBLIC_IMAGE_PATHS__: JSON.stringify(images) },
  // Test snapshots and email previews must never refresh the live invitation.
  server: {
    watch: { ignored: ['**/test-results/**', '**/email-test-results/**', '**/playwright-report/**', '**/.sites-local/**', '**/.npm-cache/**', '**/email/**'] },
  },
  build: { target: 'es2022' },
})
