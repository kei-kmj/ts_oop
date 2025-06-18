import { test, expect } from '@playwright/test';
import { JukuCourseSection } from '../pages/JukuCourseSection';

test.describe('Juku Course Section Tests', () => {
  let courseSection: JukuCourseSection;
  const brandId = process.env.BRAND_ID || '21'; // Default to individual classroom Torai

  test.beforeEach(async ({ page }) => {
    console.log(`Testing Juku Course Section with Brand ID: ${brandId}`);
    
    courseSection = new JukuCourseSection(page);
    await page.goto(`https://bestjuku.com/juku/${brandId}/`);
    await courseSection.waitForSectionToLoad();
  });

  test('Verify course section basic functionality', async () => {
    const jukuNameElement = courseSection.page.locator('.bjc-juku-header-title');
    const jukuName = await jukuNameElement.textContent();
    console.log(`Testing courses for: ${jukuName}`);

    // Verify section is visible
    expect(await courseSection.isVisible()).toBe(true);

    // Test tab functionality
    const availableTabs = await courseSection.getAvailableTabs();
    console.log(`Available tabs: ${JSON.stringify(availableTabs)}`);
    expect(availableTabs.length).toBeGreaterThan(0);

    // Test default active tab
    const activeTab = await courseSection.getActiveTab();
    console.log(`Default active tab: ${activeTab}`);
    expect(activeTab).toBeTruthy();

    // Test active tab heading
    const activeHeading = await courseSection.getActiveTabHeading();
    console.log(`Active tab heading: ${activeHeading}`);
    expect(activeHeading).toBeTruthy();

    // Verify view all link
    expect(await courseSection.isViewAllLinkVisible()).toBe(true);
  });

  test('Test course cards in each tab', async () => {
    const allTabsData = await courseSection.getAllTabsCourseData();
    
    console.log('\nCourse data by tab:\n');
    for (const tabData of allTabsData) {
      console.log(`${tabData.tabName}:`);
      console.log(`- Total courses: ${tabData.courseCount}`);
      
      if (tabData.courses.length > 0) {
        const firstCourse = tabData.courses[0];
        console.log(`- First course:`);
        console.log(`  - Title: ${firstCourse.title}`);
        console.log(`  - Course ID: ${firstCourse.courseId}`);
        console.log(`  - Subjects: ${firstCourse.subjects.join(', ')}`);
        console.log(`  - Description preview: ${firstCourse.description.substring(0, 100)}...`);
      }
      console.log('');
    }

    // Verify each tab has courses and check for grade level availability
    const hasHighSchool = await courseSection.hasCoursesForGrade('高校生・高卒生');
    const hasJuniorHigh = await courseSection.hasCoursesForGrade('中学生');
    const hasElementary = await courseSection.hasCoursesForGrade('小学生');

    console.log('Course availability:');
    console.log(`- High School: ${hasHighSchool}`);
    console.log(`- Junior High: ${hasJuniorHigh}`);
    console.log(`- Elementary: ${hasElementary}`);

    // At least one grade level should have courses
    expect(hasHighSchool || hasJuniorHigh || hasElementary).toBe(true);
  });

  test('Test view all link', async () => {
    // Test view all link properties
    const viewAllText = await courseSection.getViewAllLinkText();
    const viewAllHref = await courseSection.getViewAllLinkHref();
    
    console.log(`View all link text: ${viewAllText}`);
    console.log(`View all link href: ${viewAllHref}`);
    
    expect(viewAllText).toContain('コース');
    expect(viewAllHref).toContain(`/juku/${brandId}/course/`);
    
    // Click the view all link
    await courseSection.clickViewAllLink();
    
    // Verify navigation to course list page
    await courseSection.page.waitForURL(new RegExp(`/juku/${brandId}/course/`));
    const currentUrl = courseSection.page.url();
    expect(currentUrl).toContain(`/juku/${brandId}/course/`);
  });

  test('Test course summary and analysis', async () => {
    const summary = await courseSection.getCourseSummary();
    
    console.log('\nCourse Summary:');
    console.log(`- Total courses: ${summary.totalCourses}`);
    console.log(`- By tab: ${JSON.stringify(summary.byTab)}`);
    console.log(`- Exam preparation courses: ${summary.examPreparationCount}`);
    console.log(`- Regular courses: ${summary.regularCourseCount}`);
    console.log(`- Most common subjects: ${summary.mostCommonSubjects.join(', ')}`);
    console.log(`- Subject coverage: ${JSON.stringify(summary.subjectCoverage)}`);
    
    expect(summary.totalCourses).toBeGreaterThan(0);
    expect(summary.examPreparationCount).toBeGreaterThanOrEqual(0);
    expect(summary.regularCourseCount).toBeGreaterThanOrEqual(0);
    expect(summary.mostCommonSubjects.length).toBeGreaterThan(0);
    
    // Test filtering by course type
    const examCourses = await courseSection.getExamPreparationCourses();
    const regularCourses = await courseSection.getRegularCourses();
    
    console.log(`\nExam preparation courses: ${examCourses.length}`);
    console.log(`Regular courses: ${regularCourses.length}`);
    
    expect(examCourses.length + regularCourses.length).toBeLessThanOrEqual(summary.totalCourses);
  });

  test('Test subject-based filtering', async () => {
    // Test filtering by common subjects
    const mathCourses = await courseSection.getCoursesBySubject('数学');
    const englishCourses = await courseSection.getCoursesBySubject('英語');
    const japaneseCourses = await courseSection.getCoursesBySubject('国語');
    
    console.log(`\nCourses by subject:`);
    console.log(`- Math courses: ${mathCourses.length}`);
    console.log(`- English courses: ${englishCourses.length}`);
    console.log(`- Japanese courses: ${japaneseCourses.length}`);
    
    if (mathCourses.length > 0) {
      console.log(`  Math course example: ${mathCourses[0].title}`);
    }
    if (englishCourses.length > 0) {
      console.log(`  English course example: ${englishCourses[0].title}`);
    }
    
    // At least some courses should be available for core subjects
    expect(mathCourses.length + englishCourses.length + japaneseCourses.length).toBeGreaterThan(0);
  });

  test('Test clicking course card', async () => {
    // First, get course cards from the active tab
    const courseCards = await courseSection.getCourseCards();
    
    if (courseCards.length > 0) {
      const firstCourse = courseCards[0];
      console.log(`Clicking on course: ${firstCourse.title}`);
      console.log(`Course ID: ${firstCourse.courseId}`);
      
      // Click the first course card
      await courseSection.clickCourseCard(0);
      
      // Wait for navigation to course detail page
      await courseSection.page.waitForLoadState('networkidle');
      
      // Verify we navigated to the course detail page
      const currentUrl = courseSection.page.url();
      expect(currentUrl).toContain(`/juku/${brandId}/course/${firstCourse.courseId}/`);
      console.log('Successfully navigated to course detail page');
    } else {
      console.log('No course cards found in the active tab');
    }
  });

  test('Test tab switching and course retrieval', async () => {
    const tabs = await courseSection.getAvailableTabs();
    
    for (const tab of tabs) {
      console.log(`\nSwitching to ${tab} tab`);
      const courses = await courseSection.switchTabAndGetCourses(tab);
      console.log(`Found ${courses.length} courses`);
      
      if (courses.length > 0) {
        const firstCourse = courses[0];
        console.log(`First course - Title: ${firstCourse.title}`);
        console.log(`First course - Subjects: ${firstCourse.subjects.join(', ')}`);
        console.log(`First course - Course ID: ${firstCourse.courseId}`);
        
        // Check if it's exam preparation or regular course
        const isExamPrep = firstCourse.title.includes('受験対策') || firstCourse.title.includes('対策コース');
        const isRegular = firstCourse.title.includes('向けコース') && !isExamPrep;
        console.log(`Course type: ${isExamPrep ? 'Exam Preparation' : isRegular ? 'Regular' : 'Other'}`);
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