import { defineConfig } from 'playwright/test'
import base from './playwright.config'

const port = Number(process.env.EMAIL_TEST_PORT || 5184)
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('EMAIL_TEST_PORT must be a valid local port.')
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  ...base,
  testIgnore: [],
  testMatch: '**/email.spec.ts',
  outputDir: './email-test-results',
  use: { ...base.use, baseURL },
  // Close Vite directly: process-tree shutdown can stall on Windows.
  webServer: undefined,
  globalSetup: './tests/email-server.ts',
})
