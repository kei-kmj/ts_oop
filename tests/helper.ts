import { type Page, type Locator } from '@playwright/test';

/**
 * タブ要素を取得する共通関数
 *
 * @param page PlaywrightのPageオブジェクト
 * @param label 表示ラベル（例: "大学受験"）
 * @param dataTab data-tab属性の値（例: "01-01"）
 * @returns 該当するLocator（li[data-tab="..."] かつラベル一致）
 */
export const getTab = (page: Page, label: string, dataTab: string): Locator => {
  return page.locator(`li[data-tab="${dataTab}"]`).filter({ hasText: label });
};
