import { Page, Locator } from '@playwright/test';

export interface ExperienceCardData {
  schoolName: string;
  year: string;
  startingDeviation: string;
  href: string;
  thumbnailSrc: string;
  experienceId: string;
}

export class ExperienceCard {
  readonly page: Page;
  readonly container: Locator;

  constructor(page: Page, containerSelector: string = '.bjp-home-experience__content') {
    this.page = page;
    this.container = page.locator(containerSelector);
  }

  async getCardData(index?: number): Promise<ExperienceCardData> {
    const card = index !== undefined ? this.container.nth(index) : this.container.first();
    
    const schoolName = await card.locator('.title .passed').textContent() || '';
    const text = await card.locator('.text').textContent() || '';
    const href = await card.getAttribute('href') || '';
    const thumbnailSrc = await card.locator('.bjp-home-experience__title-block-thumbnail img').getAttribute('src') || '';
    
    // Extract year and deviation from text (e.g., "2021年度年度 / 学習開始時の偏差値：58")
    const yearMatch = text.match(/(\d{4})年度/);
    const deviationMatch = text.match(/偏差値：(\d+)/);
    
    const year = yearMatch ? yearMatch[1] : '';
    const startingDeviation = deviationMatch ? deviationMatch[1] : '';
    
    // Extract experience ID from href
    const experienceIdMatch = href.match(/\/shingaku\/experience\/(\d+)\//);
    const experienceId = experienceIdMatch ? experienceIdMatch[1] : '';

    return {
      schoolName: schoolName.trim(),
      year,
      startingDeviation,
      href,
      thumbnailSrc,
      experienceId
    };
  }

  async getAllCardData(containerSelector?: string): Promise<ExperienceCardData[]> {
    const cardsContainer = containerSelector 
      ? this.page.locator(containerSelector)
      : this.page.locator('.bjp-home-experience__contents');
    
    const cards = cardsContainer.locator('.bjp-home-experience__content');
    const count = await cards.count();
    const cardDataArray: ExperienceCardData[] = [];

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      
      const schoolName = await card.locator('.title .passed').textContent() || '';
      const text = await card.locator('.text').textContent() || '';
      const href = await card.getAttribute('href') || '';
      const thumbnailSrc = await card.locator('.bjp-home-experience__title-block-thumbnail img').getAttribute('src') || '';
      
      const yearMatch = text.match(/(\d{4})年度/);
      const deviationMatch = text.match(/偏差値：(\d+)/);
      
      const year = yearMatch ? yearMatch[1] : '';
      const startingDeviation = deviationMatch ? deviationMatch[1] : '';
      
      const experienceIdMatch = href.match(/\/shingaku\/experience\/(\d+)\//);
      const experienceId = experienceIdMatch ? experienceIdMatch[1] : '';

      cardDataArray.push({
        schoolName: schoolName.trim(),
        year,
        startingDeviation,
        href,
        thumbnailSrc,
        experienceId
      });
    }

    return cardDataArray;
  }

  async clickCard(index?: number): Promise<void> {
    const card = index !== undefined ? this.container.nth(index) : this.container.first();
    await card.click();
  }

  async clickCardBySchoolName(schoolName: string): Promise<void> {
    const card = this.container.filter({ 
      has: this.page.locator('.title .passed', { hasText: schoolName })
    });
    await card.click();
  }

  async clickCardByExperienceId(experienceId: string): Promise<void> {
    const card = this.container.filter({ 
      has: this.page.locator(`[href*="/shingaku/experience/${experienceId}/"]`)
    });
    await card.click();
  }

  async getCardCount(containerSelector?: string): Promise<number> {
    const cardsContainer = containerSelector 
      ? this.page.locator(containerSelector)
      : this.page.locator('.bjp-home-experience__contents');
    
    return await cardsContainer.locator('.bjp-home-experience__content').count();
  }

  async isCardVisible(index?: number): Promise<boolean> {
    const card = index !== undefined ? this.container.nth(index) : this.container.first();
    return await card.isVisible();
  }

  async getSchoolNames(containerSelector?: string): Promise<string[]> {
    const cardData = await this.getAllCardData(containerSelector);
    return cardData.map(card => card.schoolName);
  }

  async getCardsByYear(year: string, containerSelector?: string): Promise<ExperienceCardData[]> {
    const allCards = await this.getAllCardData(containerSelector);
    return allCards.filter(card => card.year === year);
  }

  async getCardsByDeviationRange(minDeviation: number, maxDeviation: number, containerSelector?: string): Promise<ExperienceCardData[]> {
    const allCards = await this.getAllCardData(containerSelector);
    return allCards.filter(card => {
      const deviation = parseInt(card.startingDeviation);
      return deviation >= minDeviation && deviation <= maxDeviation;
    });
  }

  async waitForCardsToLoad(expectedCount?: number, timeout: number = 5000): Promise<void> {
    if (expectedCount !== undefined) {
      await this.page.waitForFunction(
        (count) => {
          const cards = document.querySelectorAll('.bjp-home-experience__content');
          return cards.length >= count;
        },
        expectedCount,
        { timeout }
      );
    } else {
      await this.container.first().waitFor({ state: 'visible', timeout });
    }
  }
}