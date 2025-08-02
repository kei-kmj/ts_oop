import { Base } from './Base';
import type { Locator, Page } from '@playwright/test';
import { HEADER, BUTTONS } from '../fixtures/global';
import { ReviewFilterModal } from './components/ReviewFilterModal';

export class ClassroomReview extends Base {
  readonly title: Locator;
  readonly titleBrandLink: Locator;
  readonly reviewFilterModal: ReviewFilterModal;
  readonly filterButton: Locator;
  readonly articles: Locator;
  readonly firstArticle: Locator;
  readonly noReviewMessage: Locator;
  readonly jukuReviewListLink: Locator;
  readonly classroomTopLink: Locator;
  private static readonly EXPECTED_TITLE_LINES = 2;

  constructor(page: Page) {
    super(page);
    this.title = page.getByRole('heading', {
      name: /.*の口コミ・評判/,
      level: HEADER.H1,
    });
    this.titleBrandLink = this.title.locator('.bjc-page-header-title--brand-name');
    this.reviewFilterModal = new ReviewFilterModal(page);
    this.filterButton = page.getByRole('button', { name: BUTTONS.FILTER });
    this.articles = page.locator('.bjc-review-article');
    this.firstArticle = this.articles.first();
    this.noReviewMessage = page.getByText(/この教室にはまだ口コミがありません。/);
    this.jukuReviewListLink = this.articles;
    this.classroomTopLink = page.locator('.bjc-links--text').getByRole('link', { name: /のトップページへ戻る/ });
  }

  async gotoClassroomReview(brandId: string, classroomId: string): Promise<void> {
    await super.goto(`/juku/${brandId}/class/${classroomId}/review/`);
  }

  async clickFilterButton(): Promise<void> {
    await this.filterButton.click();
  }

  async clickFirstReviewArticle(): Promise<void> {
    await this.firstArticle.click();
  }

  async hasClassroomNameAfterBrandLink(): Promise<boolean> {
    const fullText = await this.title.textContent();
    if (!fullText) return false;

    const lines = fullText.split('\n').filter((line) => line.trim());

    return lines.length === ClassroomReview.EXPECTED_TITLE_LINES;
  }

  async clickClassroomTopLink(): Promise<void> {
    await this.classroomTopLink.click();
  }
}
