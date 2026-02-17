import { test, expect } from '@playwright/test';
import { fillRegisterForm, makeTestEmail } from './helpers';
import { setupAuthTest } from './setup';
import DificultyType, { DificultyTypeToString } from '../../src/enums/DificultyType';

setupAuthTest({ mode: 'all' });

test.describe.serial('Add Course - author flow', () => {
    const password = 'test1234';
    let authorEmail = '';

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        authorEmail = makeTestEmail(`author-add-course`);

        await page.goto('/register');
        await page.getByRole('button', { name: 'AUTOR' }).click();

        await fillRegisterForm(page, {
            firstName: 'Test',
            lastName: 'Author',
            email: authorEmail,
            phone: '+381622222222',
            dob: '1995-10-20',
            password,
            confirmPassword: password,
        });

        await page.getByRole('button', { name: 'REGISTRUJ SE' }).click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL('/');

        await context.close();
    });
    test.beforeEach(async ({ page }) => {
        // Logujemo se pre svakog testa
        await page.goto('/login');
        await page.fill('input[name="email"]', authorEmail);
        await page.fill('input[name="password"]', password
        );
        await page.getByRole('button', { name: 'PRIJAVI SE' }).click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL('/');
    });

    test('AddCourseCard navigates to AddCoursePage', async ({ page }) => {
        // TODO: ako je ruta drugačija, prilagodi ovde
        await page.goto('/home/my');

        await page.getByText('Kreiraj Novi Kurs').click();
        await expect(page).toHaveURL(/\/add-course/);
    });

    test('shows empty state before any courses exist', async ({ page }) => {
        await page.goto('/home/my');
        await expect(page.getByText('Još niste kreirali nijedan kurs')).toBeVisible();
    });

    test('shows validation errors on empty/invalid submit', async ({ page }) => {
        await page.goto('/add-course');

        await page.fill('input[name="courseName"]', '');
        await page.fill('input[name="durationInWeeks"]', '0');
        await page.fill('textarea[name="description"]', '');

        await page.getByRole('button', { name: /kreiraj kurs/i }).click();

        await expect(page.getByText('Naziv kursa je obavezan.')).toBeVisible();
        await expect(page.getByText('Opis kursa je obavezan.')).toBeVisible();
        await expect(page.getByText('Trajanje kursa mora biti između 1 i 52 nedelje.')).toBeVisible();
    });

    test('shows validation errors for length limits', async ({ page }) => {
        await page.goto('/add-course');

        await page.fill('input[name="courseName"]', 'aa');
        await page.fill('input[name="durationInWeeks"]', '100');
        await page.fill('textarea[name="description"]', 'kratak opis');

        await page.getByRole('button', { name: /kreiraj kurs/i }).click();

        await expect(page.getByText('Naziv kursa mora biti između 3 i 50 karaktera.')).toBeVisible();
        await expect(page.getByText('Opis kursa mora biti između 20 i 2000 karaktera.')).toBeVisible();
        await expect(page.getByText('Trajanje kursa mora biti između 1 i 52 nedelje.')).toBeVisible();
    });

    test('creates course and redirects to course details page', async ({ page }) => {
        await page.goto('/add-course');

        const courseName = `Playwright kurs ${Date.now()}`;
        const duration = 6;
        const description = 'Ovo je opis kursa koji je dovoljno dugacak za validaciju.';

        await page.fill('input[name="courseName"]', courseName);
        await page.fill('input[name="durationInWeeks"]', duration.toString());
        await page.fill('textarea[name="description"]', description);
        const nameOfButton = `difficulty-` + DificultyTypeToString[DificultyType.Medium] + `-button`;
        await page.locator(`button[name="${nameOfButton}"]`).click();

        await page.getByRole('button', { name: /kreiraj kurs/i }).click();
        
        await expect(page).toHaveURL(/\/course\/\d+/);

        await expect(page.locator('.course-name')).toContainText(courseName);
        await expect(page.locator('.course-duration-value')).toContainText(duration.toString());

        await page.goto('/home/my');
        await expect(page.getByText(courseName)).toBeVisible();
    });
});