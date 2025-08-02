import { Page, Locator } from '@playwright/test';
import { Base } from './Base';

export class GradeSelectPage extends Base {
  readonly backLink: Locator;
  readonly pageTitle: Locator;
  readonly campaignModal: Locator;
  readonly campaignModalCloseButton: Locator;
  readonly campaignModalDetailsLink: Locator;

  // Grade sections
  readonly highSchoolSection: Locator;
  readonly middleSchoolSection: Locator;
  readonly elementarySchoolSection: Locator;
  readonly othersSection: Locator;

  // Grade links
  readonly gradeLinks: Locator;

  constructor(page: Page) {
    super(page);

    // Header elements
    this.backLink = page.locator('.bjc-search-header-prefecture-back');
    this.pageTitle = page.getByRole('heading', { level: 1, name: '学年を選択' });

    // Campaign modal
    this.campaignModal = page.locator('.present-campaign-modal');
    this.campaignModalCloseButton = page.locator('.present-campaign-modal-close-button');
    this.campaignModalDetailsLink = page.locator('.present-campaign-modal-link');

    // Grade sections
    this.highSchoolSection = page.locator('.bjc-search-form--row').filter({ hasText: '高校生' });
    this.middleSchoolSection = page.locator('.bjc-search-form--row').filter({ hasText: '中学生' });
    this.elementarySchoolSection = page.locator('.bjc-search-form--row').filter({ hasText: '小学生' });
    this.othersSection = page.locator('.bjc-search-form--row').filter({ hasText: 'その他' });

    // All grade links
    this.gradeLinks = page.locator('.bjc-search-form--radio--wrap a');
  }

  async goto(prefecture?: string, addressCode?: string) {
    let url = '/search/requirement/grade/';
    if (prefecture || addressCode) {
      const params = new URLSearchParams();
      if (prefecture) params.set('prefecture', prefecture);
      if (addressCode) params.set('address_code_and_upper', addressCode);
      url += `?${params.toString()}`;
    }
    await super.goto(url);
  }

  async clickBackLink(): Promise<void> {
    await this.backLink.click();
  }

  // Campaign modal methods
  async isCampaignModalVisible(): Promise<boolean> {
    return await this.campaignModal.isVisible();
  }

  async closeCampaignModal(): Promise<void> {
    await this.campaignModalCloseButton.click();
  }

  async clickCampaignDetails(): Promise<void> {
    await this.campaignModalDetailsLink.click();
  }

  // Dynamic grade selection methods
  async selectGrade(gradeName: string): Promise<void> {
    const gradeLink = this.page.getByRole('link', { name: gradeName });
    await gradeLink.click();
  }

  async selectGradeByExactText(gradeText: string): Promise<void> {
    const gradeLink = this.page.getByRole('link', { name: gradeText, exact: true });
    await gradeLink.click();
  }

  async selectGradeByHref(href: string): Promise<void> {
    const gradeLink = this.page.locator(`a[href="${href}"]`);
    await gradeLink.click();
  }

  // Specific grade selection methods
  async selectHighSchoolAll(): Promise<void> {
    await this.selectGrade('高校生すべて');
  }

  async selectHighSchool1(): Promise<void> {
    await this.selectGrade('高1');
  }

  async selectHighSchool2(): Promise<void> {
    await this.selectGrade('高2');
  }

  async selectHighSchool3(): Promise<void> {
    await this.selectGrade('高3');
  }

  async selectMiddleSchoolAll(): Promise<void> {
    await this.selectGrade('中学生すべて');
  }

  async selectMiddleSchool1(): Promise<void> {
    await this.selectGrade('中1');
  }

  async selectMiddleSchool2(): Promise<void> {
    await this.selectGrade('中2');
  }

  async selectMiddleSchool3(): Promise<void> {
    await this.selectGrade('中3');
  }

  async selectElementarySchoolAll(): Promise<void> {
    await this.selectGrade('小学生すべて');
  }

  async selectElementarySchool1(): Promise<void> {
    await this.selectGrade('小1');
  }

  async selectElementarySchool2(): Promise<void> {
    await this.selectGrade('小2');
  }

  async selectElementarySchool3(): Promise<void> {
    await this.selectGrade('小3');
  }

  async selectElementarySchool4(): Promise<void> {
    await this.selectGrade('小4');
  }

