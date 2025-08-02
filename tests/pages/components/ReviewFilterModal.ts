import { Page, Locator } from '@playwright/test';

export class ReviewFilterModal {
  readonly page: Page;
  readonly modal: Locator;
  readonly modalHeading: Locator;
  readonly closeButton: Locator;

  // Sort options
  readonly dateSortNewRadio: Locator;
  readonly dateSortOldRadio: Locator;
  readonly evaluationSortHighRadio: Locator;
  readonly evaluationSortLowRadio: Locator;

  // Respondent type checkboxes
  readonly parentCheckbox: Locator;
  readonly studentCheckbox: Locator;

  // Purpose checkboxes
  readonly universityExamCheckbox: Locator;
  readonly highSchoolExamCheckbox: Locator;
  readonly middleSchoolExamCheckbox: Locator;
  readonly elementarySchoolExamCheckbox: Locator;
  readonly testPreparationCheckbox: Locator;
  readonly integratedSchoolCheckbox: Locator;
  readonly childrenEnglishCheckbox: Locator;

  // Rating checkboxes
  readonly rating5Checkbox: Locator;
  readonly rating4Checkbox: Locator;
  readonly rating3Checkbox: Locator;
  readonly rating2Checkbox: Locator;
  readonly rating1Checkbox: Locator;

  // Keyword and buttons
  readonly keywordInput: Locator;
  readonly clearButton: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.locator('#modal-1');
    this.modalHeading = page.getByRole('heading', { name: '絞り込み' });
    this.closeButton = page.getByRole('button', { name: 'close' });

    // Sort options
    this.dateSortNewRadio = page.getByRole('radio', { name: '新しい順' });
    this.dateSortOldRadio = page.getByRole('radio', { name: '古い順' });
    this.evaluationSortHighRadio = page.getByRole('radio', { name: '高い順' });
    this.evaluationSortLowRadio = page.getByRole('radio', { name: '低い順' });

    // Respondent type checkboxes
    this.parentCheckbox = page.getByRole('checkbox', { name: '保護者' });
    this.studentCheckbox = page.getByRole('checkbox', { name: '生徒' });

    // Purpose checkboxes
    this.universityExamCheckbox = page.getByRole('checkbox', { name: '大学受験' });
    this.highSchoolExamCheckbox = page.getByRole('checkbox', { name: '高校受験' });
    this.middleSchoolExamCheckbox = page.getByRole('checkbox', { name: '中学受験' });
    this.elementarySchoolExamCheckbox = page.getByRole('checkbox', { name: '小学校受験' });
    this.testPreparationCheckbox = page.getByRole('checkbox', { name: 'テスト対策' });
    this.integratedSchoolCheckbox = page.getByRole('checkbox', { name: '中高一貫校' });
    this.childrenEnglishCheckbox = page.getByRole('checkbox', { name: '子供英語' });

    // Rating checkboxes
    this.rating5Checkbox = page.getByRole('checkbox', { name: '星5' });
    this.rating4Checkbox = page.getByRole('checkbox', { name: '星4' });
    this.rating3Checkbox = page.getByRole('checkbox', { name: '星3' });
    this.rating2Checkbox = page.getByRole('checkbox', { name: '星2' });
    this.rating1Checkbox = page.getByRole('checkbox', { name: '星1' });

