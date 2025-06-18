import { Page, Locator } from '@playwright/test';

export class Header {
  readonly page: Page;
  readonly logoLink: Locator;
  readonly campaignButton: Locator;
  readonly favoritesLink: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Logo/Home link - using alt text of the logo image, first occurrence in header
    this.logoLink = page.locator('.bjl-header').getByRole('link').filter({ has: page.getByRole('img', { name: '塾選（ジュクセン）' }) });
    
    // Campaign button - using alt text of the campaign image
    this.campaignButton = page.getByRole('button').filter({ has: page.getByRole('img', { name: '7/31までなら入塾で、最大10,000万円プレゼント' }) });
    
    // Favorites link - using href attribute
    this.favoritesLink = page.locator('.bjl-header a[href="/favorites/"]');
  }

  async clickLogo(): Promise<void> {
    await this.logoLink.click();
  }

  async clickCampaignButton(): Promise<void> {
    await this.campaignButton.click();
  }

  async clickFavorites(): Promise<void> {
    await this.favoritesLink.click();
  }

  async getFavoritesCount(): Promise<number> {
    const text = await this.favoritesLink.textContent();
    const match = text?.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  async isLogoVisible(): Promise<boolean> {
    return await this.logoLink.isVisible();
  }

  async isCampaignButtonVisible(): Promise<boolean> {
    return await this.campaignButton.isVisible();
  }

  async isFavoritesLinkVisible(): Promise<boolean> {
    return await this.favoritesLink.isVisible();
  }

  async waitForHeaderToLoad(): Promise<void> {
    await this.logoLink.waitFor({ state: 'visible' });
    await this.favoritesLink.waitFor({ state: 'visible' });
  }
}