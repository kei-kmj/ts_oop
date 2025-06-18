import { Page, Locator } from '@playwright/test';

export class RecentlyViewedSection {
  readonly page: Page;
  readonly sectionContainer: Locator;
  readonly sectionTitle: Locator;
  readonly viewAllLink: Locator;
  readonly contentList: Locator;
  readonly jukuItems: Locator;
  readonly classroomItems: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Section container
    this.sectionContainer = page.locator('.bjp-home-favorite');
    
    // Section title
    this.sectionTitle = page.getByRole('heading', { level: 2 }).filter({ hasText: '最近見た塾・教室' });
    
    // View all link
    this.viewAllLink = page.getByRole('link', { name: 'すべて見る' });
    
    // Content list container
    this.contentList = page.locator('.bjp-home-favorite__contents');
    
    // Juku items (orange label)
    this.jukuItems = page.locator('.bjp-home-favorite__content').filter({ has: page.locator('.label-orange') });
    
    // Classroom items (blue label)
    this.classroomItems = page.locator('.bjp-home-favorite__content').filter({ has: page.locator('.label-blue') });
  }

  async clickViewAllLink(): Promise<void> {
    await this.viewAllLink.click();
  }

  async getJukuItemsCount(): Promise<number> {
    return await this.jukuItems.count();
  }

  async getClassroomItemsCount(): Promise<number> {
    return await this.classroomItems.count();
  }

  async getTotalItemsCount(): Promise<number> {
    return await this.sectionContainer.locator('.bjp-home-favorite__content').count();
  }

  async clickJukuItem(index: number): Promise<void> {
    await this.jukuItems.nth(index).click();
  }

  async clickClassroomItem(index: number): Promise<void> {
    await this.classroomItems.nth(index).click();
  }

  async getJukuItemTitle(index: number): Promise<string> {
    const item = this.jukuItems.nth(index);
    return await item.locator('.title').textContent() || '';
  }

  async getClassroomItemTitle(index: number): Promise<string> {
    const item = this.classroomItems.nth(index);
    return await item.locator('.title').textContent() || '';
  }

  async getJukuItemText(index: number): Promise<string> {
    const item = this.jukuItems.nth(index);
    return await item.locator('.text').textContent() || '';
  }

  async isSectionVisible(): Promise<boolean> {
    return await this.sectionContainer.isVisible();
  }

  async isViewAllLinkVisible(): Promise<boolean> {
    return await this.viewAllLink.isVisible();
  }

  async waitForSectionToLoad(): Promise<void> {
    await this.sectionContainer.waitFor({ state: 'visible' });
    await this.contentList.waitFor({ state: 'visible' });
  }

  async scrollToSection(): Promise<void> {
    await this.sectionContainer.scrollIntoViewIfNeeded();
  }

  async getViewAllLinkHref(): Promise<string | null> {
    return await this.viewAllLink.getAttribute('href');
  }

  async hasAnyItems(): Promise<boolean> {
    const count = await this.getTotalItemsCount();
    return count > 0;
  }
}