    // Keyword and buttons
    this.keywordInput = page.getByPlaceholder('キーワードを入力');
    this.clearButton = page.getByRole('button', { name: 'クリア' });
    this.submitButton = page.getByRole('button', { name: '検索する' });
  }

  async isOpen(): Promise<boolean> {
    try {
      await this.modal.waitFor({ state: 'visible', timeout: 1000 });
      return await this.modal.evaluate((el) => el.classList.contains('is-open'));
    } catch {
      return false;
    }
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }

  async selectDateSort(order: 'new' | 'old'): Promise<void> {
    if (order === 'new') {
      await this.dateSortNewRadio.check();
    } else {
      await this.dateSortOldRadio.check();
    }
  }

  async selectEvaluationSort(order: 'high' | 'low'): Promise<void> {
    if (order === 'high') {
      await this.evaluationSortHighRadio.check();
    } else {
      await this.evaluationSortLowRadio.check();
    }
  }

  async selectRespondentTypes(types: ('parent' | 'student')[]): Promise<void> {
    if (types.includes('parent')) {
      await this.parentCheckbox.check();
    }
    if (types.includes('student')) {
      await this.studentCheckbox.check();
    }
  }

  async selectPurposes(
    purposes: Array<'university' | 'highSchool' | 'middleSchool' | 'elementary' | 'test' | 'integrated' | 'english'>,
  ): Promise<void> {
    const purposeMap = {
      university: this.universityExamCheckbox,
      highSchool: this.highSchoolExamCheckbox,
      middleSchool: this.middleSchoolExamCheckbox,
      elementary: this.elementarySchoolExamCheckbox,
      test: this.testPreparationCheckbox,
      integrated: this.integratedSchoolCheckbox,
      english: this.childrenEnglishCheckbox,
    };

    for (const purpose of purposes) {
      await purposeMap[purpose].check();
    }
  }

  async selectRatings(ratings: number[]): Promise<void> {
    const ratingMap = {
      5: this.rating5Checkbox,
      4: this.rating4Checkbox,
      3: this.rating3Checkbox,
      2: this.rating2Checkbox,
      1: this.rating1Checkbox,
    };

    for (const rating of ratings) {
      if (ratingMap[rating]) {
        await ratingMap[rating].check();
      }
    }
  }

  async enterKeyword(keyword: string): Promise<void> {
    await this.keywordInput.fill(keyword);
  }

  async clearForm(): Promise<void> {
    await this.clearButton.click();
  }

  async submitFilter(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async applyFilter(filterOptions: {
    dateSort?: 'new' | 'old';
    evaluationSort?: 'high' | 'low';
    respondentTypes?: ('parent' | 'student')[];
    purposes?: Array<'university' | 'highSchool' | 'middleSchool' | 'elementary' | 'test' | 'integrated' | 'english'>;
    ratings?: number[];
    keyword?: string;
  }): Promise<void> {
    if (filterOptions.dateSort) {
      await this.selectDateSort(filterOptions.dateSort);
    }

    if (filterOptions.evaluationSort) {
      await this.selectEvaluationSort(filterOptions.evaluationSort);
    }

    if (filterOptions.respondentTypes) {
      await this.selectRespondentTypes(filterOptions.respondentTypes);
    }

    if (filterOptions.purposes) {
      await this.selectPurposes(filterOptions.purposes);
    }

    if (filterOptions.ratings) {
      await this.selectRatings(filterOptions.ratings);
    }

    if (filterOptions.keyword) {
      await this.enterKeyword(filterOptions.keyword);
    }

    await this.submitFilter();
  }

  async getSelectedFilters(): Promise<{
    dateSort: 'new' | 'old';
    evaluationSort: 'high' | 'low';
    respondentTypes: string[];
    purposes: string[];
    ratings: number[];
    keyword: string;
  }> {
    const dateSort = (await this.dateSortNewRadio.isChecked()) ? 'new' : 'old';
    const evaluationSort = (await this.evaluationSortHighRadio.isChecked()) ? 'high' : 'low';

    const respondentTypes: string[] = [];
    if (await this.parentCheckbox.isChecked()) respondentTypes.push('parent');
    if (await this.studentCheckbox.isChecked()) respondentTypes.push('student');

    const purposes: string[] = [];
    if (await this.universityExamCheckbox.isChecked()) purposes.push('university');
    if (await this.highSchoolExamCheckbox.isChecked()) purposes.push('highSchool');
    if (await this.middleSchoolExamCheckbox.isChecked()) purposes.push('middleSchool');
    if (await this.elementarySchoolExamCheckbox.isChecked()) purposes.push('elementary');
    if (await this.testPreparationCheckbox.isChecked()) purposes.push('test');
    if (await this.integratedSchoolCheckbox.isChecked()) purposes.push('integrated');
    if (await this.childrenEnglishCheckbox.isChecked()) purposes.push('english');

    const ratings: number[] = [];
    for (let i = 5; i >= 1; i--) {
      const checkbox = this[`rating${i}Checkbox`];
      if (await checkbox.isChecked()) ratings.push(i);
    }

    const keyword = await this.keywordInput.inputValue();

    return {
      dateSort,
      evaluationSort,
      respondentTypes,
      purposes,
      ratings,
      keyword,
    };
  }
}
