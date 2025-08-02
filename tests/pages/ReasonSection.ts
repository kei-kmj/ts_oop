import { Page, Locator } from '@playwright/test';

export class ReasonSection {
  readonly page: Page;
  readonly sectionContainer: Locator;
  readonly sectionTitle: Locator;
  readonly logoImage: Locator;
  readonly reasonList: Locator;
  readonly classroomCountItem: Locator;
  readonly reviewCountItem: Locator;
  readonly thoroughCoverageItem: Locator;

  constructor(page: Page) {
    this.page = page;

    // Section container
    this.sectionContainer = page.locator('section.bjp-reason-section');

    // Section title with logo
    this.sectionTitle = page.getByRole('heading', { level: 2 }).filter({ hasText: 'が選ばれる' });
    this.logoImage = this.sectionTitle.getByRole('img', { name: '塾選（ジュクセン）' });

    // Reason list
    this.reasonList = page.getByRole('list').filter({ has: page.locator('.bjp-reason-selected__item') });

    // Individual reason items
    this.classroomCountItem = page.getByRole('listitem').filter({ hasText: '掲載教室数' });
    this.reviewCountItem = page.getByRole('listitem').filter({ hasText: '生徒・ご家族口コミ' });
    this.thoroughCoverageItem = page.getByRole('listitem').filter({ hasText: '担当者がひとつひとつ' });
  }

  async getClassroomCount(): Promise<string> {
    const countElement = this.classroomCountItem.locator('.strong-num');
    return (await countElement.textContent()) || '';
  }

  async getReviewCount(): Promise<string> {
    const countElement = this.reviewCountItem.locator('.strong-num');
    return (await countElement.textContent()) || '';
  }

  async getThoroughCoverageText(): Promise<string> {
    const textElement = this.thoroughCoverageItem.locator('.strong-text');
    return (await textElement.textContent()) || '';
  }

  async isSectionVisible(): Promise<boolean> {
    return await this.sectionContainer.isVisible();
  }

  async areAllReasonsVisible(): Promise<boolean> {
    const classroom = await this.classroomCountItem.isVisible();
    const review = await this.reviewCountItem.isVisible();
    const coverage = await this.thoroughCoverageItem.isVisible();
    return classroom && review && coverage;
  }

  async waitForSectionToLoad(): Promise<void> {
    await this.sectionContainer.waitFor({ state: 'visible' });
    await this.reasonList.waitFor({ state: 'visible' });
  }

  async scrollToSection(): Promise<void> {
    await this.sectionContainer.scrollIntoViewIfNeeded();
  }
}
