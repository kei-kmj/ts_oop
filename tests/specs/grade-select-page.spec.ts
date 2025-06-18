import { test, expect } from '@playwright/test';
import { GradeSelectPage } from '../pages/GradeSelectPage';

test.describe('Grade Select Page', () => {
  let gradePage: GradeSelectPage;

  test.beforeEach(async ({ page }) => {
    gradePage = new GradeSelectPage(page);
    // Go to grade selection page with hokkaido and sapporo parameters
    await gradePage.goto('hokkaido', '1_01_801');
  });

  test('Page elements should be visible', async ({ page }) => {
    // Wait for page to load
    await gradePage.waitForPageToLoad();
    
    // Check header elements
    await expect(gradePage.backLink).toBeVisible();
    await expect(gradePage.pageTitle).toBeVisible();
    
    // Check grade sections
    await expect(gradePage.highSchoolSection).toBeVisible();
    await expect(gradePage.middleSchoolSection).toBeVisible();
    await expect(gradePage.elementarySchoolSection).toBeVisible();
    await expect(gradePage.othersSection).toBeVisible();
  });

  test('Can get grade links count', async ({ page }) => {
    await gradePage.waitForPageToLoad();
    
    const gradeCount = await gradePage.getGradeLinksCount();
    expect(gradeCount).toBeGreaterThan(0);
    // Should have links for all grades plus "すべて" options
    expect(gradeCount).toBeGreaterThanOrEqual(16); // Minimum expected grade options
  });

  test('Can get grade data', async ({ page }) => {
    await gradePage.waitForPageToLoad();
    
    // Get data for high school all
    const highSchoolAllData = await gradePage.getGradeData('高校生すべて');
    
    expect(highSchoolAllData).toBeTruthy();
    expect(highSchoolAllData?.name).toBe('高校生すべて');
    expect(highSchoolAllData?.gradeValue).toBe('11,12,13');
    expect(highSchoolAllData?.prefecture).toBe('hokkaido');
    expect(highSchoolAllData?.addressCode).toBe('1_01_801');
    expect(highSchoolAllData?.href).toContain('/search');
  });

  test('Can get all grade data', async ({ page }) => {
    await gradePage.waitForPageToLoad();
    
    const allGrades = await gradePage.getAllGradeData();
    
    expect(allGrades.length).toBeGreaterThan(0);
    
    // Check structure of first grade
    const firstGrade = allGrades[0];
    expect(firstGrade.name).toBeTruthy();
    expect(firstGrade.href).toBeTruthy();
    expect(firstGrade.gradeValue).toBeTruthy();
    expect(firstGrade.prefecture).toBe('hokkaido');
    expect(firstGrade.addressCode).toBe('1_01_801');
    expect(firstGrade.section).toBeTruthy();
  });

  test('Can get grade data by section', async ({ page }) => {
    await gradePage.waitForPageToLoad();
    
    // Get high school grades
    const highSchoolGrades = await gradePage.getAllGradeDataInSection(gradePage.highSchoolSection);
    
    expect(highSchoolGrades.length).toBe(4); // 高校生すべて, 高1, 高2, 高3
    
    // Check specific grades
    const allHighSchool = highSchoolGrades.find(g => g.name === '高校生すべて');
    const grade1 = highSchoolGrades.find(g => g.name === '高1');
    
    expect(allHighSchool).toBeTruthy();
    expect(allHighSchool?.gradeValue).toBe('11,12,13');
    expect(grade1).toBeTruthy();
    expect(grade1?.gradeValue).toBe('11');
  });

  test('Can filter single grades vs all options', async ({ page }) => {
    await gradePage.waitForPageToLoad();
    
    // Get single grades (individual grade levels)
    const singleGrades = await gradePage.getSingleGrades();
    
    // Get "すべて" options
    const allOptions = await gradePage.getAllOptions();
    
    expect(singleGrades.length).toBeGreaterThan(0);
    expect(allOptions.length).toBe(3); // 高校生すべて, 中学生すべて, 小学生すべて
    
    // Verify "すべて" options have multiple grade values
    allOptions.forEach(option => {
      expect(option.gradeValue).toContain(',');
      expect(option.name).toContain('すべて');
    });
    
    // Verify single grades don't have commas in grade values
    singleGrades.forEach(grade => {
      expect(grade.gradeValue).not.toContain(',');
      expect(grade.name).not.toContain('すべて');
    });
  });

  test('Can select specific grades', async ({ page }) => {
    await gradePage.waitForPageToLoad();
    
    // Select middle school 3rd grade (this will navigate to search results)
    await gradePage.selectMiddleSchool3();
    
    // Should navigate to search page
    await expect(page).toHaveURL(/\/search/);
    await expect(page).toHaveURL(/target_grade_id=10/);
  });

  test('Can use convenience methods for grade selection', async ({ page }) => {
    await gradePage.waitForPageToLoad();
    
    // Test high school selection
    await gradePage.selectHighSchoolAll();
    
    // Should navigate with correct grade parameters (URL encoded commas)
    await expect(page).toHaveURL(/target_grade_id=11.*12.*13/);
  });

  test('Campaign modal functionality', async ({ page }) => {
    await gradePage.waitForPageToLoad();
    
    // Check if campaign modal exists (may or may not be visible)
    const modalExists = await gradePage.campaignModal.count() > 0;
    
    if (modalExists) {
      // If modal is visible, test close functionality
      const isModalVisible = await gradePage.isCampaignModalVisible();
      if (isModalVisible) {
        await gradePage.closeCampaignModal();
        // Modal should be closed (not visible)
        await expect(gradePage.campaignModal).not.toBeVisible();
      }
    }
  });

  test('Can get grades by value pattern', async ({ page }) => {
    await gradePage.waitForPageToLoad();
    
    // Get elementary school grades (values 2-7)
    const elementaryPattern = /^[2-7]$/;
    const elementaryGrades = await gradePage.getGradesByValuePattern(elementaryPattern);
    
    expect(elementaryGrades.length).toBe(6); // 小1-小6
    
    // Verify all are elementary grades
    elementaryGrades.forEach(grade => {
      expect(grade.section).toBe('小学生');
      expect(grade.gradeValue).toMatch(elementaryPattern);
    });
  });
});