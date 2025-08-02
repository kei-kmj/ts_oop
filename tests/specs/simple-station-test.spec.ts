import { test, expect } from '@playwright/test';
import { Top } from '../pages/Top';
import { PrefectureSelectPage } from '../pages/PrefectureSelectPage';
import { SearchHeaderSection } from '../pages/SearchHeaderSection';
import { GradeSelectPage } from '../pages/GradeSelectPage';
import { SearchResultsHeaderSection } from '../pages/SearchResultsHeaderSection';

test('シンプルな駅検索テスト', async ({ page }) => {
  // 1. Start from top page
  const topPage = new Top(page);
  await topPage.goto();

  // 2. Click search by station
  await topPage.areaSearchSection.clickSearchByStation();

  // 3. Select Hokkaido
  const prefPage = new PrefectureSelectPage(page);
  await prefPage.waitForPageToLoad();
  await prefPage.expandHokkaidoTohoku();
  await prefPage.selectPrefecture('北海道');

  // 4. On station search page
  const searchHeader = new SearchHeaderSection(page);
  await searchHeader.waitForLoad();

  // 5. Get all lines and select first one
  const allLines = await searchHeader.getAllLineNames();

  const firstLine = allLines[0];

  await searchHeader.clickLineAccordion(firstLine);
  await page.waitForTimeout(1500); // Wait for accordion

  // 6. Get stations from first line
  const stations = await searchHeader.getStationsInLine(firstLine);

  if (stations.length > 0) {
    const firstStation = stations[0];

    await searchHeader.clickStation(firstStation);

    // 7. Select grade
    const gradePage = new GradeSelectPage(page);
    await gradePage.waitForPageToLoad();
    await gradePage.selectHighSchool1();

    // 8. Check search results
    const searchResults = new SearchResultsHeaderSection(page);
    await searchResults.waitForHeaderToLoad();

    const institutionTitle = await searchResults.getInstitutionTitle();

    // Try to get school data
    const schoolData = await searchResults.getSchoolListData();

    if (schoolData.length > 0) {
      // Try clicking details
      await searchResults.clickSchoolDetails(schoolData[0].name);

      // Verify URL
      await expect(page).toHaveURL(/\/class\/\d+\/$/);
    }
  }
});
