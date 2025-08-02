import { Page, Locator } from '@playwright/test';

export interface JukuExperienceCardData {
  href: string;
  title: string;
  year: number;
  startingDeviation: number;
  isPickup: boolean;
  iconSrc: string;
  experienceId: string;
}

export class JukuExperienceCard {
  readonly page: Page;
  readonly container: Locator;

  constructor(page: Page, containerSelector: string = '.bjc-posts-experience') {
    this.page = page;
    this.container = page.locator(containerSelector);
  }

  async getCardData(index?: number): Promise<JukuExperienceCardData> {
    const card =
      index !== undefined
        ? this.container.locator('.bjc-post-experience').nth(index)
        : this.container.locator('.bjc-post-experience').first();

    const href = (await card.getAttribute('href')) || '';
    const title = (await card.locator('.bjc-post-experience-title').textContent()) || '';
    const metaText = (await card.locator('.bjc-post-experience-meta').textContent()) || '';
    const iconSrc = (await card.locator('.bjc-post-experience-icon img').getAttribute('src')) || '';

    // Check if it's a pickup card
    const classAttr = (await card.getAttribute('class')) || '';
    const isPickup = classAttr.includes('pickup');

    // Extract year and starting deviation from meta text
    // Format: "受験年度：2024年度 / 開始偏差値50"
    const yearMatch = metaText.match(/受験年度：(\d{4})年度/);
    const deviationMatch = metaText.match(/開始偏差値(\d+)/);

    const year = yearMatch ? parseInt(yearMatch[1]) : 0;
    const startingDeviation = deviationMatch ? parseInt(deviationMatch[1]) : 0;

    // Extract experience ID from href
    const experienceIdMatch = href.match(/\/shingaku\/experience\/(\d+)\//);
    const experienceId = experienceIdMatch ? experienceIdMatch[1] : '';

    return {
      href,
      title: title.trim(),
      year,
      startingDeviation,
      isPickup,
      iconSrc,
      experienceId,
    };
  }

  async getAllCardData(containerSelector?: string): Promise<JukuExperienceCardData[]> {
    const cardsContainer = containerSelector
      ? this.page.locator(containerSelector)
      : this.page.locator('.bjc-posts-experience');

    const cards = cardsContainer.locator('.bjc-post-experience');
    const count = await cards.count();
    const cardDataArray: JukuExperienceCardData[] = [];

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);

      const href = (await card.getAttribute('href')) || '';
      const title = (await card.locator('.bjc-post-experience-title').textContent()) || '';
      const metaText = (await card.locator('.bjc-post-experience-meta').textContent()) || '';
      const iconSrc = (await card.locator('.bjc-post-experience-icon img').getAttribute('src')) || '';

      // Check if it's a pickup card
      const classAttr = (await card.getAttribute('class')) || '';
      const isPickup = classAttr.includes('pickup');

      // Extract year and starting deviation from meta text
      const yearMatch = metaText.match(/受験年度：(\d{4})年度/);
      const deviationMatch = metaText.match(/開始偏差値(\d+)/);

      const year = yearMatch ? parseInt(yearMatch[1]) : 0;
      const startingDeviation = deviationMatch ? parseInt(deviationMatch[1]) : 0;

      // Extract experience ID from href
      const experienceIdMatch = href.match(/\/shingaku\/experience\/(\d+)\//);
      const experienceId = experienceIdMatch ? experienceIdMatch[1] : '';

      cardDataArray.push({
        href,
        title: title.trim(),
        year,
        startingDeviation,
        isPickup,
        iconSrc,
        experienceId,
      });
    }

    return cardDataArray;
  }

  async clickCard(index?: number): Promise<void> {
    const card =
      index !== undefined
        ? this.container.locator('.bjc-post-experience').nth(index)
        : this.container.locator('.bjc-post-experience').first();
    await card.click();
  }

  async clickCardByTitle(titleText: string): Promise<void> {
    const cards = this.container.locator('.bjc-post-experience');
    const card = cards.filter({
      has: this.page.locator('.bjc-post-experience-title', { hasText: titleText }),
    });
    await card.click();
  }

  async clickCardByExperienceId(experienceId: string): Promise<void> {
    const card = this.container.locator(`.bjc-post-experience[href*="/shingaku/experience/${experienceId}/"]`);
    await card.click();
  }

  async getCardCount(containerSelector?: string): Promise<number> {
    const cardsContainer = containerSelector
      ? this.page.locator(containerSelector)
      : this.page.locator('.bjc-posts-experience');

    return await cardsContainer.locator('.bjc-post-experience').count();
  }

  async isCardVisible(index?: number): Promise<boolean> {
    const card =
      index !== undefined
        ? this.container.locator('.bjc-post-experience').nth(index)
        : this.container.locator('.bjc-post-experience').first();
    return await card.isVisible();
  }

  async getTitles(containerSelector?: string): Promise<string[]> {
    const cardData = await this.getAllCardData(containerSelector);
    return cardData.map((card) => card.title);
  }

  async getCardsByYear(year: number, containerSelector?: string): Promise<JukuExperienceCardData[]> {
    const allCards = await this.getAllCardData(containerSelector);
    return allCards.filter((card) => card.year === year);
  }

  async getCardsByDeviationRange(
    minDeviation: number,
    maxDeviation: number,
    containerSelector?: string,
  ): Promise<JukuExperienceCardData[]> {
    const allCards = await this.getAllCardData(containerSelector);
    return allCards.filter((card) => {
      return card.startingDeviation >= minDeviation && card.startingDeviation <= maxDeviation;
    });
  }

  async getPickupCards(containerSelector?: string): Promise<JukuExperienceCardData[]> {
    const allCards = await this.getAllCardData(containerSelector);
    return allCards.filter((card) => card.isPickup);
  }

  async waitForCardsToLoad(expectedCount?: number, timeout: number = 5000): Promise<void> {
    if (expectedCount !== undefined) {
      await this.page.waitForFunction(
        (count) => {
          const cards = document.querySelectorAll('.bjc-post-experience');
          return cards.length >= count;
        },
        expectedCount,
        { timeout },
      );
    } else {
      await this.container.locator('.bjc-post-experience').first().waitFor({ state: 'visible', timeout });
    }
  }
}
