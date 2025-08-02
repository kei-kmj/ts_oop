import { test, expect } from '../fixtures/fixture';
import { ClassroomId } from '../pages/ClassroomId';
import { ClassroomAccess } from '../pages/ClassroomAccess';
import { ClassroomReview } from '../pages/ClassroomReview';
import { BUTTONS } from '../fixtures/global';
import { BRAND_IDS, CLASSROOM_IDS } from '../fixtures/s01';

test.describe('教室ページ', () => {
  test.use({ brandId: BRAND_IDS.TEST_CLASSROOM });
  let classroomPage: ClassroomId;

  test.beforeEach(async ({ page, brandId }) => {
    classroomPage = new ClassroomId(page);
    await classroomPage.gotoClassroom(brandId, CLASSROOM_IDS.TEST_CLASSROOM);
  });
  test('CTAボタンの両ボタンが表示される', async () => {
    await expect(classroomPage.cta.trialCTALink.first()).toBeVisible();
    await expect(classroomPage.cta.docCTALink.first()).toBeVisible();
  });

  test('口コミタブをクリックして口コミを絞り込み検索し確認できる', async ({ page }) => {
    await classroomPage.classroomTab.goToTab('review');

    await classroomPage.review.clickFilterButton();

    const reviewPage = new ClassroomReview(page);
    await expect(reviewPage.title).toBeVisible();
    expect(await reviewPage.hasClassroomNameAfterBrandLink()).toBeTruthy();
    await expect(reviewPage.classroomTopLink).toBeVisible();
    await expect(reviewPage.reviewFilterModal.modal).toBeVisible();

    await reviewPage.reviewFilterModal.selectPurposes(['university']);
    await reviewPage.reviewFilterModal.submitFilter();

    await expect(reviewPage.firstArticle).toBeVisible();

    await reviewPage.clickFirstReviewArticle();

    const { ReviewId } = await import('../pages/reviewId');
    const reviewDetailPage = new ReviewId(page);
    await expect(reviewDetailPage.title).toBeVisible();
  });

  test('地図タブをクリックして地図とCTAボタンを確認できる', async ({ page }) => {
    await classroomPage.classroomTab.goToTab('map');

    const accessPage = new ClassroomAccess(page);
    await expect(accessPage.title).toBeVisible();

    await expect(accessPage.mapContainer.first()).toBeVisible();

    await expect(accessPage.cta.trialCTALink.first()).toBeVisible();
  });

  test('お気に入りボタンをクリックすると登録済みになる', async ({ page }) => {
    // ローカルストレージのお気に入りキーを削除してお気に入りボタンを表示させた状態でテストを始める
    await page.evaluate(() => localStorage.removeItem('_bj_favorites'));

    await expect(classroomPage.favoriteButton).toBeVisible();

    await expect(classroomPage.favoriteButton.locator('span')).toHaveText(BUTTONS.FAVORITE);

    await classroomPage.clickFavoriteButton();
    await expect(classroomPage.favoriteButton.locator('span')).toHaveText(BUTTONS.REGISTERED);
  });

  test('表示対象が0件の場合、口コミがない旨のテキストと、塾の口コミ一覧が表示される', async ({ page }) => {
    await classroomPage.gotoClassroom('38', '52221');

    await classroomPage.classroomTab.goToTab('review');

    const classroomReviewPage = new ClassroomReview(page);
    await expect(classroomReviewPage.noReviewMessage).toBeVisible();
    await expect(classroomReviewPage.jukuReviewListLink.first()).toBeVisible();
  });

  test('期別講習ボタンがあればクリックして各講習ページに遷移できる', async ({ page }) => {
    // 期別講習の時期を正確に捉えられないため、次善の策としてボタンが見える時だけ遷移できることを確認する
    const hasAnyButton =
      (await classroomPage.isSummerCourseButtonVisible()) ||
      (await classroomPage.isWinterCourseButtonVisible()) ||
      (await classroomPage.isSpringCourseButtonVisible());

    if (!hasAnyButton) {
      test.skip();
      return;
    }

    if (await classroomPage.isSummerCourseButtonVisible()) {
      await classroomPage.clickSummerCourseButton();
      await expect(page).toHaveURL(/\/summer\//);
      await page.goBack();
    }

    if (await classroomPage.isWinterCourseButtonVisible()) {
      await classroomPage.clickWinterCourseButton();
      await expect(page).toHaveURL(/\/winter\//);
      await page.goBack();
    }

    if (await classroomPage.isSpringCourseButtonVisible()) {
      await classroomPage.clickSpringCourseButton();
      await expect(page).toHaveURL(/\/spring\//);
      await page.goBack();
    }
  });
});
