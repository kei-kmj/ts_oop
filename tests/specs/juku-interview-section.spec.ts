import { test, expect } from '@playwright/test';
import { JukuHeader } from '../pages/JukuHeader';
import { JukuInterviewSection } from '../pages/JukuInterviewSection';

test.describe('Juku Interview Section Tests', () => {
  // Get brand ID from environment variable or use default
  const testBrandId = process.env.JUKU_BRAND_ID || '21'; // Default: 個別教室のトライ
  
  test.beforeAll(() => {
  });

  test('インタビューセクションの基本機能を検証する', async ({ page }) => {
    // Navigate to juku page
    const jukuHeader = new JukuHeader(page);
    await jukuHeader.goto(testBrandId);
    await jukuHeader.waitForHeaderToLoad();
    
    // Get juku name for reference
    const jukuName = await jukuHeader.getJukuName();
    
    // Initialize interview section
    const interviewSection = new JukuInterviewSection(page);
    await interviewSection.waitForSectionToLoad();
    
    // Verify section is visible
    const isVisible = await interviewSection.isVisible();
    expect(isVisible).toBe(true);
    
    // Test tab functionality
    const availableTabs = await interviewSection.getAvailableTabs();
    expect(availableTabs).toContain('大学受験');
    expect(availableTabs).toContain('高校受験');
    expect(availableTabs).toContain('中学受験');
    
    // Verify default active tab
    const activeTab = await interviewSection.getActiveTab();
    expect(activeTab.trim()).toBe('大学受験');
  });

  test('各タブのインタビューカードをテストする', async ({ page }) => {
    const jukuHeader = new JukuHeader(page);
    await jukuHeader.goto(testBrandId);
    await jukuHeader.waitForHeaderToLoad();
    
    const jukuName = await jukuHeader.getJukuName();
    const interviewSection = new JukuInterviewSection(page);
    await interviewSection.waitForSectionToLoad();
    
    // Get all tabs data
    const allTabsData = await interviewSection.getAllTabsInterviewData();
    
    for (const tabData of allTabsData) {
      
      if (tabData.cards.length > 0) {
        const firstCard = tabData.cards[0];
      }
    }
    
    // Check which tabs have interviews
    const hasUniversity = await interviewSection.hasInterviewsForGrade('大学受験');
    const hasHighSchool = await interviewSection.hasInterviewsForGrade('高校受験');
    const hasJunior = await interviewSection.hasInterviewsForGrade('中学受験');
    
  });

  test('すべて表示リンクをテストする', async ({ page }) => {
    const jukuHeader = new JukuHeader(page);
    await jukuHeader.goto(testBrandId);
    await jukuHeader.waitForHeaderToLoad();
    
    const jukuName = await jukuHeader.getJukuName();
    const interviewSection = new JukuInterviewSection(page);
    await interviewSection.waitForSectionToLoad();
    
    // Check view all link
    const isLinkVisible = await interviewSection.isViewAllLinkVisible();
    expect(isLinkVisible).toBe(true);
    
    const linkText = await interviewSection.getViewAllLinkText();
    
    if (testBrandId === '21') {
      expect(linkText).toContain('個別教室のトライの合格者インタビューをすべて見る');
    } else {
      expect(linkText).toContain('合格者インタビューをすべて見る');
    }
    
    const linkHref = await interviewSection.getViewAllLinkHref();
    expect(linkHref).toBe(`/juku/${testBrandId}/passed-interview/`);
  });

  test('インタビューのサマリーと塾の言及をテストする', async ({ page }) => {
    const jukuHeader = new JukuHeader(page);
    await jukuHeader.goto(testBrandId);
    await jukuHeader.waitForHeaderToLoad();
    
    const jukuName = await jukuHeader.getJukuName();
    const interviewSection = new JukuInterviewSection(page);
    await interviewSection.waitForSectionToLoad();
    
    // Get interview summary
    const summary = await interviewSection.getInterviewSummary();
    
    // Get juku-related interviews
    const relatedInterviews = await interviewSection.getJukuRelatedInterviews(jukuName);
    
    expect(summary.totalInterviews).toBeGreaterThanOrEqual(0);
    expect(Object.keys(summary.byTab).length).toBe(3); // Should have 3 tabs
  });

  test('インタビューカードのクリックをテストする', async ({ page }) => {
    const jukuHeader = new JukuHeader(page);
    await jukuHeader.goto(testBrandId);
    await jukuHeader.waitForHeaderToLoad();
    
    const interviewSection = new JukuInterviewSection(page);
    await interviewSection.waitForSectionToLoad();
    
    // Get cards in current tab
    const cards = await interviewSection.getInterviewCards();
    
    if (cards.length > 0) {
      const firstCard = cards[0];
      
      // Click first interview card
      await interviewSection.clickInterviewCard(0);
      
      // Verify navigation to interview detail page
      await expect(page).toHaveURL(new RegExp(`/passed-interview/${firstCard.interviewId}/`));
    } else {
    }
  });

  test('タブの切り替えとカードの取得をテストする', async ({ page }) => {
    const jukuHeader = new JukuHeader(page);
    await jukuHeader.goto(testBrandId);
    await jukuHeader.waitForHeaderToLoad();
    
    const interviewSection = new JukuInterviewSection(page);
    await interviewSection.waitForSectionToLoad();
    
    // Test switching to each tab and getting cards
    const tabs = ['大学受験', '高校受験', '中学受験'];
    
    for (const tab of tabs) {
      const cards = await interviewSection.switchTabAndGetCards(tab);
      
      // Verify tab is active
      const isActive = await interviewSection.isTabActive(tab);
      expect(isActive).toBe(true);
      
      if (cards.length > 0) {
        // Log some details about the first card
        const firstCard = cards[0];
      }
    }
  });
});