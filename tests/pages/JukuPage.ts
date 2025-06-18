import { Page } from '@playwright/test';
import { Base } from './Base';
import { JukuHeader } from './JukuHeader';
import { JukuInterviewSection } from './JukuInterviewSection';
import { JukuExperienceSection } from './JukuExperienceSection';
import { JukuCourseSection } from './JukuCourseSection';
import { JukuPriceSection } from './JukuPriceSection';

export class JukuPage extends Base {
  readonly header: JukuHeader;
  readonly interviewSection: JukuInterviewSection;
  readonly experienceSection: JukuExperienceSection;
  readonly courseSection: JukuCourseSection;
  readonly priceSection: JukuPriceSection;

  constructor(page: Page) {
    super(page);
    this.header = new JukuHeader(page);
    this.interviewSection = new JukuInterviewSection(page);
    this.experienceSection = new JukuExperienceSection(page);
    this.courseSection = new JukuCourseSection(page);
    this.priceSection = new JukuPriceSection(page);
  }

  async goto(brandId: string): Promise<void> {
    await super.goto(`/juku/${brandId}/`);
  }

  async waitForPageToLoad(): Promise<void> {
    await this.header.waitForHeaderToLoad();
    // Interview section might not always be present, so don't wait for it by default
  }

  async hasInterviewSection(): Promise<boolean> {
    return await this.interviewSection.isVisible();
  }

  async hasExperienceSection(): Promise<boolean> {
    return await this.experienceSection.isVisible();
  }

  async hasCourseSection(): Promise<boolean> {
    return await this.courseSection.isVisible();
  }

  async hasPriceSection(): Promise<boolean> {
    return await this.priceSection.isVisible();
  }

  async getJukuName(): Promise<string> {
    return await this.header.getJukuName();
  }

  async getJukuPageData(): Promise<{
    header: any;
    interviews: any;
    experiences: any;
    courses: any;
    pricing: any;
    hasInterviews: boolean;
    hasExperiences: boolean;
    hasCourses: boolean;
    hasPricing: boolean;
  }> {
    const headerData = await this.header.getJukuHeaderData();
    const hasInterviews = await this.hasInterviewSection();
    const hasExperiences = await this.hasExperienceSection();
    const hasCourses = await this.hasCourseSection();
    const hasPricing = await this.hasPriceSection();
    
    let interviews = null;
    if (hasInterviews) {
      interviews = await this.interviewSection.getInterviewSummary();
    }

    let experiences = null;
    if (hasExperiences) {
      experiences = await this.experienceSection.getExperienceSummary();
    }

    let courses = null;
    if (hasCourses) {
      courses = await this.courseSection.getCourseSummary();
    }

    let pricing = null;
    if (hasPricing) {
      pricing = await this.priceSection.getPricingSummary();
    }

    return {
      header: headerData,
      interviews,
      experiences,
      courses,
      pricing,
      hasInterviews,
      hasExperiences,
      hasCourses,
      hasPricing
    };
  }
}