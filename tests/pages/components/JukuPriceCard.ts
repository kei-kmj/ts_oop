import { Page, Locator } from '@playwright/test';

export interface JukuPriceData {
  courseTitle: string;
  initialCost: string;
  monthlyCost: string;
  initialCostAmount: number | null;
  monthlyCostAmount: number | null;
  isInquiryRequired: boolean;
}

export class JukuPriceCard {
  readonly page: Page;
  readonly container: Locator;

  constructor(page: Page, containerSelector: string = '.bjc-juku-price') {
    this.page = page;
    this.container = page.locator(containerSelector);
  }

  async getPriceData(): Promise<JukuPriceData> {
    // Get course title from the heading above the price table
    const courseTitle = await this.page.locator('.bjc-juku-heading-4').textContent() || '';
    
    // Get price table data
    const priceTable = this.container.locator('.bjc-juku-price-table');
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
    
    // Extract numeric amounts from cost strings
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

  async getAllPriceData(containerSelector?: string): Promise<JukuPriceData[]> {
    const priceContainers = containerSelector 
      ? this.page.locator(containerSelector)
      : this.page.locator('.bjc-juku-price');
    
    const count = await priceContainers.count();
    const priceDataArray: JukuPriceData[] = [];

    for (let i = 0; i < count; i++) {
      const container = priceContainers.nth(i);
      
      // Get course title from the heading above this price container
      const contentSection = container.locator('..'); // Parent element
      const courseTitle = await contentSection.locator('.bjc-juku-heading-4').textContent() || '';
      
      // Get price table data
      const priceTable = container.locator('.bjc-juku-price-table');
      const rows = priceTable.locator('tr');
      const rowCount = await rows.count();
      
      let initialCost = '';
      let monthlyCost = '';
      
      for (let j = 0; j < rowCount; j++) {
        const row = rows.nth(j);
        const header = await row.locator('th').textContent() || '';
        const value = await row.locator('td').textContent() || '';
        
        if (header.includes('初期費用')) {
          initialCost = value.trim();
        } else if (header.includes('月額費用')) {
          monthlyCost = value.trim();
        }
      }
      
      // Extract numeric amounts from cost strings
      const initialCostAmount = this.extractNumericAmount(initialCost);
      const monthlyCostAmount = this.extractNumericAmount(monthlyCost);
      
      // Check if inquiry is required
      const isInquiryRequired = monthlyCost.includes('要問い合わせ') || monthlyCost.includes('お問い合わせ');
      
      priceDataArray.push({
        courseTitle: courseTitle.trim(),
        initialCost,
        monthlyCost,
        initialCostAmount,
        monthlyCostAmount,
        isInquiryRequired
      });
    }

    return priceDataArray;
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

  async getInitialCost(): Promise<string> {
    const priceTable = this.container.locator('.bjc-juku-price-table');
    const initialCostRow = priceTable.locator('tr').filter({ 
      has: this.page.locator('th', { hasText: '初期費用' })
    });
    return await initialCostRow.locator('td').textContent() || '';
  }

  async getMonthlyCost(): Promise<string> {
    const priceTable = this.container.locator('.bjc-juku-price-table');
    const monthlyCostRow = priceTable.locator('tr').filter({ 
      has: this.page.locator('th', { hasText: '月額費用' })
    });
    return await monthlyCostRow.locator('td').textContent() || '';
  }

  async isInquiryRequired(): Promise<boolean> {
    const monthlyCost = await this.getMonthlyCost();
    return monthlyCost.includes('要問い合わせ') || monthlyCost.includes('お問い合わせ');
  }

  async hasFixedPricing(): Promise<boolean> {
    const monthlyCost = await this.getMonthlyCost();
    return !this.isInquiryRequired() && monthlyCost.includes('円');
  }

  async getPriceTableRows(): Promise<Array<{header: string, value: string}>> {
    const priceTable = this.container.locator('.bjc-juku-price-table');
    const rows = priceTable.locator('tr');
    const rowCount = await rows.count();
    const tableData = [];
    
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const header = await row.locator('th').textContent() || '';
      const value = await row.locator('td').textContent() || '';
      
      tableData.push({
        header: header.trim(),
        value: value.trim()
      });
    }
    
    return tableData;
  }

  async isPriceVisible(): Promise<boolean> {
    return await this.container.isVisible();
  }

  async waitForPriceToLoad(timeout: number = 5000): Promise<void> {
    await this.container.waitFor({ state: 'visible', timeout });
  }
}