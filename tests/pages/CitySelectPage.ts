import { Page, Locator } from '@playwright/test';
import { Base } from './Base';

export class CitySelectPage extends Base {
  readonly backLink: Locator;
  readonly pageTitle: Locator;
  readonly lastSearchConditionSection: Locator;
  readonly lastSearchConditionText: Locator;
  readonly cityLinksContainer: Locator;
  readonly cityLinks: Locator;

  constructor(page: Page) {
    super(page);
    
    // Header elements
    this.backLink = page.getByRole('link', { name: '戻る' });
    this.pageTitle = page.getByRole('heading', { level: 1 });
    
    // Last search condition
    this.lastSearchConditionSection = page.locator('#last-search-condition');
    this.lastSearchConditionText = this.lastSearchConditionSection.locator('.bjc-search-history-text');
    
    // City links - use more generic approach
    this.cityLinksContainer = page.locator('main, .main-content');
    this.cityLinks = page.locator('a[href*="/search/requirement/grade/"]');
  }

  async goto(prefecture?: string) {
    const url = prefecture ? `/search/requirement/city/?prefecture=${prefecture}` : '/search/requirement/city/';
    await super.goto(url);
  }

  async clickBackLink(): Promise<void> {
    await this.backLink.click();
  }

  async getLastSearchConditionText(): Promise<string> {
    return await this.lastSearchConditionText.textContent() || '';
  }

  async hasLastSearchCondition(): Promise<boolean> {
    return await this.lastSearchConditionSection.isVisible();
  }

  // Dynamic city selection methods
  async selectCity(cityName: string): Promise<void> {
    // Find city by name (excluding the count in parentheses)
    const cityLink = this.page.getByRole('link').filter({ hasText: cityName }).first();
    await cityLink.click();
  }

  async selectCityByExactText(cityText: string): Promise<void> {
    // Select by exact text including count
    const cityLink = this.page.getByRole('link', { name: cityText });
    await cityLink.click();
  }

  async selectCityByHref(href: string): Promise<void> {
    // Select by href attribute
    const cityLink = this.page.locator(`a[href="${href}"]`);
    await cityLink.click();
  }

  // Helper method to get city data
  async getCityData(cityName: string): Promise<{
    name: string;
    fullText: string;
    count: number;
    href: string;
    prefecture: string;
    addressCode: string;
  } | null> {
    const cityLink = this.page.getByRole('link').filter({ hasText: cityName }).first();
    const count = await cityLink.count();
    
    if (count === 0) {
      return null;
    }

    const fullText = await cityLink.textContent() || '';
    const href = await cityLink.getAttribute('href') || '';
    
    // Extract count from text like "札幌市（1721件）"
    const countMatch = fullText.match(/（(\d+)件）/);
    const resultCount = countMatch ? parseInt(countMatch[1], 10) : 0;
    
    // Extract prefecture and address code from href
    const urlParams = new URLSearchParams(href.split('?')[1] || '');
    const prefecture = urlParams.get('prefecture') || '';
    const addressCode = urlParams.get('address_code_and_upper') || '';

    return {
      name: cityName,
      fullText,
      count: resultCount,
      href,
      prefecture,
      addressCode
    };
  }

  // Get all city data on the page
  async getAllCityData(): Promise<Array<{
    name: string;
    fullText: string;
    count: number;
    href: string;
    prefecture: string;
    addressCode: string;
  }>> {
    const links = this.cityLinks;
    const linkCount = await links.count();
    const cityData = [];

    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const fullText = await link.textContent() || '';
      const href = await link.getAttribute('href') || '';
      
      // Extract city name (remove count part)
      const nameMatch = fullText.match(/^([^（]+)/);
      const name = nameMatch ? nameMatch[1].trim() : fullText;
      
      // Extract count
      const countMatch = fullText.match(/（(\d+)件）/);
      const count = countMatch ? parseInt(countMatch[1], 10) : 0;
      
      // Extract URL parameters
      const urlParams = new URLSearchParams(href.split('?')[1] || '');
      const prefecture = urlParams.get('prefecture') || '';
      const addressCode = urlParams.get('address_code_and_upper') || '';

      cityData.push({
        name,
        fullText,
        count,
        href,
        prefecture,
        addressCode
      });
    }

    return cityData;
  }

  // Get cities with specific count range
  async getCitiesWithCountRange(minCount: number, maxCount: number): Promise<Array<{
    name: string;
    fullText: string;
    count: number;
    href: string;
    prefecture: string;
    addressCode: string;
  }>> {
    const allCities = await this.getAllCityData();
    return allCities.filter(city => city.count >= minCount && city.count <= maxCount);
  }

  // Get city with highest count
  async getCityWithHighestCount(): Promise<{
    name: string;
    fullText: string;
    count: number;
    href: string;
    prefecture: string;
    addressCode: string;
  } | null> {
    const allCities = await this.getAllCityData();
    if (allCities.length === 0) return null;
    
    return allCities.reduce((max, city) => city.count > max.count ? city : max);
  }

  // Search for cities by name pattern
  async searchCitiesByPattern(pattern: RegExp): Promise<Array<{
    name: string;
    fullText: string;
    count: number;
    href: string;
    prefecture: string;
    addressCode: string;
  }>> {
    const allCities = await this.getAllCityData();
    return allCities.filter(city => pattern.test(city.name));
  }

  async waitForPageToLoad(): Promise<void> {
    await this.pageTitle.waitFor({ state: 'visible' });
    // Wait for at least one city link to appear
    await this.cityLinks.first().waitFor({ state: 'visible' });
  }

  async getCityCount(): Promise<number> {
    return await this.cityLinks.count();
  }
}