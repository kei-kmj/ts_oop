import { test, expect } from '@playwright/test';
import { JukuReviewPage } from '../pages/JukuReviewPage';

test.describe('JukuReviewPage', () => {
  let reviewPage: JukuReviewPage;

  test.beforeEach(async ({ page }) => {
    reviewPage = new JukuReviewPage(page);
  });

  test('should navigate to review page and display reviews', async () => {
    await reviewPage.goto('1304');
    await reviewPage.waitForPageToLoad();

    // Check if the page loaded correctly
    const title = await reviewPage.getTitle();
    expect(title).toContain('口コミ');

    // Check if review navigation is visible
    expect(await reviewPage.reviewNavigation.isVisible()).toBeTruthy();
    
    // Check if category filter is visible
    expect(await reviewPage.categoryFilter.isVisible()).toBeTruthy();
  });

  test('should display review cards with correct structure', async () => {
    await reviewPage.goto('1304');
    await reviewPage.waitForPageToLoad();

    const reviewCards = await reviewPage.getReviewCards();
    expect(reviewCards.length).toBeGreaterThan(0);

    // Check first review card data
    const firstCardData = await reviewPage.getReviewCardData(0);
    expect(firstCardData.href).toBeTruthy();
    expect(firstCardData.heading).toContain('口コミ・評判');
    expect(firstCardData.title).toBeTruthy();
    expect(firstCardData.meta).toBeTruthy();
    expect(firstCardData.rating).toBeGreaterThanOrEqual(1);
    expect(firstCardData.rating).toBeLessThanOrEqual(5);
    expect(firstCardData.date).toContain('回答日');
    expect(firstCardData.content).toBeTruthy();
  });

  test('should navigate between different review tabs', async () => {
    await reviewPage.goto('1304');
    await reviewPage.waitForPageToLoad();

    // Check default tab
    expect(await reviewPage.getCurrentView()).toBe('category');

    // Navigate to respondent view
    await reviewPage.navigateToRespondentView();
    expect(await reviewPage.reviewNavigation.isTabActive('respondent')).toBeTruthy();

    // Navigate to experience view
    await reviewPage.navigateToExperienceView();
    expect(await reviewPage.reviewNavigation.isTabActive('experience')).toBeTruthy();
  });

  test('should filter reviews by category', async () => {
    await reviewPage.goto('1304');
    await reviewPage.waitForPageToLoad();

    // Click on teacher quality filter
    await reviewPage.filterByCategory('teacher');
    
    // Verify URL changed
    const currentUrl = reviewPage.page.url();
    expect(currentUrl).toContain('category=juku_teacher');
  });

  test('should open and interact with filter modal', async () => {
    await reviewPage.goto('1304');
    await reviewPage.waitForPageToLoad();

    // Check if filter button is visible
    expect(await reviewPage.isFilterModalButtonVisible()).toBeTruthy();

    // Open filter modal
    await reviewPage.openFilterModal();
    expect(await reviewPage.filterModal.isOpen()).toBeTruthy();

    // Apply filters
    await reviewPage.filterModal.applyFilter({
      dateSort: 'new',
      evaluationSort: 'high',
      respondentTypes: ['parent'],
      purposes: ['highSchool'],
      ratings: [4, 5],
      keyword: 'テスト'
    });

    // Wait for results to update
    await reviewPage.waitForPageToLoad();
  });

  test('should close filter modal', async () => {
    await reviewPage.goto('1304');
    await reviewPage.waitForPageToLoad();

    // Open and close modal
    await reviewPage.openFilterModal();
    expect(await reviewPage.filterModal.isOpen()).toBeTruthy();
    
    await reviewPage.closeFilterModal();
    expect(await reviewPage.filterModal.isOpen()).toBeFalsy();
  });

  test('should load more reviews when available', async () => {
    await reviewPage.goto('1304');
    await reviewPage.waitForPageToLoad();

    const initialCards = await reviewPage.getReviewCards();
    const initialCount = initialCards.length;

    // Check if load more button exists
    const hasLoadMore = await reviewPage.loadMoreButton.isVisible();
    
    if (hasLoadMore) {
      await reviewPage.loadMoreReviews();
      const updatedCards = await reviewPage.getReviewCards();
      expect(updatedCards.length).toBeGreaterThan(initialCount);
    }
  });

  test('should search reviews by keyword', async () => {
    await reviewPage.goto('1304');
    await reviewPage.waitForPageToLoad();

    // Load all reviews first
    await reviewPage.loadAllReviews();

    // Search for a keyword
    const matchCount = await reviewPage.searchReviewsByKeyword('料金');
    
    // If there are matches, verify they exist
    if (matchCount > 0) {
      const allCardsData = await reviewPage.getAllReviewCardsData();
      const matchingCards = allCardsData.filter(card => 
        card.content.includes('料金') || card.title.includes('料金')
      );
      expect(matchingCards.length).toBeGreaterThan(0);
    }
  });

  test.skip('should get and verify active filters', async () => {
    await reviewPage.goto('1304');
    await reviewPage.waitForPageToLoad();

    // Apply specific filters
    await reviewPage.applyFilters({
      dateSort: 'old',
      evaluationSort: 'low',
      respondentTypes: ['student'],
      ratings: [3]
    });

    // Get active filters
    const activeFilters = await reviewPage.getActiveFilters();
    expect(activeFilters.dateSort).toBe('old');
    expect(activeFilters.evaluationSort).toBe('low');
    expect(activeFilters.respondentTypes).toContain('student');
    expect(activeFilters.ratings).toContain(3);
  });

  test.skip('should verify review count', async () => {
    await reviewPage.goto('1304');
    await reviewPage.waitForPageToLoad();

    const hasReviews = await reviewPage.hasReviews();
    expect(hasReviews).toBeTruthy();

    if (hasReviews) {
      const reviewCount = await reviewPage.getReviewCount();
      expect(reviewCount).toBeGreaterThan(0);
    }
  });
});