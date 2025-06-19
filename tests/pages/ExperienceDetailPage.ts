import { Page, Locator } from '@playwright/test';
import { Base } from './Base';

export class ExperienceDetailPage extends Base {
  constructor(page: Page) {
    super(page);
  }

  async goto(experienceId: string): Promise<void> {
    await super.goto(`/shingaku/experience/${experienceId}/`);
  }

  async getAttendedJukuHeading(): Promise<string> {
    const text = await this.page.getByRole('heading', { name: '受験時に通っていた塾' }).textContent() || '';
    return text.trim();
  }

  async isAttendedJukuHeadingVisible(): Promise<boolean> {
    return await this.page.getByRole('heading', { name: '受験時に通っていた塾' }).isVisible();
  }

  private getJukuSummaryCard(index: number): Locator {
    return this.page.locator('.bjp-juku-summary').nth(index);
  }

  async getJukuCardCount(): Promise<number> {
    return await this.page.locator('.bjp-juku-summary').count();
  }

  async getJukuName(index: number): Promise<string> {
    return await this.getJukuSummaryCard(index).locator('.juku-name').textContent() || '';
  }

  async getJukuLogoSrc(index: number): Promise<string | null> {
    return await this.getJukuSummaryCard(index).locator('.bjp-juku-logo').getAttribute('src');
  }

  async getTargetStudents(index: number): Promise<string[]> {
    return await this.getJukuSummaryCard(index).locator('.target-students li').allTextContents();
  }

  async getInstructionTypes(index: number): Promise<string[]> {
    return await this.getJukuSummaryCard(index).locator('.instruction li').allTextContents();
  }

  async getKeyPoints(index: number): Promise<string[]> {
    return await this.getJukuSummaryCard(index).locator('.bjc-summary-sentence li').allTextContents();
  }

  async clickJukuNameLink(index: number): Promise<void> {
    await this.getJukuSummaryCard(index).locator('.juku-name a').click();
  }

  async clickNearbyJukuButton(index: number): Promise<void> {
    await this.getJukuSummaryCard(index).getByRole('link', { name: '近くの塾を探す' }).click();
  }

  async clickDetailsButton(index: number): Promise<void> {
    await this.getJukuSummaryCard(index).getByRole('link', { name: '詳しく見る' }).click();
  }

  async clickInterviewLink(index: number): Promise<void> {
    await this.getJukuSummaryCard(index).locator('a[href*="/passed-interview/"]').click();
  }

  async clickReviewLink(index: number): Promise<void> {
    await this.getJukuSummaryCard(index).locator('a[href*="/review/"]').click();
  }

  async getInterviewCount(index: number): Promise<string> {
    const text = await this.getJukuSummaryCard(index).locator('a[href*="/passed-interview/"]').textContent() || '';
    const match = text.match(/（(\d+)）/);
    return match ? match[1] : '';
  }

  async getReviewCount(index: number): Promise<string> {
    const text = await this.getJukuSummaryCard(index).locator('a[href*="/review/"]').textContent() || '';
    const match = text.match(/（(\d+)）/);
    return match ? match[1] : '';
  }
}