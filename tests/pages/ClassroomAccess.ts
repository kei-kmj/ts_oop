import { Base } from '../pages/Base';
import type { Locator, Page } from '@playwright/test';
import { HEADER } from '../fixtures/global';
import { CTA } from '../pages/components/CTA';

export class ClassroomAccess extends Base {
  readonly title: Locator;
  readonly mapContainer: Locator;
  readonly cta: CTA;

  constructor(page: Page) {
    super(page);
    this.title = page.getByRole('heading', {
      name: /.*の地図・アクセス/,
      level: HEADER.H1,
    });
    this.mapContainer = page.locator('#access-map');
    this.cta = new CTA(page);
  }

  async gotoAccess(brandId: string, classroomId: string): Promise<void> {
    await super.goto(`/juku/${brandId}/class/${classroomId}/access/`);
  }
}
