import { Page, Locator } from '@playwright/test';
import { JukuTabComponent } from './components/JukuTabComponent';
import { JukuPriceCard, JukuPriceData } from './components/JukuPriceCard';

export class JukuPriceSection {
  readonly page: Page;
  readonly container: Locator;
  readonly tabComponent: JukuTabComponent;
  readonly priceCard: JukuPriceCard;

  constructor(page: Page) {
    this.page = page;
    // Find the specific price section by looking for the one with price content
    this.container = page.locator('.bjc-juku-inner-tab-wrap').filter({ 
      has: page.locator('.bjc-juku-price')
    }).first();
    
    // Create a juku-specific tab component that works within this container
    this.tabComponent = new JukuTabComponent(page, this.container);
    
    // Use JukuPriceCard component for juku pages
    this.priceCard = new JukuPriceCard(page);
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

  // Price operations
  async getCurrentTabPriceData(): Promise<JukuPriceData> {
    const activeContent = this.container.locator('.js-tab__content.is-active');
    const priceContainer = activeContent.locator('.bjc-juku-price');
    
    // Get course title from the heading in the active tab
    const courseTitle = await activeContent.locator('.bjc-juku-heading-4').textContent() || '';
    
    // Get price table data
    const priceTable = priceContainer.locator('.bjc-juku-price-table');
    const rows = priceTable.locator('tr');
    const rowCount = await rows.count();
    
    let initialCost = '';
    let monthlyCost = '';
    
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const header = await row.locator('th').textContent() || '';
      const value = await row.locator('td').textContent() || '';
      
      if (header.includes('初期費用')) {
        initialCost = value.trim();
      } else if (header.includes('月額費用')) {
        monthlyCost = value.trim();
      }
    }
    
    // Extract numeric amounts
    const initialCostAmount = this.extractNumericAmount(initialCost);
    const monthlyCostAmount = this.extractNumericAmount(monthlyCost);
    
    // Check if inquiry is required
    const isInquiryRequired = monthlyCost.includes('要問い合わせ') || monthlyCost.includes('お問い合わせ');
    
    return {
      courseTitle: courseTitle.trim(),
      initialCost,
      monthlyCost,
      initialCostAmount,
      monthlyCostAmount,
      isInquiryRequired
    };
  }

  async getAllTabsPriceData(): Promise<Array<{
    tabName: string;
    priceData: JukuPriceData;
  }>> {
    const tabs = await this.getAvailableTabs();
    const allTabsData = [];

    for (const tab of tabs) {
      await this.tabComponent.clickTabByText(tab);
      await this.tabComponent.waitForTabChange(tab);
      
      const priceData = await this.getCurrentTabPriceData();
      
      allTabsData.push({
        tabName: tab,
        priceData
      });
    }

    return allTabsData;
  }

  // Check if this juku has pricing for specific grade levels
  async hasPricingForGrade(gradeLevel: '高校生・高卒生' | '中学生' | '小学生'): Promise<boolean> {
    await this.switchTabByText(gradeLevel);
    const activeContent = this.container.locator('.js-tab__content.is-active');
    const priceContainer = activeContent.locator('.bjc-juku-price');
    return await priceContainer.isVisible();
  }

  async switchTabByText(tabText: string): Promise<void> {
    await this.tabComponent.clickTabByText(tabText);
    await this.tabComponent.waitForTabChange(tabText);
  }

  // Get the course title for the active tab
  async getActiveTabCourseTitle(): Promise<string> {
    const activeContent = this.container.locator('.js-tab__content.is-active');
    const heading = activeContent.locator('.bjc-juku-heading-4');
    return await heading.textContent() || '';
  }

  // Price analysis methods
  async getInitialCostForAllGrades(): Promise<Record<string, string>> {
    const allTabsData = await this.getAllTabsPriceData();
    const initialCosts: Record<string, string> = {};
    
    for (const tabData of allTabsData) {
      initialCosts[tabData.tabName] = tabData.priceData.initialCost;
    }
    
    return initialCosts;
  }

  async getMonthlyCostForAllGrades(): Promise<Record<string, string>> {
    const allTabsData = await this.getAllTabsPriceData();
    const monthlyCosts: Record<string, string> = {};
    
    for (const tabData of allTabsData) {
      monthlyCosts[tabData.tabName] = tabData.priceData.monthlyCost;
    }
    
    return monthlyCosts;
  }

  async areAllGradesInquiryBased(): Promise<boolean> {
    const allTabsData = await this.getAllTabsPriceData();
    return allTabsData.every(tabData => tabData.priceData.isInquiryRequired);
  }

  async hasConsistentInitialCost(): Promise<boolean> {
    const initialCosts = await this.getInitialCostForAllGrades();
    const costs = Object.values(initialCosts);
    return costs.every(cost => cost === costs[0]);
  }

  async getCommonInitialCost(): Promise<string | null> {
    const hasConsistent = await this.hasConsistentInitialCost();
    if (hasConsistent) {
      const allTabsData = await this.getAllTabsPriceData();
      return allTabsData[0]?.priceData.initialCost || null;
    }
    return null;
  }

  // Get summary of all pricing
  async getPricingSummary(): Promise<{
    totalGrades: number;
    commonInitialCost: string | null;
    isAllInquiryBased: boolean;
    pricesByGrade: Record<string, JukuPriceData>;
    hasConsistentPricing: boolean;
  }> {
    const allTabsData = await this.getAllTabsPriceData();
    const pricesByGrade: Record<string, JukuPriceData> = {};
    
    for (const tabData of allTabsData) {
      pricesByGrade[tabData.tabName] = tabData.priceData;
    }
    
    const commonInitialCost = await this.getCommonInitialCost();
    const isAllInquiryBased = await this.areAllGradesInquiryBased();
    const hasConsistentPricing = await this.hasConsistentInitialCost();
    
    return {
      totalGrades: allTabsData.length,
      commonInitialCost,
      isAllInquiryBased,
      pricesByGrade,
      hasConsistentPricing
    };
  }

  private extractNumericAmount(costString: string): number | null {
    // Extract numbers from strings like "11,000円（税込）" or "5,500円"
    const numericMatch = costString.match(/[\d,]+/);
    if (numericMatch) {
      const numericString = numericMatch[0].replace(/,/g, '');
      return parseInt(numericString);
    }
    return null;
  }

  async waitForSectionToLoad(): Promise<void> {
    await this.container.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(500); // Wait for tab content
  }
}