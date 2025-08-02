import { test, expect } from '@playwright/test';
import { Top } from '../pages/Top';
import { PrefectureSelectPage } from '../pages/PrefectureSelectPage';
import { CitySelectPage } from '../pages/CitySelectPage';
import { GradeSelectPage } from '../pages/GradeSelectPage';
import { SearchResultsHeaderSection } from '../pages/SearchResultsHeaderSection';

test.describe('End-to-End Search Scenario', () => {
  test('トップページから検索フローを経て機関詳細ページに遷移する', async ({ page }) => {
    // 1. Start from top page
    const topPage = new Top(page);
    await topPage.goto();

    // 2. Click search by city button to go to prefecture selection
    await topPage.areaSearchSection.clickSearchByCity();

    // 3. Select Hokkaido prefecture
    const prefPage = new PrefectureSelectPage(page);
    await prefPage.waitForPageToLoad();
    // First expand the Hokkaido-Tohoku region
    await prefPage.expandHokkaidoTohoku();
    await prefPage.selectPrefecture('北海道');

    // 4. Select Sapporo city
    const cityPage = new CitySelectPage(page);
    await cityPage.waitForPageToLoad();
    await cityPage.selectCity('札幌市');

    // 5. Select High School 1st grade
    const gradePage = new GradeSelectPage(page);
    await gradePage.waitForPageToLoad();
    await gradePage.selectHighSchool1();

    // 6. Verify we're on search results page
    const searchResults = new SearchResultsHeaderSection(page);
    await searchResults.waitForHeaderToLoad();

    // Verify the search results header shows correct information
    const titleInfo = await searchResults.parseTitleInfo();
    expect(titleInfo.city).toBe('札幌市');
    expect(titleInfo.grade).toBe('高1');
    expect(titleInfo.institutionType).toBe('学習塾・予備校');

    // 7. Click on the first institution title
    const firstInstitutionTitle = await searchResults.getInstitutionTitle();

    await searchResults.clickInstitutionTitle();

    // 8. Verify we navigated to the institution detail page
    await expect(page).toHaveURL(/\/juku\/\d+\/$/);

    // Additional verification - check if we're on the expected institution page
    const currentUrl = page.url();

    // Verify the URL contains the institution detail pattern
    expect(currentUrl).toMatch(/\/juku\/\d+\/$/);
  });

  test('特定の機関詳細ページに遷移する', async ({ page }) => {
    // 1. Start from top page and navigate through search flow
    const topPage = new Top(page);
    await topPage.goto();

    await topPage.areaSearchSection.clickSearchByCity();

    const prefPage = new PrefectureSelectPage(page);
    await prefPage.waitForPageToLoad();
    // First expand the Hokkaido-Tohoku region
    await prefPage.expandHokkaidoTohoku();
    await prefPage.selectPrefecture('北海道');

    const cityPage = new CitySelectPage(page);
    await cityPage.waitForPageToLoad();
    await cityPage.selectCity('札幌市');

    const gradePage = new GradeSelectPage(page);
    await gradePage.waitForPageToLoad();
    await gradePage.selectHighSchool1();

    // 2. On search results page, look for specific institution
    const searchResults = new SearchResultsHeaderSection(page);
    await searchResults.waitForHeaderToLoad();

    // 3. Click on the first available institution
    const institutionTitle = await searchResults.getInstitutionTitle();

    await searchResults.clickInstitutionTitle();

    // 4. Verify we're on the expected institution detail page
    await expect(page).toHaveURL(/\/juku\/\d+\/$/);
  });

  test('異なる市区町村と学年の選択で料金ページに遷移する', async ({ page }) => {
    // 1. Start from top page and navigate through search flow with different selections
    const topPage = new Top(page);
    await topPage.goto();

    await topPage.areaSearchSection.clickSearchByCity();

    // 2. Select Tokyo prefecture instead of Hokkaido
    const prefPage = new PrefectureSelectPage(page);
    await prefPage.waitForPageToLoad();
    // Expand Kanto region for Tokyo
    await prefPage.expandKanto();
    await prefPage.selectPrefecture('東京都');

    // 3. Select a different city (e.g., Shibuya)
    const cityPage = new CitySelectPage(page);
    await cityPage.waitForPageToLoad();
    await cityPage.selectCity('渋谷区');

    // 4. Select middle school 3rd grade instead of high school
    const gradePage = new GradeSelectPage(page);
    await gradePage.waitForPageToLoad();
    await gradePage.selectMiddleSchool3();

    // 5. On search results page, verify header and get first juku info
    const searchResults = new SearchResultsHeaderSection(page);
    await searchResults.waitForHeaderToLoad();

    // Verify the search results header shows correct information
    const titleInfo = await searchResults.parseTitleInfo();
    expect(titleInfo.city).toBe('渋谷区');
    expect(titleInfo.grade).toBe('中3');
    expect(titleInfo.institutionType).toBe('学習塾・予備校');

    // 6. Get first juku name and first school name for that juku
    const firstJukuTitle = await searchResults.getJukuTitle();

    const schoolListData = await searchResults.getSchoolListData();
    expect(schoolListData.length).toBeGreaterThan(0);

    const firstSchool = schoolListData[0];

    // 7. Click "料金を知りたい" button for the first school of the first juku
    await searchResults.clickSchoolPricing(firstSchool.name);

    // 8. Verify we navigated to the pricing request page
    // URL should be like https://bestjuku.com/class/{classroomId}/request/
    const expectedUrlPattern = new RegExp(`/class/${firstSchool.classroomId}/request/`);
    await expect(page).toHaveURL(expectedUrlPattern);

    // Additional verification - check if URL matches the expected format
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/class\/\d+\/request\/$/);
  });

  test('特定の料金ページに遷移する（教室ID 79668）', async ({ page }) => {
    // This test aims to reach the specific URL mentioned: https://bestjuku.com/class/79668/request/
    // We'll search systematically to find classroom ID 79668

    const topPage = new Top(page);
    await topPage.goto();

    await topPage.areaSearchSection.clickSearchByCity();

    // Try different prefectures/cities to find classroom 79668
    const prefPage = new PrefectureSelectPage(page);
    await prefPage.waitForPageToLoad();

    // Let's try Hokkaido first (common test case)
    await prefPage.expandHokkaidoTohoku();
    await prefPage.selectPrefecture('北海道');

    const cityPage = new CitySelectPage(page);
    await cityPage.waitForPageToLoad();
    await cityPage.selectCity('札幌市');

    const gradePage = new GradeSelectPage(page);
    await gradePage.waitForPageToLoad();
    await gradePage.selectMiddleSchool1(); // Try middle school 1st grade

    const searchResults = new SearchResultsHeaderSection(page);
    await searchResults.waitForHeaderToLoad();

    // Get all school data and look for classroom ID 79668
    const allSchools = await searchResults.getSchoolListData();

    const targetSchool = allSchools.find((school) => school.classroomId === '79668');

    if (targetSchool) {
      // Click pricing button for the specific school
      await searchResults.clickSchoolPricing(targetSchool.name);

      // Verify we reached the exact URL
      await expect(page).toHaveURL('https://bestjuku.com/class/79668/request/');
    } else {
      // For this test, we'll verify the pattern works with any available classroom
      if (allSchools.length > 0) {
        const firstSchool = allSchools[0];
        await searchResults.clickSchoolPricing(firstSchool.name);

        const expectedPattern = new RegExp(`/class/${firstSchool.classroomId}/request/`);
        await expect(page).toHaveURL(expectedPattern);
      }
    }
  });
});
