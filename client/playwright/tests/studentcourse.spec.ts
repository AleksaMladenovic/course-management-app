import { test, expect } from './setup';
import { fillRegisterForm, loginUser, makeTestEmail } from './helpers';
import DificultyType, { DificultyTypeToString } from '../../src/enums/DificultyType';
import { execSync } from 'child_process';

test.describe.serial('Student Course Interactions', () => {
    const password = 'test1234';
    let authorEmail = '';
    let studentEmail = '';
    let courseId = '';
    let courseName = '';
    const lessonName = 'JavaScript Basics';
    const lessonDescription = 'Learn the fundamentals of JavaScript programming language.';
    const lessonDuration = 120;

    test.beforeAll(async ({ browser, request }) => {
        execSync('node ./test_scripts/deleteTestUsers.js');
        const result = (await request.put('http://localhost:5196/api/Seed/DeleteTestDatabase')).status();
        console.log('Delete test database response status:', result);

        // Create author and course with lessons
        const authorContext = await browser.newContext();
        const authorPage = await authorContext.newPage();
        authorPage.on('dialog', async dialog => dialog.accept());

        authorEmail = makeTestEmail('author-student-test');

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

        courseName = `Student Test Course ${Date.now()}`;

        await authorPage.fill('input[name="courseName"]', courseName);
        await authorPage.fill('input[name="durationInWeeks"]', '10');
        await authorPage.fill('textarea[name="description"]', 'This is a comprehensive course for student testing purposes.');
        const difficultyButtonName = `difficulty-${DificultyTypeToString[DificultyType.Medium]}-button`;
        await authorPage.locator(`button[name="${difficultyButtonName}"]`).click();

        await authorPage.getByRole('button', { name: /kreiraj kurs/i }).click();
        await expect(authorPage).toHaveURL(/\/course\/\d+/);

        const match = authorPage.url().match(/\/course\/([^/?#]+)/);
        if (!match) {
            throw new Error('Failed to parse course id from URL.');
        }
        courseId = match[1];

        // Add lessons to the course
        await authorPage.locator('.add-lesson-button').click();
        const lessonForm = authorPage.getByText('Nova Lekcija').locator('..');
        await lessonForm.locator('input').first().fill(lessonName);
        await lessonForm.locator('input[type="number"]').fill(String(lessonDuration));
        await lessonForm.locator('textarea').fill(lessonDescription);

        await Promise.all([
            authorPage.waitForResponse(res => res.url().includes('/Lessons/addLesson/') && res.status() === 200),
            authorPage.locator('.save-lesson-button').click(),
        ]);

        // Add second lesson
        await authorPage.locator('.add-lesson-button').click();
        const lessonForm2 = authorPage.getByText('Nova Lekcija').locator('..');
        await lessonForm2.locator('input').first().fill('Advanced JavaScript');
        await lessonForm2.locator('input[type="number"]').fill('90');
        await lessonForm2.locator('textarea').fill('Deep dive into advanced JavaScript concepts and patterns.');

        await Promise.all([
            authorPage.waitForResponse(res => res.url().includes('/Lessons/addLesson/') && res.status() === 200),
            authorPage.locator('.save-lesson-button').click(),
        ]);

        await authorContext.close();

        // Create student
        const studentContext = await browser.newContext();
        const studentPage = await studentContext.newPage();
        studentPage.on('dialog', async dialog => dialog.accept());

        studentEmail = makeTestEmail('student-test');

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
    });

    test.beforeEach(async ({ page }) => {
        page.on('dialog', async dialog => dialog.accept());
        await loginUser(page, studentEmail, password);
    });

    test.describe('Access Restrictions', () => {
        test('student cannot see owner controls', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            await expect(page.locator('.update-button')).not.toBeVisible();
            await expect(page.locator('.delete-button')).not.toBeVisible();
        });

        test('student cannot see add lesson button', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            await expect(page.locator('.add-lesson-button')).not.toBeVisible();
        });

        test('student cannot see edit/delete lesson buttons', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            // First enroll to see lessons
            await page.locator('.enroll-button').click();
            
            await expect(page.locator('.edit-lesson-button')).not.toBeVisible();
            await expect(page.locator('.delete-lesson-button')).not.toBeVisible();
        });
    });

    test.describe('Lesson Visibility', () => {
        test('lessons are locked before enrollment', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            // Ensure student is not enrolled
            const unenrollButton = page.locator('.unenroll-button');
            if (await unenrollButton.isVisible()) {
                await unenrollButton.click();
            }

            // Check for locked state message
            await expect(page.getByText('Sadržaj je privatan')).toBeVisible();
            await expect(page.getByText(/Upisom na kurs otključaćete lekcije/i)).toBeVisible();

            // Lessons should not be visible
            await expect(page.locator('.lesson-div')).toHaveCount(0);
        });

        test('lessons become visible after enrollment', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            // Ensure student is not enrolled first
            const unenrollButton = page.locator('.unenroll-button');
            if (await unenrollButton.isVisible()) {
                await unenrollButton.click();
            }

            await page.locator('.enroll-button').click();

            // Lessons should now be visible
            await expect(page.locator('.lesson-div')).toHaveCount(2);
            await expect(page.locator('.lesson-div .lesson-name').first()).toContainText(lessonName);
            await expect(page.locator('.lesson-div .lesson-duration').first()).toContainText(`${lessonDuration}`);
        });

        test('lessons are hidden after unenrollment', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            // First enroll if not already enrolled
            const enrollButton = page.locator('.enroll-button');
            if (await enrollButton.isVisible()) {
                await enrollButton.click();
                await page.waitForResponse(res => res.url().includes('/Student/EnrollStudentToCourse/') && res.status() === 200);
            }

            // Verify lessons are visible
            await expect(page.locator('.lesson-div')).toHaveCount(2);

            // Now unenroll
            await page.locator('.unenroll-button').click();

            // Reload page to reflect changes
            await page.reload();
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            // Lessons should be hidden again
            await expect(page.locator('.lesson-div')).toHaveCount(0);
            await expect(page.getByText('Sadržaj je privatan')).toBeVisible();
        });
    });

    test.describe('Enrollment Management', () => {
        test('student can successfully enroll in a course', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            // Ensure student is not enrolled first
            const unenrollButton = page.locator('.unenroll-button');
            if (await unenrollButton.isVisible()) {
                await unenrollButton.click();
            }

            await expect(page.locator('.enroll-button')).toBeVisible();
            await expect(page.locator('.enroll-button')).toContainText(/upis na kurs/i);

            const [enrollResponse] = await Promise.all([
                page.waitForResponse(res => res.url().includes('/Student/EnrollStudentToCourse/') && res.status() === 200),
                page.locator('.enroll-button').click(),
            ]);

            expect(enrollResponse.ok()).toBeTruthy();
            await expect(page.locator('.unenroll-button')).toBeVisible();
            await expect(page.locator('.enroll-button')).not.toBeVisible();
        });

        test('enrolled course appears in MyCoursesStudent', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            // Enroll if not already enrolled
            const enrollButton = page.locator('.enroll-button');
            if (await enrollButton.isVisible()) {
                await enrollButton.click();
                await page.waitForResponse(res => res.url().includes('/Student/EnrollStudentToCourse/') && res.status() === 200);
            }

            // Navigate to MyCoursesStudent
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            // Course should be visible
            const courseCard = page.locator('.course-card', { hasText: courseName });
            await expect(courseCard).toBeVisible();
        });

        test('student can successfully unenroll from a course', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            // Ensure student is enrolled first
            const enrollButton = page.locator('.enroll-button');
            if (await enrollButton.isVisible()) {
                await enrollButton.click();
                await page.waitForResponse(res => res.url().includes('/Student/EnrollStudentToCourse/') && res.status() === 200);
            }

            await expect(page.locator('.unenroll-button')).toBeVisible();
            await expect(page.locator('.unenroll-button')).toContainText(/ispiši se sa kursa/i);

            const [unenrollResponse] = await Promise.all([
                page.waitForResponse(res => res.url().includes('/Student/UnEnrollStudentFromCourse/') && res.status() === 200),
                page.locator('.unenroll-button').click(),
            ]);

            expect(unenrollResponse.ok()).toBeTruthy();
            await expect(page.locator('.enroll-button')).toBeVisible();
            await expect(page.locator('.unenroll-button')).not.toBeVisible();
        });

        test('unenrolled course disappears from MyCoursesStudent', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            // Ensure student is enrolled first
            const enrollButton = page.locator('.enroll-button');
            if (await enrollButton.isVisible()) {
                await enrollButton.click();
            }

            // Unenroll
            await page.locator('.unenroll-button').click();

            // Navigate to MyCoursesStudent
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            // Course should not be visible
            const courseCard = page.locator('.course-card', { hasText: courseName });
            await expect(courseCard).toHaveCount(0);
        });

        test('multiple enroll/unenroll cycles work correctly', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            // Ensure starting from unenrolled state
            const initialUnenrollButton = page.locator('.unenroll-button');
            if (await initialUnenrollButton.isVisible()) {
                await initialUnenrollButton.click();
            }

            // First cycle: enroll
            await page.locator('.enroll-button').click();
            await expect(page.locator('.unenroll-button')).toBeVisible();

            // First cycle: unenroll
            await page.locator('.unenroll-button').click();
            await expect(page.locator('.enroll-button')).toBeVisible();

            // Second cycle: enroll
            await page.locator('.enroll-button').click();
            await expect(page.locator('.unenroll-button')).toBeVisible();

            // Second cycle: unenroll
            await page.locator('.unenroll-button').click();
            await expect(page.locator('.enroll-button')).toBeVisible();
        });
    });

    test.describe('Lesson Details Modal', () => {
        test('clicking on lesson opens modal with details', async ({ page }) => {
            await page.goto(`/course/${courseId}`);

            // Enroll to see lessons
            await page.locator('.enroll-button').click();

            // Click on first lesson
            await page.locator('.lesson-div').first().click();

            // Modal should be visible
            await expect(page.locator('.lesson-modal')).toBeVisible();
        });

        test('modal displays lesson name correctly', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            // Enroll to see lessons
            const enrollButton = page.locator('.enroll-button');
            if (await enrollButton.isVisible()) {
                await enrollButton.click();
            }

            // Click on first lesson
            await page.locator('.lesson-div').first().click();

            // Check lesson name in modal
            const modalLessonName = page.locator('.lesson-modal .lesson-name');
            await expect(modalLessonName).toContainText(lessonName);
        });

        test('modal displays lesson duration correctly', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            // Enroll to see lessons
            const enrollButton = page.locator('.enroll-button');
            if (await enrollButton.isVisible()) {
                await enrollButton.click();
            }

            // Click on first lesson
            await page.locator('.lesson-div').first().click();

            // Check lesson duration in modal
            const modalLessonDuration = page.locator('.lesson-modal .lesson-duration');
            await expect(modalLessonDuration).toContainText(`${lessonDuration}`);
        });

        test('modal displays lesson description correctly', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            // Enroll to see lessons
            const enrollButton = page.locator('.enroll-button');
            if (await enrollButton.isVisible()) {
                await enrollButton.click();
            }

            // Click on first lesson
            await page.locator('.lesson-div').first().click();

            // Check lesson description in modal
            const modalLessonDescription = page.locator('.lesson-modal .lesson-description');
            await expect(modalLessonDescription).toContainText(lessonDescription);
        });

        test('modal can be closed by clicking close button', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            // Enroll to see lessons
            const enrollButton = page.locator('.enroll-button');
            if (await enrollButton.isVisible()) {
                await enrollButton.click();
            }

            // Open modal
            await page.locator('.lesson-div').first().click();
            await expect(page.locator('.lesson-modal')).toBeVisible();

            // Close modal
            await page.locator('.close-lesson-modal').click();
            await expect(page.locator('.lesson-modal')).not.toBeVisible();
        });

        test('modal can be closed by clicking backdrop', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            // Enroll to see lessons
            const enrollButton = page.locator('.enroll-button');
            if (await enrollButton.isVisible()) {
                await enrollButton.click();
            }

            // Open modal
            await page.locator('.lesson-div').first().click();
            await expect(page.locator('.lesson-modal')).toBeVisible();

            // Click on backdrop (outside modal)
            await page.locator('.fixed.inset-0 > .absolute.inset-0').click({ position: { x: 10, y: 10 } });
            await expect(page.locator('.lesson-modal')).not.toBeVisible();
        });

        test('can open different lessons sequentially', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            // Enroll to see lessons
            const enrollButton = page.locator('.enroll-button');
            if (await enrollButton.isVisible()) {
                await enrollButton.click();
            }

            // Open first lesson
            await page.locator('.lesson-div').first().click();
            const firstLessonName = await page.locator('.lesson-modal .lesson-name').textContent();
            expect(firstLessonName).toContain(lessonName);

            // Close first lesson
            await page.locator('.close-lesson-modal').click();

            // Open second lesson
            await page.locator('.lesson-div').nth(1).click();
            const secondLessonName = await page.locator('.lesson-modal .lesson-name').textContent();
            expect(secondLessonName).toContain('Advanced JavaScript');
        });
    });

    test.describe('MyCoursesStudent Functionality', () => {
        test('shows empty state when no courses enrolled', async ({ page }) => {
            // Ensure student is not enrolled in any course
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            const unenrollButton = page.locator('.unenroll-button');
            if (await unenrollButton.isVisible()) {
                await unenrollButton.click();
            }

            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            await expect(page.getByText('Još uvek niste upisali nijedan kurs')).toBeVisible();
            await expect(page.getByText(/Istražite naš katalog/i)).toBeVisible();
        });

        test('displays enrolled courses correctly', async ({ page }) => {
            // Enroll in course
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            const enrollButton = page.locator('.enroll-button');
            if (await enrollButton.isVisible()) {
                await enrollButton.click();
            }

            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            const courseCard = page.locator('.course-card', { hasText: courseName });
            await expect(courseCard).toBeVisible();
        });

        test('search filters courses correctly', async ({ page }) => {
            // Enroll in course
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            const enrollButton = page.locator('.enroll-button');
            if (await enrollButton.isVisible()) {
                await enrollButton.click();
            }

            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            // Search for existing course
            await page.fill('input[type="text"]', 'Student Test');
            const courseCard = page.locator('.course-card', { hasText: courseName });
            await expect(courseCard).toBeVisible();

            // Search for non-existing course
            await page.fill('input[type="text"]', 'NonExistentCourse12345');
            await expect(page.getByText(/Nema rezultata za pretragu/i)).toBeVisible();
        });

        test('clicking on course navigates to course details', async ({ page }) => {
            // Enroll in course
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            const enrollButton = page.locator('.enroll-button');
            if (await enrollButton.isVisible()) {
                await enrollButton.click();
            }

            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            // Click on course card
            await page.locator('.course-card', { hasText: courseName }).first().click();

            await expect(page).toHaveURL(new RegExp(`/course/${courseId}`));
            await expect(page.locator('.course-name')).toContainText(courseName);
        });
    });

    test.describe('Course Information Sidebar', () => {
        test('sidebar shows correct course information', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            // Ensure starting from unenrolled state
            const unenrollButton = page.locator('.unenroll-button');
            if (await unenrollButton.isVisible()) {
                await unenrollButton.click();
            }

            const sidebar = page.getByRole('complementary');

            // Check sidebar displays difficulty
            await expect(sidebar.getByText(DificultyTypeToString[DificultyType.Medium])).toBeVisible();

            // Check sidebar displays lesson count
            await expect(sidebar.getByText('2 Lekcija')).toBeVisible();

            // Check sidebar displays duration
            await expect(sidebar.getByText('10 Nedelja')).toBeVisible();
        });

        test('sidebar title changes based on enrollment status', async ({ page }) => {
            await page.goto(`/course/${courseId}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);

            // Before enrollment
            await expect(page.getByText('Upis Kursa')).toBeVisible();

            // Enroll
            await page.locator('.enroll-button').click();

            // After enrollment
            await expect(page.getByText('Vaš Status')).toBeVisible();
        });
    });

    test.describe('Navigation and Discovery', () => {
        test('student can discover course from AllCourses', async ({ page }) => {
            await page.goto('/home/all');
            await page.waitForResponse(res => res.url().includes('/Course/getCoursesByFilter') && res.status() === 200);

            const courseCard = page.locator('.course-card', { hasText: courseName });
            await expect(courseCard).toBeVisible();
        });

        test('student can navigate from AllCourses to course details', async ({ page }) => {
            await page.goto('/home/all');
            await page.waitForResponse(res => res.url().includes('/Course/getCoursesByFilter') && res.status() === 200);

            await page.locator('.course-card', { hasText: courseName }).first().click();

            await expect(page).toHaveURL(new RegExp(`/course/${courseId}`));
            await expect(page.locator('.course-name')).toContainText(courseName);
        });
    });
});
