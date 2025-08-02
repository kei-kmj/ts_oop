import { test, expect } from '@playwright/test';
import { JukuPage } from './pages/JukuPage';
import { ExperiencePage } from './pages/ExperiencePage';
import { ExperienceDetailPage } from './pages/ExperienceDetailPage';

test.describe('Juku Experience Navigation', () => {
  test('塾ページから体験記詳細ページに移動し、再び塾ページに戻ることができる', async ({ page }) => {
    const jukuPage = new JukuPage(page);
    const experiencePage = new ExperiencePage(page);
    const experienceDetailPage = new ExperienceDetailPage(page);

    // Get juku ID from environment variable or use default
    const jukuId = process.env.JUKU_ID || '38';

    // Step 1: Go to juku page
    await jukuPage.goto(jukuId);
    await jukuPage.waitForPageToLoad();

    // Step 2: Click "合格体験記を全て見る"
    await jukuPage.experienceSection.clickViewAllLink();

    // Step 3: Verify we're on the experience page
    await expect(page).toHaveURL(new RegExp(`\\/juku\\/${jukuId}\\/experience\\/`));

    // Step 4: Wait for experience posts to load and click the first one
    await page.waitForSelector('.bjc-post-experience', { timeout: 10000 });
    await experiencePage.clickExperiencePost(0);

    // Step 5: Verify we're on the experience detail page
    await expect(page).toHaveURL(/\/shingaku\/experience\/\d+\//);

    // Step 6: Wait for juku cards to load
    await page.waitForSelector('.bjp-juku-summary', { timeout: 10000 });

    // Step 7: Click the first juku card's link
    await experienceDetailPage.clickJukuNameLink(0);

    // Step 8: Verify we're back on a juku page
    await expect(page).toHaveURL(/\/juku\/\d+\//);

    // Optional: Verify it's the same juku
    const currentUrl = page.url();
    expect(currentUrl).toContain(`/juku/${jukuId}/`);
  });
});
