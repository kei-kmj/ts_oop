import { Base } from '../pages/Base';
import type { Locator, Page } from '@playwright/test';
import { ClassroomTabKey, CLASSROOM_TAB } from '../fixtures/global';

export class ClassroomTab extends Base {
  readonly tabs: Record<ClassroomTabKey, Locator>;

  constructor(page: Page) {
    super(page);

    const tabContainer = page.locator('.bjc-juku-tab-wrap');
    this.tabs = {
      top: tabContainer.locator(`.${CLASSROOM_TAB.top.className}`),
      report: tabContainer.getByRole('link', { name: CLASSROOM_TAB.report.label }),
      review: tabContainer.getByRole('link', { name: CLASSROOM_TAB.review.label }),
      map: tabContainer.getByRole('link', { name: CLASSROOM_TAB.map.label }),
    };
  }

  async goToTab(tabKey: ClassroomTabKey): Promise<void> {
    await this.tabs[tabKey].click();
  }
}
