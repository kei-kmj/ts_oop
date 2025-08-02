import { Page, Locator } from '@playwright/test';

export class SearchFormSection {
  readonly page: Page;
  readonly sectionContainer: Locator;
  readonly sectionTitle: Locator;
  readonly searchInput: Locator;
  readonly searchPlaceholder: Locator;

  constructor(page: Page) {
    this.page = page;

    // Section container
    this.sectionContainer = page.locator('.bjp-home-search-form');

    // Section title
    this.sectionTitle = page.getByRole('heading', { level: 2 }).filter({ hasText: '塾名・志望校名から探す' });

    // Search input - using the actual input element
    this.searchInput = page.locator('.bjc-academy-search-box__input');

    // Search placeholder
    this.searchPlaceholder = page.locator('.bjc-academy-search-box__placeholder');
  }

  async fillSearchInput(searchTerm: string): Promise<void> {
    await this.searchInput.fill(searchTerm);
  }

  async clearSearchInput(): Promise<void> {
    await this.searchInput.clear();
  }

  async pressEnter(): Promise<void> {
    await this.searchInput.press('Enter');
  }

  async getSectionTitleText(): Promise<string> {
    return (await this.sectionTitle.textContent()) || '';
  }

  async getPlaceholderText(): Promise<string> {
    return (await this.searchPlaceholder.textContent()) || '';
  }

  async isSearchInputVisible(): Promise<boolean> {
    return await this.searchInput.isVisible();
  }

  async isSectionVisible(): Promise<boolean> {
    return await this.sectionContainer.isVisible();
  }

  async waitForSectionToLoad(): Promise<void> {
    await this.sectionContainer.waitFor({ state: 'visible' });
    await this.searchInput.waitFor({ state: 'visible' });
  }

  async getSearchInputValue(): Promise<string> {
    return await this.searchInput.inputValue();
  }

  async focusSearchInput(): Promise<void> {
    await this.searchInput.focus();
  }

  async isSearchInputFocused(): Promise<boolean> {
    return await this.searchInput.evaluate((el) => el === document.activeElement);
  }
}
