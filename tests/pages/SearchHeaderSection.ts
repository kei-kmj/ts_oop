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
    const trigger = this.lineAccordionTriggers.filter({ hasText: lineName });
    await trigger.waitFor({ state: 'visible', timeout: 5000 });
    await trigger.click({ force: true });
    
    // Wait for the accordion animation to complete
    await this.page.waitForTimeout(1000);
    
    // Verify the accordion opened
    const targetLocator = trigger.locator('+ .bjc-search-form--station-list-accordion-target');
    await targetLocator.waitFor({ state: 'visible', timeout: 5000 });
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
    
    // Wait for the accordion to be open and visible
    await targetLocator.waitFor({ state: 'visible', timeout: 5000 });
    
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
    // Find all visible accordion targets that are open
    const openTargets = await this.accordionTargets.locator('.is-open').all();
    
    let stationToClick: any = null;
    
    // Search through open accordions for the station
    for (const target of openTargets) {
      const stationLinks = target.locator('.bjc-form--checkbox--wrap a.search-form');
      const exactMatch = stationLinks.filter({ hasText: new RegExp(`^\\s*${stationName}\\s*（\\d+件）\\s*$`) });
      const count = await exactMatch.count();
      
      if (count > 0) {
        stationToClick = exactMatch.first();
        break;
      }
    }
    
    // If exact match not found, try contains match in first open accordion
    if (!stationToClick && openTargets.length > 0) {
      const firstOpenTarget = openTargets[0];
      const stationLinks = firstOpenTarget.locator('.bjc-form--checkbox--wrap a.search-form');
      const containsMatch = stationLinks.filter({ hasText: stationName });
      const count = await containsMatch.count();
      
      if (count > 0) {
        stationToClick = containsMatch.first();
      }
    }
    
    if (stationToClick) {
      // Ensure the station is visible before clicking
      await stationToClick.waitFor({ state: 'visible', timeout: 5000 });
      await stationToClick.click({ force: true });
    } else {
      throw new Error(`Station "${stationName}" not found in any open accordion`);
    }
  }

  async getStationLink(stationName: string): Promise<Locator> {
    // Find station link in the first open accordion
    const openTargets = await this.accordionTargets.locator('.is-open').all();
    
    for (const target of openTargets) {
      const stationLinks = target.locator('.bjc-form--checkbox--wrap a.search-form');
      const exactMatch = stationLinks.filter({ hasText: new RegExp(`^\\s*${stationName}\\s*（\\d+件）\\s*$`) });
      const count = await exactMatch.count();
      
      if (count > 0) {
        return exactMatch.first();
      }
    }
    
    // Fallback to contains match
    for (const target of openTargets) {
      const stationLinks = target.locator('.bjc-form--checkbox--wrap a.search-form');
      const containsMatch = stationLinks.filter({ hasText: stationName });
      const count = await containsMatch.count();
      
      if (count > 0) {
        return containsMatch.first();
      }
    }
    
    // Return a locator that won't match anything if station not found
    return this.page.locator('non-existent-element');
  }

  async getStationHref(stationName: string): Promise<string> {
    const link = await this.getStationLink(stationName);
    return await link.getAttribute('href') || '';
  }

  async getStationCount(stationName: string): Promise<number> {
    // Find all visible accordion targets that are open
    const openTargets = await this.accordionTargets.locator('.is-open').all();
    
    // Search through open accordions for the station
    for (const target of openTargets) {
      const stationLinks = target.locator('.bjc-form--checkbox--wrap a.search-form');
      const exactMatch = stationLinks.filter({ hasText: new RegExp(`^\\s*${stationName}\\s*（\\d+件）\\s*$`) });
      const count = await exactMatch.count();
      
      if (count > 0) {
        const text = await exactMatch.first().textContent() || '';
        const match = text.match(/（(\d+)件）/);
        return match ? parseInt(match[1], 10) : 0;
      }
    }
    
    // If exact match not found, try contains match
    for (const target of openTargets) {
      const stationLinks = target.locator('.bjc-form--checkbox--wrap a.search-form');
      const containsMatch = stationLinks.filter({ hasText: stationName });
      const count = await containsMatch.count();
      
      if (count > 0) {
        const text = await containsMatch.first().textContent() || '';
        const match = text.match(/（(\d+)件）/);
        return match ? parseInt(match[1], 10) : 0;
      }
    }
    
    return 0;
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

  // Helper method to click station specifically within a given line context
  async clickStationInLine(stationName: string, lineName: string): Promise<void> {
    const trigger = this.lineAccordionTriggers.filter({ hasText: lineName });
    const targetLocator = trigger.locator('+ .bjc-search-form--station-list-accordion-target');
    
    // Ensure the accordion is open
    await targetLocator.waitFor({ state: 'visible', timeout: 5000 });
    
    const stationLinks = targetLocator.locator('.bjc-form--checkbox--wrap a.search-form');
    const exactMatch = stationLinks.filter({ hasText: new RegExp(`^\\s*${stationName}\\s*（\\d+件）\\s*$`) });
    const count = await exactMatch.count();
    
    if (count > 0) {
      await exactMatch.first().waitFor({ state: 'visible', timeout: 5000 });
      await exactMatch.first().click({ force: true });
    } else {
      // Try contains match as fallback
      const containsMatch = stationLinks.filter({ hasText: stationName });
      const containsCount = await containsMatch.count();
      
      if (containsCount > 0) {
        await containsMatch.first().waitFor({ state: 'visible', timeout: 5000 });
        await containsMatch.first().click({ force: true });
      } else {
        throw new Error(`Station "${stationName}" not found in line "${lineName}"`);
      }
    }
  }

  // Helper method to get station count specifically within a given line context
  async getStationCountInLine(stationName: string, lineName: string): Promise<number> {
    const trigger = this.lineAccordionTriggers.filter({ hasText: lineName });
    const targetLocator = trigger.locator('+ .bjc-search-form--station-list-accordion-target');
    
    // Ensure the accordion is open
    await targetLocator.waitFor({ state: 'visible', timeout: 5000 });
    
    const stationLinks = targetLocator.locator('.bjc-form--checkbox--wrap a.search-form');
    const exactMatch = stationLinks.filter({ hasText: new RegExp(`^\\s*${stationName}\\s*（\\d+件）\\s*$`) });
    const count = await exactMatch.count();
    
    if (count > 0) {
      const text = await exactMatch.first().textContent() || '';
      const match = text.match(/（(\d+)件）/);
      return match ? parseInt(match[1], 10) : 0;
    } else {
      // Try contains match as fallback
      const containsMatch = stationLinks.filter({ hasText: stationName });
      const containsCount = await containsMatch.count();
      
      if (containsCount > 0) {
        const text = await containsMatch.first().textContent() || '';
        const match = text.match(/（(\d+)件）/);
        return match ? parseInt(match[1], 10) : 0;
      }
    }
    
    return 0;
  }
}