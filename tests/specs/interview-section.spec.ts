import { test, expect } from '@playwright/test';
import { Top } from '../pages/Top';
import { InterviewSection } from '../pages/InterviewSection';

test.describe('Interview Section Tests', () => {
  test('Verify interview section components and tab functionality', async ({ page }) => {
    // 1. Navigate to top page
    const topPage = new Top(page);
    await topPage.goto();
    
    // 2. Initialize interview section
    const interviewSection = new InterviewSection(page);
    await interviewSection.waitForSectionToLoad();
    
    // 3. Verify section is visible
    const isVisible = await interviewSection.isVisible();
    expect(isVisible).toBe(true);
    
    // 4. Verify title
    const title = await interviewSection.getTitle();
    expect(title).toBe('合格者インタビュー');
    
    // 5. Test tab functionality (same as experience section)
    const availableTabs = await interviewSection.getAvailableTabs();
    console.log('Available tabs:', availableTabs);
    expect(availableTabs).toContain('大学受験');
    expect(availableTabs).toContain('高校受験');
    expect(availableTabs).toContain('中学受験');
    
    // 6. Verify default active tab
    const activeTab = await interviewSection.getActiveTab();
    console.log('Default active tab:', activeTab);
    expect(activeTab.trim()).toBe('大学受験');
    
    // 7. Test tab switching
    await interviewSection.switchToHighSchoolTab();
    const newActiveTab = await interviewSection.getActiveTab();
    expect(newActiveTab.trim()).toBe('高校受験');
    
    await interviewSection.switchToJuniorHighSchoolTab();
    const juniorActiveTab = await interviewSection.getActiveTab();
    expect(juniorActiveTab.trim()).toBe('中学受験');
  });

  test('Test interview cards in university tab', async ({ page }) => {
    const topPage = new Top(page);
    await topPage.goto();
    
    const interviewSection = new InterviewSection(page);
    await interviewSection.waitForSectionToLoad();
    
    // Ensure we're on university tab
    await interviewSection.switchToUniversityTab();
    
    // Get interview cards
    const cards = await interviewSection.getInterviewCards();
    console.log('University interview cards:', cards.length);
    expect(cards.length).toBeGreaterThan(0);
    
    // Verify card data structure
    const firstCard = cards[0];
    expect(firstCard.destination).toBeTruthy();
    expect(firstCard.passedSchools).toBeTruthy();
    expect(firstCard.mainJuku).toBeTruthy();
    expect(firstCard.balloonText).toBeTruthy();
    expect(firstCard.interviewId).toBeTruthy();
    
    console.log('First university interview card:', {
      destination: firstCard.destination,
      mainJuku: firstCard.mainJuku,
      isPickup: firstCard.isPickup,
      gender: firstCard.gender,
      id: firstCard.interviewId
    });
    
    // Test pickup cards
    const pickupCards = await interviewSection.getPickupCards();
    console.log('Pickup cards count:', pickupCards.length);
    expect(pickupCards.length).toBeGreaterThan(0);
    expect(pickupCards.every(card => card.isPickup)).toBe(true);
    
    // Test view all link
    const viewAllText = await interviewSection.getViewAllLinkText();
    expect(viewAllText).toContain('大学受験の合格者インタビュー一覧へ');
    
    const viewAllHref = await interviewSection.getViewAllLinkHref();
    expect(viewAllHref).toBe('/passed-interview/list/university/');
  });

  test('Test interview cards in all tabs with summary data', async ({ page }) => {
    const topPage = new Top(page);
    await topPage.goto();
    
    const interviewSection = new InterviewSection(page);
    await interviewSection.waitForSectionToLoad();
    
    // Get data from all tabs
    const allTabsData = await interviewSection.getAllTabsData();
    console.log('All tabs data:', allTabsData.map(tab => ({
      name: tab.tabName,
      totalCards: tab.cards.length,
      pickupCards: tab.pickupCount,
      viewAllLink: tab.viewAllLink
    })));
    
    expect(allTabsData.length).toBe(3);
    
    // Verify each tab has cards and correct view all link
    const universityTab = allTabsData.find(tab => tab.tabName.trim() === '大学受験');
    expect(universityTab).toBeTruthy();
    expect(universityTab!.cards.length).toBeGreaterThan(0);
    expect(universityTab!.viewAllLink).toBe('/passed-interview/list/university/');
    
    const highSchoolTab = allTabsData.find(tab => tab.tabName.trim() === '高校受験');
    expect(highSchoolTab).toBeTruthy();
    expect(highSchoolTab!.cards.length).toBeGreaterThan(0);
    expect(highSchoolTab!.viewAllLink).toBe('/passed-interview/list/high/');
    
    const juniorHighTab = allTabsData.find(tab => tab.tabName.trim() === '中学受験');
    expect(juniorHighTab).toBeTruthy();
    expect(juniorHighTab!.viewAllLink).toBe('/passed-interview/list/junior/');
  });

  test('Test clicking interview card and view all link', async ({ page }) => {
    const topPage = new Top(page);
    await topPage.goto();
    
    const interviewSection = new InterviewSection(page);
    await interviewSection.waitForSectionToLoad();
    
    // Get first card data
    const cards = await interviewSection.getInterviewCards();
    const firstCard = cards[0];
    
    // Click on first interview card
    await interviewSection.clickInterviewCard(0);
    
    // Verify navigation to interview detail page
    await expect(page).toHaveURL(new RegExp(`/passed-interview/${firstCard.interviewId}/`));
    
    // Go back to top page
    await topPage.goto();
    await interviewSection.waitForSectionToLoad();
    
    // Test view all link
    await interviewSection.clickViewAllLink();
    await expect(page).toHaveURL('/passed-interview/list/university/');
  });

  test('Test interview summary and filtering', async ({ page }) => {
    const topPage = new Top(page);
    await topPage.goto();
    
    const interviewSection = new InterviewSection(page);
    await interviewSection.waitForSectionToLoad();
    
    // Get interview summary for university tab
    const summary = await interviewSection.getInterviewSummary();
    console.log('University interview summary:', summary);
    
    expect(summary.totalCards).toBeGreaterThan(0);
    expect(summary.pickupCards).toBeGreaterThan(0);
    expect(summary.maleCount + summary.femaleCount).toBe(summary.totalCards);
    expect(summary.uniqueJukus.length).toBeGreaterThan(0);
    expect(summary.uniqueDestinations.length).toBeGreaterThan(0);
    
    // Test filtering by gender
    const maleCards = await interviewSection.getCardsByGender('男性');
    const femaleCards = await interviewSection.getCardsByGender('女性');
    
    console.log('Male cards:', maleCards.length);
    console.log('Female cards:', femaleCards.length);
    
    expect(maleCards.every(card => card.gender === '男性')).toBe(true);
    expect(femaleCards.every(card => card.gender === '女性')).toBe(true);
    
    // Test filtering by juku
    const jukuCards = await interviewSection.getCardsByJuku('創英ゼミナール');
    console.log('Cards with 創英ゼミナール:', jukuCards.length);
    
    if (jukuCards.length > 0) {
      expect(jukuCards.every(card => 
        card.mainJuku.includes('創英ゼミナール') || 
        card.concurrentJuku.includes('創英ゼミナール')
      )).toBe(true);
    }
  });

  test('Test juku and destination lists', async ({ page }) => {
    const topPage = new Top(page);
    await topPage.goto();
    
    const interviewSection = new InterviewSection(page);
    await interviewSection.waitForSectionToLoad();
    
    // Switch to high school tab
    await interviewSection.switchToHighSchoolTab();
    
    // Get jukus and destinations
    const jukus = await interviewSection.getJukusInActiveTab();
    const destinations = await interviewSection.getDestinationsInActiveTab();
    
    console.log('High school jukus:', jukus);
    console.log('High school destinations:', destinations);
    
    expect(jukus.length).toBeGreaterThan(0);
    expect(destinations.length).toBeGreaterThan(0);
    
    // Test clicking by destination
    const cards = await interviewSection.getInterviewCards();
    if (cards.length > 0) {
      const targetDestination = cards[0].destination;
      await interviewSection.clickInterviewCardByDestination(targetDestination);
      
      // Verify navigation
      await expect(page).toHaveURL(/\/passed-interview\/\d+\//);
    }
  });
});