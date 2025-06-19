import { test, expect } from '@playwright/test';
import { JukuPage } from './pages/JukuPage';

test.describe('Juku Tab Navigation', () => {
  let jukuPage: JukuPage;
  const jukuId = process.env.JUKU_ID || '38';

  test.beforeEach(async ({ page }) => {
    jukuPage = new JukuPage(page);
    await jukuPage.goto(jukuId);
    await jukuPage.waitForPageToLoad();
  });

  test('should display all navigation tabs', async () => {
    const isVisible = await jukuPage.tabNavigation.isTabVisible();
    expect(isVisible).toBeTruthy();
    
    const tabs = await jukuPage.tabNavigation.getAllTabs();
    expect(tabs).toContain('塾トップ');
    expect(tabs).toContain('詳細レポ');
    expect(tabs).toContain('コース');
    expect(tabs).toContain('教室一覧');
    expect(tabs).toContain('口コミ');
  });

  test('should navigate to 詳細レポ page', async ({ page }) => {
    await jukuPage.tabNavigation.clickDetailReport();
    await expect(page).toHaveURL(new RegExp(`/juku/${jukuId}/report/`));
  });

  test('should navigate to コース page', async ({ page }) => {
    await jukuPage.tabNavigation.clickCourse();
    await expect(page).toHaveURL(new RegExp(`/juku/${jukuId}/course/`));
  });

  test('should navigate to 教室一覧 page', async ({ page }) => {
    await jukuPage.tabNavigation.clickClassList();
    await expect(page).toHaveURL(new RegExp(`/juku/${jukuId}/class/`));
  });

  test('should navigate back to 塾トップ from other pages', async ({ page }) => {
    // First go to course page
    await jukuPage.tabNavigation.clickCourse();
    await expect(page).toHaveURL(new RegExp(`/juku/${jukuId}/course/`));
    
    // Then navigate back to top
    await jukuPage.tabNavigation.clickJukuTop();
    await expect(page).toHaveURL(new RegExp(`/juku/${jukuId}/`));
  });

  test('should show active tab correctly', async ({ page }) => {
    // Check initial active tab (should be 塾トップ)
    const initialActiveTab = await jukuPage.tabNavigation.getActiveTab();
    expect(initialActiveTab).toBe('塾トップ');
    
    // Navigate to course and check active tab
    await jukuPage.tabNavigation.clickCourse();
    await page.waitForLoadState('networkidle');
    const courseActiveTab = await jukuPage.tabNavigation.getActiveTab();
    expect(courseActiveTab).toBe('コース');
  });

  test('should have correct href attributes', async ({ page }) => {
    // Wait for navigation to be visible
    await page.waitForSelector('.bjc-juku-tab', { state: 'visible' });
    
    // When on the top page, '塾トップ' won't have a link (it's the active page)
    const topLink = await jukuPage.tabNavigation.getTabLink('塾トップ');
    expect(topLink).toBeNull(); // Active page doesn't have a link
    
    const reportLink = await jukuPage.tabNavigation.getTabLink('詳細レポ');
    expect(reportLink).toBe(`/juku/${jukuId}/report/`);
    
    const courseLink = await jukuPage.tabNavigation.getTabLink('コース');
    expect(courseLink).toBe(`/juku/${jukuId}/course/`);
    
    const classLink = await jukuPage.tabNavigation.getTabLink('教室一覧');
    expect(classLink).toBe(`/juku/${jukuId}/class/`);
    
    const reviewLink = await jukuPage.tabNavigation.getTabLink('口コミ');
    expect(reviewLink).toBe(`/juku/${jukuId}/review/`);
  });

  test('should have href for non-active tabs', async ({ page }) => {
    // Navigate to course page first
    await jukuPage.tabNavigation.clickCourse();
    await page.waitForLoadState('networkidle');
    
    // Now '塾トップ' should have a link since it's not active
    const topLink = await jukuPage.tabNavigation.getTabLink('塾トップ');
    expect(topLink).toBe(`/juku/${jukuId}/`);
    
    // And 'コース' should not have a link since it's now active
    const courseLink = await jukuPage.tabNavigation.getTabLink('コース');
    expect(courseLink).toBeNull();
  });

  test('should identify clickable tabs correctly', async ({ page }) => {
    // On the top page, '塾トップ' should not be clickable
    const isTopClickable = await jukuPage.tabNavigation.isTabClickable('塾トップ');
    expect(isTopClickable).toBe(false);
    
    // Other tabs should be clickable
    const isReportClickable = await jukuPage.tabNavigation.isTabClickable('詳細レポ');
    expect(isReportClickable).toBe(true);
    
    const isCourseClickable = await jukuPage.tabNavigation.isTabClickable('コース');
    expect(isCourseClickable).toBe(true);
    
    // Navigate to course page
    await jukuPage.tabNavigation.clickCourse();
    await page.waitForLoadState('networkidle');
    
    // Now '塾トップ' should be clickable
    const isTopClickableAfterNav = await jukuPage.tabNavigation.isTabClickable('塾トップ');
    expect(isTopClickableAfterNav).toBe(true);
    
    // And 'コース' should not be clickable
    const isCourseClickableAfterNav = await jukuPage.tabNavigation.isTabClickable('コース');
    expect(isCourseClickableAfterNav).toBe(false);
  });
});