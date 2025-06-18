import { test, expect } from '@playwright/test';
import { JukuPriceSection } from '../pages/JukuPriceSection';

test.describe('Juku Price Section Tests', () => {
  let priceSection: JukuPriceSection;
  const brandId = process.env.BRAND_ID || '21'; // Default to individual classroom Torai

  test.beforeEach(async ({ page }) => {
    console.log(`Testing Juku Price Section with Brand ID: ${brandId}`);
    
    priceSection = new JukuPriceSection(page);
    await page.goto(`https://bestjuku.com/juku/${brandId}/`);
    await priceSection.waitForSectionToLoad();
  });

  test('Verify price section basic functionality', async () => {
    const jukuNameElement = priceSection.page.locator('.bjc-juku-header-title');
    const jukuName = await jukuNameElement.textContent();
    console.log(`Testing pricing for: ${jukuName}`);

    // Verify section is visible
    expect(await priceSection.isVisible()).toBe(true);

    // Test tab functionality
    const availableTabs = await priceSection.getAvailableTabs();
    console.log(`Available tabs: ${JSON.stringify(availableTabs)}`);
    expect(availableTabs.length).toBeGreaterThan(0);

    // Test default active tab
    const activeTab = await priceSection.getActiveTab();
    console.log(`Default active tab: ${activeTab}`);
    expect(activeTab).toBeTruthy();

    // Test active tab course title
    const activeCourseTitle = await priceSection.getActiveTabCourseTitle();
    console.log(`Active tab course title: ${activeCourseTitle}`);
    expect(activeCourseTitle).toBeTruthy();
  });

  test('Test price data in each tab', async () => {
    const allTabsData = await priceSection.getAllTabsPriceData();
    
    console.log('\nPrice data by tab:\n');
    for (const tabData of allTabsData) {
      console.log(`${tabData.tabName}:`);
      console.log(`- Course: ${tabData.priceData.courseTitle}`);
      console.log(`- Initial cost: ${tabData.priceData.initialCost}`);
      console.log(`- Monthly cost: ${tabData.priceData.monthlyCost}`);
      console.log(`- Initial cost amount: ${tabData.priceData.initialCostAmount}`);
      console.log(`- Monthly cost amount: ${tabData.priceData.monthlyCostAmount}`);
      console.log(`- Inquiry required: ${tabData.priceData.isInquiryRequired}`);
      console.log('');
    }

    // Verify each tab has pricing and check for grade level availability
    const hasHighSchoolPricing = await priceSection.hasPricingForGrade('高校生・高卒生');
    const hasJuniorHighPricing = await priceSection.hasPricingForGrade('中学生');
    const hasElementaryPricing = await priceSection.hasPricingForGrade('小学生');

    console.log('Pricing availability:');
    console.log(`- High School: ${hasHighSchoolPricing}`);
    console.log(`- Junior High: ${hasJuniorHighPricing}`);
    console.log(`- Elementary: ${hasElementaryPricing}`);

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

  test('Test pricing analysis and consistency', async () => {
    const summary = await priceSection.getPricingSummary();
    
    console.log('\nPricing Summary:');
    console.log(`- Total grades: ${summary.totalGrades}`);
    console.log(`- Common initial cost: ${summary.commonInitialCost}`);
    console.log(`- All inquiry based: ${summary.isAllInquiryBased}`);
    console.log(`- Has consistent pricing: ${summary.hasConsistentPricing}`);
    console.log(`- Prices by grade:`);
    
    for (const [grade, priceData] of Object.entries(summary.pricesByGrade)) {
      console.log(`  ${grade}: Initial ${priceData.initialCost}, Monthly ${priceData.monthlyCost}`);
    }
    
    expect(summary.totalGrades).toBeGreaterThan(0);
    expect(summary.totalGrades).toBeLessThanOrEqual(3); // Should not exceed 3 grade levels
    
    // Test consistency checks
    const hasConsistentInitial = await priceSection.hasConsistentInitialCost();
    const areAllInquiryBased = await priceSection.areAllGradesInquiryBased();
    
    console.log(`\nConsistency checks:`);
    console.log(`- Consistent initial cost: ${hasConsistentInitial}`);
    console.log(`- All grades inquiry-based: ${areAllInquiryBased}`);
    
    expect(typeof hasConsistentInitial).toBe('boolean');
    expect(typeof areAllInquiryBased).toBe('boolean');
  });

  test('Test initial and monthly cost retrieval', async () => {
    const initialCosts = await priceSection.getInitialCostForAllGrades();
    const monthlyCosts = await priceSection.getMonthlyCostForAllGrades();
    
    console.log('\nCost breakdown:');
    console.log(`Initial costs: ${JSON.stringify(initialCosts)}`);
    console.log(`Monthly costs: ${JSON.stringify(monthlyCosts)}`);
    
    // Verify we have costs for each available tab
    const availableTabs = await priceSection.getAvailableTabs();
    for (const tab of availableTabs) {
      expect(initialCosts[tab]).toBeTruthy();
      expect(monthlyCosts[tab]).toBeTruthy();
    }
    
    // Test common initial cost
    const commonInitialCost = await priceSection.getCommonInitialCost();
    console.log(`Common initial cost: ${commonInitialCost}`);
    
    if (commonInitialCost) {
      // If there's a common initial cost, all should be the same
      const uniqueInitialCosts = new Set(Object.values(initialCosts));
      expect(uniqueInitialCosts.size).toBe(1);
    }
  });

  test('Test current tab price data', async () => {
    // Test getting price data for the currently active tab
    const currentPriceData = await priceSection.getCurrentTabPriceData();
    
    console.log('\nCurrent tab price data:');
    console.log(`- Course: ${currentPriceData.courseTitle}`);
    console.log(`- Initial cost: ${currentPriceData.initialCost}`);
    console.log(`- Monthly cost: ${currentPriceData.monthlyCost}`);
    console.log(`- Initial amount: ${currentPriceData.initialCostAmount}`);
    console.log(`- Monthly amount: ${currentPriceData.monthlyCostAmount}`);
    console.log(`- Inquiry required: ${currentPriceData.isInquiryRequired}`);
    
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

  test('Test tab switching and price retrieval', async () => {
    const tabs = await priceSection.getAvailableTabs();
    
    for (const tab of tabs) {
      console.log(`\nSwitching to ${tab} tab`);
      await priceSection.switchTabByText(tab);
      
      const priceData = await priceSection.getCurrentTabPriceData();
      console.log(`Course: ${priceData.courseTitle}`);
      console.log(`Initial cost: ${priceData.initialCost}`);
      console.log(`Monthly cost: ${priceData.monthlyCost}`);
      console.log(`Inquiry required: ${priceData.isInquiryRequired}`);
      
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

  test('Test price section integration', async () => {
    // Test that price section works well with other components
    const activeTab = await priceSection.getActiveTab();
    const courseTitle = await priceSection.getActiveTabCourseTitle();
    const priceData = await priceSection.getCurrentTabPriceData();
    
    console.log('\nIntegration test:');
    console.log(`Active tab: ${activeTab}`);
    console.log(`Course title: ${courseTitle}`);
    console.log(`Price data course: ${priceData.courseTitle}`);
    
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