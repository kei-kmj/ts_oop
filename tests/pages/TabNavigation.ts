import { type Locator, type Page } from '@playwright/test';

export class TabNavigation {
  readonly topTabLink: Locator;
  readonly reportTabLink: Locator;
  readonly courseTabLink: Locator;
  readonly classTabLink: Locator;
  readonly reviewTabLink: Locator;

  constructor(page: Page) {
    this.topTabLink = page.getByRole('link', { name: '塾トップ' });
    this.reportTabLink = page.getByRole('link', { name: '詳細レポ' });
    this.courseTabLink = page.getByRole('link', { name: 'コース' });
    this.classTabLink = page.getByRole('link', { name: '教室一覧' });
    this.reviewTabLink = page.getByRole('link', { name: '口コミ' });
  }
}
