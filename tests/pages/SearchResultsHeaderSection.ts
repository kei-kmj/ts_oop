import { Page, Locator } from '@playwright/test';

export class SearchResultsHeaderSection {
  readonly page: Page;
  readonly headerContainer: Locator;
  readonly headerTitle: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header container
    this.headerContainer = page.locator('.bjc-search-header');

    // Header title - more direct approach
    this.headerTitle = page.locator('.bjc-search-header-title');
  }

  // Search result article methods
  getSearchResultArticle(institutionName?: string): Locator {
    if (institutionName) {
      return this.page.locator('.bjc-search-result-article').filter({
        has: this.page.getByRole('link', { name: institutionName }),
      });
    }
    return this.page.locator('.bjc-search-result-article').first();
  }

  // Get institution recommendation pickup badge
  async getPickupBadge(institutionName?: string): Promise<Locator> {
    const article = this.getSearchResultArticle(institutionName);
    return article.locator('.bjc-post-experience-pickup');
  }

  async hasPickupBadge(institutionName?: string): Promise<boolean> {
    const badge = await this.getPickupBadge(institutionName);
    return await badge.isVisible();
  }

  // Get institution header title
  async getInstitutionTitle(institutionName?: string): Promise<string> {
    const article = this.getSearchResultArticle(institutionName);
    const titleLink = article.locator('.bjc-search-result-article--header-title');
    const text = (await titleLink.textContent()) || '';
    return text.trim();
  }

  // Keep backward compatibility
  async getJukuTitle(jukuName?: string): Promise<string> {
    return this.getInstitutionTitle(jukuName);
  }

  async clickInstitutionTitle(institutionName?: string): Promise<void> {
    const article = this.getSearchResultArticle(institutionName);
    const titleLink = article.locator('.bjc-search-result-article--header-title');
    await titleLink.click();
  }

  // Keep backward compatibility
  async clickJukuTitle(jukuName?: string): Promise<void> {
    return this.clickInstitutionTitle(jukuName);
  }

  // Get evaluation data
  async getEvaluationData(institutionName?: string): Promise<{
    rating: number;
    reviewCount: number;
    stars: number;
  }> {
    const article = this.getSearchResultArticle(institutionName);
    const evaluation = article.locator('.bjc-juku-header-evaluation');

    const ratingText = (await evaluation.locator('.bjc-juku-header-evaluation-average_number').textContent()) || '0';
    const reviewCountText = (await evaluation.locator('.bjc-juku-header-evaluation-number a').textContent()) || '(0)';

    const rating = parseFloat(ratingText);
    const reviewCount = parseInt(reviewCountText.match(/\((\d+)\)$/)?.[1] || '0');

    // Count filled stars
    const starElements = evaluation.locator('.bjc-evaluation-star:not(.inert)');
    const stars = await starElements.count();

    return {
      rating,
      reviewCount,
      stars,
    };
  }

  // Get institution tags information
  async getInstitutionTags(institutionName?: string): Promise<{
    targetGrades: string[];
    teachingMethods: string[];
    purposes: string[];
  }> {
    const article = this.getSearchResultArticle(institutionName);
    const tagSection = article.locator('.bjc-juku-header-tag');

    const targetGrades = await this.getTagsByHeading(tagSection, '対象学年');
    const teachingMethods = await this.getTagsByHeading(tagSection, '授業形式');
    const purposes = await this.getTagsByHeading(tagSection, '目的');

    return {
      targetGrades,
      teachingMethods,
      purposes,
    };
  }

  private async getTagsByHeading(tagSection: Locator, heading: string): Promise<string[]> {
    const row = tagSection.locator('.bjc-juku-header-tag-row').filter({
      has: this.page.locator('.bjc-juku-header-tag-heading', { hasText: heading }),
    });

    const items = row.locator('.bjc-juku-header-tag-list li');
    const count = await items.count();
    const tags = [];

    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      if (text) tags.push(text.trim());
    }

    return tags;
  }

  // Get tagline
  async getTagline(jukuName?: string): Promise<string> {
    const article = this.getSearchResultArticle(jukuName);
    const tagline = article.locator('.bjc-search-result-article--header-tagline');
    return (await tagline.textContent()) || '';
  }

  // Get recommendation points
  async getRecommendationPoints(jukuName?: string): Promise<string[]> {
    const article = this.getSearchResultArticle(jukuName);
    const pointsList = article.locator('.bjc-juku-point-list li');
    const count = await pointsList.count();
    const points = [];

    for (let i = 0; i < count; i++) {
      const text = await pointsList.nth(i).textContent();
      if (text) points.push(text.trim());
    }

    return points;
  }

  // Get post links data
  async getPostLinksData(jukuName?: string): Promise<{
    interviewCount: number;
    experienceCount: number;
    reviewCount: number;
  }> {
    const article = this.getSearchResultArticle(jukuName);
    const linksSection = article.locator('.bjc-search-result-article--links');

    const interviewLink = linksSection.locator('.bjc-search-result-article--link-icon.interview a');
    const experienceLink = linksSection.locator('.bjc-search-result-article--link-icon.experience a');
    const reviewLink = linksSection.locator('.bjc-search-result-article--link-icon.kuchikomi a');

    const interviewText = (await interviewLink.textContent()) || '';
    const experienceText = (await experienceLink.textContent()) || '';
    const reviewText = (await reviewLink.textContent()) || '';

    const interviewCount = parseInt(interviewText.match(/\((\d+)\)$/)?.[1] || '0');
    const experienceCount = parseInt(experienceText.match(/\((\d+)\)$/)?.[1] || '0');
    const reviewCount = parseInt(reviewText.match(/\((\d+)\)$/)?.[1] || '0');

    return {
      interviewCount,
      experienceCount,
      reviewCount,
    };
  }

  // Click post links
  async clickInterviewLink(jukuName?: string): Promise<void> {
    const article = this.getSearchResultArticle(jukuName);
    await article.locator('.bjc-search-result-article--link-icon.interview a').click();
  }

  async clickExperienceLink(jukuName?: string): Promise<void> {
    const article = this.getSearchResultArticle(jukuName);
    await article.locator('.bjc-search-result-article--link-icon.experience a').click();
  }

  async clickReviewLink(jukuName?: string): Promise<void> {
    const article = this.getSearchResultArticle(jukuName);
    await article.locator('.bjc-search-result-article--link-icon.kuchikomi a').click();
  }

  // Get school list data
  async getSchoolListData(
    jukuName?: string,
    city?: string,
  ): Promise<
    Array<{
      name: string;
      href: string;
      nearestStation: string;
      classroomId: string;
    }>
  > {
    // First try to get data from search result articles (institution-based approach)
    if (jukuName) {
      const article = this.getSearchResultArticle(jukuName);
      const schoolSection = article.locator('.bjc-search-result-article--school_list');

      // Check if city matches expected city in heading
      if (city) {
        const heading = schoolSection.locator('.bjc-search-result-article--school_list-heading');
        const headingText = (await heading.textContent()) || '';
        if (!headingText.includes(city)) {
          return [];
        }
      }

      const schoolCards = schoolSection.locator('.bjc-search-result-article--school_list-card');
      const count = await schoolCards.count();
      const schools = [];

      for (let i = 0; i < count; i++) {
        const card = schoolCards.nth(i);
        const nameLink = card.locator('.bjc-search-result-article--school_list-card-header-heading a');
        const name = (await nameLink.textContent()) || '';
        const href = (await nameLink.getAttribute('href')) || '';
        const station =
          (await card.locator('.bjc-search-result-article--school_list-address:not(.is-heading)').textContent()) || '';

        // Extract classroom ID from href
        const classroomIdMatch = href.match(/\/class\/(\d+)\//);
        const classroomId = classroomIdMatch ? classroomIdMatch[1] : '';

        schools.push({
          name: name.trim(),
          href,
          nearestStation: station.trim(),
          classroomId,
        });
      }

      if (schools.length > 0) {
        return schools;
      }
    }

    // Fallback approach: get data from search results paragraphs
    // Based on the snapshot, school data is in paragraph elements with specific structure
    const schools = [];

    try {
      // Look for links that contain "/juku/" and "/class/" patterns in main content
      const mainContent = this.page.locator('main');
      const classroomLinks = mainContent.locator('a[href*="/juku/"][href*="/class/"]');
      const count = await classroomLinks.count();

      // Limit to prevent infinite loops
      const maxResults = Math.min(count, 50);

      for (let i = 0; i < maxResults; i++) {
        try {
          const link = classroomLinks.nth(i);
          const href = (await link.getAttribute('href')) || '';
          const name = (await link.textContent()) || '';

          // Extract classroom ID from href (pattern: /juku/16/class/92148/)
          const classroomIdMatch = href.match(/\/class\/(\d+)\//);
          if (classroomIdMatch && name.trim()) {
            const classroomId = classroomIdMatch[1];

            schools.push({
              name: name.trim(),
              href,
              nearestStation: '', // We'll fill this in later if needed
              classroomId,
            });
          }
        } catch (e) {
          // Skip this link if there's an error
          continue;
        }
      }
    } catch (e) {
      // If the fallback fails completely, return empty array
      console.warn('Failed to get school list data:', e);
    }

    return schools;
  }

  // Get specific school data
  async getSchoolData(
    schoolName: string,
    jukuName?: string,
  ): Promise<{
    name: string;
    href: string;
    nearestStation: string;
    classroomId: string;
  } | null> {
    const schools = await this.getSchoolListData(jukuName);
    return schools.find((school) => school.name.includes(schoolName)) || null;
  }

  // Click school actions
  async clickSchoolDetails(schoolName: string, jukuName?: string): Promise<void> {
    // First try the original approach with specific juku
    if (jukuName) {
      const article = this.getSearchResultArticle(jukuName);
      const schoolCard = article.locator('.bjc-search-result-article--school_list-card').filter({
        has: this.page.getByRole('link', { name: schoolName }),
      });

      const detailsButton = schoolCard.locator('.bjc-button.free-primary a');
      if ((await detailsButton.count()) > 0) {
        await detailsButton.click();
        return;
      }
    }

    // Fallback: look for "詳細を見る" link near the school name in the main content
    const schoolLink = this.page.locator('main').getByRole('link', { name: schoolName });
    if ((await schoolLink.count()) > 0) {
      // Find the details link near this school (look for "詳細を見る" text)
      const parentSection = schoolLink.locator('xpath=ancestor::*[self::paragraph or self::section or self::div][1]');
      const detailsLink = parentSection
        .getByRole('link', { name: '詳細を見る' })
        .or(parentSection.locator('a[href*="/class/"][href$="/"]'));

      if ((await detailsLink.count()) > 0) {
        await detailsLink.first().click();
        return;
      }
    }

    // Final fallback: click the school link itself (should navigate to details)
    await schoolLink.first().click();
  }

  async clickSchoolPricing(schoolName: string, jukuName?: string): Promise<void> {
    // First try the original approach with specific juku
    if (jukuName) {
      const article = this.getSearchResultArticle(jukuName);
      const schoolCard = article.locator('.bjc-search-result-article--school_list-card').filter({
        has: this.page.getByRole('link', { name: schoolName }),
      });

      const pricingButton = schoolCard.locator('.bjc-button.free-secondary a');
      if ((await pricingButton.count()) > 0) {
        await pricingButton.click();
        return;
      }
    }

    // Fallback: look for "料金を知りたい" link near the school name
    const schoolLink = this.page.locator('main').getByRole('link', { name: schoolName });
    if ((await schoolLink.count()) > 0) {
      // Find the pricing link near this school (look for "料金を知りたい" text)
      const parentSection = schoolLink.locator('xpath=ancestor::*[self::paragraph or self::section or self::div][1]');
      const pricingLink = parentSection
        .getByRole('link', { name: '料金を知りたい' })
        .or(parentSection.locator('a[href*="/class/"][href*="/request/"]'));

      if ((await pricingLink.count()) > 0) {
        await pricingLink.first().click();
        return;
      }
    }

    throw new Error(`Could not find pricing link for school: ${schoolName}`);
  }

  async clickSchoolMap(schoolName: string, jukuName?: string): Promise<void> {
    const article = this.getSearchResultArticle(jukuName);
    const schoolCard = article.locator('.bjc-search-result-article--school_list-card').filter({
      has: this.page.getByRole('link', { name: schoolName }),
    });

    await schoolCard.locator('.bjc-juku-map-link').click();
  }

  // Click "show all classrooms" link
  async clickShowAllClassrooms(jukuName?: string): Promise<void> {
    const article = this.getSearchResultArticle(jukuName);
    await article.locator('.bjc-search-result-article--school_list-more a').click();
  }

  // Get the full header title text
  async getHeaderTitleText(): Promise<string> {
    const text = (await this.headerTitle.textContent()) || '';
    return text.trim();
  }

  // Extract city name from the title
  async getCityName(): Promise<string> {
    const titleText = await this.getHeaderTitleText();
    // Extract city name from pattern like "札幌市の高1向けの学習塾・予備校一覧"
    const cityMatch = titleText.match(/^([^の]+)の/);
    return cityMatch ? cityMatch[1].trim() : '';
  }

  // Extract grade information from the title
  async getGradeInfo(): Promise<string> {
    const titleText = await this.getHeaderTitleText();
    // Extract grade from pattern like "札幌市の高1向けの学習塾・予備校一覧"
    const gradeMatch = titleText.match(/の([^向]+)向けの/);
    return gradeMatch ? gradeMatch[1].trim() : '';
  }

  // Extract institution type from the title
  async getInstitutionType(): Promise<string> {
    const titleText = await this.getHeaderTitleText();
    // Extract type from pattern like "札幌市の高1向けの学習塾・予備校一覧"
    const typeMatch = titleText.match(/向けの([^一覧]+)一覧/);
    return typeMatch ? typeMatch[1].trim() : '';
  }

  // Parse the complete title information
  async parseTitleInfo(): Promise<{
    city: string;
    grade: string;
    institutionType: string;
    fullTitle: string;
  }> {
    const fullTitle = await this.getHeaderTitleText();
    const city = await this.getCityName();
    const grade = await this.getGradeInfo();
    const institutionType = await this.getInstitutionType();

    return {
      city,
      grade,
      institutionType,
      fullTitle,
    };
  }

  // Check if the title matches expected pattern
  async validateTitlePattern(): Promise<boolean> {
    const titleText = await this.getHeaderTitleText();
    // Pattern: [City]の[Grade]向けの[Type]一覧
    const pattern = /^.+の.+向けの.+一覧$/;
    return pattern.test(titleText);
  }

  // Verify if the title contains specific city
  async containsCity(expectedCity: string): Promise<boolean> {
    const city = await this.getCityName();
    return city === expectedCity;
  }

  // Verify if the title contains specific grade
  async containsGrade(expectedGrade: string): Promise<boolean> {
    const grade = await this.getGradeInfo();
    return grade === expectedGrade;
  }

  // Verify if the title contains specific institution type
  async containsInstitutionType(expectedType: string): Promise<boolean> {
    const institutionType = await this.getInstitutionType();
    return institutionType === expectedType;
  }

  // Check if header is visible
  async isHeaderVisible(): Promise<boolean> {
    return await this.headerContainer.isVisible();
  }

  // Check if title is visible
  async isTitleVisible(): Promise<boolean> {
    return await this.headerTitle.isVisible();
  }

  // Wait for header to load
  async waitForHeaderToLoad(): Promise<void> {
    await this.headerContainer.waitFor({ state: 'visible' });
    await this.headerTitle.waitFor({ state: 'visible' });
  }

  // Get different variations of title patterns
  async getExpectedTitleForParams(city: string, grade: string, type: string = '学習塾・予備校'): Promise<string> {
    return `${city}の${grade}向けの${type}一覧`;
  }

  // Verify title matches expected parameters
  async verifyTitleMatches(
    expectedCity: string,
    expectedGrade: string,
    expectedType: string = '学習塾・予備校',
  ): Promise<boolean> {
    const expectedTitle = await this.getExpectedTitleForParams(expectedCity, expectedGrade, expectedType);
    const actualTitle = await this.getHeaderTitleText();
    return actualTitle === expectedTitle;
  }

  // Extract all grade patterns (handles various grade formats)
  async extractGradePattern(): Promise<{
    isAll: boolean; // true if "すべて" or similar
    gradeLevel: string; // e.g., "高校", "中学", "小学"
    specificGrade?: string; // e.g., "1", "2", "3"
    originalText: string; // original grade text
  }> {
    const gradeText = await this.getGradeInfo();

    // Check for explicit "すべて" or "全て" keywords
    let isAll = gradeText.includes('すべて') || gradeText.includes('全て');

    let gradeLevel = '';
    let specificGrade = '';

    if (gradeText.includes('高')) {
      gradeLevel = '高校';
      const match = gradeText.match(/高(\d)/);
      if (match) {
        specificGrade = match[1];
      } else if (gradeText === '高校生') {
        // "高校生" without a specific number indicates all high school grades
        isAll = true;
      }
    } else if (gradeText.includes('中')) {
      gradeLevel = '中学';
      const match = gradeText.match(/中(\d)/);
      if (match) {
        specificGrade = match[1];
      } else if (gradeText === '中学生') {
        // "中学生" without a specific number indicates all middle school grades
        isAll = true;
      }
    } else if (gradeText.includes('小')) {
      gradeLevel = '小学';
      const match = gradeText.match(/小(\d)/);
      if (match) {
        specificGrade = match[1];
      } else if (gradeText === '小学生') {
        // "小学生" without a specific number indicates all elementary school grades
        isAll = true;
      }
    } else if (gradeText.includes('幼児')) {
      gradeLevel = '幼児';
    } else if (gradeText.includes('高卒')) {
      gradeLevel = '高卒';
    }

    return {
      isAll,
      gradeLevel,
      specificGrade,
      originalText: gradeText,
    };
  }
}
