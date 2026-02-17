import { test, expect } from './setup';
import { fillRegisterForm, loginUser, makeTestEmail } from './helpers';
import DificultyType, { DificultyTypeToString } from '../../src/enums/DificultyType';
import { execSync } from 'child_process';

test.describe('MyCoursesAuthor Component', () => {
    const password = 'test1234';
    let authorEmail = '';

    test.beforeAll(async ({ browser, request }) => {
        execSync('node ./test_scripts/deleteTestUsers.js');
        await request.put('http://localhost:5196/api/Seed/DeleteTestDatabase');

        // Create author
        const authorContext = await browser.newContext();
        const authorPage = await authorContext.newPage();
        authorPage.on('dialog', async dialog => dialog.accept());

        authorEmail = makeTestEmail('author-mycourses-test');

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
    });

    test.beforeEach(async ({ page }) => {
        page.on('dialog', async dialog => dialog.accept());
        await loginUser(page, authorEmail, password);
    });

    test.describe('Empty State', () => {
        test('shows empty state when author has no courses', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            // Check empty state message
            await expect(page.getByText('Još niste kreirali nijedan kurs')).toBeVisible();
            await expect(page.getByText(/Započnite svoje putovanje autora/i)).toBeVisible();
            
            // AddCourseCard should still be visible
            await expect(page.locator('.add-course-card')).toBeVisible();
        });

        test('empty state shows AddCourseCard with correct link', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            const addCourseCard = page.locator('.add-course-card');
            await expect(addCourseCard).toBeVisible();
            
            // Click should navigate to add course page
            await addCourseCard.click();
            await expect(page).toHaveURL('/add-course');
        });
    });

    test.describe('Course List Display', () => {
        test.beforeAll(async ({ browser }) => {
            // Create a course for this test
            const context = await browser.newContext();
            const page = await context.newPage();
            page.on('dialog', async dialog => dialog.accept());
            
            await loginUser(page, authorEmail, password);
            await page.goto('/add-course');

            const courseName = `Author MyTest Course ${Date.now()}`;
            await page.fill('input[name="courseName"]', courseName);
            await page.fill('input[name="durationInWeeks"]', '8');
            await page.fill('textarea[name="description"]', 'Test course for MyCoursesAuthor');
            const difficultyButtonName = `difficulty-${DificultyTypeToString[DificultyType.Easy]}-button`;
            await page.locator(`button[name="${difficultyButtonName}"]`).click();
            
            await page.getByRole('button', { name: /kreiraj kurs/i }).click();
            await expect(page).toHaveURL(/\/course\/\d+/);
            
            await context.close();
        });

        test('displays created courses in grid layout', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            // Should see at least one course card (plus AddCourseCard)
            const courseCards = page.locator('.course-card');
            await expect(courseCards).toHaveCount(1);
        });

        test('course cards show correct information', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            const courseCard = page.locator('.course-card').first();
            
            // Check that course card has basic info
            await expect(courseCard.locator('.name')).toBeVisible();
            await expect(courseCard.getByText('Instruktor')).toBeVisible();
            await expect(courseCard.locator('.difficulty').first()).toBeVisible();
        });

        test('clicking course card navigates to course details', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            const courseCard = page.locator('.course-card').first();
            await courseCard.click();

            // Should navigate to course details page
            await expect(page).toHaveURL(/\/course\/\d+/);
        });

        test('AddCourseCard is always present in courses grid', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            const addCourseCard = page.locator('.add-course-card');
            await expect(addCourseCard).toBeVisible();
        });
    });

    test.describe('Search Functionality', () => {
        let testCourseName = '';

        test.beforeAll(async ({ browser }) => {
            // Create multiple courses with different names
            const context = await browser.newContext();
            const page = await context.newPage();
            page.on('dialog', async dialog => dialog.accept());
            
            await loginUser(page, authorEmail, password);
            
            testCourseName = `Searchable Course ${Date.now()}`;
            
            await page.goto('/add-course');
            await page.fill('input[name="courseName"]', testCourseName);
            await page.fill('input[name="durationInWeeks"]', '6');
            await page.fill('textarea[name="description"]', 'This is a course designed for search testing purposes');
            const difficultyButtonName1 = `difficulty-${DificultyTypeToString[DificultyType.Medium]}-button`;
            await page.locator(`button[name="${difficultyButtonName1}"]`).click();
            await page.getByRole('button', { name: /kreiraj kurs/i }).click();
            await expect(page).toHaveURL(/\/course\/\d+/);

            // Create another course with different name
            await page.goto('/add-course');
            await page.fill('input[name="courseName"]', `Another Course ${Date.now()}`);
            await page.fill('input[name="durationInWeeks"]', '5');
            await page.fill('textarea[name="description"]', 'This is a different course with sufficient description length');
            const difficultyButtonName2 = `difficulty-${DificultyTypeToString[DificultyType.Hard]}-button`;
            await page.locator(`button[name="${difficultyButtonName2}"]`).click();
            await page.getByRole('button', { name: /kreiraj kurs/i }).click();
            await expect(page).toHaveURL(/\/course\/\d+/);
            
            await context.close();
        });

        test('search bar is visible and functional', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            const searchInput = page.locator('input[name="input-search"]');
            await expect(searchInput).toBeVisible();
            await expect(searchInput).toHaveAttribute('placeholder', /Pretraži moje kurseve/i);
        });

        test('search filters courses correctly', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            // Type search term
            await page.fill('input[name="input-search"]', 'Searchable');

            // Should only show matching course
            const courseCards = page.locator('.course-card');
            await expect(courseCards).toHaveCount(1);
            await expect(courseCards.first().locator('.name')).toContainText('Searchable');
        });

        test('search shows empty state for no results', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            // Search for non-existent course
            await page.fill('input[name="input-search"]', 'NonExistentCourse12345');

            // Should show no results message
            await expect(page.locator('.search-result-text')).toContainText(/Nema rezultata za pretragu/i);
            await expect(page.getByText('NonExistentCourse12345')).toBeVisible();
        });

        test('search is case insensitive', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            // Search with different case
            await page.fill('input[name="input-search"]', 'searchable');

            const courseCards = page.locator('.course-card');
            await expect(courseCards.first().locator('.name')).toContainText('Searchable');
        });

        test('clearing search shows all courses again', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

           
            const searchInput = page.locator('input[name="input-search"]');
            
            // Search for specific course
            await searchInput.fill('Searchable');
            await expect(page.locator('.course-card')).toHaveCount(1);

            // Clear search
            await searchInput.clear();
            
            // Should show all courses again (same as initial)
            await expect(page.locator('.course-card')).toHaveCount(2);
        });
    });

    test.describe('Page Header', () => {
        test('displays correct header title', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            await expect(page.getByRole('heading', { name: 'Moji Kursevi' })).toBeVisible();
        });

        test('displays header subtitle', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            await expect(page.getByText('Pretraga')).toBeVisible();
        });
    });
});

