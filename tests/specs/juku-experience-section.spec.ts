import { test, expect } from '@playwright/test';
import { JukuExperienceSection } from '../pages/JukuExperienceSection';

test.describe('Juku Experience Section Tests', () => {
  let experienceSection: JukuExperienceSection;
  const brandId = process.env.BRAND_ID || '21'; // Default to individual classroom Torai

  test.beforeEach(async ({ page }) => {
    
    experienceSection = new JukuExperienceSection(page);
    await page.goto(`https://bestjuku.com/juku/${brandId}/`);
    await experienceSection.waitForSectionToLoad();
  });

  test('体験記セクションの基本機能を検証する', async () => {
    const jukuNameElement = experienceSection.page.locator('.bjc-juku-header-title');
    const jukuName = await jukuNameElement.textContent();

    // Verify section is visible
    expect(await experienceSection.isVisible()).toBe(true);

    // Test tab functionality
    const availableTabs = await experienceSection.getAvailableTabs();
    expect(availableTabs.length).toBeGreaterThan(0);

    // Test default active tab
    const activeTab = await experienceSection.getActiveTab();
    expect(activeTab).toBeTruthy();

    // Verify view all link
    expect(await experienceSection.isViewAllLinkVisible()).toBe(true);
  });

  test('各タブの体験記カードをテストする', async () => {
    const allTabsData = await experienceSection.getAllTabsExperienceData();
    
    for (const tabData of allTabsData) {
      
      if (tabData.cards.length > 0) {
        const firstCard = tabData.cards[0];
      }
    }

    // Verify each tab has experiences and check for grade level availability
    const hasUniversity = await experienceSection.hasExperiencesForGrade('大学受験');
    const hasHighSchool = await experienceSection.hasExperiencesForGrade('高校受験');
    const hasJuniorHigh = await experienceSection.hasExperiencesForGrade('中学受験');


    // At least one grade level should have experiences
    expect(hasUniversity || hasHighSchool || hasJuniorHigh).toBe(true);
  });

  test('すべて表示リンクをテストする', async () => {
    // Test view all link properties
    const viewAllText = await experienceSection.getViewAllLinkText();
    const viewAllHref = await experienceSection.getViewAllLinkHref();
    
    
    expect(viewAllText).toContain('合格体験記');
    expect(viewAllHref).toContain(`/juku/${brandId}/experience/`);
    
    // Click the view all link
    await experienceSection.clickViewAllLink();
    
    // Verify navigation to experience list page
    await experienceSection.page.waitForURL(new RegExp(`/juku/${brandId}/experience/`));
    const currentUrl = experienceSection.page.url();
    expect(currentUrl).toContain(`/juku/${brandId}/experience/`);
  });

  test('体験記のサマリーと統計をテストする', async () => {
    const summary = await experienceSection.getExperienceSummary();
    
    
    expect(summary.totalExperiences).toBeGreaterThan(0);
    expect(summary.pickupCount).toBeGreaterThanOrEqual(0);
    expect(summary.averageStartingDeviation).toBeGreaterThanOrEqual(0);
    
    // Test filtering by deviation range
    const midRangeExperiences = await experienceSection.getExperiencesByDeviationRange(45, 65);
    
    // Test filtering by recent year
    const currentYear = new Date().getFullYear();
    const recentExperiences = await experienceSection.getExperiencesByYear(currentYear);
  });

  test('体験記カードのクリックをテストする', async () => {
    // First, get experience cards from the active tab
    const experienceCards = await experienceSection.getExperienceCards();
    
    if (experienceCards.length > 0) {
      const firstCard = experienceCards[0];
      
      // Click the first experience card
      await experienceSection.clickExperienceCard(0);
      
      // Wait for navigation to experience detail page
      await experienceSection.page.waitForLoadState('networkidle');
      
      // Verify we navigated to the experience detail page
      const currentUrl = experienceSection.page.url();
      expect(currentUrl).toContain('/shingaku/experience/');
    } else {
    }
  });

  test('タブの切り替えとカードの取得をテストする', async () => {
    const tabs = await experienceSection.getAvailableTabs();
    
    for (const tab of tabs) {
      const cards = await experienceSection.switchTabAndGetCards(tab);
      
      if (cards.length > 0) {
        const firstCard = cards[0];
      }
      
      // Verify the tab is now active
      const isActive = await experienceSection.isTabActive(tab);
      expect(isActive).toBe(true);
    }
  });
});