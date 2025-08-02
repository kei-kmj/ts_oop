import { Page, Locator } from '@playwright/test';

export class MainFooter {
  readonly page: Page;
  readonly footerContainer: Locator;
  readonly logoLink: Locator;
  readonly footerCopyText: Locator;
  readonly classroomCountText: Locator;
  readonly navList: Locator;
  readonly jukuListLink: Locator;
  readonly writersListLink: Locator;
  readonly faqLink: Locator;
  readonly termsLink: Locator;
  readonly privacyPolicyLink: Locator;
  readonly inquiryLink: Locator;
  readonly companyInfoLink: Locator;
  readonly reviewPostLink: Locator;
  readonly operationPolicyLink: Locator;
  readonly nationalRankingLink: Locator;
  readonly jukusenJournalLink: Locator;
  readonly copyrightText: Locator;

  constructor(page: Page) {
    this.page = page;

    // Footer container
    this.footerContainer = page.locator('.bjl-footer');

    // Logo
    this.logoLink = this.footerContainer
      .getByRole('link')
      .filter({ has: page.getByRole('img', { name: '塾選（ジュクセン）' }) });

    // Footer copy text
    this.footerCopyText = page.locator('.bjp-footer__copy');
    this.classroomCountText = this.footerCopyText.locator('.num');

    // Navigation list
    this.navList = page.getByRole('list').filter({ has: page.locator('.bjp-footer__nav-list') });

    // Navigation links
    this.jukuListLink = page.getByRole('link', { name: '塾一覧' });
    this.writersListLink = page.getByRole('link', { name: '執筆者一覧' });
    this.faqLink = page.getByRole('link', { name: 'よくある質問' });
    this.termsLink = page.getByRole('link', { name: '利用規約' });
    this.privacyPolicyLink = page.getByRole('link', { name: '個人情報取り扱い' });
    this.inquiryLink = page.getByRole('link', { name: 'ご意見・ご質問' });
    this.companyInfoLink = page.getByRole('link', { name: '会社概要' });
    this.reviewPostLink = page.getByRole('link', { name: '口コミ投稿' });
    this.operationPolicyLink = page.getByRole('link', { name: '運営ポリシー' });
    this.nationalRankingLink = page.getByRole('link', { name: '全国の塾ランキング' });
    this.jukusenJournalLink = page.getByRole('link', { name: '塾選ジャーナル' });

    // Copyright
    this.copyrightText = page.locator('.bjc-copyright');
  }

  async clickLogo(): Promise<void> {
    await this.logoLink.click();
  }

  async navigateToJukuList(): Promise<void> {
    await this.jukuListLink.click();
  }

  async navigateToWritersList(): Promise<void> {
    await this.writersListLink.click();
  }

  async navigateToFAQ(): Promise<void> {
    await this.faqLink.click();
  }

  async navigateToTerms(): Promise<void> {
    await this.termsLink.click();
  }

  async navigateToPrivacyPolicy(): Promise<void> {
    await this.privacyPolicyLink.click();
  }

  async navigateToInquiry(): Promise<void> {
    await this.inquiryLink.click();
  }

  async navigateToCompanyInfo(): Promise<void> {
    await this.companyInfoLink.click();
  }

  async navigateToReviewPost(): Promise<void> {
    await this.reviewPostLink.click();
  }

  async navigateToOperationPolicy(): Promise<void> {
    await this.operationPolicyLink.click();
  }

  async navigateToNationalRanking(): Promise<void> {
    await this.nationalRankingLink.click();
  }

  async navigateToJukusenJournal(): Promise<void> {
    await this.jukusenJournalLink.click();
  }

  async getClassroomCount(): Promise<string> {
    return (await this.classroomCountText.textContent()) || '';
  }

  async getCopyrightYear(): Promise<string> {
    const copyrightElement = this.copyrightText.locator('#js_copyright');
    return (await copyrightElement.textContent()) || '';
  }

  async isFooterVisible(): Promise<boolean> {
    return await this.footerContainer.isVisible();
  }

  async areAllNavLinksVisible(): Promise<boolean> {
    const links = [
      this.jukuListLink,
      this.writersListLink,
      this.faqLink,
      this.termsLink,
      this.privacyPolicyLink,
      this.inquiryLink,
      this.companyInfoLink,
      this.reviewPostLink,
      this.operationPolicyLink,
      this.nationalRankingLink,
      this.jukusenJournalLink,
    ];

    for (const link of links) {
      if (!(await link.isVisible())) {
        return false;
      }
    }
    return true;
  }

  async waitForFooterToLoad(): Promise<void> {
    await this.footerContainer.waitFor({ state: 'visible' });
    await this.navList.waitFor({ state: 'visible' });
  }

  async scrollToFooter(): Promise<void> {
    await this.footerContainer.scrollIntoViewIfNeeded();
  }
}
