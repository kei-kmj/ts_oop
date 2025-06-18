import { Page, Locator } from '@playwright/test';
import { JukuTabComponent } from './components/JukuTabComponent';
import { JukuCourseCard, JukuCourseCardData } from './components/JukuCourseCard';

export class JukuCourseSection {
  readonly page: Page;
  readonly container: Locator;
  readonly tabComponent: JukuTabComponent;
  readonly courseCard: JukuCourseCard;
  readonly viewAllLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // Find the specific course section by looking for the one with course content
    this.container = page.locator('.bjc-juku-inner-tab-wrap').filter({ 
      has: page.locator('.bjc-posts-course')
    }).first();
    
    // Create a juku-specific tab component that works within this container
    this.tabComponent = new JukuTabComponent(page, this.container);
    
    // Use JukuCourseCard component for juku pages
    this.courseCard = new JukuCourseCard(page);
    
    // View all link at the bottom
    this.viewAllLink = this.container.locator('.bjc-juku-link');
  }

  async isVisible(): Promise<boolean> {
    return await this.container.isVisible();
  }

  // Tab operations using JukuTabComponent
  async getAvailableTabs(): Promise<string[]> {
    return await this.tabComponent.getTabTexts();
  }

  async getActiveTab(): Promise<string> {
    return await this.tabComponent.getActiveTabText();
  }

  async switchToHighSchoolTab(): Promise<void> {
    await this.tabComponent.clickTabByText('高校生・高卒生');
    await this.tabComponent.waitForTabChange('高校生・高卒生');
  }

  async switchToJuniorHighSchoolTab(): Promise<void> {
    await this.tabComponent.clickTabByText('中学生');
    await this.tabComponent.waitForTabChange('中学生');
  }

  async switchToElementarySchoolTab(): Promise<void> {
    await this.tabComponent.clickTabByText('小学生');
    await this.tabComponent.waitForTabChange('小学生');
  }

  async switchTabByIndex(index: number): Promise<void> {
    const tabTexts = await this.tabComponent.getTabTexts();
    const tabText = tabTexts[index];
    await this.tabComponent.clickTabByIndex(index);
    if (tabText) {
      await this.tabComponent.waitForTabChange(tabText);
    }
  }

  async isTabActive(tabText: string): Promise<boolean> {
    return await this.tabComponent.isTabActive(tabText);
  }

  // Course card operations
  async getCourseCards(): Promise<JukuCourseCardData[]> {
    const activeContent = this.container.locator('.js-tab__content.is-active');
    const containerSelector = '.js-tab__content.is-active .bjc-posts-course';
    return await this.courseCard.getAllCardData(containerSelector);
  }

  async getCourseCardCount(): Promise<number> {
    const activeContent = this.container.locator('.js-tab__content.is-active');
    return await activeContent.locator('.bjc-post-course').count();
  }

  async clickCourseCard(index: number): Promise<void> {
    const activeContent = this.container.locator('.js-tab__content.is-active');
    const card = activeContent.locator('.bjc-post-course').nth(index);
    await card.click();
  }

  async clickCourseCardByTitle(titleText: string): Promise<void> {
    const activeContent = this.container.locator('.js-tab__content.is-active');
    const cards = await this.getCourseCards();
    const targetCard = cards.find(card => card.title.includes(titleText));
    
    if (targetCard) {
      const card = activeContent.locator(`.bjc-post-course[href="${targetCard.href}"]`);
      await card.click();
    }
  }

  // View all link operations
  async clickViewAllLink(): Promise<void> {
    await this.viewAllLink.click();
  }

  async getViewAllLinkText(): Promise<string> {
    return await this.viewAllLink.textContent() || '';
  }

  async getViewAllLinkHref(): Promise<string> {
    return await this.viewAllLink.getAttribute('href') || '';
  }

  async isViewAllLinkVisible(): Promise<boolean> {
    return await this.viewAllLink.isVisible();
  }

  // Combined operations
  async switchTabAndGetCourses(tabText: string): Promise<JukuCourseCardData[]> {
    await this.tabComponent.clickTabByText(tabText);
    await this.tabComponent.waitForTabChange(tabText);
    return await this.getCourseCards();
  }

  async getAllTabsCourseData(): Promise<Array<{
    tabName: string;
    courses: JukuCourseCardData[];
    courseCount: number;
  }>> {
    const tabs = await this.getAvailableTabs();
    const allTabsData = [];

    for (const tab of tabs) {
      await this.tabComponent.clickTabByText(tab);
      await this.tabComponent.waitForTabChange(tab);
      
      const courses = await this.getCourseCards();
      
      allTabsData.push({
        tabName: tab,
        courses,
        courseCount: courses.length
      });
    }

    return allTabsData;
  }

  // Check if this juku has courses for specific grade levels
  async hasCoursesForGrade(gradeLevel: '高校生・高卒生' | '中学生' | '小学生'): Promise<boolean> {
    await this.switchTabByText(gradeLevel);
    const courses = await this.getCourseCards();
    return courses.length > 0;
  }

  async switchTabByText(tabText: string): Promise<void> {
    await this.tabComponent.clickTabByText(tabText);
    await this.tabComponent.waitForTabChange(tabText);
  }

  // Get courses by subject across all tabs
  async getCoursesBySubject(subject: string): Promise<JukuCourseCardData[]> {
    const allTabs = await this.getAllTabsCourseData();
    const coursesBySubject: JukuCourseCardData[] = [];
    
    for (const tabData of allTabs) {
      const subjectCourses = tabData.courses.filter(course => 
        course.subjects.includes(subject)
      );
      coursesBySubject.push(...subjectCourses);
    }
    
    return coursesBySubject;
  }

  // Get exam preparation courses vs regular courses
  async getExamPreparationCourses(): Promise<JukuCourseCardData[]> {
    const allTabs = await this.getAllTabsCourseData();
    const examCourses: JukuCourseCardData[] = [];
    
    for (const tabData of allTabs) {
      const examPrep = tabData.courses.filter(course => 
        course.title.includes('受験対策') || course.title.includes('対策コース')
      );
      examCourses.push(...examPrep);
    }
    
    return examCourses;
  }

  async getRegularCourses(): Promise<JukuCourseCardData[]> {
    const allTabs = await this.getAllTabsCourseData();
    const regularCourses: JukuCourseCardData[] = [];
    
    for (const tabData of allTabs) {
      const regular = tabData.courses.filter(course => 
        course.title.includes('向けコース') && !course.title.includes('受験対策')
      );
      regularCourses.push(...regular);
    }
    
    return regularCourses;
  }

  // Get summary of all courses
  async getCourseSummary(): Promise<{
    totalCourses: number;
    byTab: Record<string, number>;
    examPreparationCount: number;
    regularCourseCount: number;
    subjectCoverage: Record<string, number>;
    mostCommonSubjects: string[];
  }> {
    const allTabs = await this.getAllTabsCourseData();
    let totalCourses = 0;
    const byTab: Record<string, number> = {};
    let examPreparationCount = 0;
    let regularCourseCount = 0;
    const subjectCoverage: Record<string, number> = {};
    
    for (const tabData of allTabs) {
      totalCourses += tabData.courseCount;
      byTab[tabData.tabName] = tabData.courseCount;
      
      for (const course of tabData.courses) {
        // Count exam preparation vs regular courses
        if (course.title.includes('受験対策') || course.title.includes('対策コース')) {
          examPreparationCount++;
        } else if (course.title.includes('向けコース')) {
          regularCourseCount++;
        }
        
        // Count subjects
        for (const subject of course.subjects) {
          subjectCoverage[subject] = (subjectCoverage[subject] || 0) + 1;
        }
      }
    }
    
    // Get most common subjects (sorted by frequency)
    const mostCommonSubjects = Object.entries(subjectCoverage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([subject]) => subject);
    
    return {
      totalCourses,
      byTab,
      examPreparationCount,
      regularCourseCount,
      subjectCoverage,
      mostCommonSubjects
    };
  }

  // Get the heading text for the active tab
  async getActiveTabHeading(): Promise<string> {
    const activeContent = this.container.locator('.js-tab__content.is-active');
    const heading = activeContent.locator('.bjc-juku-heading-4');
    return await heading.textContent() || '';
  }

  async waitForSectionToLoad(): Promise<void> {
    await this.container.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(500); // Wait for tab content
  }
}