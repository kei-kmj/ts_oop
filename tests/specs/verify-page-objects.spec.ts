import { test, expect } from '@playwright/test';
import { Top } from '../pages/Top';

test.describe('Verify Page Objects', () => {
  let topPage: Top;

  test.beforeEach(async ({ page }) => {
    topPage = new Top(page);
    await topPage.goto();
  });

  test('Header elements should be visible', async ({ page }) => {
    // Check header logo
    await expect(topPage.header.logoLink).toBeVisible();
    
    // Check campaign button
    await expect(topPage.header.campaignButton).toBeVisible();
    
    // Check favorites link
    await expect(topPage.header.favoritesLink).toBeVisible();
  });

  test('AreaSearchSection elements should be visible', async ({ page }) => {
    // Check section container
    await expect(topPage.areaSearchSection.sectionContainer).toBeVisible();
    
    // Check section title
    await expect(topPage.areaSearchSection.sectionTitle).toBeVisible();
    
    // Check search buttons
    await expect(topPage.areaSearchSection.searchByCityButton).toBeVisible();
    await expect(topPage.areaSearchSection.searchByStationButton).toBeVisible();
  });

  test('SearchFormSection elements should be visible', async ({ page }) => {
    // Check section container
    await expect(topPage.searchFormSection.sectionContainer).toBeVisible();
    
    // Check section title
    await expect(topPage.searchFormSection.sectionTitle).toBeVisible();
    
    // Check search input
    await expect(topPage.searchFormSection.searchInput).toBeVisible();
    
    // Check placeholder
    await expect(topPage.searchFormSection.searchPlaceholder).toBeVisible();
  });

  test('RecentlyViewedSection elements may or may not be visible', async ({ page }) => {
    // Recently viewed section may only appear when user has browsing history
    const sectionCount = await topPage.recentlyViewedSection.sectionContainer.count();
    
    if (sectionCount > 0) {
      // If section exists, check its elements
      await expect(topPage.recentlyViewedSection.sectionContainer).toBeVisible();
      await expect(topPage.recentlyViewedSection.sectionTitle).toBeVisible();
      await expect(topPage.recentlyViewedSection.viewAllLink).toBeVisible();
      await expect(topPage.recentlyViewedSection.contentList).toBeVisible();
    } else {
      // Section doesn't exist (no browsing history)
      expect(sectionCount).toBe(0);
    }
  });

  test('RecentSearchConditionsSection elements may or may not be visible', async ({ page }) => {
    // Recent search conditions section may only appear when user has search history
    const sectionCount = await topPage.recentSearchConditionsSection.sectionContainer.count();
    
    if (sectionCount > 0) {
      // If section exists, check its elements
      await expect(topPage.recentSearchConditionsSection.sectionContainer).toBeVisible();
      await expect(topPage.recentSearchConditionsSection.sectionTitle).toBeVisible();
      await expect(topPage.recentSearchConditionsSection.conditionsList).toBeVisible();
      
      // Check if there are any condition items
      const conditionsCount = await topPage.recentSearchConditionsSection.getConditionsCount();
      expect(conditionsCount).toBeGreaterThan(0);
    } else {
      // Section doesn't exist (no search history)
      expect(sectionCount).toBe(0);
    }
  });

  test('ReasonSection elements should be visible', async ({ page }) => {
    // Scroll to reason section
    await topPage.reasonSection.scrollToSection();
    
    // Check section container
    await expect(topPage.reasonSection.sectionContainer).toBeVisible();
    
    // Check section title
    await expect(topPage.reasonSection.sectionTitle).toBeVisible();
    
    // Check reason items
    await expect(topPage.reasonSection.classroomCountItem).toBeVisible();
    await expect(topPage.reasonSection.reviewCountItem).toBeVisible();
    await expect(topPage.reasonSection.thoroughCoverageItem).toBeVisible();
  });

  test('JukuInquirySection elements should be visible', async ({ page }) => {
    // Scroll to juku inquiry section
    await topPage.jukuInquirySection.scrollToSection();
    
    // Check section container
    await expect(topPage.jukuInquirySection.sectionContainer).toBeVisible();
    
    // Check section title
    await expect(topPage.jukuInquirySection.sectionTitle).toBeVisible();
    
    // Check inquiry button
    await expect(topPage.jukuInquirySection.inquiryButton).toBeVisible();
  });

  test('MainFooter elements should be visible', async ({ page }) => {
    // Scroll to footer
    await topPage.mainFooter.scrollToFooter();
    
    // Check footer container
    await expect(topPage.mainFooter.footerContainer).toBeVisible();
    
    // Check logo
    await expect(topPage.mainFooter.logoLink).toBeVisible();
    
    // Check some navigation links
    await expect(topPage.mainFooter.jukuListLink).toBeVisible();
    await expect(topPage.mainFooter.faqLink).toBeVisible();
    await expect(topPage.mainFooter.companyInfoLink).toBeVisible();
  });

  test('Get text content from elements', async ({ page }) => {
    // Get favorites count
    const favoritesCount = await topPage.header.getFavoritesCount();
    expect(favoritesCount).toBe(0);
    
    // Get section title
    const sectionTitle = await topPage.areaSearchSection.getSectionTitleText();
    expect(sectionTitle).toContain('全国の塾・予備校を探す');
    
    // Get search form section title
    const searchFormTitle = await topPage.searchFormSection.getSectionTitleText();
    expect(searchFormTitle).toContain('塾名・志望校名から探す');
    
    // Get placeholder text
    const placeholderText = await topPage.searchFormSection.getPlaceholderText();
    expect(placeholderText).toBe('塾名、志望校名を入力');
    
    // Check recently viewed section (if it exists)
    const recentlyViewedExists = await topPage.recentlyViewedSection.sectionContainer.count() > 0;
    
    if (recentlyViewedExists) {
      const hasRecentlyViewedItems = await topPage.recentlyViewedSection.hasAnyItems();
      expect(hasRecentlyViewedItems).toBe(true);
      
      const viewAllHref = await topPage.recentlyViewedSection.getViewAllLinkHref();
      expect(viewAllHref).toBe('/history/');
    }
    
    // Check recent search conditions section (if it exists)
    const searchConditionsExists = await topPage.recentSearchConditionsSection.sectionContainer.count() > 0;
    
    if (searchConditionsExists) {
      const hasConditions = await topPage.recentSearchConditionsSection.hasAnyConditions();
      expect(hasConditions).toBe(true);
      
      const titleText = await topPage.recentSearchConditionsSection.getSectionTitleText();
      expect(titleText).toContain('最近検索した条件');
    }
    
    // Scroll to reason section and get counts
    await topPage.reasonSection.scrollToSection();
    const classroomCount = await topPage.reasonSection.getClassroomCount();
    expect(classroomCount).toMatch(/\d+/);
    
    const reviewCount = await topPage.reasonSection.getReviewCount();
    expect(reviewCount).toMatch(/\d+/);
  });
});