import { fillRegisterForm, makeTestEmail } from './helpers';
import { test, expect, setupAuthTest } from './setup';

setupAuthTest();

test('registers student successfully', async ({ page }) => {
    await page.goto('/register');

    await page.getByRole('button', { name: 'STUDENT' }).click();

    await fillRegisterForm(page, {
        firstName: 'Test',
        lastName: 'Student',
        email: makeTestEmail('student'),
        phone: '+381621111111',
        dob: '2003-05-11',
        password: 'test1234',
        confirmPassword: 'test1234',
    });

    await page.getByRole('button', { name: 'REGISTRUJ SE' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'Explore Courses' })).toBeVisible();
});

test('registers author successfully', async ({ page }) => {
    await page.goto('/register');

    await page.getByRole('button', { name: 'AUTOR' }).click();

    await fillRegisterForm(page, {
        firstName: 'Test',
        lastName: 'Author',
        email: makeTestEmail('author'),
        phone: '+381622222222',
        dob: '1995-10-20',
        password: 'test1234',
        confirmPassword: 'test1234',
    });

    await page.getByRole('button', { name: 'REGISTRUJ SE' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'Explore Courses' })).toBeVisible();
});

test('shows required field errors on empty submit', async ({ page }) => {
    await page.goto('/register');

    await page.getByRole('button', { name: 'REGISTRUJ SE' }).click();

    const form = page.locator('form');
    await expect(form).toContainText('Ime je obavezno.');
    await expect(form).toContainText('Prezime je obavezno.');
    await expect(form).toContainText('Email je obavezan.');
    await expect(form).toContainText('Telefon je obavezan.');
    await expect(form).toContainText('Datum rođenja je obavezan.');
    await expect(form).toContainText('Lozinka je obavezna.');
});

test('shows format and password mismatch errors', async ({ page }) => {
    await page.goto('/register');
    await fillRegisterForm(page, {
        firstName: 'Test',
        lastName: 'User',
        email: 'not-an-email',
        phone: '123',
        dob: '2000-01-01',
        password: 'test1234',
        confirmPassword: 'different',
    });

    await page.getByRole('button', { name: 'REGISTRUJ SE' }).click();

    const form = page.locator('form');
    await expect(form).toContainText('Neispravan format email adrese.');
    await expect(form).toContainText('Neispravan format telefona.');
    await expect(form).toContainText('Lozinke se ne podudaraju.');
});

test('shows date validation errors for future date and underage', async ({ page }) => {
    await page.goto('/register');

    // Buduci datum
    await fillRegisterForm(page, {
        firstName: 'Test',
        lastName: 'User',
        email: makeTestEmail('date'),
        phone: '+381621234567',
        dob: '2999-01-01',
        password: 'test1234',
        confirmPassword: 'test1234',
    });

    await page.getByRole('button', { name: 'REGISTRUJ SE' }).click();
    const form = page.locator('form');
    await expect(form).toContainText('Datum rođenja ne može biti u budućnosti.');

    // Maloletan korisnik (< 12)
    const today = new Date();
    const underageYear = today.getFullYear() - 10;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    await page.fill('input[name="dob"]', `${underageYear}-${month}-${day}`);
    await page.getByRole('button', { name: 'REGISTRUJ SE' }).click();
    await expect(form).toContainText('Morate imati najmanje 12 godina.');
});

test('shows error for email that is already registered', async ({ page }) => {
    await page.goto('/register');
    const testEmail = makeTestEmail('duplicate');
    await fillRegisterForm(page, {
        firstName: 'Test',
        lastName: 'User',
        email: testEmail,
        phone: '+381621234567',
        dob: '2000-01-01',
        password: 'test1234',
        confirmPassword: 'test1234',
    });

    await page.getByRole('button', { name: 'REGISTRUJ SE' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'Explore Courses' })).toBeVisible();
    await page.getByRole('button', { name: 'Explore Courses' }).click();
    await expect(page.getByRole('button', { name: 'Odjavi se' })).toBeVisible();
    await page.getByRole('button', { name: 'Odjavi se' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'REGISTER' })).toBeVisible();
    await page.getByRole('button', { name: 'REGISTER' }).click();
    await fillRegisterForm(page, {
        firstName: 'Test',
        lastName: 'User',
        email: testEmail,
        phone: '+381621234567',
        dob: '2000-01-01',
        password: 'test1234',
        confirmPassword: 'test1234',
    });
    await page.getByRole('button', { name: 'REGISTRUJ SE' }).click();
    const form = page.locator('form');
    await expect(form).toContainText('Email adresa je već u upotrebi.');
});

test('can navigate to login page from register', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('link', { name: 'Prijavi se' }).click();
    await expect(page).toHaveURL('/login');
});