import { test, expect } from '@playwright/test';
import { Top } from '../pages/Top';
import { ExperienceSection } from '../pages/ExperienceSection';

test.describe('Experience Section Tests', () => {
  test('Verify experience section components and tab functionality', async ({ page }) => {
    // 1. Navigate to top page
    const topPage = new Top(page);
    await topPage.goto();
    
    // 2. Initialize experience section
    const experienceSection = new ExperienceSection(page);
    await experienceSection.waitForSectionToLoad();
    
    // 3. Verify section is visible
    const isVisible = await experienceSection.isVisible();
    expect(isVisible).toBe(true);
    
    // 4. Verify title
    const title = await experienceSection.getTitle();
    expect(title).toBe('合格体験記を探す');
    
    // 5. Test tab functionality
    const availableTabs = await experienceSection.getAvailableTabs();
    console.log('Available tabs:', availableTabs);
    expect(availableTabs).toContain('大学受験');
    expect(availableTabs).toContain('高校受験');
    expect(availableTabs).toContain('中学受験');
    
    // 6. Verify default active tab
    const activeTab = await experienceSection.getActiveTab();
    console.log('Default active tab:', activeTab);
    expect(activeTab.trim()).toBe('大学受験');
    
    // 7. Test tab switching
    await experienceSection.switchToHighSchoolTab();
    const newActiveTab = await experienceSection.getActiveTab();
    expect(newActiveTab.trim()).toBe('高校受験');
    
    await experienceSection.switchToJuniorHighSchoolTab();
    const juniorActiveTab = await experienceSection.getActiveTab();
    expect(juniorActiveTab.trim()).toBe('中学受験');
    
    // Switch back to university tab
    await experienceSection.switchToUniversityTab();
    const backToUniversityTab = await experienceSection.getActiveTab();
    expect(backToUniversityTab.trim()).toBe('大学受験');
  });

  test('Test experience cards in university tab', async ({ page }) => {
    const topPage = new Top(page);
    await topPage.goto();
    
    const experienceSection = new ExperienceSection(page);
    await experienceSection.waitForSectionToLoad();
    
    // Ensure we're on university tab
    await experienceSection.switchToUniversityTab();
    
    // Get experience cards
    const cards = await experienceSection.getExperienceCards();
    console.log('University experience cards:', cards.length);
    expect(cards.length).toBeGreaterThan(0);
    
    // Verify card data structure
    const firstCard = cards[0];
    expect(firstCard.schoolName).toBeTruthy();
    expect(firstCard.year).toBeTruthy();
    expect(firstCard.href).toBeTruthy();
    expect(firstCard.experienceId).toBeTruthy();
    
    console.log('First university card:', {
      school: firstCard.schoolName,
      year: firstCard.year,
      deviation: firstCard.startingDeviation,
      id: firstCard.experienceId
    });
    
    // Test view all link
    const viewAllText = await experienceSection.getViewAllLinkText();
    expect(viewAllText).toContain('大学受験の受験体験記一覧へ');
    
    const viewAllHref = await experienceSection.getViewAllLinkHref();
    expect(viewAllHref).toBe('/shingaku/experience/university/');
  });

  test('Test experience cards in all tabs', async ({ page }) => {
    const topPage = new Top(page);
    await topPage.goto();
    
    const experienceSection = new ExperienceSection(page);
    await experienceSection.waitForSectionToLoad();
    
    // Get data from all tabs
    const allTabsData = await experienceSection.getAllTabsData();
    console.log('All tabs data:', allTabsData.map(tab => ({
      name: tab.tabName,
      cardCount: tab.cards.length,
      viewAllLink: tab.viewAllLink
    })));
    
    expect(allTabsData.length).toBe(3);
    
    // Verify each tab has cards and correct view all link
    const universityTab = allTabsData.find(tab => tab.tabName.trim() === '大学受験');
    expect(universityTab).toBeTruthy();
    expect(universityTab!.cards.length).toBeGreaterThan(0);
    expect(universityTab!.viewAllLink).toBe('/shingaku/experience/university/');
    
    const highSchoolTab = allTabsData.find(tab => tab.tabName.trim() === '高校受験');
    expect(highSchoolTab).toBeTruthy();
    expect(highSchoolTab!.cards.length).toBeGreaterThan(0);
    expect(highSchoolTab!.viewAllLink).toBe('/shingaku/experience/highschool/');
    
    const juniorHighTab = allTabsData.find(tab => tab.tabName.trim() === '中学受験');
    expect(juniorHighTab).toBeTruthy();
    expect(juniorHighTab!.cards.length).toBeGreaterThan(0);
    expect(juniorHighTab!.viewAllLink).toBe('/shingaku/experience/junior/');
  });

  test('Test clicking experience card and view all link', async ({ page }) => {
    const topPage = new Top(page);
    await topPage.goto();
    
    const experienceSection = new ExperienceSection(page);
    await experienceSection.waitForSectionToLoad();
    
    // Get first card data
    const cards = await experienceSection.getExperienceCards();
    const firstCard = cards[0];
    
    // Click on first experience card
    await experienceSection.clickExperienceCard(0);
    
    // Verify navigation to experience detail page
    await expect(page).toHaveURL(new RegExp(`/shingaku/experience/${firstCard.experienceId}/`));
    
    // Go back to top page
    await topPage.goto();
    await experienceSection.waitForSectionToLoad();
    
    // Test view all link
    await experienceSection.clickViewAllLink();
    await expect(page).toHaveURL('/shingaku/experience/university/');
  });

  test('Test filtering cards by deviation and year', async ({ page }) => {
    const topPage = new Top(page);
    await topPage.goto();
    
    const experienceSection = new ExperienceSection(page);
    await experienceSection.waitForSectionToLoad();
    
    // Get all cards
    const allCards = await experienceSection.getExperienceCards();
    console.log('All cards:', allCards.map(card => ({
      school: card.schoolName,
      year: card.year,
      deviation: card.startingDeviation
    })));
    
    // Filter by deviation range (50-60)
    const midRangeCards = await experienceSection.getCardsByDeviationRange(50, 60);
    console.log('Mid-range deviation cards (50-60):', midRangeCards.length);
    
    // Filter by specific year
    const recentCards = await experienceSection.getCardsByYear('2025');
    console.log('2025 cards:', recentCards.length);
    
    // Verify filtering logic
    midRangeCards.forEach(card => {
      const deviation = parseInt(card.startingDeviation);
      expect(deviation).toBeGreaterThanOrEqual(50);
      expect(deviation).toBeLessThanOrEqual(60);
    });
    
    recentCards.forEach(card => {
      expect(card.year).toBe('2025');
    });
  });
});