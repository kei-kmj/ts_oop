import type { Page } from '@playwright/test';

export abstract class Base {
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(path);

    /** cookie利用許可ポップアップを消す */
    await this.page.evaluate(() => {
      const popup = document.querySelector('#cookie-content');
      if (popup) popup.classList.add('popup-hide');
    });
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async goBack(): Promise<void> {
    await this.page.goBack();
  }
}
