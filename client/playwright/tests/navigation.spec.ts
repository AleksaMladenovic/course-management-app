import { test, expect, setupAuthTest } from './setup';
import { fillRegisterForm, loginUser, makeTestEmail } from './helpers';

setupAuthTest();

test.describe('Navigation and Route Protection', () => {
    test('unauthenticated user redirected from protected routes', async ({ page }) => {
        // Pokušaj pristup protected rutama bez logina - redirectuje na home (landing page)
        await page.goto('/home/all');
        await expect(page).toHaveURL('/');

        await page.goto('/home/my');
        await expect(page).toHaveURL('/');

        await page.goto('/home/profile');
        await expect(page).toHaveURL('/');

        await page.goto('/add-course');
        await expect(page).toHaveURL('/');
        
        // Proveri da je landing page - treba da vidi Log In i Register dugmad
        await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /register/i })).toBeVisible();
    });

    test('authenticated student can access student routes', async ({ page }) => {
        const email = makeTestEmail('student-nav');
        const password = 'test1234';

        // Registruj studenta
        await page.goto('/register');
        await page.getByRole('button', { name: 'STUDENT' }).click();
        await fillRegisterForm(page, {
            firstName: 'Test',
            lastName: 'Student',
            email,
            phone: '+381621111111',
            dob: '2000-01-15',
            password,
            confirmPassword: password,
        });
        await page.getByRole('button', { name: 'REGISTRUJ SE' }).click();
        await expect(page).toHaveURL('/');

        // Pristup dozvolljenim rutama
        await page.goto('/home/all');
        await expect(page).toHaveURL('/home/all');

        await page.goto('/home/my');
        await expect(page).toHaveURL('/home/my');

        await page.goto('/home/profile');
        await expect(page).toHaveURL('/home/profile');
    });

    test('student cannot access author-only routes', async ({ page }) => {
        const email = makeTestEmail('student-author-route');
        const password = 'test1234';

        // Registruj studenta
        await page.goto('/register');
        await page.getByRole('button', { name: 'STUDENT' }).click();
        await fillRegisterForm(page, {
            firstName: 'Test',
            lastName: 'Student',
            email,
            phone: '+381621111111',
            dob: '2000-01-15',
            password,
            confirmPassword: password,
        });
        await page.getByRole('button', { name: 'REGISTRUJ SE' }).click();
        await expect(page).toHaveURL('/');

        // Pokušaj pristup author ruti
        await page.goto('/add-course');
        
        // Student treba da vidi error poruku
        await expect(page.getByRole('heading', { name: /greška/i })).toBeVisible();
        await expect(page.getByText(/Samo autori mogu da kreiraju kurseve/i)).toBeVisible();
        
        // Treba da postoji "Vrati se nazad" dugme
        const backButton = page.getByRole('button', { name: /vrati se nazad/i });
        await expect(backButton).toBeVisible();
    });

    test('authenticated author can access author routes', async ({ page }) => {
        const email = makeTestEmail('author-nav');
        const password = 'test1234';

        // Registruj autora
        await page.goto('/register');
        await page.getByRole('button', { name: 'AUTOR' }).click();
        await fillRegisterForm(page, {
            firstName: 'Test',
            lastName: 'Author',
            email,
            phone: '+381622222222',
            dob: '1990-05-15',
            password,
            confirmPassword: password,
        });
        await page.getByRole('button', { name: 'REGISTRUJ SE' }).click();
        await expect(page).toHaveURL('/');

        // Author može pristupiti dodavanju kursa
        await page.goto('/add-course');
        await expect(page).toHaveURL('/add-course');
    });

    test('header shows correct links for student', async ({ page }) => {
        const email = makeTestEmail('student-header');
        const password = 'test1234';

        // Registruj studenta
        await page.goto('/register');
        await page.getByRole('button', { name: 'STUDENT' }).click();
        await fillRegisterForm(page, {
            firstName: 'Test',
            lastName: 'Student',
            email,
            phone: '+381621111111',
            dob: '2000-01-15',
            password,
            confirmPassword: password,
        });
        await page.getByRole('button', { name: 'REGISTRUJ SE' }).click();
        await expect(page).toHaveURL('/');

        // Idi na All courses da bi bio u aplikaciji sa headerom
        await page.goto('/home/all');

        // Student treba da vidi Svi kursevi i Moji kursevi
        await expect(page.getByRole('link', { name: /svi kursevi/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /moji kursevi/i })).toBeVisible();
        
        // Treba da vidi logout dugme
        await expect(page.locator('button[title="Odjavi se"]')).toBeVisible();
    });

    test('header shows correct links for author', async ({ page }) => {
        const email = makeTestEmail('author-header');
        const password = 'test1234';

        // Registruj autora
        await page.goto('/register');
        await page.getByRole('button', { name: 'AUTOR' }).click();
        await fillRegisterForm(page, {
            firstName: 'Test',
            lastName: 'Author',
            email,
            phone: '+381622222222',
            dob: '1990-05-15',
            password,
            confirmPassword: password,
        });
        await page.getByRole('button', { name: 'REGISTRUJ SE' }).click();
        await expect(page).toHaveURL('/');

        // Idi na All courses da bi bio u aplikaciji sa headerom
        await page.goto('/home/all');

        // Author treba da vidi Svi kursevi i Moji kursevi
        await expect(page.getByRole('link', { name: /svi kursevi/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /moji kursevi/i })).toBeVisible();
        
        // Treba da vidi logout dugme
        await expect(page.locator('button[title="Odjavi se"]')).toBeVisible();
    });

    test('logout redirects to home page', async ({ page }) => {
        const email = makeTestEmail('student-logout');
        const password = 'test1234';

        // Registruj studenta
        await page.goto('/register');
        await page.getByRole('button', { name: 'STUDENT' }).click();
        await fillRegisterForm(page, {
            firstName: 'Test',
            lastName: 'Student',
            email,
            phone: '+381621111111',
            dob: '2000-01-15',
            password,
            confirmPassword: password,
        });
        await page.getByRole('button', { name: 'REGISTRUJ SE' }).click();
        await expect(page).toHaveURL('/');

        // Idi na All courses da bi bio u aplikaciji
        await page.goto('/home/all');
        
        // Odjavi se
        await page.locator('button[title="Odjavi se"]').click();
        
        // Treba da bude na početnoj stranici
        await expect(page).toHaveURL('/');
        
        // Landing page treba da je vidljiva sa Log In i Register dugmadima
        await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /register/i })).toBeVisible();
    });

    test('profile link navigates to profile page', async ({ page }) => {
        const email = makeTestEmail('student-profile-nav');
        const password = 'test1234';

        // Registruj studenta
        await page.goto('/register');
        await page.getByRole('button', { name: 'STUDENT' }).click();
        await fillRegisterForm(page, {
            firstName: 'Test',
            lastName: 'Student',
            email,
            phone: '+381621111111',
            dob: '2000-01-15',
            password,
            confirmPassword: password,
        });
        await page.getByRole('button', { name: 'REGISTRUJ SE' }).click();
        await expect(page).toHaveURL('/');

        // Idi na All courses da bi bio u aplikaciji
        await page.goto('/home/all');
        
        // Klikni na profil link u headeru - link ide ka /home/profile
        const profileLink = page.getByRole('link', { name: /Student.*Test/i });
        await profileLink.click();
        
        // Treba da bude na profil stranici
        await expect(page).toHaveURL('/home/profile');
    });
});
