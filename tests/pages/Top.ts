import { Base } from './Base';
import { Page } from '@playwright/test';
import { HeadingLevel } from '../consts/global';
import { Header } from './Header';
import { ReasonSection } from './ReasonSection';
import { JukuInquirySection } from './JukuInquirySection';
import { MainFooter } from './MainFooter';
import { AreaSearchSection } from './AreaSearchSection';
import { SearchFormSection } from './SearchFormSection';
import { RecentlyViewedSection } from './RecentlyViewedSection';
import { RecentSearchConditionsSection } from './RecentSearchConditionsSection';

export class Top extends Base {
  readonly header: Header;
  readonly areaSearchSection: AreaSearchSection;
  readonly searchFormSection: SearchFormSection;
  readonly recentlyViewedSection: RecentlyViewedSection;
  readonly recentSearchConditionsSection: RecentSearchConditionsSection;
  readonly reasonSection: ReasonSection;
  readonly jukuInquirySection: JukuInquirySection;
  readonly mainFooter: MainFooter;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.areaSearchSection = new AreaSearchSection(page);
    this.searchFormSection = new SearchFormSection(page);
    this.recentlyViewedSection = new RecentlyViewedSection(page);
    this.recentSearchConditionsSection = new RecentSearchConditionsSection(page);
    this.reasonSection = new ReasonSection(page);
    this.jukuInquirySection = new JukuInquirySection(page);
    this.mainFooter = new MainFooter(page);
  }
  async goto() {
    await super.goto('/');
  }

  async getSearchTitleText(): Promise<string> {
    return await this.page.getByRole('heading', { name: /全国の塾・予備校を探す/, level: HeadingLevel.H2 }).innerText();
  }

  async getSearchByNameTitleText(): Promise<string> {
    return await this.page.getByRole('heading', { name: /塾名・志望校名から探す/, level: HeadingLevel.H2 }).innerText();
  }
}
