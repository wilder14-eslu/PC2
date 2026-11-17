import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

const systemChrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  expect: { timeout: 15_000 },
  use: { baseURL: 'http://127.0.0.1:4173', ...devices['Desktop Chrome'], launchOptions: !process.env.CI && existsSync(systemChrome) ? { executablePath: systemChrome } : {} },
  webServer: {
    command: 'npm run dev -- --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  reporter: 'list',
});
