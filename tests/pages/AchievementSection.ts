import { type Locator, type Page } from '@playwright/test';
import {HeadingLevel} from "../consts/global";
import {getTab} from "../helper";

export class AchievementSection {
  readonly heading: Locator;
  readonly universityExamTab: Locator;
  readonly highSchoolExamTab: Locator;
  readonly juniorHighExamTab: Locator;
  readonly universityExamList: Locator;
  readonly highSchoolExamList: Locator;
  readonly juniorHighExamList: Locator;
  readonly viewAllLink: Locator;
  readonly universityItem : Locator

  constructor(page: Page) {
    this.universityExamTab = getTab(page, '大学受験', '01-01');
    this.highSchoolExamTab = getTab(page, '高校受験', '01-02');
    this.juniorHighExamTab = getTab(page, '中学受験', '01-03');
    this.heading = page.getByRole('heading', { name: /の合格実績/, level: HeadingLevel.H2 });
    this.universityExamList = page.locator('[data-content="01-01"] ul.bjc-juku-pass_record');
    this.highSchoolExamList = page.locator('[data-content="01-02"] ul.bjc-juku-pass_record');
    this.juniorHighExamList = page.locator('[data-content="01-03"] ul.bjc-juku-pass_record');
    this.viewAllLink = page.getByRole('link', {name: /の合格実績をすべて見る/});
    this.universityItem = page.getByRole('listitem', {name: /大学/});
  }

  async clickUniversityExamTab() {
    await this.universityExamTab.click();
  }

  async clickHighSchoolExamTab() {
    await this.highSchoolExamTab.click();
  }

  async clickJuniorHighExamTab() {
    await this.juniorHighExamTab.click();
  }

  async clickAllLink() {
    await this.viewAllLink.click()
  }
}
