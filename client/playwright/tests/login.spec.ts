import { fillLoginForm, fillRegisterForm, makeTestEmail } from './helpers';
import { test, expect, setupAuthTest } from './setup';

setupAuthTest();

test('login student successfully', async ({ page }) => {
    const email = makeTestEmail('student-login');
    const password = 'test1234';

    // Registracija
    await page.goto('/register');
    await page.getByRole('button', { name: 'STUDENT' }).click();
    await fillRegisterForm(page, {
        firstName: 'Test',
        lastName: 'Student',
        email,
        phone: '+381621111111',
        dob: '2003-05-11',
        password,
        confirmPassword: password,
    });
    await page.getByRole('button', { name: 'REGISTRUJ SE' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'Explore Courses' })).toBeVisible();

    await page.getByRole('button', { name: 'Explore Courses' }).click();
    // Odjava
    await page.getByRole('button', { name: 'Odjavi se' }).click();
    await expect(page).toHaveURL('/');

    // Login
    await page.goto('/login');
    await fillLoginForm(page, { email, password });
    await page.getByRole('button', { name: 'Prijavi se' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'Explore Courses' })).toBeVisible();
});

test('login author successfully', async ({ page }) => {
    const email = makeTestEmail('author-login');
    const password = 'test1234';

    // Registracija
    await page.goto('/register');
    await page.getByRole('button', { name: 'AUTOR' }).click();
    await fillRegisterForm(page, {
        firstName: 'Test',
        lastName: 'Author',
        email,
        phone: '+381622222222',
        dob: '1995-10-20',
        password,
        confirmPassword: password,
    });
    await page.getByRole('button', { name: 'AUTOR' }).click();
    await page.getByRole('button', { name: 'REGISTRUJ SE' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'Explore Courses' })).toBeVisible();

    await page.getByRole('button', { name: 'Explore Courses' }).click();
    // Odjava
    await page.getByRole('button', { name: 'Odjavi se' }).click();
    await expect(page).toHaveURL('/');

    // Login
    await page.goto('/login');
    await fillLoginForm(page, { email, password });
    await page.getByRole('button', { name: 'Prijavi se' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'Explore Courses' })).toBeVisible();
});


test('shows error for wrong password', async ({ page }) => {
    const email = makeTestEmail('student-wrong');
    const password = 'test1234';

    // Registracija
    await page.goto('/register');
    await page.getByRole('button', { name: 'STUDENT' }).click();
    await fillRegisterForm(page, {
        firstName: 'Test',
        lastName: 'Student',
        email,
        phone: '+381621111111',
        dob: '2003-05-11',
        password,
        confirmPassword: password,
    });
    await page.getByRole('button', { name: 'REGISTRUJ SE' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'Explore Courses' })).toBeVisible();
    await page.getByRole('button', { name: 'Explore Courses' }).click();
    // Odjava
    await page.getByRole('button', { name: 'Odjavi se' }).click();
    await expect(page).toHaveURL('/');

    // Login sa pogrešnom lozinkom
    await page.goto('/login');
    await fillLoginForm(page, { email, password: 'wrongpass' });
    await page.getByRole('button', { name: 'Prijavi se' }).click();
    const form = page.locator('form');
    await expect(form).toContainText('Pogrešan email ili lozinka.');
});

test('shows error for non-existent user', async ({ page }) => {
    await page.goto('/login');
    const email = makeTestEmail('nonexistent');
    await fillLoginForm(page, { email, password: 'test1234' });
    await page.getByRole('button', { name: 'Prijavi se' }).click();
    const form = page.locator('form');
    await expect(form).toContainText('Pogrešan email ili lozinka.');
});

test('shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Prijavi se' }).click();
    const form = page.locator('form');
    await expect(form).toContainText('Email je obavezan.');
    await expect(form).toContainText('Lozinka je obavezna.');
});

test('can navigate to register page from login', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Registruj se' }).click();
    await expect(page).toHaveURL('/register');
});