import { Page, Locator } from '@playwright/test';
import { TabComponent } from './components/TabComponent';
import { InterviewCard, InterviewCardData } from './components/InterviewCard';

export class InterviewSection {
  readonly page: Page;
  readonly container: Locator;
  readonly title: Locator;
  readonly tabComponent: TabComponent;
  readonly interviewCard: InterviewCard;
  readonly viewAllLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('.bjp-home-interview');
    this.title = this.container.locator('.bjp-home-title__normal .bjp-home-title__normal--sakura');
    this.tabComponent = new TabComponent(page, '.bjp-home-tab');
    this.interviewCard = new InterviewCard(page);
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

  // Interview card operations using InterviewCard component
  async getInterviewCards(): Promise<InterviewCardData[]> {
    const activeContent = await this.tabComponent.getActiveTabContent();
    const containerSelector = '.tab__content-item.is-active .bjc-posts-interview';
    return await this.interviewCard.getAllCardData(containerSelector);
  }

  async getInterviewCardCount(): Promise<number> {
    const containerSelector = '.tab__content-item.is-active .bjc-posts-interview';
    return await this.interviewCard.getCardCount(containerSelector);
  }

  async getPickupCards(): Promise<InterviewCardData[]> {
    const containerSelector = '.tab__content-item.is-active .bjc-posts-interview';
    return await this.interviewCard.getPickupCards(containerSelector);
  }

  async clickInterviewCard(index: number): Promise<void> {
    const activeContent = await this.tabComponent.getActiveTabContent();
    const card = activeContent.locator('.bjc-post-interview').nth(index);
    await card.click();
  }

  async clickInterviewCardByDestination(destination: string): Promise<void> {
    const activeContent = await this.tabComponent.getActiveTabContent();
    const cards = await this.getInterviewCards();
    const targetCard = cards.find(card => card.destination.includes(destination));
    
    if (targetCard) {
      const card = activeContent.locator(`.bjc-post-interview[href="${targetCard.href}"]`);
      await card.click();
    }
  }

  async clickInterviewCardByJuku(jukuName: string): Promise<void> {
    const activeContent = await this.tabComponent.getActiveTabContent();
    const cards = await this.getInterviewCards();
    const targetCard = cards.find(card => card.mainJuku.includes(jukuName));
    
    if (targetCard) {
      const card = activeContent.locator(`.bjc-post-interview[href="${targetCard.href}"]`);
      await card.click();
    }
  }

  async getDestinationsInActiveTab(): Promise<string[]> {
    const cards = await this.getInterviewCards();
    return cards.map(card => card.destination);
  }

  async getJukusInActiveTab(): Promise<string[]> {
    const cards = await this.getInterviewCards();
    const jukus = new Set<string>();
    cards.forEach(card => {
      jukus.add(card.mainJuku);
      if (card.concurrentJuku && card.concurrentJuku !== 'なし') {
        jukus.add(card.concurrentJuku);
      }
    });
    return Array.from(jukus);
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
  async switchTabAndGetCards(tabText: string): Promise<InterviewCardData[]> {
    await this.tabComponent.clickTabByText(tabText);
    await this.page.waitForTimeout(500);
    return await this.getInterviewCards();
  }

  async getCardsByGender(gender: string): Promise<InterviewCardData[]> {
    const containerSelector = '.tab__content-item.is-active .bjc-posts-interview';
    return await this.interviewCard.getCardsByGender(gender, containerSelector);
  }

  async getCardsByJuku(jukuName: string): Promise<InterviewCardData[]> {
    const containerSelector = '.tab__content-item.is-active .bjc-posts-interview';
    return await this.interviewCard.getCardsByJuku(jukuName, containerSelector);
  }

  async getAllTabsData(): Promise<Array<{
    tabName: string;
    cards: InterviewCardData[];
    pickupCount: number;
    viewAllLink: string;
  }>> {
    const tabs = await this.getAvailableTabs();
    const allTabsData = [];

    for (const tab of tabs) {
      await this.tabComponent.clickTabByText(tab);
      await this.page.waitForTimeout(500);
      
      const cards = await this.getInterviewCards();
      const pickupCards = await this.getPickupCards();
      const viewAllLink = await this.getViewAllLinkHref();
      
      allTabsData.push({
        tabName: tab,
        cards,
        pickupCount: pickupCards.length,
        viewAllLink
      });
    }

    return allTabsData;
  }

  async getInterviewSummary(): Promise<{
    totalCards: number;
    pickupCards: number;
    maleCount: number;
    femaleCount: number;
    uniqueJukus: string[];
    uniqueDestinations: string[];
  }> {
    const cards = await this.getInterviewCards();
    const pickupCards = cards.filter(card => card.isPickup);
    const maleCards = cards.filter(card => card.gender === '男性');
    const femaleCards = cards.filter(card => card.gender === '女性');
    
    const uniqueJukus = new Set<string>();
    const uniqueDestinations = new Set<string>();
    
    cards.forEach(card => {
      uniqueJukus.add(card.mainJuku);
      uniqueDestinations.add(card.destination);
      if (card.concurrentJuku && card.concurrentJuku !== 'なし') {
        uniqueJukus.add(card.concurrentJuku);
      }
    });
    
    return {
      totalCards: cards.length,
      pickupCards: pickupCards.length,
      maleCount: maleCards.length,
      femaleCount: femaleCards.length,
      uniqueJukus: Array.from(uniqueJukus),
      uniqueDestinations: Array.from(uniqueDestinations)
    };
  }

  async waitForSectionToLoad(): Promise<void> {
    await this.container.waitFor({ state: 'visible' });
    await this.title.waitFor({ state: 'visible' });
    await this.interviewCard.waitForCardsToLoad();
  }
}