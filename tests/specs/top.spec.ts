import { test, expect } from '@playwright/test';
import {Top} from "../pages/Top";

test('トップページにアクセスできる', async ({ page }) => {
  const topPage = new Top(page);

  await topPage.goto();

  const title = await topPage.getTitle();
  expect(title).toBe('塾選（ジュクセン） | 日本最大級の塾・学習塾検索サイト');
});

test('探すテキストがある', async ({ page }) => {
  const topPage = new Top(page);

  await topPage.goto();

  const searchTitle = await topPage.getSearchTitleText();
  expect(searchTitle).toBe('全国の塾・予備校を探す')
});

test('塾名志望校名がある', async ({ page }) => {
  const topPage = new Top(page);

  await topPage.goto();

  const searchByNameTitle = await topPage.getSearchByNameTitleText()
  expect(searchByNameTitle).toBe('塾名・志望校名から探す')
});
