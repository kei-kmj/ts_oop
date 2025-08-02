import { test, expect } from '@playwright/test';
import { JukuPriceSection } from '../pages/JukuPriceSection';

test.describe('Juku Price Section Tests', () => {
  let priceSection: JukuPriceSection;
  const brandId = process.env.BRAND_ID || '21'; // Default to individual classroom Torai

  test.beforeEach(async ({ page }) => {
    priceSection = new JukuPriceSection(page);
    await page.goto(`https://bestjuku.com/juku/${brandId}/`);
    await priceSection.waitForSectionToLoad();
  });

  test('料金セクションの基本機能を検証する', async () => {
    const jukuNameElement = priceSection.page.locator('.bjc-juku-header-title');
    const jukuName = await jukuNameElement.textContent();

    // Verify section is visible
    expect(await priceSection.isVisible()).toBe(true);

    // Test tab functionality
    const availableTabs = await priceSection.getAvailableTabs();
    expect(availableTabs.length).toBeGreaterThan(0);

    // Test default active tab
    const activeTab = await priceSection.getActiveTab();
    expect(activeTab).toBeTruthy();

    // Test active tab course title
    const activeCourseTitle = await priceSection.getActiveTabCourseTitle();
    expect(activeCourseTitle).toBeTruthy();
  });

  test('各タブの料金データをテストする', async () => {
    const allTabsData = await priceSection.getAllTabsPriceData();

    for (const tabData of allTabsData) {
    }

    // Verify each tab has pricing and check for grade level availability
    const hasHighSchoolPricing = await priceSection.hasPricingForGrade('高校生・高卒生');
    const hasJuniorHighPricing = await priceSection.hasPricingForGrade('中学生');
    const hasElementaryPricing = await priceSection.hasPricingForGrade('小学生');

    // At least one grade level should have pricing
    expect(hasHighSchoolPricing || hasJuniorHighPricing || hasElementaryPricing).toBe(true);

    // All tabs should have price data
    expect(allTabsData.length).toBeGreaterThan(0);
    for (const tabData of allTabsData) {
      expect(tabData.priceData.courseTitle).toBeTruthy();
      expect(tabData.priceData.initialCost).toBeTruthy();
      expect(tabData.priceData.monthlyCost).toBeTruthy();
    }
  });

  test('料金分析と一貫性をテストする', async () => {
    const summary = await priceSection.getPricingSummary();

    for (const [grade, priceData] of Object.entries(summary.pricesByGrade)) {
    }

    expect(summary.totalGrades).toBeGreaterThan(0);
    expect(summary.totalGrades).toBeLessThanOrEqual(3); // Should not exceed 3 grade levels

    // Test consistency checks
    const hasConsistentInitial = await priceSection.hasConsistentInitialCost();
    const areAllInquiryBased = await priceSection.areAllGradesInquiryBased();

    expect(typeof hasConsistentInitial).toBe('boolean');
    expect(typeof areAllInquiryBased).toBe('boolean');
  });

  test('初期費用と月額費用の取得をテストする', async () => {
    const initialCosts = await priceSection.getInitialCostForAllGrades();
    const monthlyCosts = await priceSection.getMonthlyCostForAllGrades();

    // Verify we have costs for each available tab
    const availableTabs = await priceSection.getAvailableTabs();
    for (const tab of availableTabs) {
      expect(initialCosts[tab]).toBeTruthy();
      expect(monthlyCosts[tab]).toBeTruthy();
    }

    // Test common initial cost
    const commonInitialCost = await priceSection.getCommonInitialCost();

    if (commonInitialCost) {
      // If there's a common initial cost, all should be the same
      const uniqueInitialCosts = new Set(Object.values(initialCosts));
      expect(uniqueInitialCosts.size).toBe(1);
    }
  });

  test('現在のタブの料金データをテストする', async () => {
    // Test getting price data for the currently active tab
    const currentPriceData = await priceSection.getCurrentTabPriceData();

    expect(currentPriceData.courseTitle).toBeTruthy();
    expect(currentPriceData.initialCost).toBeTruthy();
    expect(currentPriceData.monthlyCost).toBeTruthy();
    expect(typeof currentPriceData.isInquiryRequired).toBe('boolean');

    // If numeric amounts are available, they should be positive numbers
    if (currentPriceData.initialCostAmount !== null) {
      expect(currentPriceData.initialCostAmount).toBeGreaterThan(0);
    }
    if (currentPriceData.monthlyCostAmount !== null) {
      expect(currentPriceData.monthlyCostAmount).toBeGreaterThan(0);
    }
  });

  test('タブの切り替えと料金取得をテストする', async () => {
    const tabs = await priceSection.getAvailableTabs();

    for (const tab of tabs) {
      await priceSection.switchTabByText(tab);

      const priceData = await priceSection.getCurrentTabPriceData();

      // Verify the tab is now active
      const isActive = await priceSection.isTabActive(tab);
      expect(isActive).toBe(true);

      // Verify course title contains grade level information
      const courseTitle = await priceSection.getActiveTabCourseTitle();
      expect(courseTitle).toBeTruthy();

      // Verify price data is valid
      expect(priceData.courseTitle).toBeTruthy();
      expect(priceData.initialCost).toBeTruthy();
      expect(priceData.monthlyCost).toBeTruthy();
    }
  });

  test('料金セクションの統合をテストする', async () => {
    // Test that price section works well with other components
    const activeTab = await priceSection.getActiveTab();
    const courseTitle = await priceSection.getActiveTabCourseTitle();
    const priceData = await priceSection.getCurrentTabPriceData();

    // Course title from section should match course title from price data (after trimming)
    expect(courseTitle.trim()).toBe(priceData.courseTitle.trim());

    // Test switching between tabs multiple times
    const tabs = await priceSection.getAvailableTabs();

    if (tabs.length > 1) {
      // Switch to second tab
      await priceSection.switchTabByText(tabs[1]);
      const secondTabActive = await priceSection.isTabActive(tabs[1]);
      expect(secondTabActive).toBe(true);

      // Switch back to first tab
      await priceSection.switchTabByText(tabs[0]);
      const firstTabActive = await priceSection.isTabActive(tabs[0]);
      expect(firstTabActive).toBe(true);
    }
  });
});
