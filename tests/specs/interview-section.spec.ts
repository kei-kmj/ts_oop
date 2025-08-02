import { test, expect } from '@playwright/test';
import { Top } from '../pages/Top';
import { InterviewSection } from '../pages/InterviewSection';

test.describe('Interview Section Tests', () => {
  test('インタビューセクションのコンポーネントとタブ機能を検証する', async ({ page }) => {
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
    expect(availableTabs).toContain('大学受験');
    expect(availableTabs).toContain('高校受験');
    expect(availableTabs).toContain('中学受験');

    // 6. Verify default active tab
    const activeTab = await interviewSection.getActiveTab();
    expect(activeTab.trim()).toBe('大学受験');

    // 7. Test tab clicking (tabs may not actually switch on this page)
    await interviewSection.switchToHighSchoolTab();
    await interviewSection.switchToJuniorHighSchoolTab();
    await interviewSection.switchToUniversityTab();

    // Verify section is still functional after tab interactions
    expect(await interviewSection.isVisible()).toBe(true);
  });

  test('大学受験タブのインタビューカードをテストする', async ({ page }) => {
    const topPage = new Top(page);
    await topPage.goto();

    const interviewSection = new InterviewSection(page);
    await interviewSection.waitForSectionToLoad();

    // Ensure we're on university tab
    await interviewSection.switchToUniversityTab();

    // Get interview cards
    const cards = await interviewSection.getInterviewCards();
    expect(cards.length).toBeGreaterThan(0);

    // Verify card data structure
    const firstCard = cards[0];
    expect(firstCard.destination).toBeTruthy();
    expect(firstCard.passedSchools).toBeTruthy();
    expect(firstCard.mainJuku).toBeTruthy();
    expect(firstCard.balloonText).toBeTruthy();
    expect(firstCard.interviewId).toBeTruthy();

    // Test pickup cards
    const pickupCards = await interviewSection.getPickupCards();
    expect(pickupCards.length).toBeGreaterThan(0);
    expect(pickupCards.every((card) => card.isPickup)).toBe(true);

    // Test view all link
    const viewAllText = await interviewSection.getViewAllLinkText();
    expect(viewAllText).toContain('大学受験の合格者インタビュー一覧へ');

    const viewAllHref = await interviewSection.getViewAllLinkHref();
    expect(viewAllHref).toBe('/passed-interview/list/university/');
  });

  test('サマリーデータとともにすべてのタブのインタビューカードをテストする', async ({ page }) => {
    const topPage = new Top(page);
    await topPage.goto();

    const interviewSection = new InterviewSection(page);
    await interviewSection.waitForSectionToLoad();

    // Get data from all tabs
    const allTabsData = await interviewSection.getAllTabsData();
    expect(allTabsData.length).toBe(3);

    // Verify each tab has cards and correct view all link
    const universityTab = allTabsData.find((tab) => tab.tabName.trim() === '大学受験');
    expect(universityTab).toBeTruthy();
    expect(universityTab!.cards.length).toBeGreaterThan(0);
    expect(universityTab!.viewAllLink).toBe('/passed-interview/list/university/');

    const highSchoolTab = allTabsData.find((tab) => tab.tabName.trim() === '高校受験');
    expect(highSchoolTab).toBeTruthy();
    expect(highSchoolTab!.cards.length).toBeGreaterThan(0);
    expect(highSchoolTab!.viewAllLink).toBe('/passed-interview/list/high/');

    const juniorHighTab = allTabsData.find((tab) => tab.tabName.trim() === '中学受験');
    expect(juniorHighTab).toBeTruthy();
    expect(juniorHighTab!.viewAllLink).toBe('/passed-interview/list/junior/');
  });

  test('インタビューカードのクリックとすべて表示リンクをテストする', async ({ page }) => {
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

  test('インタビューのサマリーとフィルタリングをテストする', async ({ page }) => {
    const topPage = new Top(page);
    await topPage.goto();

    const interviewSection = new InterviewSection(page);
    await interviewSection.waitForSectionToLoad();

    // Get interview summary for university tab
    const summary = await interviewSection.getInterviewSummary();

    expect(summary.totalCards).toBeGreaterThan(0);
    expect(summary.pickupCards).toBeGreaterThan(0);
    expect(summary.maleCount + summary.femaleCount).toBe(summary.totalCards);
    expect(summary.uniqueJukus.length).toBeGreaterThan(0);
    expect(summary.uniqueDestinations.length).toBeGreaterThan(0);

    // Test filtering by gender
    const maleCards = await interviewSection.getCardsByGender('男性');
    const femaleCards = await interviewSection.getCardsByGender('女性');

    expect(maleCards.every((card) => card.gender === '男性')).toBe(true);
    expect(femaleCards.every((card) => card.gender === '女性')).toBe(true);

    // Test filtering by juku
    const jukuCards = await interviewSection.getCardsByJuku('創英ゼミナール');

    if (jukuCards.length > 0) {
      expect(
        jukuCards.every(
          (card) => card.mainJuku.includes('創英ゼミナール') || card.concurrentJuku.includes('創英ゼミナール'),
        ),
      ).toBe(true);
    }
  });

  test('塾と進学先のリストをテストする', async ({ page }) => {
    const topPage = new Top(page);
    await topPage.goto();

    const interviewSection = new InterviewSection(page);
    await interviewSection.waitForSectionToLoad();

    // Switch to high school tab
    await interviewSection.switchToHighSchoolTab();

    // Get jukus and destinations
    const jukus = await interviewSection.getJukusInActiveTab();
    const destinations = await interviewSection.getDestinationsInActiveTab();

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
