import { Page, Locator } from '@playwright/test';
import { Base } from './Base';
import { CSS_CLASSES } from '../fixtures/global';

export interface JukuHeaderData {
  name: string;
  rating: number;
  reviewCount: number;
  targetGrades: string[];
  lessonFormats: string[];
}

export class JukuHeader extends Base {
  readonly container: Locator;
  readonly title: Locator;
  readonly evaluationSection: Locator;
  readonly evaluationStars: Locator;
  readonly evaluationAverage: Locator;
  readonly evaluationCount: Locator;
  readonly evaluationCountLink: Locator;
  readonly tagSection: Locator;
  readonly gradeTagHeading: Locator;
  readonly gradeTagList: Locator;
  readonly lessonTagHeading: Locator;
  readonly lessonTagList: Locator;

  constructor(page: Page) {
    super(page);

    // Main container
    this.container = page.locator(CSS_CLASSES.JUKU_HEADER_BOX);

    // Title
    this.title = this.container.getByRole('heading', { level: 1 });

    // Evaluation section
    this.evaluationSection = this.container.locator('.bjc-juku-header-evaluation');
    this.evaluationStars = this.evaluationSection.locator('.bjc-juku-header-evaluation-star');
    this.evaluationAverage = this.evaluationSection.locator('.bjc-juku-header-evaluation-average_number');
    this.evaluationCount = this.evaluationSection.locator('.bjc-juku-header-evaluation-number');
    this.evaluationCountLink = this.evaluationCount.locator('a');

    // Tag section
    this.tagSection = this.container.locator('.bjc-juku-header-tag');

    // Grade tags
    this.gradeTagHeading = this.tagSection.locator('.bjc-juku-header-tag-row').filter({
      has: page.getByText('対象学年'),
    });
    this.gradeTagList = this.gradeTagHeading.locator('.bjc-juku-header-tag-list.grade');

    // Lesson format tags
    this.lessonTagHeading = this.tagSection.locator('.bjc-juku-header-tag-row').filter({
      has: page.getByText('授業形式'),
    });
    this.lessonTagList = this.lessonTagHeading.locator('.bjc-juku-header-tag-list.lesson');
  }

  async goto(brandId: string): Promise<void> {
    await super.goto(`/juku/${brandId}/`);
  }

  async getJukuName(): Promise<string> {
    return (await this.title.textContent()) || '';
  }

  async getRating(): Promise<number> {
    const ratingText = (await this.evaluationAverage.textContent()) || '0';
    return parseFloat(ratingText);
  }

  async getStarCount(): Promise<{
    full: number;
    half: number;
    inert: number;
    total: number;
  }> {
    const stars = await this.evaluationStars.locator('.bjc-evaluation-star').all();
    let full = 0;
    let half = 0;
    let inert = 0;

    for (const star of stars) {
      const classes = (await star.getAttribute('class')) || '';
      if (classes.includes('half')) {
        half++;
      } else if (classes.includes('inert')) {
        inert++;
      } else {
        full++;
      }
    }

    return {
      full,
      half,
      inert,
      total: stars.length,
    };
  }