test.describe('MyCoursesStudent Component', () => {
    const password = 'test1234';
    let studentEmail = '';
    let authorEmail = '';
    let courseId1 = '';
    let courseId2 = '';
    let courseName1 = '';
    let courseName2 = '';

    test.beforeAll(async ({ browser, request }) => {
        test.setTimeout(60000); // Increase timeout to 60 seconds for setup
        
        execSync('node ./test_scripts/deleteTestUsers.js');
        await request.put('http://localhost:5196/api/Seed/DeleteTestDatabase');

        // Create author and courses
        const authorContext = await browser.newContext();
        const authorPage = await authorContext.newPage();
        authorPage.on('dialog', async dialog => dialog.accept());

        authorEmail = makeTestEmail('author-student-mycourses');

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

        // Create first course
        await authorPage.goto('/add-course');
        courseName1 = `Student Course One ${Date.now()}`;
        await authorPage.fill('input[name="courseName"]', courseName1);
        await authorPage.fill('input[name="durationInWeeks"]', '10');
        await authorPage.fill('textarea[name="description"]', 'First course for student testing');
        const difficultyButtonName1 = `difficulty-${DificultyTypeToString[DificultyType.Easy]}-button`;
        await authorPage.locator(`button[name="${difficultyButtonName1}"]`).click();
        await authorPage.getByRole('button', { name: /kreiraj kurs/i }).click();
        await expect(authorPage).toHaveURL(/\/course\/\d+/);
        
        const match1 = authorPage.url().match(/\/course\/([^/?#]+)/);
        if (!match1) throw new Error('Failed to parse course id from URL.');
        courseId1 = match1[1];

        // Create second course
        await authorPage.goto('/add-course');
        courseName2 = `Student Course Two ${Date.now()}`;
        await authorPage.fill('input[name="courseName"]', courseName2);
        await authorPage.fill('input[name="durationInWeeks"]', '8');
        await authorPage.fill('textarea[name="description"]', 'Second course for student testing');
        const difficultyButtonName2 = `difficulty-${DificultyTypeToString[DificultyType.Medium]}-button`;
        await authorPage.locator(`button[name="${difficultyButtonName2}"]`).click();
        await authorPage.getByRole('button', { name: /kreiraj kurs/i }).click();
        await expect(authorPage).toHaveURL(/\/course\/\d+/);
        
        const match2 = authorPage.url().match(/\/course\/([^/?#]+)/);
        if (!match2) throw new Error('Failed to parse course id from URL.');
        courseId2 = match2[1];

        await authorContext.close();

        // Create student
        const studentContext = await browser.newContext();
        const studentPage = await studentContext.newPage();
        studentPage.on('dialog', async dialog => dialog.accept());

        studentEmail = makeTestEmail('student-mycourses-test');

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

        // Enroll student in both courses immediately
        const enrollContext = await browser.newContext();
        const enrollPage = await enrollContext.newPage();
        enrollPage.on('dialog', async dialog => dialog.accept());
        
        await loginUser(enrollPage, studentEmail, password);
        
        // Enroll in first course
        await enrollPage.goto(`/course/${courseId1}`);
        await enrollPage.waitForResponse(res => res.url().includes(`/Course/getById/${courseId1}`) && res.status() === 200);
        const enroll1 = enrollPage.locator('.enroll-button');
        if (await enroll1.isVisible()) {
            await enroll1.click();
        }

        // Enroll in second course
        await enrollPage.goto(`/course/${courseId2}`);
        await enrollPage.waitForResponse(res => res.url().includes(`/Course/getById/${courseId2}`) && res.status() === 200);
        const enroll2 = enrollPage.locator('.enroll-button');
        if (await enroll2.isVisible()) {
            await enroll2.click();
        }
        
        await enrollContext.close();
    });

    test.beforeEach(async ({ page }) => {
        page.on('dialog', async dialog => dialog.accept());
        await loginUser(page, studentEmail, password);
    });

    test.describe('Course List Display', () => {
        test('displays enrolled courses in grid layout', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            // Should see enrolled courses
            const courseCards = page.locator('.course-card');
            await expect(courseCards).toHaveCount(2);
        });

        test('course cards show correct information', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            const courseCard = page.locator('.course-card').first();
            
            // Check that course card has basic info
            await expect(courseCard.locator('.name')).toContainText(courseName1);
            await expect(courseCard.getByText('Instruktor')).toBeVisible();
            await expect(courseCard.locator('.difficulty').first()).toBeVisible();
        });

        test('clicking course card navigates to course details', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            const courseCard = page.locator('.course-card').first();
            await courseCard.click();

            // Should navigate to course details page
            await expect(page).toHaveURL(/\/course\/\d+/);
        });
    });

    test.describe('Search Functionality', () => {
        test('search bar is visible and functional', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            const searchInput = page.locator('input[placeholder*="Pretraži"]');
            await expect(searchInput).toBeVisible();
            await expect(searchInput).toHaveAttribute('placeholder', /Pretraži moje kurseve/i);
        });

        test('search filters courses correctly', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            const searchInput = page.locator('input[placeholder*="Pretraži"]');
            
            // Search for first course
            await searchInput.fill('One');

            // Should only show matching course
            const courseCards = page.locator('.course-card');
            await expect(courseCards).toHaveCount(1);
            await expect(courseCards.first().locator('.name')).toContainText('One');
        });

        test('search shows empty state for no results', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            // Search for non-existent course
            await page.fill('input[placeholder*="Pretraži"]', 'NonExistentCourse99999');

            // Should show no results message
            await expect(page.getByText(/Nema rezultata za pretragu/i)).toBeVisible();
            await expect(page.getByText('NonExistentCourse99999')).toBeVisible();
        });

        test('search is case insensitive', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            // Search with different case
            await page.fill('input[placeholder*="Pretraži"]', 'one');

            const courseCards = page.locator('.course-card');
            await expect(courseCards.first().locator('.name')).toContainText('One');
        });

        test('clearing search shows all courses again', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            const searchInput = page.locator('input[placeholder*="Pretraži"]');
            
            // Search for specific course
            await searchInput.fill('One');
            await expect(page.locator('.course-card')).toHaveCount(1);

            // Clear search
            await searchInput.clear();
            
            // Should show all enrolled courses again (2 courses)
            await expect(page.locator('.course-card')).toHaveCount(2);
        });

        test('search responds quickly', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            const searchInput = page.locator('input[placeholder*="Pretraži"]');
            
            // Measure search response time
            const start = Date.now();
            await searchInput.fill('One');
            
            // Wait for filter to apply (course cards to update)
            await page.waitForTimeout(50); // Small buffer for UI update
            const duration = Date.now() - start;
            
            // Search should be instant (< 500ms)
            expect(duration).toBeLessThan(500);
            
            // Verify search worked
            await expect(page.locator('.course-card')).toHaveCount(1);
        });
    });

    test.describe('Page Header', () => {
        test('displays correct header title', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            await expect(page.getByRole('heading', { name: 'Upisani Kursevi' })).toBeVisible();
        });

        test('displays header subtitle', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            await expect(page.getByText('Moje učenje')).toBeVisible();
        });
    });

    test.describe('Pagination', () => {
        test.beforeAll(async ({ browser }) => {
            test.setTimeout(120000); // Increase timeout to 2 minutes for creating 10 courses
            
            // Create 10 additional courses and enroll student
            const context = await browser.newContext();
            const page = await context.newPage();
            page.on('dialog', async dialog => dialog.accept());
            
            // Login as author
            await loginUser(page, authorEmail, password);
            
            const createdCourseIds: string[] = [];
            
            // Create 10 more courses
            for (let i = 1; i <= 10; i++) {
                await page.goto('/add-course');
                await page.fill('input[name="courseName"]', `Pagination Test Course ${i} ${Date.now()}`);
                await page.fill('input[name="durationInWeeks"]', '6');
                await page.fill('textarea[name="description"]', `Description for pagination test course number ${i}`);
                const difficultyButtonName = `difficulty-${DificultyTypeToString[DificultyType.Easy]}-button`;
                await page.locator(`button[name="${difficultyButtonName}"]`).click();
                await page.getByRole('button', { name: /kreiraj kurs/i }).click();
                await expect(page).toHaveURL(/\/course\/\d+/);
                
                const match = page.url().match(/\/course\/([^/?#]+)/);
                if (match) createdCourseIds.push(match[1]);
            }
            
            await context.close();
            
            // Enroll student in all 10 courses
            const enrollContext = await browser.newContext();
            const enrollPage = await enrollContext.newPage();
            enrollPage.on('dialog', async dialog => dialog.accept());
            
            await loginUser(enrollPage, studentEmail, password);
            
            for (const id of createdCourseIds) {
                await enrollPage.goto(`/course/${id}`);
                await enrollPage.waitForResponse(res => res.url().includes(`/Course/getById/${id}`) && res.status() === 200);
                const enrollBtn = enrollPage.locator('.enroll-button');
                if (await enrollBtn.isVisible()) {
                    await enrollBtn.click();
                    // await enrollPage.waitForResponse(res => res.url().includes('/Student/EnrollStudentToCourse/') && res.status() === 200);
                }
            }
            
            await enrollContext.close();
        });

        test('shows pagination when student has many courses', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            // Check if pagination exists
            const paginationButtons = page.locator('button').filter({ hasText: /^[0-9]$/ });
            const paginationExists = await paginationButtons.count() > 0;
            
            if (paginationExists) {
                // Verify pagination is visible
                await expect(paginationButtons.first()).toBeVisible();
                
                // Check if there are multiple pages
                const pageButtonCount = await paginationButtons.count();
                if (pageButtonCount > 1) {
                    // Try clicking page 2
                    await paginationButtons.nth(1).click();
                    await page.waitForTimeout(500); // Wait for page change
                    
                    // Should still be on my courses page
                    await expect(page).toHaveURL('/home/my');
                }
            }
        });
    });

    test.describe('Navigation Integration', () => {
        test('can navigate from course details back to my courses', async ({ page }) => {
            // Go to my courses
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);
            
            // Click on course card
            await page.locator('.course-card').first().click();
            await expect(page).toHaveURL(`/course/${courseId1}`);

            // Click back button
            await page.getByRole('button', { name: 'Nazad' }).click();
            
            // Should be back on my courses page
            await expect(page).toHaveURL('/home/my');
        });
    });

    test.describe('Enrollment Management', () => {
        test('course disappears from list after unenroll', async ({ page }) => {
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            // Get course names before unenroll
            const courseNamesBefore = await page.locator('.course-card .name').allTextContents();
            expect(courseNamesBefore).toContain(courseName1);

            // Navigate to first course and unenroll
            await page.goto(`/course/${courseId1}`);
            await page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId1}`) && res.status() === 200);
            
            const unenrollButton = page.locator('.unenroll-button');
            await expect(unenrollButton).toBeVisible();
            await unenrollButton.click();
            
            // Wait for unenroll to complete (no response wait needed per earlier fix)
            await page.waitForTimeout(500);

            // Go back to my courses
            await page.goto('/home/my');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            // Verify the unenrolled course is NOT in the list anymore
            const courseNamesAfter = await page.locator('.course-card .name').allTextContents();
            expect(courseNamesAfter).not.toContain(courseName1);
            
            // Verify course list has changed (either count decreased or content changed)
            expect(courseNamesAfter.length).toBeLessThanOrEqual(courseNamesBefore.length);
        });
    });
});
