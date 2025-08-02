import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const ENV = {
  BASE_URL: process.env.BASE_URL || 'https://example.com',
  TEST_TIMEOUT: parseInt(process.env.TEST_TIMEOUT || '30000', 10),
} as const;

export const getBaseUrl = (): string => {
  return ENV.BASE_URL;
};

export const getFullUrl = (path: string): string => {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};
