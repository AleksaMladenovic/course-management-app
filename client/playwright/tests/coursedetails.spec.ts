import { test, expect, setupAuthTest } from './setup';
import { fillRegisterForm, loginUser, makeTestEmail } from './helpers';
import DificultyType, { DificultyTypeToString } from '../../src/enums/DificultyType';
import { execSync } from 'child_process';


test.describe.serial('Course Details - author and student flows', () => {
    const password = 'test1234';
    let authorEmail = '';
    let studentEmail = '';
    let courseId = '';
    let courseName = '';
    const lessonName = 'Uvod u Playwright';
    const lessonDescription = 'Ovo je opis lekcije koji ima dovoljno karaktera.';
    const lessonDuration = 45;

    test.beforeAll(async ({ browser, request }) => {
        execSync('node ./test_scripts/deleteTestUsers.js');
        const result =( await request.put('http://localhost:5196/api/Seed/DeleteTestDatabase')).status();
        console.log('Delete test database response status:', result);

        const authorContext = await browser.newContext();
        const authorPage = await authorContext.newPage();
        authorPage.on('dialog', async dialog => dialog.accept());

        authorEmail = makeTestEmail('author-course-details');

        await authorPage.goto('/register');
        await authorPage.getByRole('button', { name: 'AUTOR' }).click();
        await fillRegisterForm(authorPage, {
            firstName: 'Test',
            lastName: 'Author',
            email: authorEmail,
            phone: '+381622222222',
            dob: '1995-10-20',
            password,
            confirmPassword: password,
        });
        await authorPage.getByRole('button', { name: 'REGISTRUJ SE' }).click();
        await expect(authorPage).toHaveURL('/');
        await authorContext.close();

        const studentContext = await browser.newContext();
        const studentPage = await studentContext.newPage();
        studentPage.on('dialog', async dialog => dialog.accept());

        studentEmail = makeTestEmail('student-course-details');

        await studentPage.goto('/register');
        await studentPage.getByRole('button', { name: 'STUDENT' }).click();
        await fillRegisterForm(studentPage, {
            firstName: 'Test',
            lastName: 'Student',
            email: studentEmail,
            phone: '+381633333333',
            dob: '2000-01-15',
            password,
            confirmPassword: password,
        });
        await studentPage.getByRole('button', { name: 'REGISTRUJ SE' }).click();
        await expect(studentPage).toHaveURL('/');
        await studentContext.close();

        const authorContextForCourse = await browser.newContext();
        const authorCoursePage = await authorContextForCourse.newPage();
        authorCoursePage.on('dialog', async dialog => dialog.accept());

        await loginUser(authorCoursePage, authorEmail, password);
        await authorCoursePage.goto('/add-course');

        courseName = `Playwright Course ${Date.now()}`;

        await authorCoursePage.fill('input[name="courseName"]', courseName);
        await authorCoursePage.fill('input[name="durationInWeeks"]', '6');
        await authorCoursePage.fill('textarea[name="description"]', 'Opis kursa sa dovoljno karaktera za validaciju.');
        const nameOfButton = `difficulty-${DificultyTypeToString[DificultyType.Medium]}-button`;
        await authorCoursePage.locator(`button[name="${nameOfButton}"]`).click();

        authorCoursePage.getByRole('button', { name: /kreiraj kurs/i }).click();

        await expect(authorCoursePage).toHaveURL(/\/course\/\d+/);

        const match = authorCoursePage.url().match(/\/course\/([^/?#]+)/);
        if (!match) {
            throw new Error('Failed to parse course id from URL.');
        }
        courseId = match[1];

        await authorCoursePage.locator('.add-lesson-button').click();
        const lessonForm = authorCoursePage.getByText('Nova Lekcija').locator('..');
        await lessonForm.locator('input').first().fill(lessonName);
        await lessonForm.locator('input[type="number"]').fill(String(lessonDuration));
        await lessonForm.locator('textarea').fill(lessonDescription);

        const [lessonResponse] = await Promise.all([
            authorCoursePage.waitForResponse(res => res.url().includes('/Lessons/addLesson/') && res.status() === 200),
            authorCoursePage.locator('.save-lesson-button').click(),
        ]);
        expect(lessonResponse.ok()).toBeTruthy();
        await authorCoursePage.waitForSelector('.lesson-div .lesson-name');

        await authorContextForCourse.close();
    });

    test.describe('author view', () => {
        test.beforeEach(async ({ page }) => {
            page.on('dialog', async dialog => dialog.accept());
            await loginUser(page, authorEmail, password);
        });

        test('opens course details from MyCoursesAuthor', async ({ page }) => {
            await page.goto('/home/my');
            await page.locator('.course-card', { hasText: courseName }).first().click();
            await expect(page).toHaveURL(new RegExp(`/course/${courseId}`));
            await expect(page.locator('.course-name')).toContainText(courseName);
        });

        test('displays lessons list for owner', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);
            await expect(page.locator('.lesson-div .lesson-name')).toContainText(lessonName);
            await expect(page.locator('.lesson-div .lesson-duration')).toContainText(`${lessonDuration}`);
        });

        test('shows owner controls on course details', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);
            await expect(page.locator('.update-button')).toBeVisible();
            await expect(page.locator('.delete-button')).toBeVisible();
        });
    });

    test.describe('student view', () => {
        test.beforeEach(async ({ page }) => {
            page.on('dialog', async dialog => dialog.accept());
            await loginUser(page, studentEmail, password);
        });

        test('opens course details from AllCourses', async ({ page }) => {
            await page.goto('/home/all');
            await page.locator('.course-card', { hasText: courseName }).first().click();
            await expect(page).toHaveURL(new RegExp(`/course/${courseId}`));
            await expect(page.locator('.course-name')).toContainText(courseName);
        });

        test('student can enroll and unenroll', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            await page.locator('.enroll-button').click();
            await expect(page.locator('.unenroll-button')).toBeVisible();

            await page.locator('.unenroll-button').click();
            await expect(page.locator('.enroll-button')).toBeVisible();
        });

        test('lessons become visible after enroll', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            await page.locator('.enroll-button').click();
            await expect(page.locator('.lesson-div .lesson-name')).toContainText(lessonName);
        });

        test('handles non-existent course id', async ({ page }) => {
            const missingId = '999999999';
            await page.goto(`/course/${missingId}`);
            const errors = await page.getByText("Greška");
            expect(errors).toHaveCount(2);
            (await errors.all()).forEach(error => {
                expect(error).toBeVisible();
            });
            await expect(
                page.getByText('Greška pri učitavanju kursa. Kurs možda ne postoji ili je došlo do problema na serveru.')
            ).toBeVisible();
            await expect(page.getByRole('button', { name: /vrati se nazad/i })).toBeVisible();
        });

        test('enrolled student does not see enroll button after page reload', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            // Prvo proveri trenutno stanje - ako nije enrolled, upiši se
            const enrollButton = page.locator('.enroll-button');
            const unenrollButton = page.locator('.unenroll-button');
            
            const isEnrolled = await unenrollButton.isVisible().catch(() => false);
            
            if (!isEnrolled) {
                // Ako nije upisan, upiši se
                await expect(enrollButton).toBeVisible();
                await enrollButton.click();
                await expect(unenrollButton).toBeVisible();
            }
            
            // Sada reload stranice
            await page.reload();
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);
            
            // Proveri da enroll dugme nije vidljivo
            await expect(enrollButton).not.toBeVisible();
            
            // Ali unenroll dugme treba da je vidljivo
            await expect(unenrollButton).toBeVisible();
        });

        test('student can view lessons after enrollment', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            // Proveri da je enrolled (ili se upiši ako nije)
            const enrollButton = page.locator('.enroll-button');
            const unenrollButton = page.locator('.unenroll-button');
            
            const isEnrolled = await unenrollButton.isVisible().catch(() => false);
            
            if (!isEnrolled && await enrollButton.isVisible()) {
                await enrollButton.click();
                await expect(unenrollButton).toBeVisible();
            }
            
            // Nakon upisa (ili ako je već upisan), lekcije treba da budu vidljive
            await expect(page.locator('.lesson-div .lesson-name')).toContainText(lessonName);
            await expect(page.locator('.lesson-div .lesson-duration')).toContainText(`${lessonDuration}`);
        });
    });
});

