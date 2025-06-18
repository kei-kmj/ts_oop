import { Page, Locator } from '@playwright/test';

export class AreaSearchSection {
  readonly page: Page;
  readonly sectionContainer: Locator;
  readonly sectionTitle: Locator;
  readonly searchAreaList: Locator;
  readonly searchByCityButton: Locator;
  readonly searchByStationButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Section container
    this.sectionContainer = page.locator('.bjp-home-area-search--sp');
    
    // Section title
    this.sectionTitle = page.getByRole('heading', { level: 2 }).filter({ hasText: '全国の塾・予備校を探す' });
    
    // Search area list
    this.searchAreaList = page.getByRole('list').filter({ has: page.locator('.bjp-home-area-search-area') });
    
    // Search buttons - using link role with text content
    this.searchByCityButton = page.getByRole('link').filter({ hasText: '市区町村から探す' });
    this.searchByStationButton = page.getByRole('link').filter({ hasText: '路線・駅から探す' });
  }

  async clickSearchByCity(): Promise<void> {
    await this.searchByCityButton.click();
  }

  async clickSearchByStation(): Promise<void> {
    await this.searchByStationButton.click();
  }

  async getSectionTitleText(): Promise<string> {
    return await this.sectionTitle.textContent() || '';
  }

  async isSearchByCityButtonVisible(): Promise<boolean> {
    return await this.searchByCityButton.isVisible();
  }

  async isSearchByStationButtonVisible(): Promise<boolean> {
    return await this.searchByStationButton.isVisible();
  }

  async isSectionVisible(): Promise<boolean> {
    return await this.sectionContainer.isVisible();
  }

  async waitForSectionToLoad(): Promise<void> {
    await this.sectionContainer.waitFor({ state: 'visible' });
    await this.searchAreaList.waitFor({ state: 'visible' });
  }

  async getSearchByCityHref(): Promise<string | null> {
    return await this.searchByCityButton.getAttribute('href');
  }

  async getSearchByStationHref(): Promise<string | null> {
    return await this.searchByStationButton.getAttribute('href');
  }
}