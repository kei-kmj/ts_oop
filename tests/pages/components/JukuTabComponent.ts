import { Page, Locator } from '@playwright/test';

export class JukuTabComponent {
  readonly page: Page;
  readonly container: Locator;
  readonly tabItems: Locator;
  readonly tabContents: Locator;

  constructor(page: Page, containerLocator: Locator) {
    this.page = page;
    this.container = containerLocator;
    this.tabItems = containerLocator.locator('.bjc-juku-inner-tab-nav .js-tab__item');
    this.tabContents = containerLocator.locator('.js-tab__content');
  }

  async getTabTexts(): Promise<string[]> {
    const count = await this.tabItems.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await this.tabItems.nth(i).textContent();
      if (text) texts.push(text.trim());
    }
    return texts;
  }

  async getActiveTabText(): Promise<string> {
    const activeTab = this.tabItems.filter({ hasClass: 'is-active' }).first();
    return (await activeTab.textContent()) || '';
  }

  async clickTabByText(tabText: string): Promise<void> {
    const tab = this.tabItems.filter({ hasText: tabText }).first();
    await tab.click();
  }

  async clickTabByIndex(index: number): Promise<void> {
    await this.tabItems.nth(index).click();
  }

  async isTabActive(tabText: string): Promise<boolean> {
    const tab = this.tabItems.filter({ hasText: tabText }).first();
    const classAttr = (await tab.getAttribute('class')) || '';
    return classAttr.includes('is-active');
  }

  async getActiveTabContent(): Promise<Locator> {
    return this.tabContents.filter({ hasClass: 'is-active' });
  }

  async waitForTabChange(expectedTabText: string, timeout: number = 3000): Promise<void> {
    await this.page.waitForFunction(
      ({ expectedText, containerSelector }) => {
        const containers = document.querySelectorAll(containerSelector);
        for (const container of containers) {
          const activeTab = container.querySelector('.js-tab__item.is-active');
          if (activeTab?.textContent?.trim() === expectedText) {
            return true;
          }
        }
        return false;
      },
      { expectedText: expectedTabText, containerSelector: '.bjc-juku-inner-tab-wrap' },
      { timeout },
    );
  }
}
