import { Page, Locator } from '@playwright/test';

export class SearchHeaderSection {
  readonly page: Page;
  readonly container: Locator;
  readonly backLink: Locator;
  readonly title: Locator;
  readonly stationSearchBox: Locator;
  readonly stationSearchInput: Locator;
  readonly lineAccordionTriggers: Locator;
  readonly accordionTargets: Locator;
  readonly stationLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Main container for the search header
    this.container = page.locator('.bjc-search-header.prefecture');
    
    // Back link
    this.backLink = this.container.locator('.bjc-search-history-back a');
    
    // Title
    this.title = this.container.locator('.bjc-search-header-title');
    
    // Station search box container
    this.stationSearchBox = page.locator('.bjc-form--box .bjc-select-box-main');
    
    // Station search input field
    this.stationSearchInput = this.stationSearchBox.locator('.bjc-station-search-box__input');
    
    // Line accordion triggers
    this.lineAccordionTriggers = page.locator('.bjc-search-form--station-list-accordion-trigger');
    
    // Accordion target containers (opened accordion content)
    this.accordionTargets = page.locator('.bjc-search-form--station-list-accordion-target');
    
    // Station links within accordion targets
    this.stationLinks = this.accordionTargets.locator('.bjc-form--checkbox--wrap a.search-form');
  }

  async clickBack(): Promise<void> {
    await this.backLink.click();
  }

  async getTitle(): Promise<string> {
    return await this.title.textContent() || '';
  }

  async getBackLinkText(): Promise<string> {
    return await this.backLink.textContent() || '';
  }

  async getBackLinkHref(): Promise<string> {
    return await this.backLink.getAttribute('href') || '';
  }

  async isVisible(): Promise<boolean> {
    return await this.container.isVisible();
  }

  async isTitleVisible(): Promise<boolean> {
    return await this.title.isVisible();
  }

  async isBackLinkVisible(): Promise<boolean> {
    return await this.backLink.isVisible();
  }

  async waitForLoad(): Promise<void> {
    await this.container.waitFor({ state: 'visible' });
    await this.title.waitFor({ state: 'visible' });
    await this.backLink.waitFor({ state: 'visible' });
  }

  async searchStation(stationName: string): Promise<void> {
    await this.stationSearchInput.click({ force: true });
    await this.stationSearchInput.fill(stationName);
  }

  async clearStationSearch(): Promise<void> {
    await this.stationSearchInput.clear();
  }

  async getStationSearchPlaceholder(): Promise<string> {
    return await this.stationSearchBox.locator('.bjc-station-search-box__placeholder').textContent() || '';
  }

  async isStationSearchBoxVisible(): Promise<boolean> {
    return await this.stationSearchBox.isVisible();
  }

  async isStationSearchInputVisible(): Promise<boolean> {
    return await this.stationSearchInput.isVisible();
  }

  async getStationOptions(): Promise<string[]> {
    const options = await this.page.locator('.bjc-station-search-box__option').all();
    const optionTexts: string[] = [];
    for (const option of options) {
      const text = await option.textContent();
      if (text) optionTexts.push(text.trim());
    }
    return optionTexts;
  }

  async selectStationOption(stationName: string): Promise<void> {
    await this.page.locator('.bjc-station-search-box__option').filter({ hasText: stationName }).click();
  }

  async clickLineAccordion(lineName: string): Promise<void> {
    await this.lineAccordionTriggers.filter({ hasText: lineName }).click();
  }

  async getLineAccordionTrigger(lineName: string): Promise<Locator> {
    return this.lineAccordionTriggers.filter({ hasText: lineName });
  }

  async isLineAccordionVisible(lineName: string): Promise<boolean> {
    return await this.lineAccordionTriggers.filter({ hasText: lineName }).isVisible();
  }

  async getAllLineNames(): Promise<string[]> {
    const lines = await this.lineAccordionTriggers.all();
    const lineNames: string[] = [];
    for (const line of lines) {
      const text = await line.textContent();
      if (text) lineNames.push(text.trim());
    }
    return lineNames;
  }

  async isAccordionOpen(lineName: string): Promise<boolean> {
    // Wait a bit for animation to complete
    await this.page.waitForTimeout(500);
    
    const trigger = this.lineAccordionTriggers.filter({ hasText: lineName });
    const targetLocator = trigger.locator('+ .bjc-search-form--station-list-accordion-target');
    
    try {
      await targetLocator.waitFor({ state: 'visible', timeout: 3000 });
      const hasClass = await targetLocator.getAttribute('class');
      return hasClass ? hasClass.includes('is-open') : false;
    } catch {
      return false;
    }
  }

  async getStationsInLine(lineName: string): Promise<string[]> {
    const trigger = this.lineAccordionTriggers.filter({ hasText: lineName });
    const targetLocator = trigger.locator('+ .bjc-search-form--station-list-accordion-target');
    const stationLinks = targetLocator.locator('.bjc-form--checkbox--wrap a.search-form');
    
    const stations = await stationLinks.all();
    const stationNames: string[] = [];
    for (const station of stations) {
      const text = await station.textContent();
      if (text) {
        // Remove count information like "（20件）" and keep only station name
        const cleanText = text.replace(/\s*（\d+件）\s*/g, '').trim();
        stationNames.push(cleanText);
      }
    }
    return stationNames;
  }

  async clickStation(stationName: string): Promise<void> {
    // Try exact match first, then fallback to contains match
    const exactMatch = this.stationLinks.filter({ hasText: new RegExp(`^\\s*${stationName}\\s*（\\d+件）\\s*$`) });
    const exactCount = await exactMatch.count();
    
    if (exactCount > 0) {
      await exactMatch.first().click();
    } else {
      await this.stationLinks.filter({ hasText: stationName }).first().click();
    }
  }

  async getStationLink(stationName: string): Promise<Locator> {
    return this.stationLinks.filter({ hasText: stationName });
  }

  async getStationHref(stationName: string): Promise<string> {
    const link = this.stationLinks.filter({ hasText: stationName });
    return await link.getAttribute('href') || '';
  }

  async getStationCount(stationName: string): Promise<number> {
    const link = this.stationLinks.filter({ hasText: stationName });
    const text = await link.textContent() || '';
    const match = text.match(/（(\d+)件）/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async getAllStationsInOpenAccordions(): Promise<string[]> {
    const openTargets = this.accordionTargets.locator('.is-open');
    const stationLinks = openTargets.locator('.bjc-form--checkbox--wrap a.search-form');
    
    const stations = await stationLinks.all();
    const stationNames: string[] = [];
    for (const station of stations) {
      const text = await station.textContent();
      if (text) {
        const cleanText = text.replace(/\s*（\d+件）\s*/g, '').trim();
        stationNames.push(cleanText);
      }
    }
    return stationNames;
  }
}