  async selectElementarySchool5(): Promise<void> {
    await this.selectGrade('小5');
  }

  async selectElementarySchool6(): Promise<void> {
    await this.selectGrade('小6');
  }

  async selectKindergarten(): Promise<void> {
    await this.selectGrade('幼児');
  }

  async selectGraduate(): Promise<void> {
    await this.selectGrade('高卒生');
  }

  // Helper method to get grade data
  async getGradeData(gradeName: string): Promise<{
    name: string;
    href: string;
    gradeValue: string;
    prefecture: string;
    addressCode: string;
  } | null> {
    const gradeLink = this.page.getByRole('link', { name: gradeName });
    const count = await gradeLink.count();

    if (count === 0) {
      return null;
    }

    const href = (await gradeLink.getAttribute('href')) || '';

    // Extract parameters from href
    const urlParams = new URLSearchParams(href.split('?')[1] || '');
    const gradeValue = urlParams.get('target_grade_id') || '';
    const prefecture = urlParams.get('prefecture') || '';
    const addressCode = urlParams.get('address_code_and_upper') || '';

    return {
      name: gradeName,
      href,
      gradeValue,
      prefecture,
      addressCode,
    };
  }

  // Get all grade data in a section
  async getAllGradeDataInSection(sectionLocator: Locator): Promise<
    Array<{
      name: string;
      href: string;
      gradeValue: string;
      prefecture: string;
      addressCode: string;
    }>
  > {
    const links = sectionLocator.locator('a');
    const linkCount = await links.count();
    const gradeData = [];

    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const name = (await link.textContent()) || '';
      const href = (await link.getAttribute('href')) || '';

      // Extract parameters from href
      const urlParams = new URLSearchParams(href.split('?')[1] || '');
      const gradeValue = urlParams.get('target_grade_id') || '';
      const prefecture = urlParams.get('prefecture') || '';
      const addressCode = urlParams.get('address_code_and_upper') || '';

      gradeData.push({
        name: name.trim(),
        href,
        gradeValue,
        prefecture,
        addressCode,
      });
    }

    return gradeData;
  }

  // Get all grade data on the page
  async getAllGradeData(): Promise<
    Array<{
      name: string;
      href: string;
      gradeValue: string;
      prefecture: string;
      addressCode: string;
      section: string;
    }>
  > {
    const sections = [
      { locator: this.highSchoolSection, name: '高校生' },
      { locator: this.middleSchoolSection, name: '中学生' },
      { locator: this.elementarySchoolSection, name: '小学生' },
      { locator: this.othersSection, name: 'その他' },
    ];

    const allGradeData = [];

    for (const section of sections) {
      const sectionData = await this.getAllGradeDataInSection(section.locator);
      sectionData.forEach((data) => {
        allGradeData.push({
          ...data,
          section: section.name,
        });
      });
    }

    return allGradeData;
  }

  // Get grades by grade value pattern
  async getGradesByValuePattern(pattern: RegExp): Promise<
    Array<{
      name: string;
      href: string;
      gradeValue: string;
      prefecture: string;
      addressCode: string;
      section: string;
    }>
  > {
    const allGrades = await this.getAllGradeData();
    return allGrades.filter((grade) => pattern.test(grade.gradeValue));
  }

  // Get single grades (not "すべて" options)
  async getSingleGrades(): Promise<
    Array<{
      name: string;
      href: string;
      gradeValue: string;
      prefecture: string;
      addressCode: string;
      section: string;
    }>
  > {
    const allGrades = await this.getAllGradeData();
    return allGrades.filter((grade) => !grade.gradeValue.includes(',') && !grade.name.includes('すべて'));
  }

  // Get "すべて" options
  async getAllOptions(): Promise<
    Array<{
      name: string;
      href: string;
      gradeValue: string;
      prefecture: string;
      addressCode: string;
      section: string;
    }>
  > {
    const allGrades = await this.getAllGradeData();
    return allGrades.filter((grade) => grade.name.includes('すべて'));
  }

  async waitForPageToLoad(): Promise<void> {
    await this.pageTitle.waitFor({ state: 'visible' });
    await this.gradeLinks.first().waitFor({ state: 'visible' });
  }

  async getGradeLinksCount(): Promise<number> {
    return await this.gradeLinks.count();
  }
}
