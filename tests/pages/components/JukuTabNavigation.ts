import { Page, Locator } from '@playwright/test';

export class JukuTabNavigation {
  private readonly page: Page;
  private readonly container: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('.bjc-juku-tab');
  }

  async clickTab(tabName: '塾トップ' | '詳細レポ' | 'コース' | '教室一覧' | '口コミ'): Promise<void> {
    // Wait for the navigation to be visible
    await this.container.waitFor({ state: 'visible' });
    
    // First try to find a link with the tab name
    const link = this.container.getByRole('link', { name: tabName });
    const linkCount = await link.count();
    
    if (linkCount > 0) {
      // Wait for the link to be clickable and click it
      await link.waitFor({ state: 'visible' });
      await link.click();
      return;
    }
    
    // If no link found, the tab might be the current active tab (rendered as text, not a link)
    // In this case, we don't need to click it as we're already on that page
    // Use a more flexible text matching to handle whitespace
    const textElement = this.container.locator(`li:has-text("${tabName}")`).locator('p');
    if (await textElement.count() > 0) {
      // Verify it's the active tab by checking the parent li
      const parentLi = this.container.locator(`li:has-text("${tabName}")`);
      const isActive = await parentLi.evaluate(el => el.classList.contains('is-active'));
      if (!isActive) {
        throw new Error(`Tab "${tabName}" is not a clickable link and is not active`);
      }
      // If it's active, we don't need to do anything - just return
      return;
    }
    
    throw new Error(`Tab "${tabName}" not found`);
  }

  async getActiveTab(): Promise<string> {
    const activeItem = this.container.locator('.is-active');
    const text = await activeItem.textContent() || '';
    return text.trim();
  }

  async isTabActive(tabName: string): Promise<boolean> {
    const activeTabText = await this.getActiveTab();
    return activeTabText.trim() === tabName;
  }

  async getAllTabs(): Promise<string[]> {
    const tabs = await this.container.locator('li').allTextContents();
    return tabs.map(tab => tab.trim());
  }

  async isTabVisible(): Promise<boolean> {
    return await this.container.isVisible();
  }

  async getTabLink(tabName: string): Promise<string | null> {
    // First try to find a link with the tab name
    const link = this.container.getByRole('link', { name: tabName });
    if (await link.count() > 0) {
      return await link.getAttribute('href');
    }
    
    // If no link found, check if it's the active tab (rendered as text)
    const textElement = this.container.locator(`li:has-text("${tabName}")`).locator('p');
    if (await textElement.count() > 0) {
      const parentLi = this.container.locator(`li:has-text("${tabName}")`);
      const isActive = await parentLi.evaluate(el => el.classList.contains('is-active'));
      if (isActive) {
        // For active tabs without links, we need to determine the URL from the current page
        // or return null to indicate it's the current page
        return null;
      }
    }
    
    throw new Error(`Tab "${tabName}" not found`);
  }

  async clickJukuTop(): Promise<void> {
    await this.clickTab('塾トップ');
  }

  async isTabClickable(tabName: string): Promise<boolean> {
    const link = this.container.getByRole('link', { name: tabName });
    return await link.count() > 0;
  }

  async clickDetailReport(): Promise<void> {
    await this.clickTab('詳細レポ');
  }

  async clickCourse(): Promise<void> {
    await this.clickTab('コース');
  }

  async clickClassList(): Promise<void> {
    await this.clickTab('教室一覧');
  }

  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}