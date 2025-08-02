import { test, expect } from '@playwright/test';
import { ExperienceDetailPage } from './pages/ExperienceDetailPage';

test.describe('ExperienceDetailPage', () => {
  let experienceDetailPage: ExperienceDetailPage;

  test.beforeEach(async ({ page }) => {
    experienceDetailPage = new ExperienceDetailPage(page);
  });

  test('体験記詳細ページに遷移できる', async () => {
    await experienceDetailPage.goto('71212');
    await expect(experienceDetailPage.page).toHaveURL(/\/shingaku\/experience\/71212\//);
  });

  test('通っていた塾のヘッディングが表示される', async () => {
    await experienceDetailPage.goto('71212');

    // Wait for the heading to be visible
    await experienceDetailPage.page.waitForSelector('h4', { timeout: 10000 });

    const isVisible = await experienceDetailPage.isAttendedJukuHeadingVisible();
    expect(isVisible).toBeTruthy();

    const headingText = await experienceDetailPage.getAttendedJukuHeading();
    expect(headingText).toBe('受験時に通っていた塾');
  });

  test('塾のサマリーカードを取得できる', async () => {
    await experienceDetailPage.goto('71212');

    // Wait for juku cards to load
    await experienceDetailPage.page.waitForSelector('.bjp-juku-summary', { timeout: 10000 });

    const cardCount = await experienceDetailPage.getJukuCardCount();
    expect(cardCount).toBeGreaterThan(0);

    if (cardCount > 0) {
      // Test first card
      const jukuName = await experienceDetailPage.getJukuName(0);
      expect(jukuName).toBeTruthy();

      const logoSrc = await experienceDetailPage.getJukuLogoSrc(0);
      expect(logoSrc).toBeTruthy();
      expect(logoSrc).toMatch(/\.(png|jpg|jpeg|webp|svg)/i);

      const targetStudents = await experienceDetailPage.getTargetStudents(0);
      expect(targetStudents.length).toBeGreaterThan(0);

      const instructionTypes = await experienceDetailPage.getInstructionTypes(0);
      expect(instructionTypes.length).toBeGreaterThan(0);

      const keyPoints = await experienceDetailPage.getKeyPoints(0);
      expect(keyPoints.length).toBeGreaterThan(0);
    }
  });

  test('インタビューとレビューの件数を取得できる', async () => {
    await experienceDetailPage.goto('71212');

    await experienceDetailPage.page.waitForSelector('.bjp-juku-summary', { timeout: 10000 });

    const cardCount = await experienceDetailPage.getJukuCardCount();
    if (cardCount > 0) {
      const interviewCount = await experienceDetailPage.getInterviewCount(0);
      expect(interviewCount).toMatch(/\d+/);

      const reviewCount = await experienceDetailPage.getReviewCount(0);
      expect(reviewCount).toMatch(/\d+/);
    }
  });

  test('塾カードのボタンをクリックできる', async () => {
    await experienceDetailPage.goto('71212');

    await experienceDetailPage.page.waitForSelector('.bjp-juku-summary', { timeout: 10000 });

    const cardCount = await experienceDetailPage.getJukuCardCount();
    if (cardCount > 0) {
      // Test clicking juku name link
      await experienceDetailPage.clickJukuNameLink(0);
      await expect(experienceDetailPage.page).toHaveURL(/\/juku\/\d+\//);

      // Go back and test other buttons
      await experienceDetailPage.goto('71212');
      await experienceDetailPage.page.waitForSelector('.bjp-juku-summary', { timeout: 10000 });

      // Test nearby juku button
      await experienceDetailPage.clickNearbyJukuButton(0);
      await expect(experienceDetailPage.page).toHaveURL(/\/juku\/\d+\/class\//);
    }
  });
});
