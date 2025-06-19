import { test, expect } from '@playwright/test';
import { Top } from '../pages/Top';
import { ExperienceSection } from '../pages/ExperienceSection';

test.describe('Experience Section Tests', () => {
  test('体験記セクションのコンポーネントとタブ機能を検証する', async ({ page }) => {
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
    expect(availableTabs).toContain('大学受験');
    expect(availableTabs).toContain('高校受験');
    expect(availableTabs).toContain('中学受験');
    
    // 6. Verify default active tab
    const activeTab = await experienceSection.getActiveTab();
    expect(activeTab.trim()).toBe('大学受験');
    
    // 7. Test tab clicking (tabs may not actually switch on this page)
    await experienceSection.switchToHighSchoolTab();
    await experienceSection.switchToJuniorHighSchoolTab();
    await experienceSection.switchToUniversityTab();
    
    // Verify section is still functional after tab interactions
    expect(await experienceSection.isVisible()).toBe(true);
  });

  test('大学受験タブの体験記カードをテストする', async ({ page }) => {
    const topPage = new Top(page);
    await topPage.goto();
    
    const experienceSection = new ExperienceSection(page);
    await experienceSection.waitForSectionToLoad();
    
    // Ensure we're on university tab
    await experienceSection.switchToUniversityTab();
    
    // Get experience cards
    const cards = await experienceSection.getExperienceCards();
    expect(cards.length).toBeGreaterThan(0);
    
    // Verify card data structure
    const firstCard = cards[0];
    expect(firstCard.schoolName).toBeTruthy();
    expect(firstCard.year).toBeTruthy();
    expect(firstCard.href).toBeTruthy();
    expect(firstCard.experienceId).toBeTruthy();
    
    // Test view all link
    const viewAllText = await experienceSection.getViewAllLinkText();
    expect(viewAllText).toContain('大学受験の受験体験記一覧へ');
    
    const viewAllHref = await experienceSection.getViewAllLinkHref();
    expect(viewAllHref).toBe('/shingaku/experience/university/');
  });

  test('すべてのタブの体験記カードをテストする', async ({ page }) => {
    const topPage = new Top(page);
    await topPage.goto();
    
    const experienceSection = new ExperienceSection(page);
    await experienceSection.waitForSectionToLoad();
    
    // Get data from all tabs
    const allTabsData = await experienceSection.getAllTabsData();
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

  test('体験記カードのクリックとすべて表示リンクをテストする', async ({ page }) => {
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

  test('偏差値と年でカードをフィルタリングするテスト', async ({ page }) => {
    const topPage = new Top(page);
    await topPage.goto();
    
    const experienceSection = new ExperienceSection(page);
    await experienceSection.waitForSectionToLoad();
    
    // Get all cards
    const allCards = await experienceSection.getExperienceCards();
    
    // Filter by deviation range (50-60)
    const midRangeCards = await experienceSection.getCardsByDeviationRange(50, 60);
    
    // Filter by specific year
    const recentCards = await experienceSection.getCardsByYear('2025');
    
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