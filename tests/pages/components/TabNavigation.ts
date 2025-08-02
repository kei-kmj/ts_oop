import { type Page, type Locator } from '@playwright/test';

export class TabNavigation {
  private readonly page: Page;
  private readonly container: Locator;

  constructor(page: Page, containerSelector: string) {
    this.page = page;
    this.container = page.locator(containerSelector);
  }

  async clickTab(tabName: string): Promise<void> {
    await this.container.getByRole('link', { name: tabName }).click();
  }

  async getActiveTab(): Promise<string> {
    return (await this.container.locator('.is-active').textContent()) || '';
  }

  async isTabActive(tabName: string): Promise<boolean> {
    const activeTabText = await this.getActiveTab();
    return activeTabText.trim() === tabName;
  }

  async getAllTabs(): Promise<string[]> {
    const tabs = await this.container.locator('li').allTextContents();
    return tabs.map((tab) => tab.trim());
  }
}
