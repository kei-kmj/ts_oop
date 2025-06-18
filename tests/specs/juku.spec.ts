import {expect, test} from "@playwright/test";
import {Juku} from "../pages/Juku";
import {JukuAchievement} from "../pages/JukuAchievement";

test('juku', async ({ page }) => {
  const jukuPage = new Juku(page);
  await jukuPage.goto('38');
  await expect(jukuPage.consultationLink.first()).toBeVisible();
})

test('Jukuページでタブナビゲーションが見える', async ({ page }) => {
  const jukuPage = new Juku(page);

  await jukuPage.goto('38');
  await expect(jukuPage.tabNavigation.reportTabLink).toBeVisible();
});

test('Jukuページで「の合格実績」というh2が存在する', async ({ page }) => {
  const jukuPage = new Juku(page);

  await jukuPage.goto('38');
  const text = await jukuPage.getAchievementTitleText();
  expect(text).toMatch(/の合格実績/);
});

test('合格実績セクションの各受験タブが表示されていること', async ({ page }) => {
  const jukuPage = new Juku(page);
  await jukuPage.goto('38');

  const section = jukuPage.achievementSection

  await expect(section.universityExamTab).toBeVisible();
  await expect(section.highSchoolExamTab).toBeVisible();
  await expect(section.juniorHighExamTab).toBeVisible();
});

test('体験授業の相談をクリックできる', async ({ page }) => {
  const jukuPage = new Juku(page);
  await jukuPage.goto('21');

  await jukuPage.clickConsultationLink()
})

test('問い合わせリンクをクリックできる', async ({ page }) => {
  const jukuPage = new Juku(page);
  await jukuPage.goto('21');

  await jukuPage.clickAskLink()
})
test('CTAボタンが見える', async ({ page }) => {
  const jukuPage = new Juku(page);
  await jukuPage.goto('21');

  await expect(jukuPage.askLink.first()).toBeVisible()
  await expect(jukuPage.consultationLink.first()).toBeVisible()
})

test('大学の合格実績がある' , async ({ page }) => {
  const jukuPage = new Juku(page);
  await jukuPage.goto('38');
  await expect(jukuPage.achievementSection.universityExamTab).toBeVisible();
  await expect(jukuPage.achievementSection.universityExamList).toBeVisible();
})

test('高校の合格実績がある' , async ({ page }) => {
  const jukuPage = new Juku(page);
  await jukuPage.goto('38');
  await expect(jukuPage.achievementSection.highSchoolExamTab).toBeVisible();
  await jukuPage.achievementSection.clickHighSchoolExamTab()
  await expect(jukuPage.achievementSection.highSchoolExamList).toBeVisible();
})

test('中学の合格実績がある', async ({ page }) => {
  const jukuPage = new Juku(page);
  await jukuPage.goto('38');
  await expect(jukuPage.achievementSection.juniorHighExamTab).toBeVisible();
  await jukuPage.achievementSection.clickJuniorHighExamTab()
  await expect(jukuPage.achievementSection.juniorHighExamList).toBeVisible();
})

test('合格実績をすべて見るをクリックすると最新の合格実績ページに遷移する', async ({ page }) => {
  const jukuPage = new Juku(page)
  await jukuPage.goto('38');
  await jukuPage.achievementSection.clickAllLink()

  const achievementPage = new JukuAchievement(page)

  const title = await achievementPage.getTitle();
  const brandName = await achievementPage.extractJukuNameFromTitle()

  expect(title).toContain(brandName);
  expect(title).toContain('年度(最新)の合格実績');


})