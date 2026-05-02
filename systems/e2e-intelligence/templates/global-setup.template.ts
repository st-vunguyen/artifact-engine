// global-setup template — runs once before all tests
import { chromium, FullConfig } from '@playwright/test'
import { rmSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'

async function globalSetup(config: FullConfig) {
  const root = process.cwd()
  const authDir = path.join(root, 'tests/e2e/.auth')

  // 1. Clean previous artifacts
  for (const dir of ['test-results', 'playwright-report', 'blob-report']) {
    const p = path.join(root, dir)
    if (existsSync(p)) rmSync(p, { recursive: true, force: true })
  }
  if (existsSync(authDir)) rmSync(authDir, { recursive: true, force: true })
  mkdirSync(authDir, { recursive: true })

  // 2. Database setup (truncate, migrate, seed) — implement per project
  // await truncateAllTables()
  // await runMigrations()
  // await seedBaseData()

  // 3. Register and login users; capture storageState per role
  const baseURL = process.env.BASE_URL || config.projects[0].use.baseURL!
  const browser = await chromium.launch()

  const roles: Array<{ key: string; email: string; password: string }> = [
    { key: 'admin',  email: process.env.USER_EMAIL_ADMIN!, password: process.env.USER_PASSWORD_ADMIN! },
    { key: 'userA',  email: process.env.USER_EMAIL_A!,     password: process.env.USER_PASSWORD_A! },
    { key: 'userB',  email: process.env.USER_EMAIL_B!,     password: process.env.USER_PASSWORD_B! },
  ]

  for (const role of roles) {
    if (!role.email || !role.password) continue
    const ctx = await browser.newContext({ baseURL })
    const page = await ctx.newPage()
    await page.goto('/login')
    await page.getByLabel('Email').fill(role.email)
    await page.getByLabel('Password').fill(role.password)
    await page.getByRole('button', { name: /log in|sign in/i }).click()
    await page.waitForLoadState('domcontentloaded')
    await ctx.storageState({ path: path.join(authDir, `${role.key}.json`) })
    await ctx.close()
  }

  await browser.close()
}

export default globalSetup
