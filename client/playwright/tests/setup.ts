import { execSync } from 'child_process';
import { test as base, expect } from '@playwright/test';

export const test = base;
export { expect };

// Setup za login/register testove - brise korisnike i bazu pre svakog testa
export const setupAuthTest = (options?: { mode?: 'each' | 'all' }) => {
  const mode = options?.mode ?? 'each';

  const hook = mode === 'all' ? test.beforeAll : test.beforeEach;

  hook(async ({ request }) => {
    execSync('node ./test_scripts/deleteTestUsers.js');
    await request.put('http://localhost:5196/api/Seed/DeleteTestDatabase');
  });
};

