import { Page, Locator } from '@playwright/test';
import { JukuTabComponent } from './components/JukuTabComponent';
import { JukuExperienceCard, JukuJukuExperienceCardData } from './components/JukuExperienceCard';

export class JukuExperienceSection {
  readonly page: Page;
  readonly container: Locator;
  readonly tabComponent: JukuTabComponent;
  readonly experienceCard: JukuExperienceCard;
  readonly viewAllLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // Find the specific experience section by looking for the one with experience content
    this.container = page.locator('.bjc-juku-inner-tab-wrap').filter({ 
      has: page.locator('.bjc-posts-experience')
    }).first();
    
    // Create a juku-specific tab component that works within this container
    this.tabComponent = new JukuTabComponent(page, this.container);
    
    // Use JukuExperienceCard component for juku pages
    this.experienceCard = new JukuExperienceCard(page);
    
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

  async switchToUniversityTab(): Promise<void> {
    await this.tabComponent.clickTabByText('大学受験');
    await this.tabComponent.waitForTabChange('大学受験');
  }

  async switchToHighSchoolTab(): Promise<void> {
    await this.tabComponent.clickTabByText('高校受験');
    await this.tabComponent.waitForTabChange('高校受験');
  }

  async switchToJuniorHighSchoolTab(): Promise<void> {
    await this.tabComponent.clickTabByText('中学受験');
    await this.tabComponent.waitForTabChange('中学受験');
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

  // Experience card operations
  async getExperienceCards(): Promise<JukuJukuExperienceCardData[]> {
    const activeContent = this.container.locator('.js-tab__content.is-active');
    const containerSelector = '.js-tab__content.is-active .bjc-posts-experience';
    return await this.experienceCard.getAllCardData(containerSelector);
  }

  async getExperienceCardCount(): Promise<number> {
    const activeContent = this.container.locator('.js-tab__content.is-active');
    return await activeContent.locator('.bjc-post-experience').count();
  }

  async clickExperienceCard(index: number): Promise<void> {
    const activeContent = this.container.locator('.js-tab__content.is-active');
    const card = activeContent.locator('.bjc-post-experience').nth(index);
    await card.click();
  }

  async clickExperienceCardByTitle(titleText: string): Promise<void> {
    const activeContent = this.container.locator('.js-tab__content.is-active');
    const cards = await this.getExperienceCards();
    const targetCard = cards.find(card => card.title.includes(titleText));
    
    if (targetCard) {
      const card = activeContent.locator(`.bjc-post-experience[href="${targetCard.href}"]`);
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
  async switchTabAndGetCards(tabText: string): Promise<JukuExperienceCardData[]> {
    await this.tabComponent.clickTabByText(tabText);
    await this.tabComponent.waitForTabChange(tabText);
    return await this.getExperienceCards();
  }

  async getAllTabsExperienceData(): Promise<Array<{
    tabName: string;
    cards: JukuExperienceCardData[];
    cardCount: number;
  }>> {
    const tabs = await this.getAvailableTabs();
    const allTabsData = [];

    for (const tab of tabs) {
      await this.tabComponent.clickTabByText(tab);
      await this.tabComponent.waitForTabChange(tab);
      
      const cards = await this.getExperienceCards();
      
      allTabsData.push({
        tabName: tab,
        cards,
        cardCount: cards.length
      });
    }

    return allTabsData;
  }

  // Check if this juku has experiences for specific grade levels
  async hasExperiencesForGrade(gradeLevel: '大学受験' | '高校受験' | '中学受験'): Promise<boolean> {
    await this.switchTabByText(gradeLevel);
    const cards = await this.getExperienceCards();
    return cards.length > 0;
  }

  async switchTabByText(tabText: string): Promise<void> {
    await this.tabComponent.clickTabByText(tabText);
    await this.tabComponent.waitForTabChange(tabText);
  }

  // Filter experiences by year or deviation value
  async getExperiencesByYear(year: number): Promise<JukuExperienceCardData[]> {
    const allTabs = await this.getAllTabsExperienceData();
    const experiencesByYear: JukuExperienceCardData[] = [];
    
    for (const tabData of allTabs) {
      const yearExperiences = tabData.cards.filter(card => card.year === year);
      experiencesByYear.push(...yearExperiences);
    }
    
    return experiencesByYear;
  }

  async getExperiencesByDeviationRange(minDeviation: number, maxDeviation: number): Promise<JukuExperienceCardData[]> {
    const allTabs = await this.getAllTabsExperienceData();
    const experiencesByDeviation: JukuExperienceCardData[] = [];
    
    for (const tabData of allTabs) {
      const deviationExperiences = tabData.cards.filter(card => 
        card.startingDeviation >= minDeviation && card.startingDeviation <= maxDeviation
      );
      experiencesByDeviation.push(...deviationExperiences);
    }
    
    return experiencesByDeviation;
  }

  // Get summary of all experiences
  async getExperienceSummary(): Promise<{
    totalExperiences: number;
    byTab: Record<string, number>;
    averageStartingDeviation: number;
    yearDistribution: Record<number, number>;
    pickupCount: number;
  }> {
    const allTabs = await this.getAllTabsExperienceData();
    let totalExperiences = 0;
    const byTab: Record<string, number> = {};
    let totalDeviation = 0;
    let deviationCount = 0;
    const yearDistribution: Record<number, number> = {};
    let pickupCount = 0;
    
    for (const tabData of allTabs) {
      totalExperiences += tabData.cardCount;
      byTab[tabData.tabName] = tabData.cardCount;
      
      for (const card of tabData.cards) {
        if (card.startingDeviation > 0) {
          totalDeviation += card.startingDeviation;
          deviationCount++;
        }
        
        if (card.year > 0) {
          yearDistribution[card.year] = (yearDistribution[card.year] || 0) + 1;
        }
        
        if (card.isPickup) {
          pickupCount++;
        }
      }
    }
    
    const averageStartingDeviation = deviationCount > 0 ? Math.round(totalDeviation / deviationCount) : 0;
    
    return {
      totalExperiences,
      byTab,
      averageStartingDeviation,
      yearDistribution,
      pickupCount
    };
  }

  async waitForSectionToLoad(): Promise<void> {
    await this.container.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(500); // Wait for tab content
  }
}