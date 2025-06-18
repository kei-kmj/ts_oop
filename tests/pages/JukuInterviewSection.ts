import { Page, Locator } from '@playwright/test';
import { JukuTabComponent } from './components/JukuTabComponent';
import { InterviewCard, InterviewCardData } from './components/InterviewCard';

export class JukuInterviewSection {
  readonly page: Page;
  readonly container: Locator;
  readonly tabComponent: JukuTabComponent;
  readonly interviewCard: InterviewCard;
  readonly viewAllLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // Find the specific interview section by looking for the one with interview content
    this.container = page.locator('.bjc-juku-inner-tab-wrap').filter({ 
      has: page.locator('.bjc-posts-interview')
    }).first();
    
    // Create a juku-specific tab component that works within this container
    this.tabComponent = new JukuTabComponent(page, this.container);
    
    // Reuse InterviewCard component
    this.interviewCard = new InterviewCard(page);
    
    // View all link at the bottom
    this.viewAllLink = this.container.locator('.bjc-juku-link');
  }

  async isVisible(): Promise<boolean> {
    return await this.container.isVisible();
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

  // Interview card operations
  async getInterviewCards(): Promise<InterviewCardData[]> {
    const activeContent = this.container.locator('.js-tab__content.is-active');
    const containerSelector = '.js-tab__content.is-active .bjc-posts-interview';
    return await this.interviewCard.getAllCardData(containerSelector);
  }

  async getInterviewCardCount(): Promise<number> {
    const activeContent = this.container.locator('.js-tab__content.is-active');
    return await activeContent.locator('.bjc-post-interview').count();
  }

  async clickInterviewCard(index: number): Promise<void> {
    const activeContent = this.container.locator('.js-tab__content.is-active');
    const card = activeContent.locator('.bjc-post-interview').nth(index);
    await card.click();
  }

  async clickInterviewCardByDestination(destination: string): Promise<void> {
    const activeContent = this.container.locator('.js-tab__content.is-active');
    const cards = await this.getInterviewCards();
    const targetCard = cards.find(card => card.destination.includes(destination));
    
    if (targetCard) {
      const card = activeContent.locator(`.bjc-post-interview[href="${targetCard.href}"]`);
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
  async switchTabAndGetCards(tabText: string): Promise<InterviewCardData[]> {
    await this.tabComponent.clickTabByText(tabText);
    await this.tabComponent.waitForTabChange(tabText);
    return await this.getInterviewCards();
  }

  async getAllTabsInterviewData(): Promise<Array<{
    tabName: string;
    cards: InterviewCardData[];
    cardCount: number;
  }>> {
    const tabs = await this.getAvailableTabs();
    const allTabsData = [];

    for (const tab of tabs) {
      await this.tabComponent.clickTabByText(tab);
      await this.tabComponent.waitForTabChange(tab);
      
      const cards = await this.getInterviewCards();
      
      allTabsData.push({
        tabName: tab,
        cards,
        cardCount: cards.length
      });
    }

    return allTabsData;
  }

  // Check if this juku has interviews for specific grade levels
  async hasInterviewsForGrade(gradeLevel: '大学受験' | '高校受験' | '中学受験'): Promise<boolean> {
    await this.switchTabByText(gradeLevel);
    const cards = await this.getInterviewCards();
    return cards.length > 0;
  }

  async switchTabByText(tabText: string): Promise<void> {
    await this.tabComponent.clickTabByText(tabText);
    await this.tabComponent.waitForTabChange(tabText);
  }

  // Get interviews related to the current juku
  async getJukuRelatedInterviews(jukuName: string): Promise<InterviewCardData[]> {
    const allTabs = await this.getAllTabsInterviewData();
    const relatedInterviews: InterviewCardData[] = [];
    
    for (const tabData of allTabs) {
      const jukuInterviews = tabData.cards.filter(card => 
        card.mainJuku.includes(jukuName) || card.concurrentJuku.includes(jukuName)
      );
      relatedInterviews.push(...jukuInterviews);
    }
    
    return relatedInterviews;
  }

  // Get summary of all interviews
  async getInterviewSummary(): Promise<{
    totalInterviews: number;
    byTab: Record<string, number>;
    jukuMentions: {
      asMain: number;
      asConcurrent: number;
    };
  }> {
    const allTabs = await this.getAllTabsInterviewData();
    let totalInterviews = 0;
    const byTab: Record<string, number> = {};
    let asMain = 0;
    let asConcurrent = 0;
    
    // Assuming we're on a specific juku page, get juku name from the page
    const jukuNameElement = this.page.locator('.bjc-juku-header-title');
    const jukuName = await jukuNameElement.textContent() || '';
    
    for (const tabData of allTabs) {
      totalInterviews += tabData.cardCount;
      byTab[tabData.tabName] = tabData.cardCount;
      
      for (const card of tabData.cards) {
        if (card.mainJuku.includes(jukuName)) {
          asMain++;
        }
        if (card.concurrentJuku.includes(jukuName) && card.concurrentJuku !== 'なし') {
          asConcurrent++;
        }
      }
    }
    
    return {
      totalInterviews,
      byTab,
      jukuMentions: {
        asMain,
        asConcurrent
      }
    };
  }

  async waitForSectionToLoad(): Promise<void> {
    await this.container.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(500); // Wait for tab content
  }
}