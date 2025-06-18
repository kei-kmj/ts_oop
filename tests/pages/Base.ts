import { type Page, type Locator } from '@playwright/test';
import { getFullUrl } from '../config/environment';

export abstract class Base {
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string) {
    const fullUrl = getFullUrl(path);
    await this.page.goto(fullUrl);
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async extractEntityNameFromTitle(): Promise<string> {
    const title = await this.getTitle();
    const match = title.match(/^(.*?)の最新情報を見る/);
    return match?.[1] ?? '';
  }
}
