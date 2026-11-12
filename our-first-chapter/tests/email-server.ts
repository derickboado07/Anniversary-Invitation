import { resolve } from 'node:path'
import { createServer } from 'vite'
import type { FullConfig } from 'playwright/test'

const emailEnvironment = {
  VITE_EMAILJS_SERVICE_ID: 'service_test_only',
  VITE_EMAILJS_TEMPLATE_ID: 'template_test_only',
  VITE_EMAILJS_PUBLIC_KEY: 'public_test_only',
  VITE_EMAIL_SEND_IN_PREVIEW: 'true',
}

export default async function startEmailTestServer(config: FullConfig) {
  const address = new URL(config.projects[0].use.baseURL!)
  const root = resolve(import.meta.dirname, '..')
  const previous = Object.fromEntries(Object.keys(emailEnvironment).map(key => [key, process.env[key]]))
  Object.assign(process.env, emailEnvironment)
  const restore = () => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
  const server = await createServer({
    root,
    configFile: resolve(root, 'vite.config.ts'),
    clearScreen: false,
    server: { host: address.hostname, port: Number(address.port), strictPort: true },
  })
  try {
    await server.listen()
  } catch (error) {
    await server.close()
    restore()
    throw error
  }
  return async () => {
    try { await server.close() } finally { restore() }
  }
}
