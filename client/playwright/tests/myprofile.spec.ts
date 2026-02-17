import { test, expect } from './setup';
import { fillRegisterForm, loginUser, makeTestEmail } from './helpers';
import DificultyType, { DificultyTypeToString } from '../../src/enums/DificultyType';
import { execSync } from 'child_process';

test.describe('MyProfile - Author User', () => {
    const password = 'test1234';
    let authorEmail = '';
    let authorFirstName = 'TestAuthor';
    let authorLastName = 'ProfileTest';

    test.beforeAll(async ({ browser, request }) => {
        test.setTimeout(60000);
        
        execSync('node ./test_scripts/deleteTestUsers.js');
        await request.put('http://localhost:5196/api/Seed/DeleteTestDatabase');

        // Create author
        const authorContext = await browser.newContext();
        const authorPage = await authorContext.newPage();
        authorPage.on('dialog', async dialog => dialog.accept());

        authorEmail = makeTestEmail('author-profile-test');

        await authorPage.goto('/register');
        await authorPage.getByRole('button', { name: 'AUTOR' }).click();
        await fillRegisterForm(authorPage, {
            firstName: authorFirstName,
            lastName: authorLastName,
            email: authorEmail,
            phone: '+381622222222',
            dob: '1990-05-15',
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

    test.describe('Profile Information Display', () => {
        test('displays user name and surname correctly', async ({ page }) => {
            await page.goto('/home/profile');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            // Check full name in multiple places
            const userName = page.locator('.user-name');
            await expect(userName).toContainText(authorFirstName);
            await expect(userName).toContainText(authorLastName);

            const userFullName = page.locator('.user-fullname');
            await expect(userFullName).toContainText(`${authorFirstName} ${authorLastName}`);
        });

        test('displays email address correctly', async ({ page }) => {
            await page.goto('/home/profile');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            const userEmail = page.locator('.user-email');
            await expect(userEmail).toContainText(authorEmail);
        });

        test('displays role as Author', async ({ page }) => {
            await page.goto('/home/profile');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            const userRole = page.locator('.user-role');
            await expect(userRole).toContainText('Autor');
        });

        test('displays avatar with user initial', async ({ page }) => {
            await page.goto('/home/profile');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            // Avatar should show first letter of first name
            const avatar = page.locator('.user-name').locator('..').locator('..');
            await expect(avatar).toBeVisible();
            
            // Check if initial is displayed (T for TestAuthor)
            const initialElement = page.getByText(authorFirstName.charAt(0).toUpperCase()).first();
            await expect(initialElement).toBeVisible();
        });

        test('displays settings button', async ({ page }) => {
            await page.goto('/home/profile');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            const settingsButton = page.locator('.user-settings');
            await expect(settingsButton).toBeVisible();
            await expect(settingsButton).toContainText(/Podešavanja/i);
        });
    });

    test.describe('Author Statistics', () => {
        let courseIds: string[] = [];

        test.beforeAll(async ({ browser }) => {
            // Create 3 courses for the author
            const context = await browser.newContext();
            const page = await context.newPage();
            page.on('dialog', async dialog => dialog.accept());
            
            await loginUser(page, authorEmail, password);
            
            // Create first course
            await page.goto('/add-course');
            await page.fill('input[name="courseName"]', `Stats Course 1 ${Date.now()}`);
            await page.fill('input[name="durationInWeeks"]', '8');
            await page.fill('textarea[name="description"]', 'First course for statistics testing purposes');
            const difficultyButtonName1 = `difficulty-${DificultyTypeToString[DificultyType.Easy]}-button`;
            await page.locator(`button[name="${difficultyButtonName1}"]`).click();
            await page.getByRole('button', { name: /kreiraj kurs/i }).click();
            await expect(page).toHaveURL(/\/course\/\d+/);
            const match1 = page.url().match(/\/course\/([^/?#]+)/);
            if (match1) courseIds.push(match1[1]);

            // Create second course
            await page.goto('/add-course');
            await page.fill('input[name="courseName"]', `Stats Course 2 ${Date.now()}`);
            await page.fill('input[name="durationInWeeks"]', '6');
            await page.fill('textarea[name="description"]', 'Second course for statistics testing purposes');
            const difficultyButtonName2 = `difficulty-${DificultyTypeToString[DificultyType.Medium]}-button`;
            await page.locator(`button[name="${difficultyButtonName2}"]`).click();
            await page.getByRole('button', { name: /kreiraj kurs/i }).click();
            await expect(page).toHaveURL(/\/course\/\d+/);
            const match2 = page.url().match(/\/course\/([^/?#]+)/);
            if (match2) courseIds.push(match2[1]);

            // Create third course
            await page.goto('/add-course');
            await page.fill('input[name="courseName"]', `Stats Course 3 ${Date.now()}`);
            await page.fill('input[name="durationInWeeks"]', '10');
            await page.fill('textarea[name="description"]', 'Third course for statistics testing purposes');
            const difficultyButtonName3 = `difficulty-${DificultyTypeToString[DificultyType.Hard]}-button`;
            await page.locator(`button[name="${difficultyButtonName3}"]`).click();
            await page.getByRole('button', { name: /kreiraj kurs/i }).click();
            await expect(page).toHaveURL(/\/course\/\d+/);
            const match3 = page.url().match(/\/course\/([^/?#]+)/);
            if (match3) courseIds.push(match3[1]);
            
            await context.close();
        });

        test('displays correct number of courses', async ({ page }) => {
            await page.goto('/home/profile');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            const totalCourses = page.locator('.author-total-courses');
            await expect(totalCourses).toContainText('3');
        });

        test('initially shows zero students', async ({ page }) => {
            await page.goto('/home/profile');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            const totalStudents = page.locator('.author-total-students');
            await expect(totalStudents).toContainText('0');
        });

        test('counts unique students correctly - student enrolled in 2 courses counts as 1', async ({ page, browser }) => {
            // Use course IDs from beforeAll
            if (courseIds.length < 2) {
                throw new Error('Not enough courses created in beforeAll');
            }
            const courseId1 = courseIds[0];
            const courseId2 = courseIds[1];

            // Create a student and enroll in both courses
            const studentContext = await browser.newContext();
            const studentPage = await studentContext.newPage();
            studentPage.on('dialog', async dialog => dialog.accept());

            const studentEmail = makeTestEmail('student-stats-test');

            await studentPage.goto('/register');
            await studentPage.getByRole('button', { name: 'STUDENT' }).click();
            await fillRegisterForm(studentPage, {
                firstName: 'Test',
                lastName: 'Student',
                email: studentEmail,
                phone: '+381633333333',
                dob: '2000-01-01',
                password,
                confirmPassword: password,
            });
            await studentPage.getByRole('button', { name: 'REGISTRUJ SE' }).click();
            await expect(studentPage).toHaveURL('/');

            // Enroll in first course
            await studentPage.goto(`/course/${courseId1}`);
            await studentPage.waitForResponse(res => res.url().includes(`/Course/getById/${courseId1}`) && res.status() === 200);
            const enrollButton1 = studentPage.locator('.enroll-button');
            if (await enrollButton1.isVisible()) {
                await enrollButton1.click();
            }

            // Enroll in second course
            await studentPage.goto(`/course/${courseId2}`);
            await studentPage.waitForResponse(res => res.url().includes(`/Course/getById/${courseId2}`) && res.status() === 200);
            const enrollButton2 = studentPage.locator('.enroll-button');
            if (await enrollButton2.isVisible()) {
                await enrollButton2.click();
            }

            await studentContext.close();

            // Check author profile - should show 1 unique student, not 2
            await page.goto('/home/profile');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            const totalStudents = page.locator('.author-total-students');
            await expect(totalStudents).toContainText('1'); // Only 1 unique student despite 2 enrollments
        });

        test('updates student count when new student enrolls', async ({ page, browser }) => {
            // Use course ID from beforeAll
            if (courseIds.length < 1) {
                throw new Error('No courses created in beforeAll');
            }
            const courseId = courseIds[0];

            // Create second student
            const student2Context = await browser.newContext();
            const student2Page = await student2Context.newPage();
            student2Page.on('dialog', async dialog => dialog.accept());

            const student2Email = makeTestEmail('student2-stats-test');

            await student2Page.goto('/register');
            await student2Page.getByRole('button', { name: 'STUDENT' }).click();
            await fillRegisterForm(student2Page, {
                firstName: 'Second',
                lastName: 'Student',
                email: student2Email,
                phone: '+381644444444',
                dob: '2001-05-20',
                password,
                confirmPassword: password,
            });
            await student2Page.getByRole('button', { name: 'REGISTRUJ SE' }).click();
            await expect(student2Page).toHaveURL('/');

            // Enroll second student
            await student2Page.goto(`/course/${courseId}`);
            await student2Page.waitForResponse(res => res.url().includes(`/Course/getById/${courseId}`) && res.status() === 200);
            const enrollButton = student2Page.locator('.enroll-button');
            if (await enrollButton.isVisible()) {
                await enrollButton.click();
            }

            await student2Context.close();

            // Check author profile - should now show 2 unique students
            await page.goto('/home/profile');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            const totalStudents = page.locator('.author-total-students');
            await expect(totalStudents).toContainText('2');
        });
    });

    test.describe('Password Change Functionality', () => {
        test('settings panel opens and closes', async ({ page }) => {
            await page.goto('/home/profile');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            const settingsButton = page.locator('.user-settings');
            
            // Initially, password fields should not be visible
            const currentPasswordInput = page.locator('.current-password');
            await expect(currentPasswordInput).not.toBeVisible();

            // Click to open settings
            await settingsButton.click();
            await expect(currentPasswordInput).toBeVisible();

            // Click again to close
            await settingsButton.click();
            await expect(currentPasswordInput).not.toBeVisible();
        });

        test('validates all fields are required', async ({ page }) => {
            await page.goto('/home/profile');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            // Open settings
            await page.locator('.user-settings').click();

            // Try to change password without filling any fields
            await page.locator('.change-password-button').click();

            // Should show error message
            const passwordMessage = page.locator('.password-message');
            await expect(passwordMessage).toBeVisible();
            await expect(passwordMessage).toContainText(/Popunite sva polja/i);
        });

        test('validates new password matches confirmation', async ({ page }) => {
            await page.goto('/home/profile');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            // Open settings
            await page.locator('.user-settings').click();

            // Fill fields with mismatched passwords
            await page.locator('.current-password').fill(password);
            await page.locator('.new-password').fill('newpass123');
            await page.locator('.confirm-password').fill('differentpass');

            await page.locator('.change-password-button').click();

            // Should show error message
            const passwordMessage = page.locator('.password-message');
            await expect(passwordMessage).toBeVisible();
            await expect(passwordMessage).toContainText(/se ne poklapaju/i);
        });

        test('validates new password minimum length', async ({ page }) => {
            await page.goto('/home/profile');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            // Open settings
            await page.locator('.user-settings').click();

            // Fill fields with short password (less than 6 characters)
            await page.locator('.current-password').fill(password);
            await page.locator('.new-password').fill('12345');
            await page.locator('.confirm-password').fill('12345');

            await page.locator('.change-password-button').click();

            // Should show error message
            const passwordMessage = page.locator('.password-message');
            await expect(passwordMessage).toBeVisible();
            await expect(passwordMessage).toContainText(/najmanje 6 karaktera/i);
        });

        test('validates current password is correct', async ({ page }) => {
            await page.goto('/home/profile');
            await page.waitForResponse(res => res.url().includes('/Author/') && res.status() === 200);

            // Open settings
            await page.locator('.user-settings').click();

            // Fill fields with wrong current password
            await page.locator('.current-password').fill('wrongpassword');
            await page.locator('.new-password').fill('newpass123');
            await page.locator('.confirm-password').fill('newpass123');

            await page.locator('.change-password-button').click();

            // Should show error message after Firebase validation
            const passwordMessage = page.locator('.password-message');
            await expect(passwordMessage).toBeVisible();
            await expect(passwordMessage).toContainText(/nije ispravna/i);
        });
    });

    // Password change test at the end to avoid interfering with other tests
    test.describe('Password Change - Full Flow', () => {
        test('successfully changes password and can re-login', async ({ page, browser }) => {
            // Use a new context without beforeEach to avoid login issues
            const newContext = await browser.newContext();
            const newPage = await newContext.newPage();
            newPage.on('dialog', async dialog => dialog.accept());

            // Login with current password
            await loginUser(newPage, authorEmail, password);
            
            await newPage.goto('/home/profile');

            // Open settings
            await newPage.locator('.user-settings').click();

            const newPassword = 'newpass456';

            // Fill fields correctly
            await newPage.locator('.current-password').fill(password);
            await newPage.locator('.new-password').fill(newPassword);
            await newPage.locator('.confirm-password').fill(newPassword);

            await newPage.locator('.change-password-button').click();

            // Should show success message
            const passwordMessage = newPage.locator('.password-message');
            await expect(passwordMessage).toBeVisible();
            await expect(passwordMessage).toContainText(/uspešno promenjena/i);

            // Fields should be cleared
            await expect(newPage.locator('.current-password')).toHaveValue('');
            await expect(newPage.locator('.new-password')).toHaveValue('');
            await expect(newPage.locator('.confirm-password')).toHaveValue('');

            // After password change, user is automatically logged out
            // Go directly to login page
            await newPage.goto('/login');

            // Login with new password
            await newPage.fill('input[type="email"]', authorEmail);
            await newPage.fill('input[type="password"]', newPassword);
            await newPage.getByRole('button', { name: /Prijavi se/i }).click();

            // Should successfully login
            await expect(newPage).toHaveURL('/');

            // Should be able to access profile
            await newPage.goto('/home/profile');

            const userName = newPage.locator('.user-name');
            await expect(userName).toBeVisible();

            await newContext.close();
        });
    });
});

test.describe('MyProfile - Student User', () => {
    const password = 'test1234';
    let studentEmail = '';
    let studentFirstName = 'TestStudent';
    let studentLastName = 'ProfileTest';
    let authorEmail = '';

    test.beforeAll(async ({ browser, request }) => {
        test.setTimeout(60000);
        
        execSync('node ./test_scripts/deleteTestUsers.js');
        await request.put('http://localhost:5196/api/Seed/DeleteTestDatabase');

        // Create author first
        const authorContext = await browser.newContext();
        const authorPage = await authorContext.newPage();
        authorPage.on('dialog', async dialog => dialog.accept());

        authorEmail = makeTestEmail('author-for-student-profile');

        await authorPage.goto('/register');
        await authorPage.getByRole('button', { name: 'AUTOR' }).click();
        await fillRegisterForm(authorPage, {
            firstName: 'Test',
            lastName: 'Author',
            email: authorEmail,
            phone: '+381622222222',
            dob: '1990-05-15',
            password,
            confirmPassword: password,
        });
        await authorPage.getByRole('button', { name: 'REGISTRUJ SE' }).click();
        await expect(authorPage).toHaveURL('/');

        // Create courses
        await authorPage.goto('/add-course');
        await authorPage.fill('input[name="courseName"]', `Student Profile Course 1 ${Date.now()}`);
        await authorPage.fill('input[name="durationInWeeks"]', '8');
        await authorPage.fill('textarea[name="description"]', 'First course for student profile testing');
        const difficultyButtonName1 = `difficulty-${DificultyTypeToString[DificultyType.Easy]}-button`;
        await authorPage.locator(`button[name="${difficultyButtonName1}"]`).click();
        await authorPage.getByRole('button', { name: /kreiraj kurs/i }).click();
        await expect(authorPage).toHaveURL(/\/course\/\d+/);

        await authorPage.goto('/add-course');
        await authorPage.fill('input[name="courseName"]', `Student Profile Course 2 ${Date.now()}`);
        await authorPage.fill('input[name="durationInWeeks"]', '6');
        await authorPage.fill('textarea[name="description"]', 'Second course for student profile testing');
        const difficultyButtonName2 = `difficulty-${DificultyTypeToString[DificultyType.Medium]}-button`;
        await authorPage.locator(`button[name="${difficultyButtonName2}"]`).click();
        await authorPage.getByRole('button', { name: /kreiraj kurs/i }).click();
        await expect(authorPage).toHaveURL(/\/course\/\d+/);

        await authorContext.close();

        // Create student
        const studentContext = await browser.newContext();
        const studentPage = await studentContext.newPage();
        studentPage.on('dialog', async dialog => dialog.accept());

        studentEmail = makeTestEmail('student-profile-test');

        await studentPage.goto('/register');
        await studentPage.getByRole('button', { name: 'STUDENT' }).click();
        await fillRegisterForm(studentPage, {
            firstName: studentFirstName,
            lastName: studentLastName,
            email: studentEmail,
            phone: '+381633333333',
            dob: '1998-08-20',
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

    test.describe('Profile Information Display', () => {
        test('displays user name and surname correctly', async ({ page }) => {
            await page.goto('/home/profile');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            const userName = page.locator('.user-name');
            await expect(userName).toContainText(studentFirstName);
            await expect(userName).toContainText(studentLastName);

            const userFullName = page.locator('.user-fullname');
            await expect(userFullName).toContainText(`${studentFirstName} ${studentLastName}`);
        });

        test('displays email address correctly', async ({ page }) => {
            await page.goto('/home/profile');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            const userEmail = page.locator('.user-email');
            await expect(userEmail).toContainText(studentEmail);
        });

        test('displays role as Student', async ({ page }) => {
            await page.goto('/home/profile');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            const userRole = page.locator('.user-role');
            await expect(userRole).toContainText('Student');
        });

        test('displays avatar with user initial', async ({ page }) => {
            await page.goto('/home/profile');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            // Check if initial is displayed (T for TestStudent)
            const initialElement = page.getByText(studentFirstName.charAt(0).toUpperCase()).first();
            await expect(initialElement).toBeVisible();
        });
    });

    test.describe('Student Statistics', () => {
        test('initially shows zero enrolled courses', async ({ page }) => {
            await page.goto('/home/profile');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            const totalCourses = page.locator('.student-total-courses');
            await expect(totalCourses).toContainText('0');
        });

        test('updates course count after enrolling in courses', async ({ page }) => {
            // Increase timeout for this test as it involves multiple enrollments
            test.setTimeout(60000);
            
            // Get course IDs from all courses page
            await page.goto('/home/all');
            // await page.waitForResponse(res => res.url().includes('/Course/getPaged') && res.status() === 200);
            
            // Wait for course cards to be visible
            await page.locator('.course-card').first().waitFor({ state: 'visible', timeout: 10000 });

            // Click first course
            const firstCourseCard = page.locator('.course-card').first();
            await firstCourseCard.click();
            await expect(page).toHaveURL(/\/course\/\d+/);
            
            const match1 = page.url().match(/\/course\/([^/?#]+)/);
            if (!match1) throw new Error('Failed to parse first course ID');
            const courseId1 = match1[1];

            // Enroll in first course
            const enrollButton1 = page.locator('.enroll-button');
            await enrollButton1.waitFor({ state: 'visible', timeout: 5000 });
            if (await enrollButton1.isVisible()) {
                await enrollButton1.click();
            }

            // Get second course
            await page.goto('/home/all');
            // await page.waitForResponse(res => res.url().includes('/Course/getPaged') && res.status() === 200);
            await page.locator('.course-card').nth(1).waitFor({ state: 'visible', timeout: 10000 });
            
            const secondCourseCard = page.locator('.course-card').nth(1);
            await secondCourseCard.click();
            await expect(page).toHaveURL(/\/course\/\d+/);
            
            const match2 = page.url().match(/\/course\/([^/?#]+)/);
            if (!match2) throw new Error('Failed to parse second course ID');
            const courseId2 = match2[1];

            // Enroll in second course
            const enrollButton2 = page.locator('.enroll-button');
            await enrollButton2.waitFor({ state: 'visible', timeout: 5000 });
            if (await enrollButton2.isVisible()) {
                await enrollButton2.click();
            }

            // Check profile - should show 2 courses
            await page.goto('/home/profile');
            await page.waitForResponse(res => res.url().includes('/Student/') && res.status() === 200);

            const totalCourses = page.locator('.student-total-courses');
            await expect(totalCourses).toContainText('2');
        });
    });

    test.describe('Password Change Functionality', () => {
        test('successfully changes password and can re-login', async ({ page, browser }) => {
            // Use a new context to avoid beforeEach interfering
            const newContext = await browser.newContext();
            const newPage = await newContext.newPage();
            newPage.on('dialog', async dialog => dialog.accept());

            // Login with current password
            await loginUser(newPage, studentEmail, password);

            await newPage.goto('/home/profile');

            // Open settings
            await newPage.locator('.user-settings').click();

            const newPassword = 'student456';

            // Change password
            await newPage.locator('.current-password').fill(password);
            await newPage.locator('.new-password').fill(newPassword);
            await newPage.locator('.confirm-password').fill(newPassword);

            await newPage.locator('.change-password-button').click();

            // Should show success message
            const passwordMessage = newPage.locator('.password-message');
            await expect(passwordMessage).toBeVisible();
            await expect(passwordMessage).toContainText(/uspešno promenjena/i);

            // After password change, user is automatically logged out

            // Go directly to login page
            await newPage.locator("button[title=\"Odjavi se\"]").click();
            const loginButton = newPage.getByRole('button', { name: /LOG IN/i });
            await expect(loginButton).toBeVisible();
            loginButton.click();

            // Login with new password
            await newPage.fill('input[type="email"]', studentEmail);
            await newPage.fill('input[type="password"]', newPassword);
            await newPage.getByRole('button', { name: /Prijavi se/i }).click();

            // Should successfully login
            await expect(newPage).toHaveURL('/');

            // Should be able to access profile
            await newPage.goto('/home/profile');

            const userName = newPage.locator('.user-name');
            await expect(userName).toBeVisible();

            await newContext.close();
        });
    });
});
