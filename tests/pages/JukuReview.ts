import { Base } from './Base';
import type { Page, Locator } from '@playwright/test';
import { BUTTONS } from '../fixtures/global';

export class JukuReview extends Base {
  readonly filterButton: Locator;

  constructor(page: Page, context: string) {
    super(page);
    this.filterButton = page.getByRole('button', { name: BUTTONS.FILTER });
  }

  async init(params: { jukuName: string; classroomName: string }): Promise<void> {
    // Initialize component with juku and classroom names
  }

  async clickFilterButton(): Promise<void> {
    await this.filterButton.click();
  }
}
