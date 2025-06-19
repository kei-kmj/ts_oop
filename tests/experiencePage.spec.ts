import { test, expect } from '@playwright/test';
import { ExperiencePage } from './pages/ExperiencePage';

test.describe('ExperiencePage', () => {
  let experiencePage: ExperiencePage;

  test.beforeEach(async ({ page }) => {
    experiencePage = new ExperiencePage(page);
  });

  test('体験記ページに遷移できる', async () => {
    await experiencePage.goto('21');
    await expect(experiencePage.page).toHaveURL(/\/juku\/21\/experience\//);
  });

  test('受験タブと操作できる', async () => {
    await experiencePage.goto('21');
    
    // Check if we can get all tabs
    const tabs = await experiencePage.examTabs.getAllTabs();
    expect(tabs.length).toBeGreaterThan(0);
    
    // Check active tab
    const activeTab = await experiencePage.examTabs.getActiveTab();
    expect(activeTab).toBe('すべて');
    
    // Click on a tab if available
    if (tabs.includes('大学受験')) {
      await experiencePage.examTabs.clickTab('大学受験');
      await expect(experiencePage.page).toHaveURL(/exam=university/);
    }
  });

  test('体験記投稿を取得できる', async () => {
    await experiencePage.goto('21');
    
    // Wait for posts to load
    await experiencePage.page.waitForSelector('.bjc-post-experience', { timeout: 10000 });
    
    // Check if there are experience posts
    const count = await experiencePage.getExperienceCount();
    expect(count).toBeGreaterThan(0);
    
    if (count > 0) {
      // Test first post
      const title = await experiencePage.getExperienceTitle(0);
      expect(title).toBeTruthy();
      
      const meta = await experiencePage.getExperienceMeta(0);
      expect(meta).toBeTruthy();
      
      const year = await experiencePage.getExperienceYear(0);
      expect(year).toMatch(/\d{4}/);
      
      const deviation = await experiencePage.getStartingDeviation(0);
      expect(deviation).toMatch(/\d+/);
    }
  });

  test('すべての体験記タイトルを取得できる', async () => {
    await experiencePage.goto('21');
    
    await experiencePage.page.waitForSelector('.bjc-post-experience', { timeout: 10000 });
    
    const titles = await experiencePage.getAllExperienceTitles();
    expect(titles.length).toBeGreaterThan(0);
    titles.forEach(title => {
      expect(title).toBeTruthy();
    });
  });

  test('体験記投稿をクリックできる', async () => {
    await experiencePage.goto('21');
    
    await experiencePage.page.waitForSelector('.bjc-post-experience', { timeout: 10000 });
    
    const count = await experiencePage.getExperienceCount();
    if (count > 0) {
      await experiencePage.clickExperiencePost(0);
      await expect(experiencePage.page).toHaveURL(/\/shingaku\/experience\/\d+\//);
    }
  });
});