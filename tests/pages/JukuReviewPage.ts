import { Page, Locator } from '@playwright/test';
import { Base } from './Base';
import { ReviewNavigation } from './components/ReviewNavigation';
import { ReviewCategoryFilter } from './components/ReviewCategoryFilter';
import { ReviewFilterModal } from './components/ReviewFilterModal';

export class JukuReviewPage extends Base {
  readonly reviewNavigation: ReviewNavigation;
  readonly categoryFilter: ReviewCategoryFilter;
  readonly filterModal: ReviewFilterModal;
  readonly reviewContainer: Locator;
  readonly reviewItems: Locator;
  readonly reviewCards: Locator;
  readonly loadMoreButton: Locator;
  readonly reviewCount: Locator;
  readonly filterModalButton: Locator;

  constructor(page: Page) {
    super(page);
    this.reviewNavigation = new ReviewNavigation(page);
    this.categoryFilter = new ReviewCategoryFilter(page);
    this.filterModal = new ReviewFilterModal(page);
    this.reviewContainer = page.locator('.bjc-juku-inner');
    this.reviewItems = page.locator('.bjc-review-item');
    this.reviewCards = page.locator('a.bjc-review-article');
    this.loadMoreButton = page.getByRole('button', { name: 'もっと見る' });
    this.reviewCount = page.locator('.bjc-review-search_result--number');
    this.filterModalButton = page.getByRole('button', { name: '絞り込み' });
  }

  async goto(jukuId: string, category?: string): Promise<void> {
    const path = category 
      ? `/juku/${jukuId}/review/?category=${category}`
      : `/juku/${jukuId}/review/`;
    await super.goto(path);
  }

  async waitForPageToLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for review cards to be loaded
    await this.reviewCards.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {
      // If no review cards, wait for navigation to be visible
      return this.reviewNavigation.navContainer.waitFor({ state: 'visible', timeout: 5000 });
    });
  }

  async getReviewCount(): Promise<number> {
    const countText = await this.reviewCount.textContent();
    const match = countText?.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  async getReviewItems(): Promise<Locator[]> {
    return await this.reviewItems.all();
  }

  async getReviewCards(): Promise<Locator[]> {
    return await this.reviewCards.all();
  }

  async getReviewCardData(index: number): Promise<{
    href: string | null;
    heading: string;
    title: string;
    meta: string;
    rating: number;
    ratingText: string;
    date: string;
    content: string;
  }> {
    const card = this.reviewCards.nth(index);
    
    const href = await card.getAttribute('href');
    const heading = await card.locator('.bjc-review-article--header-heading').textContent() || '';
    const title = await card.locator('.bjc-review-article--header-title').textContent() || '';
    const meta = await card.locator('.bjc-review-article--meta-txt').textContent() || '';
    const ratingText = await card.locator('.bjc-evaluation-average_number').textContent() || '';
    const rating = parseInt(ratingText, 10) || 0;
    const date = await card.locator('.bjc-evaluation-period').textContent() || '';
    const content = await card.locator('.bjc-review-article--content').textContent() || '';

    return {
      href,
      heading: heading.trim(),
      title: title.trim(),
      meta: meta.trim(),
      rating,
      ratingText: ratingText.trim(),
      date: date.trim(),
      content: content.trim()
    };
  }

  async getReviewData(index: number): Promise<{
    title: string;
    rating: string;
    date: string;
    content: string;
    respondent?: string;
  }> {
    const review = this.reviewItems.nth(index);
    
    const title = await review.locator('.bjc-review-title').textContent() || '';
    const rating = await review.locator('.bjc-review-rating').textContent() || '';
    const date = await review.locator('.bjc-review-date').textContent() || '';
    const content = await review.locator('.bjc-review-content').textContent() || '';
    const respondent = await review.locator('.bjc-review-respondent').textContent() || '';

    return {
      title: title.trim(),
      rating: rating.trim(),
      date: date.trim(),
      content: content.trim(),
      respondent: respondent.trim() || undefined
    };
  }

  async getAllReviewsData(): Promise<Array<{
    title: string;
    rating: string;
    date: string;
    content: string;
    respondent?: string;
  }>> {
    const reviews = await this.getReviewItems();
    const reviewsData = [];

    for (let i = 0; i < reviews.length; i++) {
      const data = await this.getReviewData(i);
      reviewsData.push(data);
    }

    return reviewsData;
  }

  async getAllReviewCardsData(): Promise<Array<{
    href: string | null;
    heading: string;
    title: string;
    meta: string;
    rating: number;
    ratingText: string;
    date: string;
    content: string;
  }>> {
    const cards = await this.getReviewCards();
    const cardsData = [];

    for (let i = 0; i < cards.length; i++) {
      const data = await this.getReviewCardData(i);
      cardsData.push(data);
    }

    return cardsData;
  }

  async loadMoreReviews(): Promise<void> {
    const isVisible = await this.loadMoreButton.isVisible();
    if (isVisible) {
      await this.loadMoreButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async loadAllReviews(): Promise<void> {
    while (await this.loadMoreButton.isVisible()) {
      await this.loadMoreReviews();
    }
  }

  async filterByCategory(category: 'teacher' | 'curriculum' | 'support' | 'access' | 'home'): Promise<void> {
    await this.categoryFilter.filterByCategory(category);
    await this.waitForPageToLoad();
  }

  async navigateToRespondentView(): Promise<void> {
    await this.reviewNavigation.navigateToRespondentPage();
  }

  async navigateToExperienceView(): Promise<void> {
    await this.reviewNavigation.navigateToExperiencePage();
  }

  async getCurrentView(): Promise<'category' | 'respondent' | 'experience'> {
    if (await this.reviewNavigation.isTabActive('category')) {
      return 'category';
    } else if (await this.reviewNavigation.isTabActive('respondent')) {
      return 'respondent';
    } else {
      return 'experience';
    }
  }

  async hasReviews(): Promise<boolean> {
    return (await this.getReviewCount()) > 0;
  }

  async searchReviewsByKeyword(keyword: string): Promise<number> {
    const reviews = await this.getAllReviewsData();
    return reviews.filter(review => 
      review.content.includes(keyword) || 
      review.title.includes(keyword)
    ).length;
  }

  async openFilterModal(): Promise<void> {
    await this.filterModalButton.click();
    await this.page.waitForTimeout(1000); // Wait for modal animation
    await this.filterModal.modal.waitFor({ state: 'visible' });
  }

  async isFilterModalButtonVisible(): Promise<boolean> {
    return await this.filterModalButton.isVisible();
  }

  async applyFilters(filterOptions: {
    dateSort?: 'new' | 'old';
    evaluationSort?: 'high' | 'low';
    respondentTypes?: ('parent' | 'student')[];
    purposes?: Array<'university' | 'highSchool' | 'middleSchool' | 'elementary' | 'test' | 'integrated' | 'english'>;
    ratings?: number[];
    keyword?: string;
  }): Promise<void> {
    await this.openFilterModal();
    await this.filterModal.applyFilter(filterOptions);
    await this.waitForPageToLoad();
  }

  async closeFilterModal(): Promise<void> {
    if (await this.filterModal.isOpen()) {
      await this.filterModal.close();
    }
  }

  async getActiveFilters(): Promise<any> {
    await this.openFilterModal();
    const filters = await this.filterModal.getSelectedFilters();
    await this.closeFilterModal();
    return filters;
  }
}