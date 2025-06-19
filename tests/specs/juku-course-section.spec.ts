import { test, expect } from '@playwright/test';
import { JukuCourseSection } from '../pages/JukuCourseSection';

test.describe('Juku Course Section Tests', () => {
  let courseSection: JukuCourseSection;
  const brandId = process.env.BRAND_ID || '21'; // Default to individual classroom Torai

  test.beforeEach(async ({ page }) => {
    
    courseSection = new JukuCourseSection(page);
    await page.goto(`https://bestjuku.com/juku/${brandId}/`);
    await courseSection.waitForSectionToLoad();
  });

  test('コースセクションの基本機能を検証する', async () => {
    const jukuNameElement = courseSection.page.locator('.bjc-juku-header-title');
    const jukuName = await jukuNameElement.textContent();

    // Verify section is visible
    expect(await courseSection.isVisible()).toBe(true);

    // Test tab functionality
    const availableTabs = await courseSection.getAvailableTabs();
    expect(availableTabs.length).toBeGreaterThan(0);

    // Test default active tab
    const activeTab = await courseSection.getActiveTab();
    expect(activeTab).toBeTruthy();

    // Test active tab heading
    const activeHeading = await courseSection.getActiveTabHeading();
    expect(activeHeading).toBeTruthy();

    // Verify view all link
    expect(await courseSection.isViewAllLinkVisible()).toBe(true);
  });

  test('各タブのコースカードをテストする', async () => {
    const allTabsData = await courseSection.getAllTabsCourseData();
    
    for (const tabData of allTabsData) {
      
      if (tabData.courses.length > 0) {
        const firstCourse = tabData.courses[0];
      }
    }

    // Verify each tab has courses and check for grade level availability
    const hasHighSchool = await courseSection.hasCoursesForGrade('高校生・高卒生');
    const hasJuniorHigh = await courseSection.hasCoursesForGrade('中学生');
    const hasElementary = await courseSection.hasCoursesForGrade('小学生');


    // At least one grade level should have courses
    expect(hasHighSchool || hasJuniorHigh || hasElementary).toBe(true);
  });

  test('すべて表示リンクをテストする', async () => {
    // Test view all link properties
    const viewAllText = await courseSection.getViewAllLinkText();
    const viewAllHref = await courseSection.getViewAllLinkHref();
    
    
    expect(viewAllText).toContain('コース');
    expect(viewAllHref).toContain(`/juku/${brandId}/course/`);
    
    // Click the view all link
    await courseSection.clickViewAllLink();
    
    // Verify navigation to course list page
    await courseSection.page.waitForURL(new RegExp(`/juku/${brandId}/course/`));
    const currentUrl = courseSection.page.url();
    expect(currentUrl).toContain(`/juku/${brandId}/course/`);
  });

  test('コースのサマリーと分析をテストする', async () => {
    const summary = await courseSection.getCourseSummary();
    
    
    expect(summary.totalCourses).toBeGreaterThan(0);
    expect(summary.examPreparationCount).toBeGreaterThanOrEqual(0);
    expect(summary.regularCourseCount).toBeGreaterThanOrEqual(0);
    expect(summary.mostCommonSubjects.length).toBeGreaterThan(0);
    
    // Test filtering by course type
    const examCourses = await courseSection.getExamPreparationCourses();
    const regularCourses = await courseSection.getRegularCourses();
    
    
    expect(examCourses.length + regularCourses.length).toBeLessThanOrEqual(summary.totalCourses);
  });

  test('科目ベースのフィルタリングをテストする', async () => {
    // Test filtering by common subjects
    const mathCourses = await courseSection.getCoursesBySubject('数学');
    const englishCourses = await courseSection.getCoursesBySubject('英語');
    const japaneseCourses = await courseSection.getCoursesBySubject('国語');
    
    
    if (mathCourses.length > 0) {
    }
    if (englishCourses.length > 0) {
    }
    
    // At least some courses should be available for core subjects
    expect(mathCourses.length + englishCourses.length + japaneseCourses.length).toBeGreaterThan(0);
  });

  test('コースカードのクリックをテストする', async () => {
    // First, get course cards from the active tab
    const courseCards = await courseSection.getCourseCards();
    
    if (courseCards.length > 0) {
      const firstCourse = courseCards[0];
      
      // Click the first course card
      await courseSection.clickCourseCard(0);
      
      // Wait for navigation to course detail page
      await courseSection.page.waitForLoadState('networkidle');
      
      // Verify we navigated to the course detail page
      const currentUrl = courseSection.page.url();
      expect(currentUrl).toContain(`/juku/${brandId}/course/${firstCourse.courseId}/`);
    } else {
    }
  });

  test('タブの切り替えとコースの取得をテストする', async () => {
    const tabs = await courseSection.getAvailableTabs();
    
    for (const tab of tabs) {
      const courses = await courseSection.switchTabAndGetCourses(tab);
      
      if (courses.length > 0) {
        const firstCourse = courses[0];
        
        // Check if it's exam preparation or regular course
        const isExamPrep = firstCourse.title.includes('受験対策') || firstCourse.title.includes('対策コース');
        const isRegular = firstCourse.title.includes('向けコース') && !isExamPrep;
      }
      
      // Verify the tab is now active
      const isActive = await courseSection.isTabActive(tab);
      expect(isActive).toBe(true);
      
      // Verify the heading matches the tab
      const heading = await courseSection.getActiveTabHeading();
      expect(heading).toContain('向け');
    }
  });
});