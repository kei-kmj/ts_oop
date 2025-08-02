import { Base } from '../Base';
import type { Locator, Page } from '@playwright/test';
import { CTA_LINK } from '../../fixtures/global';

export class CTA extends Base {
  readonly trialCTALink: Locator;
  readonly docCTALink: Locator;

  constructor(page: Page) {
    super(page);
    this.trialCTALink = page.getByRole('link', { name: CTA_LINK.TRIAL });
    this.docCTALink = page.getByRole('link', { name: CTA_LINK.DOC });
  }

  async clickTrialCTALink(): Promise<void> {
    await this.trialCTALink.first().click();
  }

  async clickDocCTALink(): Promise<void> {
    await this.docCTALink.first().click();
  }
}
