import { Base } from '../Base';
import type { Locator, Page } from '@playwright/test';
import { CTA_LINK, CSS_CLASSES } from '../../fixtures/global';

export class CTA extends Base {
  readonly trialCTALink: Locator;
  readonly docCTALink: Locator;

  constructor(page: Page) {
    super(page);
    // ページ内のすべてのCTAボタンから該当するテキストを含むものを選択（page-fixedも含む）
    this.trialCTALink = page.locator(CSS_CLASSES.CTA_BTN).filter({ hasText: CTA_LINK.TRIAL });
    this.docCTALink = page.locator(CSS_CLASSES.CTA_BTN).filter({ hasText: CTA_LINK.DOC });
  }

  async clickTrialCTALink(): Promise<void> {
    await this.trialCTALink.first().click();
  }

  async clickDocCTALink(): Promise<void> {
    await this.docCTALink.first().click();
  }
}
