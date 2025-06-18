import { Page, Locator } from '@playwright/test';
import { TabComponent } from './components/TabComponent';
import { ExperienceCard, ExperienceCardData } from './components/ExperienceCard';

export class ExperienceSection {
  readonly page: Page;
  readonly container: Locator;
  readonly title: Locator;
  readonly tabComponent: TabComponent;
  readonly experienceCard: ExperienceCard;
  readonly viewAllLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('.bjp-home-experience');
    this.title = this.container.locator('.bjp-home-title__normal .bjp-home-title__normal--study');
    this.tabComponent = new TabComponent(page, '.bjp-home-tab');
    this.experienceCard = new ExperienceCard(page);
    this.viewAllLinks = this.container.locator('.pjc-link-text');
  }

  async getTitle(): Promise<string> {
    return await this.title.textContent() || '';
  }

  async isVisible(): Promise<boolean> {
    return await this.container.isVisible();
  }

  async isTitleVisible(): Promise<boolean> {
    return await this.title.isVisible();
  }

  // Tab operations using TabComponent
  async getAvailableTabs(): Promise<string[]> {
    return await this.tabComponent.getTabTexts();
  }

  async getActiveTab(): Promise<string> {
    return await this.tabComponent.getActiveTabText();
  }

  async switchToUniversityTab(): Promise<void> {
    await this.tabComponent.clickTabByText('大学受験');
    await this.page.waitForTimeout(500); // Wait for tab switch animation
  }

  async switchToHighSchoolTab(): Promise<void> {
    await this.tabComponent.clickTabByText('高校受験');
    await this.page.waitForTimeout(500);
  }

  async switchToJuniorHighSchoolTab(): Promise<void> {
    await this.tabComponent.clickTabByText('中学受験');
    await this.page.waitForTimeout(500);
  }

  async switchTabByIndex(index: number): Promise<void> {
    await this.tabComponent.clickTabByIndex(index);
    await this.page.waitForTimeout(500);
  }

  async isTabActive(tabText: string): Promise<boolean> {
    return await this.tabComponent.isTabActive(tabText);
  }

  // Experience card operations using ExperienceCard component
  async getExperienceCards(): Promise<ExperienceCardData[]> {
    const activeContent = await this.tabComponent.getActiveTabContent();
    const containerSelector = '.tab__content-item.is-active .bjp-home-experience__contents';
    return await this.experienceCard.getAllCardData(containerSelector);
  }

  async getExperienceCardCount(): Promise<number> {
    const containerSelector = '.tab__content-item.is-active .bjp-home-experience__contents';
    return await this.experienceCard.getCardCount(containerSelector);
  }

  async clickExperienceCard(index: number): Promise<void> {
    const activeContent = await this.tabComponent.getActiveTabContent();
    const card = activeContent.locator('.bjp-home-experience__content').nth(index);
    await card.click();
  }

  async clickExperienceCardBySchoolName(schoolName: string): Promise<void> {
    const activeContent = await this.tabComponent.getActiveTabContent();
    const card = activeContent.locator('.bjp-home-experience__content').filter({
      has: this.page.locator('.title .passed', { hasText: schoolName })
    });
    await card.click();
  }

  async getSchoolNamesInActiveTab(): Promise<string[]> {
    const containerSelector = '.tab__content-item.is-active .bjp-home-experience__contents';
    return await this.experienceCard.getSchoolNames(containerSelector);
  }

  // View all links
  async clickViewAllLink(): Promise<void> {
    const activeContent = await this.tabComponent.getActiveTabContent();
    const viewAllLink = activeContent.locator('.pjc-link-text');
    await viewAllLink.click();
  }

  async getViewAllLinkText(): Promise<string> {
    const activeContent = await this.tabComponent.getActiveTabContent();
    const viewAllLink = activeContent.locator('.pjc-link-text');
    return await viewAllLink.textContent() || '';
  }

  async getViewAllLinkHref(): Promise<string> {
    const activeContent = await this.tabComponent.getActiveTabContent();
    const viewAllLink = activeContent.locator('.pjc-link-text');
    return await viewAllLink.getAttribute('href') || '';
  }

  // Combined operations
  async switchTabAndGetCards(tabText: string): Promise<ExperienceCardData[]> {
    await this.tabComponent.clickTabByText(tabText);
    await this.page.waitForTimeout(500);
    return await this.getExperienceCards();
  }

  async getCardsByDeviationRange(minDeviation: number, maxDeviation: number): Promise<ExperienceCardData[]> {
    const containerSelector = '.tab__content-item.is-active .bjp-home-experience__contents';
    return await this.experienceCard.getCardsByDeviationRange(minDeviation, maxDeviation, containerSelector);
  }

  async getCardsByYear(year: string): Promise<ExperienceCardData[]> {
    const containerSelector = '.tab__content-item.is-active .bjp-home-experience__contents';
    return await this.experienceCard.getCardsByYear(year, containerSelector);
  }

  async getAllTabsData(): Promise<Array<{
    tabName: string;
    cards: ExperienceCardData[];
    viewAllLink: string;
  }>> {
    const tabs = await this.getAvailableTabs();
    const allTabsData = [];

    for (const tab of tabs) {
      await this.tabComponent.clickTabByText(tab);
      await this.page.waitForTimeout(500);
      
      const cards = await this.getExperienceCards();
      const viewAllLink = await this.getViewAllLinkHref();
      
      allTabsData.push({
        tabName: tab,
        cards,
        viewAllLink
      });
    }

    return allTabsData;
  }

  async waitForSectionToLoad(): Promise<void> {
    await this.container.waitFor({ state: 'visible' });
    await this.title.waitFor({ state: 'visible' });
    await this.experienceCard.waitForCardsToLoad();
  }
}