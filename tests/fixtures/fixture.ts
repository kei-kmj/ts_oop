import { test as base, expect as baseExpect } from '@playwright/test';

export type TestOptions = {
  institutionID: string;
  brandId: string;
  // Legacy support
  jukuID?: string;
};

export const test = base.extend<TestOptions>({
  institutionID: ['', { option: true }],
  brandId: ['', { option: true }],
  jukuID: ['', { option: true }],
});

export const expect = baseExpect;
