import { Page, Locator } from '@playwright/test';

export interface JukuCourseCardData {
  href: string;
  title: string;
  description: string;
  subjects: string[];
  courseId: string;
  iconSrc: string;
}

export class JukuCourseCard {
  readonly page: Page;
  readonly container: Locator;

  constructor(page: Page, containerSelector: string = '.bjc-posts-course') {
    this.page = page;
    this.container = page.locator(containerSelector);
  }

  async getCardData(index?: number): Promise<JukuCourseCardData> {
    const card =
      index !== undefined
        ? this.container.locator('.bjc-post-course').nth(index)
        : this.container.locator('.bjc-post-course').first();

    const href = (await card.getAttribute('href')) || '';
    const title = (await card.locator('.bjc-post-course-title').textContent()) || '';
    const description = (await card.locator('.bjc-post-course-paragraph').first().textContent()) || '';
    const iconSrc = (await card.locator('.bjc-post-course-icon img').getAttribute('src')) || '';

    // Extract subjects from the description
    // Look for pattern like "《科目：英語 / 数学 / 国語 / 理科 / 社会》"
    const fullDescription = (await card.locator('.bju-line-clamp-3').textContent()) || '';
    const subjectMatch = fullDescription.match(/《科目：([^》]+)》/);
    const subjects = subjectMatch
      ? subjectMatch[1]
          .split(' / ')
          .map((s) => s.trim())
          .filter((s) => s !== '他')
      : [];

    // Extract course ID from href
    const courseIdMatch = href.match(/\/juku\/\d+\/course\/(\d+)\//);
    const courseId = courseIdMatch ? courseIdMatch[1] : '';

    return {
      href,
      title: title.trim(),
      description: description.trim(),
      subjects,
      courseId,
      iconSrc,
    };
  }

  async getAllCardData(containerSelector?: string): Promise<JukuCourseCardData[]> {
    const cardsContainer = containerSelector
      ? this.page.locator(containerSelector)
      : this.page.locator('.bjc-posts-course');

    const cards = cardsContainer.locator('.bjc-post-course');
    const count = await cards.count();
    const cardDataArray: JukuCourseCardData[] = [];

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);

      const href = (await card.getAttribute('href')) || '';
      const title = (await card.locator('.bjc-post-course-title').textContent()) || '';
      const description = (await card.locator('.bjc-post-course-paragraph').first().textContent()) || '';
      const iconSrc = (await card.locator('.bjc-post-course-icon img').getAttribute('src')) || '';

      // Extract subjects from the description
      const fullDescription = (await card.locator('.bju-line-clamp-3').textContent()) || '';
      const subjectMatch = fullDescription.match(/《科目：([^》]+)》/);
      const subjects = subjectMatch
        ? subjectMatch[1]
            .split(' / ')
            .map((s) => s.trim())
            .filter((s) => s !== '他')
        : [];

      // Extract course ID from href
      const courseIdMatch = href.match(/\/juku\/\d+\/course\/(\d+)\//);
      const courseId = courseIdMatch ? courseIdMatch[1] : '';

      cardDataArray.push({
        href,
        title: title.trim(),
        description: description.trim(),
        subjects,
        courseId,
        iconSrc,
      });
    }

    return cardDataArray;
  }

  async clickCard(index?: number): Promise<void> {
    const card =
      index !== undefined
        ? this.container.locator('.bjc-post-course').nth(index)
        : this.container.locator('.bjc-post-course').first();
    await card.click();
  }

  async clickCardByTitle(titleText: string): Promise<void> {
    const cards = this.container.locator('.bjc-post-course');
    const card = cards.filter({
      has: this.page.locator('.bjc-post-course-title', { hasText: titleText }),
    });
    await card.click();
  }

  async clickCardByCourseId(courseId: string): Promise<void> {
    const card = this.container.locator(`.bjc-post-course[href*="/course/${courseId}/"]`);
    await card.click();
  }

  async getCardCount(containerSelector?: string): Promise<number> {
    const cardsContainer = containerSelector
      ? this.page.locator(containerSelector)
      : this.page.locator('.bjc-posts-course');

    return await cardsContainer.locator('.bjc-post-course').count();
  }

  async isCardVisible(index?: number): Promise<boolean> {
    const card =
      index !== undefined
        ? this.container.locator('.bjc-post-course').nth(index)
        : this.container.locator('.bjc-post-course').first();
    return await card.isVisible();
  }

  async getCourseTitles(containerSelector?: string): Promise<string[]> {
    const cardData = await this.getAllCardData(containerSelector);
    return cardData.map((card) => card.title);
  }

  async getCoursesBySubject(subject: string, containerSelector?: string): Promise<JukuCourseCardData[]> {
    const allCards = await this.getAllCardData(containerSelector);
    return allCards.filter((card) => card.subjects.includes(subject));
  }

  async getExamPreparationCourses(containerSelector?: string): Promise<JukuCourseCardData[]> {
    const allCards = await this.getAllCardData(containerSelector);
    return allCards.filter((card) => card.title.includes('受験対策') || card.title.includes('対策コース'));
  }

  async getRegularCourses(containerSelector?: string): Promise<JukuCourseCardData[]> {
    const allCards = await this.getAllCardData(containerSelector);
    return allCards.filter((card) => card.title.includes('向けコース') && !card.title.includes('受験対策'));
  }

  async waitForCardsToLoad(expectedCount?: number, timeout: number = 5000): Promise<void> {
    if (expectedCount !== undefined) {
      await this.page.waitForFunction(
        (count) => {
          const cards = document.querySelectorAll('.bjc-post-course');
          return cards.length >= count;
        },
        expectedCount,
        { timeout },
      );
    } else {
      await this.container.locator('.bjc-post-course').first().waitFor({ state: 'visible', timeout });
    }
  }
}
