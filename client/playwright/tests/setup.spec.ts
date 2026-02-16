
import { execSync } from 'child_process';
import { test as base, expect } from '@playwright/test';

export const test = base;
export { expect };

test.beforeEach(async ({ request }) => {
  execSync('node ./test_scripts/deleteTestUsers.js');
  await request.post('http://localhost:5173/api/Mongo/DeleteTestDatabase');
});
