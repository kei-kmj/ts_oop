import { Base } from './Base';
import { ExamTab } from '../pages/components/ExamTab';
import { JukuPassedInterview } from '../pages/juku/JukuPassedInterview';
import { JukuCourse } from '../pages/juku/JukuCourse';
import { JukuReview } from '../pages/JukuReview';
import { SECTION } from '../fixtures/global';
import type { Locator, Page } from '@playwright/test';
import { ADDRESS_LABELS } from '../fixtures/global';
import { ClassroomTab } from '../pages/ClassroomTab';
import { SHORT_COURSE_BUTTON } from '../fixtures/global';
import { CTA } from '../pages/components/CTA';

export class ClassroomId extends Base {
  readonly jukuName: Locator;
  readonly classroomName: Locator;
  jukuNameText: string = '';
  classroomNameText: string = '';
  readonly classroomTab: ClassroomTab;
  readonly examTab: ExamTab;
  passedInterview: JukuPassedInterview;
  course: JukuCourse;
  review: JukuReview;
  readonly favoriteButton: Locator;
  readonly content: {
    container: Locator;
    nearestStation: Locator;
    address: Locator;
    mapLink: Locator;
  };
  readonly summerCourseButton: Locator;
  readonly winterCourseButton: Locator;
  readonly springCourseButton: Locator;
  readonly cta: CTA;

  constructor(page: Page) {
    super(page);
    this.jukuName = page.locator('.bjc-page-header-title').getByRole('link');
    this.classroomName = page.locator('.bjc-page-header-title');
    this.classroomTab = new ClassroomTab(page);
    this.examTab = new ExamTab(page, SECTION.RESULT.areaId);
    this.passedInterview = new JukuPassedInterview(page, '');
    this.course = new JukuCourse(page, '');
    this.review = new JukuReview(page, '');
    this.favoriteButton = page.locator('.bjc-toggle-favorite-btn').first();

    const contentContainer = page.locator('.bjc-article-group');
    this.content = {
      container: contentContainer,
      nearestStation: contentContainer.getByText(ADDRESS_LABELS.NEAREST_STATION).locator('..'),
      address: contentContainer.getByText(ADDRESS_LABELS.ADDRESS).locator('..'),
      mapLink: contentContainer.getByRole('link', {
        name: ADDRESS_LABELS.MAP_LINK,
      }),
    };
    this.summerCourseButton = page.getByRole('link', { name: SHORT_COURSE_BUTTON.SUMMER });
    this.winterCourseButton = page.getByRole('link', { name: SHORT_COURSE_BUTTON.WINTER });
    this.springCourseButton = page.getByRole('link', { name: SHORT_COURSE_BUTTON.SPRING });
    this.cta = new CTA(page);
  }

  async gotoClassroom(brandId: string, classroomId: string): Promise<void> {
    await super.goto(`/juku/${brandId}/class/${classroomId}`);

    await this.jukuName.waitFor({ state: 'visible' });
    this.jukuNameText = (await this.jukuName.textContent()) ?? '';
    const fullTitle = (await this.classroomName.textContent()) ?? '';
    this.classroomNameText = fullTitle.replace(this.jukuNameText, '').trim();

    await this.passedInterview.init({ jukuName: this.jukuNameText, classroomName: this.classroomNameText });
    await this.course.init({ jukuName: this.jukuNameText, classroomName: this.classroomNameText });
    await this.review.init({ jukuName: this.jukuNameText, classroomName: this.classroomNameText });
  }

  async clickFavoriteButton(): Promise<void> {
    await this.favoriteButton.click();
  }

  async isSummerCourseButtonVisible(): Promise<boolean> {
    return await this.summerCourseButton.isVisible();
  }

  async isWinterCourseButtonVisible(): Promise<boolean> {
    return await this.winterCourseButton.isVisible();
  }

  async isSpringCourseButtonVisible(): Promise<boolean> {
    return await this.springCourseButton.isVisible();
  }

  async clickSummerCourseButton(): Promise<void> {
    await this.summerCourseButton.click();
  }

  async clickWinterCourseButton(): Promise<void> {
    await this.winterCourseButton.click();
  }

  async clickSpringCourseButton(): Promise<void> {
    await this.springCourseButton.click();
  }
}
