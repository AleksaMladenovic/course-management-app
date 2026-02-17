import { test, expect } from './setup';
import { fillRegisterForm, loginUser, makeTestEmail } from './helpers';
import DificultyType, { DificultyTypeToString } from '../../src/enums/DificultyType';
import { execSync } from 'child_process';

test.describe.serial('Author Course CRUD Operations', () => {
    const password = 'test1234';
    let authorEmail = '';
    let courseId = '';
    let courseName = '';

    test.beforeAll(async ({ browser, request }) => {
        execSync('node ./test_scripts/deleteTestUsers.js');
        const result = (await request.put('http://localhost:5196/api/Seed/DeleteTestDatabase')).status();
        console.log('Delete test database response status:', result);

        const authorContext = await browser.newContext();
        const authorPage = await authorContext.newPage();
        authorPage.on('dialog', async dialog => dialog.accept());

        authorEmail = makeTestEmail('author-crud-test');

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

        await authorPage.goto('/add-course');

        courseName = `Test Course ${Date.now()}`;

        await authorPage.fill('input[name="courseName"]', courseName);
        await authorPage.fill('input[name="durationInWeeks"]', '8');
        await authorPage.fill('textarea[name="description"]', 'This is a comprehensive course description for testing purposes.');
        const difficultyButtonName = `difficulty-${DificultyTypeToString[DificultyType.Hard]}-button`;
        await authorPage.locator(`button[name="${difficultyButtonName}"]`).click();

        await authorPage.getByRole('button', { name: /kreiraj kurs/i }).click();

        await expect(authorPage).toHaveURL(/\/course\/\d+/);

        const match = authorPage.url().match(/\/course\/([^/?#]+)/);
        if (!match) {
            throw new Error('Failed to parse course id from URL.');
        }
        courseId = match[1];

        await authorContext.close();
    });

    test.beforeEach(async ({ page }) => {
        page.on('dialog', async dialog => dialog.accept());
        await loginUser(page, authorEmail, password);
    });

    test.describe('Lesson Management', () => {
        test.describe('Add Lesson', () => {
            test('successfully adds a new lesson', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                await page.locator('.add-lesson-button').click();

                const lessonName = 'Introduction to Testing';
                const lessonDuration = 60;
                const lessonDescription = 'This is a detailed description of the lesson that covers all necessary content.';

                const lessonForm = page.getByText('Nova Lekcija').locator('..');
                await lessonForm.locator('input').first().fill(lessonName);
                await lessonForm.locator('input[type="number"]').fill(String(lessonDuration));
                await lessonForm.locator('textarea').fill(lessonDescription);

                const [lessonResponse] = await Promise.all([
                    page.waitForResponse(res => res.url().includes('/Lessons/addLesson/') && res.status() === 200),
                    page.locator('.save-lesson-button').click(),
                ]);

                expect(lessonResponse.ok()).toBeTruthy();
                await page.waitForSelector('.lesson-div .lesson-name');
                await expect(page.locator('.lesson-div .lesson-name')).toContainText(lessonName);
                await expect(page.locator('.lesson-div .lesson-duration')).toContainText(`${lessonDuration}`);
            });

            test('validates lesson name - too short', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                await page.locator('.add-lesson-button').click();

                const lessonForm = page.getByText('Nova Lekcija').locator('..');
                await lessonForm.locator('input').first().fill('Ab');
                await lessonForm.locator('input[type="number"]').fill('30');
                await lessonForm.locator('textarea').fill('This is a valid lesson description with enough characters.');

                await page.locator('.save-lesson-button').click();

                await expect(page.getByText('Naziv lekcije mora biti između 3 i 50 karaktera.')).toBeVisible();
            });

            test('validates lesson name - too long', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                await page.locator('.add-lesson-button').click();

                const lessonForm = page.getByText('Nova Lekcija').locator('..');
                await lessonForm.locator('input').first().fill('A'.repeat(51));
                await lessonForm.locator('input[type="number"]').fill('30');
                await lessonForm.locator('textarea').fill('This is a valid lesson description with enough characters.');

                await page.locator('.save-lesson-button').click();

                await expect(page.getByText('Naziv lekcije mora biti između 3 i 50 karaktera.')).toBeVisible();
            });

            test('validates lesson name - empty', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                await page.locator('.add-lesson-button').click();

                const lessonForm = page.getByText('Nova Lekcija').locator('..');
                await lessonForm.locator('input[type="number"]').fill('30');
                await lessonForm.locator('textarea').fill('This is a valid lesson description with enough characters.');

                await page.locator('.save-lesson-button').click();

                await expect(page.getByText('Naziv lekcije je obavezan.')).toBeVisible();
            });

            test('validates lesson description - too short', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                await page.locator('.add-lesson-button').click();

                const lessonForm = page.getByText('Nova Lekcija').locator('..');
                await lessonForm.locator('input').first().fill('Valid Lesson Name');
                await lessonForm.locator('input[type="number"]').fill('30');
                await lessonForm.locator('textarea').fill('Too short');

                await page.locator('.save-lesson-button').click();

                await expect(page.getByText('Opis lekcije mora biti između 20 i 2000 karaktera.')).toBeVisible();
            });

            test('validates lesson description - too long', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                await page.locator('.add-lesson-button').click();

                const lessonForm = page.getByText('Nova Lekcija').locator('..');
                await lessonForm.locator('input').first().fill('Valid Lesson Name');
                await lessonForm.locator('input[type="number"]').fill('30');
                await lessonForm.locator('textarea').fill('A'.repeat(2001));

                await page.locator('.save-lesson-button').click();

                await expect(page.getByText('Opis lekcije mora biti između 20 i 2000 karaktera.')).toBeVisible();
            });

            test('validates lesson description - empty', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                await page.locator('.add-lesson-button').click();

                const lessonForm = page.getByText('Nova Lekcija').locator('..');
                await lessonForm.locator('input').first().fill('Valid Lesson Name');
                await lessonForm.locator('input[type="number"]').fill('30');

                await page.locator('.save-lesson-button').click();

                await expect(page.getByText('Opis lekcije je obavezan.')).toBeVisible();
            });

            test('validates lesson duration - too short', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                await page.locator('.add-lesson-button').click();

                const lessonForm = page.getByText('Nova Lekcija').locator('..');
                await lessonForm.locator('input').first().fill('Valid Lesson Name');
                await lessonForm.locator('input[type="number"]').fill('0');
                await lessonForm.locator('textarea').fill('This is a valid lesson description with enough characters.');

                await page.locator('.save-lesson-button').click();

                await expect(page.getByText('Trajanje lekcije mora biti između 1 i 600 minuta.')).toBeVisible();
            });

            test('validates lesson duration - too long', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                await page.locator('.add-lesson-button').click();

                const lessonForm = page.getByText('Nova Lekcija').locator('..');
                await lessonForm.locator('input').first().fill('Valid Lesson Name');
                await lessonForm.locator('input[type="number"]').fill('601');
                await lessonForm.locator('textarea').fill('This is a valid lesson description with enough characters.');

                await page.locator('.save-lesson-button').click();

                await expect(page.getByText('Trajanje lekcije mora biti između 1 i 600 minuta.')).toBeVisible();
            });

            test('can cancel lesson form', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                await page.locator('.add-lesson-button').click();

                const lessonForm = page.getByText('Nova Lekcija').locator('..');
                await lessonForm.locator('input').first().fill('Some Lesson');
                await lessonForm.locator('input[type="number"]').fill('45');
                await lessonForm.locator('textarea').fill('Some description that is long enough for validation.');

                await page.locator('.cancel-lesson-button').click();

                await expect(page.getByText('Nova Lekcija')).not.toBeVisible();
                await expect(page.locator('.add-lesson-button')).toBeVisible();
            });
        });

        test.describe('Edit Lesson', () => {
            test('successfully edits a lesson', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                const firstLesson = page.locator('.lesson-div').first();
                await firstLesson.locator('.edit-lesson-button').click({ force: true });

                const newLessonName = 'Updated Lesson Name';
                const newLessonDuration = 90;
                const newLessonDescription = 'This is the updated lesson description with sufficient detail.';

                const lessonForm = page.getByText('Izmena Lekcije').locator('..');
                await lessonForm.locator('input').first().fill(newLessonName);
                await lessonForm.locator('input[type="number"]').fill(String(newLessonDuration));
                await lessonForm.locator('textarea').fill(newLessonDescription);

                const [updateResponse] = await Promise.all([
                    page.waitForResponse(res => res.url().includes('/Lessons/updateLesson/') && res.status() === 200),
                    page.locator('.save-lesson-button').click(),
                ]);

                expect(updateResponse.ok()).toBeTruthy();
                await page.waitForSelector('.lesson-div .lesson-name');
                await expect(page.locator('.lesson-div .lesson-name').first()).toContainText(newLessonName);
                await expect(page.locator('.lesson-div .lesson-duration').first()).toContainText(`${newLessonDuration}`);
            });

            test('validates edited lesson name - too short', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                const firstLesson = page.locator('.lesson-div').first();
                await firstLesson.locator('.edit-lesson-button').click({ force: true });

                const lessonForm = page.getByText('Izmena Lekcije').locator('..');
                await lessonForm.locator('input').first().fill('Ab');

                await page.locator('.save-lesson-button').click();

                await expect(page.getByText('Naziv lekcije mora biti između 3 i 50 karaktera.')).toBeVisible();
            });

            test('validates edited lesson description - too short', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                const firstLesson = page.locator('.lesson-div').first();
                await firstLesson.locator('.edit-lesson-button').click({ force: true });

                const lessonForm = page.getByText('Izmena Lekcije').locator('..');
                await lessonForm.locator('textarea').fill('Too short');

                await page.locator('.save-lesson-button').click();

                await expect(page.getByText('Opis lekcije mora biti između 20 i 2000 karaktera.')).toBeVisible();
            });

            test('validates edited lesson duration - out of range', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                const firstLesson = page.locator('.lesson-div').first();
                await firstLesson.locator('.edit-lesson-button').click({ force: true });

                const lessonForm = page.getByText('Izmena Lekcije').locator('..');
                await lessonForm.locator('input[type="number"]').fill('700');

                await page.locator('.save-lesson-button').click();

                await expect(page.getByText('Trajanje lekcije mora biti između 1 i 600 minuta.')).toBeVisible();
            });

            test('can cancel lesson edit', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                const originalLessonName = await page.locator('.lesson-div .lesson-name').first().textContent();

                const firstLesson = page.locator('.lesson-div').first();
                await firstLesson.locator('.edit-lesson-button').click({ force: true });

                const lessonForm = page.getByText('Izmena Lekcije').locator('..');
                await lessonForm.locator('input').first().fill('Changed Name');

                await page.locator('.cancel-lesson-button').click();

                await expect(page.getByText('Izmena Lekcije')).not.toBeVisible();
                await expect(page.locator('.lesson-div .lesson-name').first()).toContainText(originalLessonName || '');
            });
        });

        test.describe('Delete Lesson', () => {
            test('successfully deletes a lesson', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                const lessonCount = await page.locator('.lesson-div').count();
                const lastLesson = page.locator('.lesson-div').last();
                const lessonNameToDelete = await lastLesson.locator('.lesson-name').textContent();

                await lastLesson.locator('.delete-lesson-button').click({ force: true });

                await page.waitForResponse(res => res.url().includes('/Lessons/deleteLesson/') && res.status() === 200);

                const newLessonCount = await page.locator('.lesson-div').count();
                expect(newLessonCount).toBe(lessonCount - 1);
                await expect(page.locator('.lesson-div .lesson-name', { hasText: lessonNameToDelete || '' })).toHaveCount(0);
            });

            test('shows empty state when all lessons are deleted', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                // Delete all remaining lessons
                let lessonCount = await page.locator('.lesson-div').count();
                while (lessonCount > 0) {
                    const firstLesson = page.locator('.lesson-div').first();
                    await firstLesson.locator('.delete-lesson-button').click({ force: true });
                    await page.waitForResponse(res => res.url().includes('/Lessons/deleteLesson/') && res.status() === 200);
                    lessonCount = await page.locator('.lesson-div').count();
                }

                await expect(page.locator('.no-content-label')).toBeVisible();
                await expect(page.locator('.no-content-label')).toContainText('Nema sadržaja');
            });
        });
    });

    test.describe('Course Management', () => {
        test.describe('Edit Course', () => {
            test('successfully edits course details', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                await page.locator('.update-button').click();

                const newCourseName = `Updated Course ${Date.now()}`;
                const newCourseDescription = 'This is the updated comprehensive course description for testing.';
                const newDuration = 12;

                // Use proper input/textarea elements
                const nameInput = page.locator('input').filter({ hasText: '' }).first();
                await nameInput.fill(newCourseName);
                
                const descriptionTextarea = page.locator('textarea').filter({ hasText: '' }).first();
                await descriptionTextarea.fill(newCourseDescription);

                // Update duration using specific class selector
                await page.locator('.course-duration-input').fill(String(newDuration));

                // Update difficulty using select dropdown
                await page.locator('.select-difficulty').selectOption(String(DificultyType.Easy));

                const [updateResponse] = await Promise.all([
                    page.waitForResponse(res => res.url().includes('/Course/updateCourse/') && res.status() === 200),
                    page.locator('.handle-update').click(),
                ]);

                expect(updateResponse.ok()).toBeTruthy();
                await expect(page.locator('.course-name')).toContainText(newCourseName);

                courseName = newCourseName;
            });

            test('validates course name - too short', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                await page.locator('.update-button').click();

                const nameInput = page.locator('input').filter({ hasText: '' }).first();
                await nameInput.fill('Ab');

                await page.locator('.handle-update').click();

                await expect(page.getByText('Naziv kursa mora biti između 3 i 50 karaktera.')).toBeVisible();
            });

            test('validates course name - too long', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                await page.locator('.update-button').click();

                const nameInput = page.locator('input').filter({ hasText: '' }).first();
                await nameInput.fill('A'.repeat(51));

                await page.locator('.handle-update').click();

                await expect(page.getByText('Naziv kursa mora biti između 3 i 50 karaktera.')).toBeVisible();
            });

            test('validates course name - empty', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                await page.locator('.update-button').click();

                const nameInput = page.locator('input').filter({ hasText: '' }).first();
                await nameInput.fill('');

                await page.locator('.handle-update').click();

                await expect(page.getByText('Naziv kursa je obavezan.')).toBeVisible();
            });

            test('validates course description - too short', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                await page.locator('.update-button').click();

                const descriptionTextarea = page.locator('textarea').filter({ hasText: '' }).first();
                await descriptionTextarea.fill('Too short');

                await page.locator('.handle-update').click();

                await expect(page.getByText('Opis kursa mora biti između 20 i 2000 karaktera.')).toBeVisible();
            });

            test('validates course description - too long', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                await page.locator('.update-button').click();

                const descriptionTextarea = page.locator('textarea').filter({ hasText: '' }).first();
                await descriptionTextarea.fill('A'.repeat(2001));

                await page.locator('.handle-update').click();

                await expect(page.getByText('Opis kursa mora biti između 20 i 2000 karaktera.')).toBeVisible();
            });

            test('validates course description - empty', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                await page.locator('.update-button').click();

                const descriptionTextarea = page.locator('textarea').filter({ hasText: '' }).first();
                await descriptionTextarea.fill('');

                await page.locator('.handle-update').click();

                await expect(page.getByText('Opis kursa je obavezan.')).toBeVisible();
            });

            test('validates course duration - too short', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                await page.locator('.update-button').click();

                await page.locator('.course-duration-input').fill('0');

                await page.locator('.handle-update').click();

                await expect(page.getByText('Trajanje kursa mora biti između 1 i 52 nedelje.')).toBeVisible();
            });

            test('validates course duration - too long', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                await page.locator('.update-button').click();

                await page.locator('.course-duration-input').fill('53');

                await page.locator('.handle-update').click();

                await expect(page.getByText('Trajanje kursa mora biti između 1 i 52 nedelje.')).toBeVisible();
            });

            test('can cancel course edit', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                const originalCourseName = await page.locator('.course-name').textContent();

                await page.locator('.update-button').click();

                const nameInput = page.locator('input').filter({ hasText: '' }).first();
                await nameInput.fill('Changed Course Name');

                await page.locator('.cancel-update').click();

                await expect(page.locator('.course-name')).toContainText(originalCourseName || '');
                await expect(page.locator('.update-button')).toBeVisible();
            });

            test('course changes reflect in MyCoursesAuthor', async ({ page }) => {
                await page.goto('/home/my');
                await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

                const courseCard = page.locator('.course-card', { hasText: courseName }).first();
                await expect(courseCard).toBeVisible();
            });
        });

        test.describe('Delete Course', () => {
            test('successfully deletes a course', async ({ page }) => {
                await page.goto(`/course/${courseId}`);
                await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

                const [deleteResponse] = await Promise.all([
                    page.waitForResponse(res => res.url().includes('/Course/deleteCourse/') && res.status() === 200),
                    page.locator('.delete-button').click(),
                ]);

                expect(deleteResponse.ok()).toBeTruthy();
                await expect(page).toHaveURL('/courses');
            });

            test('deleted course does not appear in MyCoursesAuthor', async ({ page }) => {
                await page.goto('/home/my');
                await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

                const courseCard = page.locator('.course-card', { hasText: courseName });
                await expect(courseCard).toHaveCount(0);
            });
        });
    });
});
