import { Page, Locator } from '@playwright/test';

export class TabComponent {
  readonly page: Page;
  readonly container: Locator;
  readonly tabList: Locator;
  readonly tabItems: Locator;
  readonly tabContents: Locator;

  constructor(page: Page, containerSelector: string = '.tab__list') {
    this.page = page;
    this.container = page.locator(containerSelector);
    
    // Check if this is a juku inner tab navigation
    if (containerSelector.includes('bjc-juku-inner-tab-nav')) {
      this.tabList = this.container;
      this.tabItems = this.container.locator('.js-tab__item');
      this.tabContents = page.locator('.js-tab__content');
    } else {
      this.tabList = this.container.locator('ul');
      this.tabItems = this.tabList.locator('.tab__item');
      this.tabContents = page.locator('.tab__content .tab__content-item');
    }
  }

  async getTabItems(): Promise<Locator[]> {
    const count = await this.tabItems.count();
    const items: Locator[] = [];
    for (let i = 0; i < count; i++) {
      items.push(this.tabItems.nth(i));
    }
    return items;
  }

  async getTabTexts(): Promise<string[]> {
    const items = await this.getTabItems();
    const texts: string[] = [];
    for (const item of items) {
      const text = await item.textContent();
      if (text) texts.push(text.trim());
    }
    return texts;
  }

  async getActiveTabText(): Promise<string> {
    const activeTab = this.tabItems.filter({ hasClass: 'is-active' }).first();
    const text = await activeTab.textContent() || '';
    return text.trim();
  }

  async getActiveTabDataId(): Promise<string> {
    const activeTab = this.tabItems.locator('.is-active');
    return await activeTab.getAttribute('data-tab') || '';
  }

  async clickTabByText(tabText: string): Promise<void> {
    const tab = this.tabItems.filter({ hasText: tabText }).first();
    await tab.click();
  }

  async clickTabByIndex(index: number): Promise<void> {
    await this.tabItems.nth(index).click();
  }

  async clickTabByDataId(dataTabId: string): Promise<void> {
    const tab = this.tabItems.filter({ has: this.page.locator(`[data-tab="${dataTabId}"]`) });
    await tab.click();
  }

  async isTabActive(tabText: string): Promise<boolean> {
    const tab = this.tabItems.filter({ hasText: tabText });
    return await tab.hasClass('is-active');
  }

  async isTabActiveByIndex(index: number): Promise<boolean> {
    return await this.tabItems.nth(index).hasClass('is-active');
  }

  async getActiveTabContent(): Promise<Locator> {
    return this.tabContents.filter({ hasClass: 'is-active' });
  }

  async getTabContentByDataId(dataContentId: string): Promise<Locator> {
    return this.tabContents.filter({ has: this.page.locator(`[data-content="${dataContentId}"]`) });
  }

  async waitForTabChange(expectedTabText: string, timeout: number = 3000): Promise<void> {
    // Wait for the specific tab within this component to have the 'is-active' class
    const targetTab = this.tabItems.filter({ hasText: expectedTabText });
    await targetTab.waitFor({ state: 'visible', timeout: timeout });
    
    // Wait for the target tab to become active
    await this.page.waitForFunction(
      (expectedText) => {
        const activeTab = document.querySelector('.tab__item.is-active');
        return activeTab?.textContent?.trim() === expectedText;
      },
      expectedTabText,
      { timeout }
    );
  }

  async getAllTabData(): Promise<Array<{
    text: string;
    dataTab: string;
    isActive: boolean;
    index: number;
  }>> {
    const items = await this.getTabItems();
    const tabData = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const text = await item.textContent() || '';
      const dataTab = await item.getAttribute('data-tab') || '';
      const isActive = await item.hasClass('is-active');

      tabData.push({
        text: text.trim(),
        dataTab,
        isActive,
        index: i
      });
    }

    return tabData;
  }
}