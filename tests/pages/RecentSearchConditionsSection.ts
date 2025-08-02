import { Page, Locator } from '@playwright/test';

export class RecentSearchConditionsSection {
  readonly page: Page;
  readonly sectionContainer: Locator;
  readonly sectionTitle: Locator;
  readonly conditionsList: Locator;
  readonly conditionItems: Locator;

  constructor(page: Page) {
    this.page = page;

    // Section container - reusing the same container class as recently viewed
    this.sectionContainer = page.locator('.bjp-home-favorite').filter({ has: page.getByText('最近検索した条件') });

    // Section title
    this.sectionTitle = page.getByRole('heading', { level: 2 }).filter({ hasText: '最近検索した条件' });

    // Conditions list container
    this.conditionsList = page.locator('.bjp-home-favorite__contents-conditions');

    // Individual condition items
    this.conditionItems = this.conditionsList.locator('li a');
  }

  async getConditionsCount(): Promise<number> {
    return await this.conditionItems.count();
  }

  async clickConditionItem(index: number): Promise<void> {
    await this.conditionItems.nth(index).click();
  }

  async getConditionText(index: number): Promise<string> {
    return (await this.conditionItems.nth(index).textContent()) || '';
  }

  async getConditionHref(index: number): Promise<string | null> {
    return await this.conditionItems.nth(index).getAttribute('href');
  }

  async getAllConditions(): Promise<string[]> {
    const count = await this.getConditionsCount();
    const conditions: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await this.getConditionText(i);
      conditions.push(text);
    }

    return conditions;
  }

  async isSectionVisible(): Promise<boolean> {
    return await this.sectionContainer.isVisible();
  }

  async hasAnyConditions(): Promise<boolean> {
    const count = await this.getConditionsCount();
    return count > 0;
  }

  async waitForSectionToLoad(): Promise<void> {
    await this.sectionContainer.waitFor({ state: 'visible' });
    await this.conditionsList.waitFor({ state: 'visible' });
  }

  async scrollToSection(): Promise<void> {
    await this.sectionContainer.scrollIntoViewIfNeeded();
  }

  async getSectionTitleText(): Promise<string> {
    return (await this.sectionTitle.textContent()) || '';
  }
}
