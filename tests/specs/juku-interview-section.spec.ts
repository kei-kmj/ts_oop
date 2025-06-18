import { test, expect } from '@playwright/test';
import { JukuHeader } from '../pages/JukuHeader';
import { JukuInterviewSection } from '../pages/JukuInterviewSection';

test.describe('Juku Interview Section Tests', () => {
  // Get brand ID from environment variable or use default
  const testBrandId = process.env.JUKU_BRAND_ID || '21'; // Default: 個別教室のトライ
  
  test.beforeAll(() => {
    console.log(`Testing Juku Interview Section with Brand ID: ${testBrandId}`);
  });

  test('Verify interview section basic functionality', async ({ page }) => {
    // Navigate to juku page
    const jukuHeader = new JukuHeader(page);
    await jukuHeader.goto(testBrandId);
    await jukuHeader.waitForHeaderToLoad();
    
    // Get juku name for reference
    const jukuName = await jukuHeader.getJukuName();
    console.log('Testing interviews for:', jukuName);
    
    // Initialize interview section
    const interviewSection = new JukuInterviewSection(page);
    await interviewSection.waitForSectionToLoad();
    
    // Verify section is visible
    const isVisible = await interviewSection.isVisible();
    expect(isVisible).toBe(true);
    
    // Test tab functionality
    const availableTabs = await interviewSection.getAvailableTabs();
    console.log('Available tabs:', availableTabs);
    expect(availableTabs).toContain('大学受験');
    expect(availableTabs).toContain('高校受験');
    expect(availableTabs).toContain('中学受験');
    
    // Verify default active tab
    const activeTab = await interviewSection.getActiveTab();
    console.log('Default active tab:', activeTab);
    expect(activeTab.trim()).toBe('大学受験');
  });

  test('Test interview cards in each tab', async ({ page }) => {
    const jukuHeader = new JukuHeader(page);
    await jukuHeader.goto(testBrandId);
    await jukuHeader.waitForHeaderToLoad();
    
    const jukuName = await jukuHeader.getJukuName();
    const interviewSection = new JukuInterviewSection(page);
    await interviewSection.waitForSectionToLoad();
    
    // Get all tabs data
    const allTabsData = await interviewSection.getAllTabsInterviewData();
    console.log('\nInterview data by tab:');
    
    for (const tabData of allTabsData) {
      console.log(`\n${tabData.tabName}:`);
      console.log(`- Total interviews: ${tabData.cardCount}`);
      
      if (tabData.cards.length > 0) {
        const firstCard = tabData.cards[0];
        console.log('- First interview:');
        console.log(`  - Destination: ${firstCard.destination}`);
        console.log(`  - Main juku: ${firstCard.mainJuku}`);
        console.log(`  - Gender: ${firstCard.gender}`);
      }
    }
    
    // Check which tabs have interviews
    const hasUniversity = await interviewSection.hasInterviewsForGrade('大学受験');
    const hasHighSchool = await interviewSection.hasInterviewsForGrade('高校受験');
    const hasJunior = await interviewSection.hasInterviewsForGrade('中学受験');
    
    console.log('\nInterview availability:');
    console.log(`- University: ${hasUniversity}`);
    console.log(`- High School: ${hasHighSchool}`);
    console.log(`- Junior High: ${hasJunior}`);
  });

  test('Test view all link', async ({ page }) => {
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
    console.log('View all link text:', linkText);
    
    if (testBrandId === '21') {
      expect(linkText).toContain('個別教室のトライの合格者インタビューをすべて見る');
    } else {
      expect(linkText).toContain('合格者インタビューをすべて見る');
    }
    
    const linkHref = await interviewSection.getViewAllLinkHref();
    console.log('View all link href:', linkHref);
    expect(linkHref).toBe(`/juku/${testBrandId}/passed-interview/`);
  });

  test('Test interview summary and juku mentions', async ({ page }) => {
    const jukuHeader = new JukuHeader(page);
    await jukuHeader.goto(testBrandId);
    await jukuHeader.waitForHeaderToLoad();
    
    const jukuName = await jukuHeader.getJukuName();
    const interviewSection = new JukuInterviewSection(page);
    await interviewSection.waitForSectionToLoad();
    
    // Get interview summary
    const summary = await interviewSection.getInterviewSummary();
    console.log('\nInterview Summary:');
    console.log(`- Total interviews: ${summary.totalInterviews}`);
    console.log('- By tab:', summary.byTab);
    console.log(`- Mentions of ${jukuName}:`);
    console.log(`  - As main juku: ${summary.jukuMentions.asMain}`);
    console.log(`  - As concurrent juku: ${summary.jukuMentions.asConcurrent}`);
    
    // Get juku-related interviews
    const relatedInterviews = await interviewSection.getJukuRelatedInterviews(jukuName);
    console.log(`\nInterviews mentioning ${jukuName}: ${relatedInterviews.length}`);
    
    expect(summary.totalInterviews).toBeGreaterThanOrEqual(0);
    expect(Object.keys(summary.byTab).length).toBe(3); // Should have 3 tabs
  });

  test('Test clicking interview card', async ({ page }) => {
    const jukuHeader = new JukuHeader(page);
    await jukuHeader.goto(testBrandId);
    await jukuHeader.waitForHeaderToLoad();
    
    const interviewSection = new JukuInterviewSection(page);
    await interviewSection.waitForSectionToLoad();
    
    // Get cards in current tab
    const cards = await interviewSection.getInterviewCards();
    
    if (cards.length > 0) {
      const firstCard = cards[0];
      console.log('Clicking on interview:', firstCard.interviewId);
      
      // Click first interview card
      await interviewSection.clickInterviewCard(0);
      
      // Verify navigation to interview detail page
      await expect(page).toHaveURL(new RegExp(`/passed-interview/${firstCard.interviewId}/`));
      console.log('Successfully navigated to interview detail page');
    } else {
      console.log('No interview cards found in current tab');
    }
  });

  test('Test tab switching and card retrieval', async ({ page }) => {
    const jukuHeader = new JukuHeader(page);
    await jukuHeader.goto(testBrandId);
    await jukuHeader.waitForHeaderToLoad();
    
    const interviewSection = new JukuInterviewSection(page);
    await interviewSection.waitForSectionToLoad();
    
    // Test switching to each tab and getting cards
    const tabs = ['大学受験', '高校受験', '中学受験'];
    
    for (const tab of tabs) {
      console.log(`\nSwitching to ${tab} tab`);
      const cards = await interviewSection.switchTabAndGetCards(tab);
      console.log(`Found ${cards.length} interviews`);
      
      // Verify tab is active
      const isActive = await interviewSection.isTabActive(tab);
      expect(isActive).toBe(true);
      
      if (cards.length > 0) {
        // Log some details about the first card
        const firstCard = cards[0];
        console.log(`First card - Destination: ${firstCard.destination}`);
        console.log(`First card - Main Juku: ${firstCard.mainJuku}`);
      }
    }
  });
});