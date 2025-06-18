import { Page, Locator } from '@playwright/test';

export class JukuInquirySection {
  readonly page: Page;
  readonly sectionContainer: Locator;
  readonly sectionTitle: Locator;
  readonly ctaMessage: Locator;
  readonly inquiryButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Section container
    this.sectionContainer = page.locator('section.bjp-juku-section');
    
    // Section title
    this.sectionTitle = page.getByRole('heading', { level: 3, name: '掲載をお考えの学習塾様へ' });
    
    // CTA message with initial cost info
    this.ctaMessage = page.locator('.bjp-cta__message').filter({ hasText: '初期費用無料' });
    
    // Inquiry button
    this.inquiryButton = page.getByRole('link', { name: '学習塾様用 お問い合わせ' });
  }

  async clickInquiryButton(): Promise<void> {
    await this.inquiryButton.click();
  }

  async getCtaMessageText(): Promise<string> {
    return await this.ctaMessage.textContent() || '';
  }

  async isSectionVisible(): Promise<boolean> {
    return await this.sectionContainer.isVisible();
  }

  async isInquiryButtonVisible(): Promise<boolean> {
    return await this.inquiryButton.isVisible();
  }

  async waitForSectionToLoad(): Promise<void> {
    await this.sectionContainer.waitFor({ state: 'visible' });
    await this.inquiryButton.waitFor({ state: 'visible' });
  }

  async scrollToSection(): Promise<void> {
    await this.sectionContainer.scrollIntoViewIfNeeded();
  }

  async getInquiryButtonHref(): Promise<string | null> {
    return await this.inquiryButton.getAttribute('href');
  }
}