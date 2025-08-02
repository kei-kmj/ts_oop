import { Base } from './Base';
import { Locator, Page } from '@playwright/test';
import { TabNavigation } from './TabNavigation';
import { HeadingLevel } from '../consts/global';
import { AchievementSection } from './AchievementSection';

export class Juku extends Base {
  readonly tabNavigation: TabNavigation;
  readonly achievementSection: AchievementSection;
  readonly consultationLink: Locator;
  readonly askLink: Locator;

  constructor(page: Page) {
    super(page);
    this.consultationLink = page.getByRole('link', { name: /体験授業の相談/ });
    this.askLink = page.getByRole('link', { name: /料金・コースを知りたい/ });
    this.tabNavigation = new TabNavigation(page);
    this.achievementSection = new AchievementSection(page);
  }
  async goto(jukuID: string): Promise<void> {
    await super.goto(`/juku/${jukuID}`);
  }

  async clickConsultationLink(): Promise<void> {
    await this.consultationLink.first().click();
  }
  async getAchievementTitleText(): Promise<string> {
    return await this.page.getByRole('heading', { name: /の合格実績/, level: HeadingLevel.H2 }).innerText();
  }

  async clickAskLink() {
    await this.askLink.first().click();
  }
}
