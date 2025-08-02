import { test, expect } from '@playwright/test';
import { SearchResultsHeaderSection } from '../pages/SearchResultsHeaderSection';

test.describe('Search Results Header Section', () => {
  let headerSection: SearchResultsHeaderSection;

  test.beforeEach(async ({ page }) => {
    headerSection = new SearchResultsHeaderSection(page);
    // Navigate to a search results page (Sapporo, High School 1st grade)
    await page.goto('/search?prefecture=hokkaido&address_code_and_upper=1_01_801&target_grade_id=11&page=1');
  });

  test('ヘッダー要素が表示される', async ({ page }) => {
    // Wait for header to load
    await headerSection.waitForHeaderToLoad();

    // Check header visibility
    await expect(headerSection.headerContainer).toBeVisible();
    await expect(headerSection.headerTitle).toBeVisible();
  });

  test('タイトルから市区町村名を抽出できる', async ({ page }) => {
    await headerSection.waitForHeaderToLoad();

    const cityName = await headerSection.getCityName();
    expect(cityName).toBe('札幌市');
  });

  test('タイトルから学年情報を抽出できる', async ({ page }) => {
    await headerSection.waitForHeaderToLoad();

    const gradeInfo = await headerSection.getGradeInfo();
    expect(gradeInfo).toBe('高1');
  });

  test('タイトルから機関タイプを抽出できる', async ({ page }) => {
    await headerSection.waitForHeaderToLoad();

    const institutionType = await headerSection.getInstitutionType();
    expect(institutionType).toBe('学習塾・予備校');
  });

  test('完全なタイトル情報を解析できる', async ({ page }) => {
    await headerSection.waitForHeaderToLoad();

    const titleInfo = await headerSection.parseTitleInfo();

    expect(titleInfo.city).toBe('札幌市');
    expect(titleInfo.grade).toBe('高1');
    expect(titleInfo.institutionType).toBe('学習塾・予備校');
    expect(titleInfo.fullTitle).toBe('札幌市の高1向けの学習塾・予備校一覧');
  });

  test('タイトルパターンを検証できる', async ({ page }) => {
    await headerSection.waitForHeaderToLoad();

    const isValidPattern = await headerSection.validateTitlePattern();
    expect(isValidPattern).toBe(true);
  });

  test('タイトルに特定の値が含まれていることを確認できる', async ({ page }) => {
    await headerSection.waitForHeaderToLoad();

    // Verify city
    const containsSapporo = await headerSection.containsCity('札幌市');
    expect(containsSapporo).toBe(true);

    const containsTokyo = await headerSection.containsCity('東京都');
    expect(containsTokyo).toBe(false);

    // Verify grade
    const containsGrade1 = await headerSection.containsGrade('高1');
    expect(containsGrade1).toBe(true);

    const containsGrade2 = await headerSection.containsGrade('高2');
    expect(containsGrade2).toBe(false);

    // Verify institution type
    const containsJuku = await headerSection.containsInstitutionType('学習塾・予備校');
    expect(containsJuku).toBe(true);
  });

  test('タイトルが予期されるパラメータと一致することを確認できる', async ({ page }) => {
    await headerSection.waitForHeaderToLoad();

    // Should match current parameters
    const matchesExpected = await headerSection.verifyTitleMatches('札幌市', '高1', '学習塾・予備校');
    expect(matchesExpected).toBe(true);

    // Should not match different parameters
    const matchesDifferent = await headerSection.verifyTitleMatches('東京都', '高1', '学習塾・予備校');
    expect(matchesDifferent).toBe(false);
  });

  test('学年パターンの詳細を抽出できる', async ({ page }) => {
    await headerSection.waitForHeaderToLoad();

    const gradePattern = await headerSection.extractGradePattern();

    expect(gradePattern.isAll).toBe(false);
    expect(gradePattern.gradeLevel).toBe('高校');
    expect(gradePattern.specificGrade).toBe('1');
    expect(gradePattern.originalText).toBe('高1');
  });

  test('異なるパラメータに対して予期されるタイトルを生成できる', async ({ page }) => {
    await headerSection.waitForHeaderToLoad();

    // Test different city and grade combinations
    const title1 = await headerSection.getExpectedTitleForParams('東京都', '中3');
    expect(title1).toBe('東京都の中3向けの学習塾・予備校一覧');

    const title2 = await headerSection.getExpectedTitleForParams('大阪府', '小6', '個別指導塾');
    expect(title2).toBe('大阪府の小6向けの個別指導塾一覧');
  });
});

test.describe('Search Results Header Section - Different Grades', () => {
  let headerSection: SearchResultsHeaderSection;

  test.beforeEach(async ({ page }) => {
    headerSection = new SearchResultsHeaderSection(page);
  });

  test('高校生すべての学年を処理できる', async ({ page }) => {
    // Navigate to high school all grades
    await page.goto('/search?prefecture=hokkaido&address_code_and_upper=1_01_801&target_grade_id=11,12,13&page=1');
    await headerSection.waitForHeaderToLoad();

    const titleInfo = await headerSection.parseTitleInfo();
    expect(titleInfo.city).toBe('札幌市');
    expect(titleInfo.grade).toContain('高校生');

    const gradePattern = await headerSection.extractGradePattern();
    expect(gradePattern.gradeLevel).toBe('高校');
    expect(gradePattern.isAll).toBe(true);
  });

  test('中学生の学年を処理できる', async ({ page }) => {
    // Navigate to middle school 3rd grade
    await page.goto('/search?prefecture=hokkaido&address_code_and_upper=1_01_801&target_grade_id=10&page=1');
    await headerSection.waitForHeaderToLoad();

    const titleInfo = await headerSection.parseTitleInfo();
    expect(titleInfo.city).toBe('札幌市');
    expect(titleInfo.grade).toBe('中3');

    const gradePattern = await headerSection.extractGradePattern();
    expect(gradePattern.gradeLevel).toBe('中学');
    expect(gradePattern.specificGrade).toBe('3');
    expect(gradePattern.isAll).toBe(false);
  });

  test('小学生の学年を処理できる', async ({ page }) => {
    // Navigate to elementary school 6th grade
    await page.goto('/search?prefecture=hokkaido&address_code_and_upper=1_01_801&target_grade_id=7&page=1');
    await headerSection.waitForHeaderToLoad();

    const titleInfo = await headerSection.parseTitleInfo();
    expect(titleInfo.city).toBe('札幌市');
    expect(titleInfo.grade).toBe('小6');

    const gradePattern = await headerSection.extractGradePattern();
    expect(gradePattern.gradeLevel).toBe('小学');
    expect(gradePattern.specificGrade).toBe('6');
    expect(gradePattern.isAll).toBe(false);
  });
});
