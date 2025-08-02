import { Base } from '../Base';
import type { Page } from '@playwright/test';

export class ExamTab extends Base {
  constructor(page: Page, areaId: string) {
    super(page);
  }
}
