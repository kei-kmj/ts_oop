import { test, expect } from '@playwright/test';
import { CitySelectPage } from '../pages/CitySelectPage';

test.describe('City Select Page', () => {
  let cityPage: CitySelectPage;

  test.beforeEach(async ({ page }) => {
    cityPage = new CitySelectPage(page);
    // Go to Hokkaido cities page for testing
    await cityPage.goto('hokkaido');
  });

  test('ページ要素が表示される', async ({ page }) => {
    // Wait for page to load
    await cityPage.waitForPageToLoad();

    // Check header elements
    await expect(cityPage.backLink).toBeVisible();
    await expect(cityPage.pageTitle).toBeVisible();

    // Check city links container
    await expect(cityPage.cityLinksContainer).toBeVisible();
  });

  test('市区町村数を取得できる', async ({ page }) => {
    await cityPage.waitForPageToLoad();

    const cityCount = await cityPage.getCityCount();
    expect(cityCount).toBeGreaterThan(0);
  });

  test('市区町村データを取得できる', async ({ page }) => {
    await cityPage.waitForPageToLoad();

    // Get data for Sapporo
    const sapporoData = await cityPage.getCityData('札幌市');

    expect(sapporoData).toBeTruthy();
    expect(sapporoData?.name).toBe('札幌市');
    expect(sapporoData?.prefecture).toBe('hokkaido');
    expect(sapporoData?.count).toBeGreaterThan(0);
    expect(sapporoData?.href).toContain('/search/requirement/grade/');
  });

  test('すべての市区町村データを取得できる', async ({ page }) => {
    await cityPage.waitForPageToLoad();

    const allCities = await cityPage.getAllCityData();

    expect(allCities.length).toBeGreaterThan(0);

    // Check structure of first city
    const firstCity = allCities[0];
    expect(firstCity.name).toBeTruthy();
    expect(firstCity.fullText).toBeTruthy();
    expect(firstCity.count).toBeGreaterThanOrEqual(0);
    expect(firstCity.href).toBeTruthy();
    expect(firstCity.prefecture).toBe('hokkaido');
  });

  test('最も多い件数の市区町村を取得できる', async ({ page }) => {
    await cityPage.waitForPageToLoad();

    const topCity = await cityPage.getCityWithHighestCount();

    expect(topCity).toBeTruthy();
    expect(topCity?.count).toBeGreaterThan(0);

    // The top city should likely be Sapporo for Hokkaido
    expect(topCity?.name).toContain('札幌');
  });

  test('件数範囲で市区町村をフィルタリングできる', async ({ page }) => {
    await cityPage.waitForPageToLoad();

    // Get cities with 100+ results
    const popularCities = await cityPage.getCitiesWithCountRange(100, 10000);

    expect(popularCities.length).toBeGreaterThan(0);

    // All cities should have count >= 100
    popularCities.forEach((city) => {
      expect(city.count).toBeGreaterThanOrEqual(100);
    });
  });

  test('パターンで市区町村を検索できる', async ({ page }) => {
    await cityPage.waitForPageToLoad();

    // Search for cities containing "市"
    const cityPattern = /市$/;
    const cities = await cityPage.searchCitiesByPattern(cityPattern);

    expect(cities.length).toBeGreaterThan(0);

    // All results should end with "市"
    cities.forEach((city) => {
      expect(city.name).toMatch(cityPattern);
    });
  });

  test('市区町村を選択できる', async ({ page }) => {
    await cityPage.waitForPageToLoad();

    // Select Sapporo (this will navigate to grade selection)
    await cityPage.selectCity('札幌市');

    // Should navigate to grade selection page
    await expect(page).toHaveURL(/\/search\/requirement\/grade\//);
  });

  test('最後の検索条件が表示される場合がある', async ({ page }) => {
    await cityPage.waitForPageToLoad();

    // Check if last search condition exists
    const hasLastSearch = await cityPage.hasLastSearchCondition();

    if (hasLastSearch) {
      const lastSearchText = await cityPage.getLastSearchConditionText();
      expect(lastSearchText).toBeTruthy();
    }
  });
});
