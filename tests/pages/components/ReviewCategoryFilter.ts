import { Page, Locator } from '@playwright/test';

export class ReviewCategoryFilter {
  readonly page: Page;
  readonly filterContainer: Locator;
  readonly teacherQualityLink: Locator;
  readonly curriculumLink: Locator;
  readonly supportSystemLink: Locator;
  readonly accessEnvironmentLink: Locator;
  readonly homeSupportLink: Locator;
  readonly pricingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.filterContainer = page.locator('div.bjc-review-nav-narrow_down');
    this.teacherQualityLink = page
      .locator('div.bjc-review-nav-narrow_down')
      .getByRole('link', { name: '講師・授業の質' });
    this.curriculumLink = page
      .locator('div.bjc-review-nav-narrow_down')
      .getByRole('link', { name: '指導方針・カリキュラム' });
    this.supportSystemLink = page
      .locator('div.bjc-review-nav-narrow_down')
      .getByRole('link', { name: '塾のサポート体制' });
    this.accessEnvironmentLink = page
      .locator('div.bjc-review-nav-narrow_down')
      .getByRole('link', { name: 'アクセス・周りの環境' });
    this.homeSupportLink = page
      .locator('div.bjc-review-nav-narrow_down')
      .getByRole('link', { name: '家庭でのサポート' });
    this.pricingButton = page.locator('div.bjc-review-nav-narrow_down').getByRole('button', { name: '料金について' });
  }

  async clickTeacherQuality(): Promise<void> {
    await this.teacherQualityLink.click();
  }

  async clickCurriculum(): Promise<void> {
    await this.curriculumLink.click();
  }

  async clickSupportSystem(): Promise<void> {
    await this.supportSystemLink.click();
  }

  async clickAccessEnvironment(): Promise<void> {
    await this.accessEnvironmentLink.click();
  }

  async clickHomeSupport(): Promise<void> {
    await this.homeSupportLink.click();
  }

  async isPricingDisabled(): Promise<boolean> {
    return await this.pricingButton.isDisabled();
  }

  async isVisible(): Promise<boolean> {
    return await this.filterContainer.isVisible();
  }

  async getCategoryLinks(): Promise<{ text: string; href: string | null; disabled: boolean }[]> {
    const links: { text: string; href: string | null; disabled: boolean }[] = [];

    const linkElements = [
      this.teacherQualityLink,
      this.curriculumLink,
      this.supportSystemLink,
      this.accessEnvironmentLink,
      this.homeSupportLink,
    ];

    for (const link of linkElements) {
      const text = (await link.textContent()) || '';
      const href = await link.getAttribute('href');
      links.push({ text: text.trim(), href, disabled: false });
    }

    const pricingText = (await this.pricingButton.textContent()) || '';
    links.push({
      text: pricingText.trim(),
      href: null,
      disabled: await this.isPricingDisabled(),
    });

    return links;
  }

  async filterByCategory(category: 'teacher' | 'curriculum' | 'support' | 'access' | 'home'): Promise<void> {
    const categoryMap = {
      teacher: this.clickTeacherQuality,
      curriculum: this.clickCurriculum,
      support: this.clickSupportSystem,
      access: this.clickAccessEnvironment,
      home: this.clickHomeSupport,
    };

    await categoryMap[category].call(this);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getCurrentCategoryFromUrl(): Promise<string | null> {
    const url = this.page.url();
    const match = url.match(/category=([^&]+)/);
    return match ? match[1] : null;
  }
}