  async getReviewCount(): Promise<number> {
    const countText = (await this.evaluationCountLink.textContent()) || '';
    const match = countText.match(/\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async getReviewLinkHref(): Promise<string> {
    return (await this.evaluationCountLink.getAttribute('href')) || '';
  }

  async clickReviewLink(): Promise<void> {
    await this.evaluationCountLink.click();
  }

  async getTargetGrades(): Promise<string[]> {
    const items = await this.gradeTagList.locator('li').all();
    const grades: string[] = [];

    for (const item of items) {
      const text = await item.textContent();
      if (text) grades.push(text.trim());
    }

    return grades;
  }

  async getLessonFormats(): Promise<string[]> {
    const items = await this.lessonTagList.locator('li').all();
    const formats: string[] = [];

    for (const item of items) {
      const text = await item.textContent();
      if (text) formats.push(text.trim());
    }

    return formats;
  }

  async hasOnlineSupport(): Promise<boolean> {
    const formats = await this.getLessonFormats();
    return formats.some((format) => format.includes('オンライン'));
  }

  async isIndividualTutoring(): Promise<boolean> {
    const formats = await this.getLessonFormats();
    return formats.some((format) => format.includes('個別') || format.includes('1対1'));
  }

  async getJukuHeaderData(): Promise<JukuHeaderData> {
    const [name, rating, reviewCount, targetGrades, lessonFormats] = await Promise.all([
      this.getJukuName(),
      this.getRating(),
      this.getReviewCount(),
      this.getTargetGrades(),
      this.getLessonFormats(),
    ]);

    return {
      name,
      rating,
      reviewCount,
      targetGrades,
      lessonFormats,
    };
  }

  async isVisible(): Promise<boolean> {
    return await this.container.isVisible();
  }

  async isTitleVisible(): Promise<boolean> {
    return await this.title.isVisible();
  }

  async isEvaluationVisible(): Promise<boolean> {
    return await this.evaluationSection.isVisible();
  }

  async areTagsVisible(): Promise<boolean> {
    return await this.tagSection.isVisible();
  }

  async waitForHeaderToLoad(): Promise<void> {
    await this.container.waitFor({ state: 'visible' });
    await this.title.waitFor({ state: 'visible' });
    await this.evaluationSection.waitFor({ state: 'visible' });
  }

  async verifyRatingConsistency(): Promise<boolean> {
    const rating = await this.getRating();
    const starCount = await this.getStarCount();

    // Calculate expected stars based on rating
    const expectedFull = Math.floor(rating);
    const remainder = rating % 1;

    // Half star is shown for ratings with decimal >= 0.3 and < 0.8
    const expectedHalf = remainder >= 0.3 && remainder < 0.8 ? 1 : 0;

    // If remainder >= 0.8, it rounds up to a full star
    const roundedUp = remainder >= 0.8 ? 1 : 0;

    const expectedTotal = 5;
    const actualFullStars = starCount.full;
    const expectedFullStars = expectedFull + roundedUp;

    return (
      actualFullStars === expectedFullStars && starCount.half === expectedHalf && starCount.total === expectedTotal
    );
  }

  async getGradeRange(): Promise<{
    minGrade: string;
    maxGrade: string;
    includesAll: boolean;
  }> {
    const grades = await this.getTargetGrades();
    if (grades.length === 0) {
      return { minGrade: '', maxGrade: '', includesAll: false };
    }

    const gradeText = grades[0]; // Assuming format like "小学1年生〜高卒生"
    const match = gradeText.match(/(.+)〜(.+)/);

    if (match) {
      return {
        minGrade: match[1].trim(),
        maxGrade: match[2].trim(),
        includesAll: true,
      };
    }

    return {
      minGrade: gradeText,
      maxGrade: gradeText,
      includesAll: false,
    };
  }

  async getFormattedReviewText(): Promise<string> {
    const rating = await this.getRating();
    const count = await this.getReviewCount();
    return `${rating} (${count}件)`;
  }

  async getAllTagInfo(): Promise<{
    grades: {
      heading: string;
      items: string[];
    };
    lessonFormats: {
      heading: string;
      items: string[];
    };
  }> {
    const gradeHeading = (await this.gradeTagHeading.locator('.bjc-juku-header-tag-heading').textContent()) || '';
    const lessonHeading = (await this.lessonTagHeading.locator('.bjc-juku-header-tag-heading').textContent()) || '';

    const grades = await this.getTargetGrades();
    const lessonFormats = await this.getLessonFormats();

    return {
      grades: {
        heading: gradeHeading.trim(),
        items: grades,
      },
      lessonFormats: {
        heading: lessonHeading.trim(),
        items: lessonFormats,
      },
    };
  }
}
