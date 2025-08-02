import { Page, Locator } from '@playwright/test';
import { Base } from './Base';
import { TabNavigation } from './components/TabNavigation';

export class ExperiencePage extends Base {
  readonly examTabs: TabNavigation;

  constructor(page: Page) {
    super(page);
    this.examTabs = new TabNavigation(page, '.bjc-passed-interview-inner-tab-nav');
  }

  async goto(jukuId: string): Promise<void> {
    await super.goto(`/juku/${jukuId}/experience/`);
  }

  private getExperiencePost(index: number): Locator {
    return this.page.locator('.bjc-post-experience').nth(index);
  }

  async clickExperiencePost(index: number): Promise<void> {
    await this.getExperiencePost(index).click();
  }

  async getExperienceTitle(index: number): Promise<string> {
    return (await this.getExperiencePost(index).locator('.bjc-post-experience-title').textContent()) || '';
  }

  async getExperienceMeta(index: number): Promise<string> {
    return (await this.getExperiencePost(index).locator('.bjc-post-experience-meta').textContent()) || '';
  }

  async getExperienceYear(index: number): Promise<string> {
    const meta = await this.getExperienceMeta(index);
    const match = meta.match(/受験年度：(\d{4})年度/);
    return match ? match[1] : '';
  }

  async getStartingDeviation(index: number): Promise<string> {
    const meta = await this.getExperienceMeta(index);
    const match = meta.match(/開始偏差値：(\d+)/);
    return match ? match[1] : '';
  }

  async getAllExperienceTitles(): Promise<string[]> {
    return await this.page.locator('.bjc-post-experience-title').allTextContents();
  }

  async getExperienceCount(): Promise<number> {
    return await this.page.locator('.bjc-post-experience').count();
  }
}
