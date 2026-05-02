// BasePage template — extended by every page object
import { Page, Locator, expect } from '@playwright/test'

export type ElementKey = string

export abstract class BasePage {
  protected elements = new Map<ElementKey, Locator>()
  protected url: string = ''

  constructor(protected page: Page) {}

  /** Navigate to this page's url. */
  async goto(): Promise<void> {
    if (!this.url) throw new Error(`${this.constructor.name}.url not set`)
    await this.page.goto(this.url)
    await this.waitForReady()
  }

  /** Wait for page to be interactable; avoid networkidle hang. */
  async waitForReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded')
    await this.page.waitForFunction(() => document.readyState === 'complete')
  }

  /** Register an element locator with a stable key. */
  protected register(key: ElementKey, locator: Locator): void {
    this.elements.set(key, locator)
  }

  /** Get a registered element by key. */
  el(key: ElementKey): Locator {
    const loc = this.elements.get(key)
    if (!loc) throw new Error(`Element '${key}' not registered in ${this.constructor.name}`)
    return loc
  }

  /** Assert URL matches a pattern. */
  async expectUrl(pattern: RegExp | string): Promise<void> {
    await expect(this.page).toHaveURL(pattern)
  }

  /** Assert visible text. */
  async expectVisibleText(text: string): Promise<void> {
    await expect(this.page.getByText(text)).toBeVisible()
  }
}
