import { test, expect } from '@playwright/test';
import { JukuExperienceSection } from '../pages/JukuExperienceSection';

test.describe('Juku Experience Section Tests', () => {
  let experienceSection: JukuExperienceSection;
  const brandId = process.env.BRAND_ID || '21'; // Default to individual classroom Torai

  test.beforeEach(async ({ page }) => {
    console.log(`Testing Juku Experience Section with Brand ID: ${brandId}`);
    
    experienceSection = new JukuExperienceSection(page);
    await page.goto(`https://bestjuku.com/juku/${brandId}/`);
    await experienceSection.waitForSectionToLoad();
  });

  test('Verify experience section basic functionality', async () => {
    const jukuNameElement = experienceSection.page.locator('.bjc-juku-header-title');
    const jukuName = await jukuNameElement.textContent();
    console.log(`Testing experiences for: ${jukuName}`);

    // Verify section is visible
    expect(await experienceSection.isVisible()).toBe(true);

    // Test tab functionality
    const availableTabs = await experienceSection.getAvailableTabs();
    console.log(`Available tabs: ${JSON.stringify(availableTabs)}`);
    expect(availableTabs.length).toBeGreaterThan(0);

    // Test default active tab
    const activeTab = await experienceSection.getActiveTab();
    console.log(`Default active tab: ${activeTab}`);
    expect(activeTab).toBeTruthy();

    // Verify view all link
    expect(await experienceSection.isViewAllLinkVisible()).toBe(true);
  });

  test('Test experience cards in each tab', async () => {
    const allTabsData = await experienceSection.getAllTabsExperienceData();
    
    console.log('\nExperience data by tab:\n');
    for (const tabData of allTabsData) {
      console.log(`${tabData.tabName}:`);
      console.log(`- Total experiences: ${tabData.cardCount}`);
      
      if (tabData.cards.length > 0) {
        const firstCard = tabData.cards[0];
        console.log(`- First experience:`);
        console.log(`  - Title: ${firstCard.title}`);
        console.log(`  - Year: ${firstCard.year}`);
        console.log(`  - Starting deviation: ${firstCard.startingDeviation}`);
        console.log(`  - Is pickup: ${firstCard.isPickup}`);
      }
      console.log('');
    }

    // Verify each tab has experiences and check for grade level availability
    const hasUniversity = await experienceSection.hasExperiencesForGrade('大学受験');
    const hasHighSchool = await experienceSection.hasExperiencesForGrade('高校受験');
    const hasJuniorHigh = await experienceSection.hasExperiencesForGrade('中学受験');

    console.log('Experience availability:');
    console.log(`- University: ${hasUniversity}`);
    console.log(`- High School: ${hasHighSchool}`);
    console.log(`- Junior High: ${hasJuniorHigh}`);

    // At least one grade level should have experiences
    expect(hasUniversity || hasHighSchool || hasJuniorHigh).toBe(true);
  });

  test('Test view all link', async () => {
    // Test view all link properties
    const viewAllText = await experienceSection.getViewAllLinkText();
    const viewAllHref = await experienceSection.getViewAllLinkHref();
    
    console.log(`View all link text: ${viewAllText}`);
    console.log(`View all link href: ${viewAllHref}`);
    
    expect(viewAllText).toContain('合格体験記');
    expect(viewAllHref).toContain(`/juku/${brandId}/experience/`);
    
    // Click the view all link
    await experienceSection.clickViewAllLink();
    
    // Verify navigation to experience list page
    await experienceSection.page.waitForURL(new RegExp(`/juku/${brandId}/experience/`));
    const currentUrl = experienceSection.page.url();
    expect(currentUrl).toContain(`/juku/${brandId}/experience/`);
  });

  test('Test experience summary and statistics', async () => {
    const summary = await experienceSection.getExperienceSummary();
    
    console.log('\nExperience Summary:');
    console.log(`- Total experiences: ${summary.totalExperiences}`);
    console.log(`- By tab: ${JSON.stringify(summary.byTab)}`);
    console.log(`- Average starting deviation: ${summary.averageStartingDeviation}`);
    console.log(`- Year distribution: ${JSON.stringify(summary.yearDistribution)}`);
    console.log(`- Pickup experiences: ${summary.pickupCount}`);
    
    expect(summary.totalExperiences).toBeGreaterThan(0);
    expect(summary.pickupCount).toBeGreaterThanOrEqual(0);
    expect(summary.averageStartingDeviation).toBeGreaterThanOrEqual(0);
    
    // Test filtering by deviation range
    const midRangeExperiences = await experienceSection.getExperiencesByDeviationRange(45, 65);
    console.log(`\nExperiences with deviation 45-65: ${midRangeExperiences.length}`);
    
    // Test filtering by recent year
    const currentYear = new Date().getFullYear();
    const recentExperiences = await experienceSection.getExperiencesByYear(currentYear);
    console.log(`Experiences from ${currentYear}: ${recentExperiences.length}`);
  });

  test('Test clicking experience card', async () => {
    // First, get experience cards from the active tab
    const experienceCards = await experienceSection.getExperienceCards();
    
    if (experienceCards.length > 0) {
      const firstCard = experienceCards[0];
      console.log(`Clicking on experience: ${firstCard.title}`);
      
      // Click the first experience card
      await experienceSection.clickExperienceCard(0);
      
      // Wait for navigation to experience detail page
      await experienceSection.page.waitForLoadState('networkidle');
      
      // Verify we navigated to the experience detail page
      const currentUrl = experienceSection.page.url();
      expect(currentUrl).toContain('/shingaku/experience/');
      console.log('Successfully navigated to experience detail page');
    } else {
      console.log('No experience cards found in the active tab');
    }
  });

  test('Test tab switching and card retrieval', async () => {
    const tabs = await experienceSection.getAvailableTabs();
    
    for (const tab of tabs) {
      console.log(`\nSwitching to ${tab} tab`);
      const cards = await experienceSection.switchTabAndGetCards(tab);
      console.log(`Found ${cards.length} experiences`);
      
      if (cards.length > 0) {
        const firstCard = cards[0];
        console.log(`First card - Title: ${firstCard.title}`);
        console.log(`First card - Year: ${firstCard.year}`);
        console.log(`First card - Deviation: ${firstCard.startingDeviation}`);
      }
      
      // Verify the tab is now active
      const isActive = await experienceSection.isTabActive(tab);
      expect(isActive).toBe(true);
    }
  });
});