import {Base} from "./Base";
import {Page} from "@playwright/test";
import {HeadingLevel} from "../consts/global";


export class JukuAchievement extends Base {
  constructor(page: Page) {
    super(page);
  }
  async goto(jukuID: string) {
    await super.goto(`/juku/${jukuID}/result`);
  }

  async getTitleText(): Promise<string> {
    return await this.page.getByRole('heading', { name: /年度(最新)の合格実績/, level: HeadingLevel.H1 }).innerText();
  }

}