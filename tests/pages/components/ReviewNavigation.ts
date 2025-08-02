import { Page, Locator } from '@playwright/test';

export class ReviewNavigation {
  readonly page: Page;
  readonly navContainer: Locator;
  readonly categoryTab: Locator;
  readonly respondentTab: Locator;
  readonly experienceTab: Locator;
  readonly activeTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navContainer = page.locator('ul.bjc-review-nav-page');
    this.categoryTab = page.getByRole('listitem').filter({ hasText: 'カテゴリから探す' });
    this.respondentTab = page.getByRole('link', { name: '回答者から探す' });
    this.experienceTab = page.getByRole('link', { name: '合格体験記' });
    this.activeTab = page.locator('ul.bjc-review-nav-page li.is-active');
  }

  async clickCategoryTab(): Promise<void> {
    await this.categoryTab.click();
  }

  async clickRespondentTab(): Promise<void> {
    await this.respondentTab.click();
  }

  async clickExperienceTab(): Promise<void> {
    await this.experienceTab.click();
  }

  async getActiveTabText(): Promise<string> {
    return (await this.activeTab.textContent()) || '';
  }

  async isTabActive(tabName: 'category' | 'respondent' | 'experience'): Promise<boolean> {
    const tabMap = {
      category: 'カテゴリから探す',
      respondent: '回答者から探す',
      experience: '合格体験記',
    };

    const activeText = await this.getActiveTabText();
    return activeText.includes(tabMap[tabName]);
  }

  async isVisible(): Promise<boolean> {
    return await this.navContainer.isVisible();
  }

  async getAllTabTexts(): Promise<string[]> {
    const tabs = await this.navContainer.locator('li').all();
    const texts: string[] = [];

    for (const tab of tabs) {
      const text = await tab.textContent();
      if (text) {
        texts.push(text.trim());
      }
    }

    return texts;
  }

  async navigateToRespondentPage(): Promise<void> {
    await this.clickRespondentTab();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateToExperiencePage(): Promise<void> {
    await this.clickExperienceTab();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
