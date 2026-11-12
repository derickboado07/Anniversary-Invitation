import { defineConfig } from 'playwright/test'
import base from './playwright.config'

export default defineConfig({
  ...base,
  testIgnore: [],
  testMatch: '**/email.spec.ts',
  outputDir: './email-test-results',
  use: { ...base.use, baseURL: 'http://127.0.0.1:5174' },
  webServer: {
    command: 'npm run dev -- --port 5174 --strictPort',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: {
      VITE_EMAILJS_SERVICE_ID: 'service_test_only',
      VITE_EMAILJS_TEMPLATE_ID: 'template_test_only',
      VITE_EMAILJS_PUBLIC_KEY: 'public_test_only',
      VITE_EMAIL_SEND_IN_PREVIEW: 'true',
    },
  },
})
