import { Base } from './Base';
import type { Locator, Page } from '@playwright/test';

export class ReviewId extends Base {
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('h1');
  }
}
