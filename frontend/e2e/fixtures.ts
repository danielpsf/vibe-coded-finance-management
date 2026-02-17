import { test as base } from '@playwright/test';

export const test = base.extend({
  // Add any custom fixtures here
});

export { expect } from '@playwright/test';