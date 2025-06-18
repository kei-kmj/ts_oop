import { test as base } from '@playwright/test';

export type TestOptions = {
  institutionID: string;
  // Legacy support
  jukuID?: string;
}

export const test = base.extend<TestOptions>({
  institutionID: ['', {option: true}],
  jukuID: ['', {option: true}]
})