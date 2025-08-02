import { Page, Locator } from '@playwright/test';

export interface InterviewCardData {
  href: string;
  gender: string;
  iconSrc: string;
  isPickup: boolean;
  balloonText: string;
  destination: string;
  passedSchools: string;
  mainJuku: string;
  concurrentJuku: string;
  interviewId: string;
}

export class InterviewCard {
  readonly page: Page;
  readonly container: Locator;

  constructor(page: Page, containerSelector: string = '.bjc-post-interview') {
    this.page = page;
    this.container = page.locator(containerSelector);
  }

  async getCardData(index?: number): Promise<InterviewCardData> {
    const card = index !== undefined ? this.container.nth(index) : this.container.first();

    const href = (await card.getAttribute('href')) || '';
    const gender = (await card.locator('.bjc-post-interview-icon span').textContent()) || '';
    const iconSrc = (await card.locator('.bjc-post-interview-icon img').getAttribute('src')) || '';
    const classAttr = (await card.getAttribute('class')) || '';
    const isPickup = classAttr.includes('pickup');
    const balloonText = (await card.locator('.bjc-post-interview-balloon').textContent()) || '';

    // Extract list items
    const listItems = card.locator('.bjc-post-interview-list li');
    const itemCount = await listItems.count();

    let destination = '';
    let passedSchools = '';
    let mainJuku = '';
    let concurrentJuku = '';

    for (let i = 0; i < itemCount; i++) {
      const item = listItems.nth(i);
      const label = (await item.locator('.bjc-post-interview-list-paragraph.bold').textContent()) || '';
      const value = (await item.locator('.bjc-post-interview-list-paragraph:not(.bold)').textContent()) || '';

      if (label.includes('進学先')) {
        destination = value.trim();
      } else if (label.includes('合格校')) {
        passedSchools = value.trim();
      } else if (label.includes('メインの塾')) {
        mainJuku = value.trim();
      } else if (label.includes('併塾')) {
        concurrentJuku = value.trim();
      }
    }

    // Extract interview ID from href
    const interviewIdMatch = href.match(/passed-interview\/(\d+)\//);
    const interviewId = interviewIdMatch ? interviewIdMatch[1] : '';

    return {
      href,
      gender: gender.trim(),
      iconSrc,
      isPickup,
      balloonText: balloonText.trim(),
      destination,
      passedSchools,
      mainJuku,
      concurrentJuku,
      interviewId,
    };
  }

  async getAllCardData(containerSelector?: string): Promise<InterviewCardData[]> {
    const cardsContainer = containerSelector
      ? this.page.locator(containerSelector)
      : this.page.locator('.bjc-posts-interview');

    const cards = cardsContainer.locator('.bjc-post-interview');
    const count = await cards.count();
    const cardDataArray: InterviewCardData[] = [];

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);

      const href = (await card.getAttribute('href')) || '';
      const gender = (await card.locator('.bjc-post-interview-icon span').textContent()) || '';
      const iconSrc = (await card.locator('.bjc-post-interview-icon img').getAttribute('src')) || '';
      const classAttr = (await card.getAttribute('class')) || '';
      const isPickup = classAttr.includes('pickup');
      const balloonText = (await card.locator('.bjc-post-interview-balloon').textContent()) || '';

      // Extract list items
      const listItems = card.locator('.bjc-post-interview-list li');
      const itemCount = await listItems.count();

      let destination = '';
      let passedSchools = '';
      let mainJuku = '';
      let concurrentJuku = '';

      for (let j = 0; j < itemCount; j++) {
        const item = listItems.nth(j);
        const label = (await item.locator('.bjc-post-interview-list-paragraph.bold').textContent()) || '';
        const value = (await item.locator('.bjc-post-interview-list-paragraph:not(.bold)').textContent()) || '';

        if (label.includes('進学先')) {
          destination = value.trim();
        } else if (label.includes('合格校')) {
          passedSchools = value.trim();
        } else if (label.includes('メインの塾')) {
          mainJuku = value.trim();
        } else if (label.includes('併塾')) {
          concurrentJuku = value.trim();
        }
      }

      const interviewIdMatch = href.match(/passed-interview\/(\d+)\//);
      const interviewId = interviewIdMatch ? interviewIdMatch[1] : '';

      cardDataArray.push({
        href,
        gender: gender.trim(),
        iconSrc,
        isPickup,
        balloonText: balloonText.trim(),
        destination,
        passedSchools,
        mainJuku,
        concurrentJuku,
        interviewId,
      });
    }

    return cardDataArray;
  }

  async clickCard(index?: number): Promise<void> {
    const card = index !== undefined ? this.container.nth(index) : this.container.first();
    await card.click();
  }

  async clickCardByDestination(destination: string): Promise<void> {
    const cards = await this.getAllCardData();
    const targetCard = cards.find((card) => card.destination.includes(destination));

    if (targetCard) {
      const card = this.container.filter({
        has: this.page.locator(`[href="${targetCard.href}"]`),
      });
      await card.click();
    }
  }

  async clickCardByJuku(jukuName: string): Promise<void> {
    const cards = await this.getAllCardData();
    const targetCard = cards.find((card) => card.mainJuku.includes(jukuName));

    if (targetCard) {
      const card = this.container.filter({
        has: this.page.locator(`[href="${targetCard.href}"]`),
      });
      await card.click();
    }
  }

  async clickCardByInterviewId(interviewId: string): Promise<void> {
    const card = this.container.filter({
      has: this.page.locator(`[href*="passed-interview/${interviewId}/"]`),
    });
    await card.click();
  }

  async getPickupCards(containerSelector?: string): Promise<InterviewCardData[]> {
    const allCards = await this.getAllCardData(containerSelector);
    return allCards.filter((card) => card.isPickup);
  }

  async getCardsByGender(gender: string, containerSelector?: string): Promise<InterviewCardData[]> {
    const allCards = await this.getAllCardData(containerSelector);
    return allCards.filter((card) => card.gender === gender);
  }

  async getCardsByJuku(jukuName: string, containerSelector?: string): Promise<InterviewCardData[]> {
    const allCards = await this.getAllCardData(containerSelector);
    return allCards.filter((card) => card.mainJuku.includes(jukuName) || card.concurrentJuku.includes(jukuName));
  }

  async getCardCount(containerSelector?: string): Promise<number> {
    const cardsContainer = containerSelector
      ? this.page.locator(containerSelector)
      : this.page.locator('.bjc-posts-interview');

    return await cardsContainer.locator('.bjc-post-interview').count();
  }

  async isCardVisible(index?: number): Promise<boolean> {
    const card = index !== undefined ? this.container.nth(index) : this.container.first();
    return await card.isVisible();
  }

  async waitForCardsToLoad(expectedCount?: number, timeout: number = 5000): Promise<void> {
    if (expectedCount !== undefined) {
      await this.page.waitForFunction(
        (count) => {
          const cards = document.querySelectorAll('.bjc-post-interview');
          return cards.length >= count;
        },
        expectedCount,
        { timeout },
      );
    } else {
      await this.container.first().waitFor({ state: 'visible', timeout });
    }
  }
}
