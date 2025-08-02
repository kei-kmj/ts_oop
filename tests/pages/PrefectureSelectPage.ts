import { Page, Locator } from '@playwright/test';
import { Base } from './Base';

export class PrefectureSelectPage extends Base {
  readonly backLink: Locator;
  readonly pageTitle: Locator;
  readonly lastSearchConditionSection: Locator;
  readonly lastSearchConditionText: Locator;

  // Region sections
  readonly hokkaidoTohokuSection: Locator;
  readonly shinetsuHokurikuSection: Locator;
  readonly kantoSection: Locator;
  readonly tokaiSection: Locator;
  readonly kansaiSection: Locator;
  readonly chugokuShikokuSection: Locator;
  readonly kyushuOkinawaSection: Locator;

  constructor(page: Page) {
    super(page);

    // Header elements
    this.backLink = page.getByRole('link', { name: '戻る' });
    this.pageTitle = page.getByRole('heading', { level: 1, name: '都道府県を選択' });

    // Last search condition
    this.lastSearchConditionSection = page.locator('#last-search-condition');
    this.lastSearchConditionText = this.lastSearchConditionSection.locator('.bjc-search-history-text');

    // Region sections
    this.hokkaidoTohokuSection = page.locator('.bjc-search-form--row').filter({ hasText: '北海道・東北' });
    this.shinetsuHokurikuSection = page.locator('.bjc-search-form--row').filter({ hasText: '信越・北陸' });
    this.kantoSection = page.locator('.bjc-search-form--row').filter({ hasText: '関東' });
    this.tokaiSection = page.locator('.bjc-search-form--row').filter({ hasText: '東海' });
    this.kansaiSection = page.locator('.bjc-search-form--row').filter({ hasText: '関西' });
    this.chugokuShikokuSection = page.locator('.bjc-search-form--row').filter({ hasText: '中国・四国' });
    this.kyushuOkinawaSection = page.locator('.bjc-search-form--row').filter({ hasText: '九州・沖縄' });
  }

  async goto() {
    await super.goto('/search/requirement/city-prefecture/');
  }

  async clickBackLink(): Promise<void> {
    await this.backLink.click();
  }

  async getLastSearchConditionText(): Promise<string> {
    return (await this.lastSearchConditionText.textContent()) || '';
  }

  async hasLastSearchCondition(): Promise<boolean> {
    return await this.lastSearchConditionSection.isVisible();
  }

  // Dynamic prefecture selection methods
  async selectPrefecture(prefectureName: string): Promise<void> {
    // Use label click instead of radio button directly
    await this.page.getByText(prefectureName, { exact: true }).click();
  }

  async selectPrefectureByValue(prefectureValue: string): Promise<void> {
    // Simply use the input value selector directly
    const radioButton = this.page.locator(`input[value="${prefectureValue}"]`);
    // Scroll into view first, then click
    await radioButton.scrollIntoViewIfNeeded();
    await radioButton.click({ force: true });
  }

  async selectPrefectureById(prefectureId: string): Promise<void> {
    // Select by specific ID
    const radioButton = this.page.locator(`#${prefectureId}`);
    await radioButton.click();
  }

  // Helper method to get prefecture data
  async getPrefectureData(prefectureName: string): Promise<{
    name: string;
    value: string;
    id: string;
    url: string;
  } | null> {
    const label = this.page.locator(`label:has-text("${prefectureName}")`).first();
    const labelCount = await label.count();

    if (labelCount === 0) {
      return null;
    }

    const radioId = await label.getAttribute('for');
    if (!radioId) return null;

    const radioButton = this.page.locator(`#${radioId}`);
    const value = await radioButton.getAttribute('value');
    // Try different approaches to find the link element
    let url = '';
    try {
      const linkElement = this.page.locator(`link-to-prefecture-select[data-key="${radioId}"]`);
      url = (await linkElement.getAttribute('data-url')) || '';
    } catch {
      url = '/search/requirement/city/'; // default URL
    }

    return {
      name: prefectureName,
      value: value || '',
      id: radioId,
      url: url || '',
    };
  }

  // Get all prefecture data in a region
  async getAllPrefectureDataInRegion(regionSection: Locator): Promise<
    Array<{
      name: string;
      value: string;
      id: string;
      url: string;
    }>
  > {
    const labels = regionSection.locator('label');
    const count = await labels.count();
    const prefectureData = [];

    for (let i = 0; i < count; i++) {
      const label = labels.nth(i);
      const name = (await label.textContent())?.trim() || '';
      const radioId = await label.getAttribute('for');

      if (radioId) {
        const radioButton = this.page.locator(`#${radioId}`);
        const value = await radioButton.getAttribute('value');
        // Try to get URL, use default if not found
        let url = '';
        try {
          const linkElement = this.page.locator(`link-to-prefecture-select[data-key="${radioId}"]`);
          url = (await linkElement.getAttribute('data-url')) || '/search/requirement/city/';
        } catch {
          url = '/search/requirement/city/';
        }

        prefectureData.push({
          name,
          value: value || '',
          id: radioId,
          url: url || '',
        });
      }
    }

    return prefectureData;
  }

  // Convenience methods for specific prefectures (keeping for backward compatibility)
  async selectHokkaido(): Promise<void> {
    await this.selectPrefecture('北海道');
  }

  async selectTokyo(): Promise<void> {
    await this.selectPrefecture('東京都');
  }

  async selectOsaka(): Promise<void> {
    await this.selectPrefecture('大阪府');
  }

  async selectNagano(): Promise<void> {
    await this.selectPrefecture('長野県');
  }

  // Methods to expand/collapse regions
  async expandRegion(regionSection: Locator): Promise<void> {
    const trigger = regionSection.locator('.bjc-search-form--heading');
    await trigger.click();
    // Wait a bit for accordion animation
    await this.page.waitForTimeout(500);
  }

  async expandHokkaidoTohoku(): Promise<void> {
    await this.expandRegion(this.hokkaidoTohokuSection);
  }

  async expandKanto(): Promise<void> {
    await this.expandRegion(this.kantoSection);
  }

  async expandKansai(): Promise<void> {
    await this.expandRegion(this.kansaiSection);
  }

  // Check if prefecture is selected
  async isPrefectureSelected(prefectureName: string): Promise<boolean> {
    // Find the label with the prefecture name and get the associated radio button
    const label = this.page.locator(`label:has-text("${prefectureName}")`);
    const radioId = await label.getAttribute('for');
    if (radioId) {
      const radio = this.page.locator(`#${radioId}`);
      return await radio.isChecked();
    }
    return false;
  }

  // Get all visible prefectures in a region
  async getVisiblePrefecturesInRegion(regionSection: Locator): Promise<string[]> {
    const body = regionSection.locator('.bjc-search-form--body');
    const labels = body.locator('label');
    const count = await labels.count();
    const prefectures: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await labels.nth(i).textContent();
      if (text) {
        prefectures.push(text.trim());
      }
    }

    return prefectures;
  }

  async waitForPageToLoad(): Promise<void> {
    await this.pageTitle.waitFor({ state: 'visible' });
  }
}
