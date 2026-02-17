import { test, expect } from './setup';
import { fillRegisterForm, makeTestEmail } from './helpers';
import { DTOCourseResponse } from '../../src/interfaces/DTOCourseResponse';
import { SortByOptionsType } from '../../src/components/AllCoursesFilter';
import DificultyType, { DificultyTypeToString } from '../../src/enums/DificultyType';
let seededCourses: DTOCourseResponse[] = [];
let testUser = {
    email: '',
    password: 'test1234',
};
let isUserRegistered = false;
const coursePerPage = 8;

// Setup za AllCourses testove - seeduj kurseve jednom pre svih testova
test.beforeAll(async ({ request, browser }) => {
    // Prvo obrisi sve iz baze da bi testovi bili konzistentni
    await request.put('http://localhost:5196/api/Seed/DeleteTestDatabase');
    // Prvo seeduj kurseve
    const response = await request.post('http://localhost:5196/api/Seed/seed-random-courses');

    if (!response.ok()) {
        throw new Error(`Failed to seed courses: ${response.status()} ${response.statusText()}`);
    }

    const responseText = await response.text();
    console.log('Seed response:', responseText);

    if (responseText && responseText.trim() !== '') {
        seededCourses = JSON.parse(responseText) as DTOCourseResponse[];
        console.log(`Seeded ${seededCourses.length} courses for testing`);
    } else {
        console.log('Seed endpoint returned empty response, assuming courses were created');
    }

    // Registruj test korisnika jednom
    testUser.email = makeTestEmail('allcourses-user');
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/register');
    await page.getByRole('button', { name: 'STUDENT' }).click();
    await fillRegisterForm(page, {
        firstName: 'Test',
        lastName: 'User',
        email: testUser.email,
        phone: '+381621111111',
        dob: '2000-01-01',
        password: testUser.password,
        confirmPassword: testUser.password,
    });
    await page.getByRole('button', { name: 'REGISTRUJ SE' }).click();
    await expect(page).toHaveURL('/');

    isUserRegistered = true;
    await context.close();
    console.log(`Registered test user: ${testUser.email}`);
});

// Očisti bazu nakon svih testova
test.afterAll(async ({ request }) => {
    await request.put('http://localhost:5196/api/Seed/DeleteTestDatabase');
});

// Helper za login test korisnika (bez registracije)
async function loginTestUser(page: any) {
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.getByRole('button', { name: 'Prijavi se' }).click();
    await expect(page).toHaveURL('/');
}

test.describe('AllCourses - display and navigation', () => {
    test.beforeEach(async ({ page }) => {
        await loginTestUser(page);
        await page.goto('/home/all');
    });

    test('displays courses after navigation', async ({ page }) => {
        await expect(page).toHaveURL('/home/all');
        // Proveri da li se prikazuje bar jedan kurs
        const courseCards = page.locator('.course-card');
        await expect(courseCards.first()).toBeVisible({ timeout: 10000 });
    });

    test('displays pagination controls', async ({ page }) => {
        // Proveri da li postoje pagination kontrole
        await expect(page.locator('.previous-button')).toBeVisible();
        await expect(page.locator('.next-button')).toBeVisible();
        await expect(page.locator('.page-button').first()).toBeVisible();
    });

    test('navigates to next page', async ({ page }) => {
        // Klikni na sledeću stranicu
        await page.locator('.next-button').click();
        await expect(page).toHaveURL(/page=2/);
    });

    test('navigates to previous page from page 2', async ({ page }) => {
        // Idi na stranicu 2
        await page.goto('/home/all?page=2');
        await page.waitForResponse(response => response.url().includes('Course/getCoursesByFilter') && response.status() === 200);

        // Klikni na prethodnu stranicu
        await page.locator('.previous-button').click();
        await page.waitForResponse(response => response.url().includes('Course/getCoursesByFilter') && response.status() === 200);
        await expect(page).toHaveURL(/page=1|\/home\/all(?!\?page)/);
    });

    test('displays correct page number in pagination', async ({ page }) => {
        await page.goto('/home/all?page=2');
        await page.waitForResponse(response => response.url().includes('Course/getCoursesByFilter') && response.status() === 200);

        // Proveri da li je stranica 2 aktivna (highlight)
        const activePage = page.locator('.page-button').filter({ hasText: /^2$/ });
        await expect(activePage).toHaveClass(/bg-blue-500|border-blue-500|text-blue/);
    });

    test('disables previous on first page and next on last page', async ({ page }) => {
        const prevButton = page.locator('.previous-button');
        if (await prevButton.isVisible()) {
            await expect(prevButton).toBeDisabled();
        }

        const paginationButtons = page.locator('.page-button').filter({ hasText: /^\d+$/ });
        const buttonTexts = await paginationButtons.allTextContents();
        const pageNumbers = buttonTexts.map(text => parseInt(text)).filter(n => !isNaN(n));
        const maxPage = Math.max(...pageNumbers);

        if (maxPage > 1) {
            await page.locator('.page-button', { hasText: String(maxPage) }).click();
            await page.waitForResponse(response => response.url().includes('Course/getCoursesByFilter') && response.status() === 200);
        }

        const nextButton = page.locator('.next-button');
        if (await nextButton.isVisible()) {
            await expect(nextButton).toBeDisabled();
        }
    });
});

test.describe('AllCourses - filtering', () => {
    test.beforeEach(async ({ page }) => {
        await loginTestUser(page);
        await page.goto('/home/all');
    });

    test('filters courses by name', async ({ page }) => {
        // Otvori filtere ako su zatvoreni
        const showFiltersButton = page.locator('.show-hide-button');
        if (await showFiltersButton.isVisible() && await showFiltersButton.textContent() === 'Prikaži') {
            await showFiltersButton.click();
        }

        // Unesi naziv kursa
        await page.fill('input[name="name"]', 'test');
        await page.getByRole('button', { name: /primeni filtere/i }).click();

        await expect(page).toHaveURL(/name=test/);
    });

    test('filters courses by difficulty', async ({ page }) => {
        const showFiltersButton = page.locator('.show-hide-button');
        if (await showFiltersButton.isVisible() && await showFiltersButton.textContent() === 'Prikaži') {
            await showFiltersButton.click();
        }

        // Izaberi težinu
        await page.selectOption('select[name="difficulty"]', { index: 1 }); // Izaberi prvu opciju (Easy)
        await page.getByRole('button', { name: /primeni filtere/i }).click();

        await expect(page).toHaveURL(/difficulty=/);
    });

    test('filters courses by duration range', async ({ page }) => {
        const showFiltersButton = page.locator('.show-hide-button');
        if (await showFiltersButton.isVisible() && await showFiltersButton.textContent() === 'Prikaži') {
            await showFiltersButton.click();
        }

        // Unesi min i max trajanje
        await page.fill('input[name="minDurationInWeeks"]', '1');
        await page.fill('input[name="maxDurationInWeeks"]', '10');
        await page.getByRole('button', { name: /primeni filtere/i }).click();

        await expect(page).toHaveURL(/minDurationInWeeks=1/);
        await expect(page).toHaveURL(/maxDurationInWeeks=10/);
    });

    test('resets filters', async ({ page }) => {
        const showFiltersButton = page.locator('.show-hide-button');
        if (await showFiltersButton.isVisible() && await showFiltersButton.textContent() === 'Prikaži') {
            await showFiltersButton.click();
        }

        // Primeni filter
        await page.fill('input[name="name"]', 'test');
        await page.getByRole('button', { name: /primeni filtere/i }).click();
        await expect(page).toHaveURL(/name=test/);

        // Resetuj
        await page.getByRole('button', { name: /resetuj/i }).click();

        // Proveri da li je input prazan
        const nameInput = page.locator('input[name="name"]');
        await expect(nameInput).toHaveValue('');
    });

    test('combines multiple filters', async ({ page }) => {
        const showFiltersButton = page.locator('.show-hide-button');
        if (await showFiltersButton.isVisible() && await showFiltersButton.textContent() === 'Prikaži') {
            await showFiltersButton.click();
        }

        // Primeni više filtera odjednom
        await page.fill('input[name="name"]', 'course');
        await page.fill('input[name="minDurationInWeeks"]', '2');
        await page.selectOption('select[name="difficulty"]', { index: 2 }); // Medium

        await page.getByRole('button', { name: /primeni filtere/i }).click();

        await expect(page).toHaveURL(/name=course/);
        await expect(page).toHaveURL(/minDurationInWeeks=2/);
        await expect(page).toHaveURL(/difficulty=/);
    });

    test('shows empty results when no courses match filters', async ({ page }) => {
        const showFiltersButton = page.locator('.show-hide-button');
        if (await showFiltersButton.isVisible() && await showFiltersButton.textContent() === 'Prikaži') {
            await showFiltersButton.click();
        }

        await page.fill('input[name="name"]', '___NO_MATCH___');
        await page.getByRole('button', { name: /primeni filtere/i }).click();
        await page.waitForResponse(response => response.url().includes('Course/getCoursesByFilter') && response.status() === 200);

        await expect(page.locator('.course-card')).toHaveCount(0);
    });
});

test.describe('AllCourses - sorting', () => {
    test.beforeEach(async ({ page }) => {
        await loginTestUser(page);
        await page.goto('/home/all');
    });

    test('sorts courses by name', async ({ page }) => {
        const showFiltersButton = page.locator('.show-hide-button');
        if (await showFiltersButton.isVisible() && await showFiltersButton.textContent() === 'Prikaži') {
            await showFiltersButton.click();
        }

        await page.selectOption('select[name="sort"]', { value: SortByOptionsType.name.toString() });
        await page.getByRole('button', { name: /primeni filtere/i }).click();

        await expect(page).toHaveURL(/sort=/);
    });

    test('sorts courses by duration ascending', async ({ page }) => {
        const showFiltersButton = page.locator('.show-hide-button');
        if (await showFiltersButton.isVisible() && await showFiltersButton.textContent() === 'Prikaži') {
            await showFiltersButton.click();
        }

        await page.selectOption('select[name="sort"]', { value: SortByOptionsType.ascDuration.toString() });
        await page.getByRole('button', { name: /primeni filtere/i }).click();

        await expect(page).toHaveURL(/sort=/);
    });

    test('sorts courses by duration descending', async ({ page }) => {
        const showFiltersButton = page.locator('.show-hide-button');
        if (await showFiltersButton.isVisible() && await showFiltersButton.textContent() === 'Prikaži') {
            await showFiltersButton.click();
        }

        await page.selectOption('select[name="sort"]', { value: SortByOptionsType.descDuration.toString() });
        await page.getByRole('button', { name: /primeni filtere/i }).click();

        await expect(page).toHaveURL(/sort=/);
    });

    test('combines difficulty filter with duration descending sort', async ({ page }) => {
        const showFiltersButton = page.locator('.show-hide-button');
        if (await showFiltersButton.isVisible() && await showFiltersButton.textContent() === 'Prikaži') {
            await showFiltersButton.click();
        }

        await page.selectOption('select[name="difficulty"]', { value: DificultyType.Easy.toString() });
        await page.selectOption('select[name="sort"]', { value: SortByOptionsType.descDuration.toString() });
        await page.getByRole('button', { name: /primeni filtere/i }).click();

        await page.waitForResponse(response => response.url().includes('Course/getCoursesByFilter') && response.status() === 200);

        await expect(page).toHaveURL(new RegExp(`difficulty=${DificultyType.Easy}`));
        await expect(page).toHaveURL(new RegExp(`sort=${SortByOptionsType.descDuration}`));

        const difficultyBadges = await page.locator('.course-card .difficulty').allTextContents();
        const hasEasyBadges = difficultyBadges.every(badge =>
            badge.toLowerCase() === DificultyTypeToString[DificultyType.Easy].toLowerCase()
        );
        expect(hasEasyBadges).toBeTruthy();

        const durationTexts = await page.locator('.course-card .duration-in-weeks').allTextContents();
        const durations = durationTexts.map(text => {
            const match = text.match(/(\d+)/);
            return match ? parseInt(match[1]) : 0;
        }).filter(d => d > 0);

        for (let i = 0; i < durations.length - 1; i++) {
            expect(durations[i]).toBeGreaterThanOrEqual(durations[i + 1]);
        }
    });
});

test.describe('AllCourses - filter collapse/expand', () => {
    test.beforeEach(async ({ page }) => {
        await loginTestUser(page);
        await page.goto('/home/all');
    });

    test('collapses and expands filters', async ({ page }) => {
        // Proveri da li su filtri prikazani po defaultu
        const nameInput = page.locator('input[name="name"]');
        const toggleButton = page.locator('.show-hide-button');

        // Ako su prikazani, sakrij ih
        const buttonText = await toggleButton.textContent();
        if (buttonText?.includes('Sakrij')) {
            await toggleButton.click();
            await expect(nameInput).not.toBeVisible();
        }

        // Prikaži ih ponovo
        await toggleButton.click();
        await expect(nameInput).toBeVisible();
    });
});

test.describe('AllCourses - URL persistence', () => {
    test.beforeEach(async ({ page }) => {
        await loginTestUser(page);
    });

    test('persists filters in URL on page reload', async ({ page }) => {
        await page.goto('/home/all?name=test&page=2&difficulty=1');
        await page.reload();

        // Proveri da li su parametri i dalje u URL-u
        await expect(page).toHaveURL(/name=test/);
        await expect(page).toHaveURL(/page=2/);
        await expect(page).toHaveURL(/difficulty=1/);
    });

    test('restores filter state from URL', async ({ page }) => {
        await page.goto('/home/all?name=testcourse&minDurationInWeeks=5');

        // Proveri da li su inputi popunjeni sa vrednostima iz URL-a
        const showFiltersButton = page.locator('.show-hide-button');
        if (await showFiltersButton.isVisible() && await showFiltersButton.textContent() === 'Prikaži') {
            await showFiltersButton.click();
        }

        const nameInput = page.locator('input[name="name"]');
        await expect(nameInput).toHaveValue('testcourse');

        const minDurationInput = page.locator('input[name="minDurationInWeeks"]');
        await expect(minDurationInput).toHaveValue('5');
    });
});

test.describe('AllCourses - data validation', () => {
    test.beforeEach(async ({ page }) => {
        await loginTestUser(page);
        await page.goto('/home/all');
    });

    test('displays correct number of courses per page', async ({ page }) => {
        // Sačekaj da se učitaju podaci
        await page.waitForLoadState('networkidle');
        await expect(page.locator('.course-card').first()).toBeVisible();

        // Proveri da li je prikazano tačno 8 kurseva na prvoj stranici (ili manje ako ih ima manje)
        const courseCards = await page.locator('.course-card').count();
        const expectedCoursesOnPage = Math.min(8, seededCourses.length);
        expect(courseCards).toBeLessThanOrEqual(8);
        expect(courseCards).toBeGreaterThan(0);
    });

    test('displays correct total number of pages', async ({ page }) => {
        await page.waitForLoadState('networkidle');
        // Ukupan broj stranica treba biti ceil(totalCourses / 8)
        const expectedPages = Math.ceil(seededCourses.length / 8);

        // Pronađi pagination dugme sa najvećim brojem
        const paginationButtons = page.locator('.page-button').filter({ hasText: /^\d+$/ });
        const buttonTexts = await paginationButtons.allTextContents();
        const pageNumbers = buttonTexts.map(text => parseInt(text)).filter(n => !isNaN(n));
        const maxPage = Math.max(...pageNumbers);

        expect(maxPage).toBe(expectedPages);
    });

    test('filters by name display only matching courses', async ({ page }) => {
        // Otvori filtere
        const showFiltersButton = page.locator('.show-hide-button');
        if (await showFiltersButton.isVisible() && await showFiltersButton.textContent() === 'Prikaži') {
            await showFiltersButton.click();
        }

        // Uzmi prvi kurs iz seeded podataka
        const firstCourseName = seededCourses[0]?.name;
        if (!firstCourseName) {
            console.warn('No seeded courses available for testing');
            return;
        }

        // Pretražuj po delu naziva
        const searchTerm = firstCourseName.substring(0, 5);
        await page.fill('input[name="name"]', searchTerm);
        await page.getByRole('button', { name: /primeni filtere/i }).click();


        // Proveri da svi prikazani kursevi sadrže search term u nazivu na svakoj stranici
        do {
            await page.waitForResponse(response => response.url().includes('Course/getCoursesByFilter') && response.status() === 200);

            const courseTitles = await page.locator('.course-card .name').allTextContents();
            expect(courseTitles.every(title => title.toLowerCase().includes(searchTerm.toLowerCase()))).toBeTruthy();
            const nextButton = page.locator('.next-button');
            if (await nextButton.isVisible() && !(await nextButton.isDisabled())) {
                await nextButton.click();
            } else {
                break;
            }
        } while (true);
    });

    test('filters by difficulty display only courses with that difficulty', async ({ page }) => {
        const showFiltersButton = page.locator('.show-hide-button');
        if (await showFiltersButton.isVisible() && await showFiltersButton.textContent() === 'Prikaži') {
            await showFiltersButton.click();
        }

        // Izaberi Easy težinu (difficulty = 0)
        await page.selectOption('select[name="difficulty"]', { value: DificultyType.Easy.toString() }); // Easy
        await page.getByRole('button', { name: /primeni filtere/i }).click();

        await page.waitForResponse(response => response.url().includes('Course/getCoursesByFilter') && response.status() === 200);

        // Proveri da li URL sadrži difficulty=0
        await expect(page).toHaveURL(new RegExp(`difficulty=${DificultyType.Easy}`));

        // Proveri da li su prikazani samo kursevi sa Easy težinom
        // (mora da se prilagodi selektoru gde se prikazuje težina na kartici)
        do {

            const difficultyBadges = await page.locator('.course-card .difficulty').allTextContents();
            // Svi prikazani badge-ovi treba da sadrže "Easy" ili "Лако" ili sličan termin
            const hasEasyBadges = difficultyBadges.every(badge =>
                badge.toLowerCase() === DificultyTypeToString[DificultyType.Easy].toLowerCase()
            );

            expect(hasEasyBadges).toBeTruthy();
            const nextButton = page.locator('.next-button');
            if (await nextButton.isVisible() && !(await nextButton.isDisabled())) {
                await nextButton.click();
                await page.waitForResponse(response => response.url().includes('Course/getCoursesByFilter') && response.status() === 200);
            } else {
                break;
            }
        }
        while (true);
    });

    test('filters by duration range display only matching courses', async ({ page }) => {
        const showFiltersButton = page.locator('.show-hide-button');
        if (await showFiltersButton.isVisible() && await showFiltersButton.textContent() === 'Prikaži') {
            await showFiltersButton.click();
        }

        // Postavi opseg trajanja 
        await page.fill('input[name="minDurationInWeeks"]', '5');
        await page.fill('input[name="maxDurationInWeeks"]', '15');
        await page.getByRole('button', { name: /primeni filtere/i }).click();

        await page.waitForResponse(response => response.url().includes('Course/getCoursesByFilter') && response.status() === 200);

        // Proveri URL parametre
        await expect(page).toHaveURL(/minDurationInWeeks=5/);
        await expect(page).toHaveURL(/maxDurationInWeeks=15/);

        // Proveri da li su svi prikazani kursevi u zadatom opsegu na svakoj stranici
        do {
            const durations = await page.locator('.course-card .duration-in-weeks').allTextContents();
            expect(durations.length).toBeGreaterThan(0);
            for (const text of durations) {
                const match = text.match(/(\d+)/);
                const weeks = match ? parseInt(match[1]) : 0;
                expect(weeks).toBeGreaterThanOrEqual(5);
                expect(weeks).toBeLessThanOrEqual(15);
            }
            const nextButton = page.locator('.next-button');
            if (await nextButton.isVisible() && !(await nextButton.isDisabled())) {
                await nextButton.click();
                await page.waitForResponse(response => response.url().includes('Course/getCoursesByFilter') && response.status() === 200);
            } else {
                break;
            }
        } while (true);
    });

    test('sorting by duration ascending shows courses in correct order', async ({ page }) => {
        const showFiltersButton = page.locator('.show-hide-button');
        if (await showFiltersButton.isVisible() && await showFiltersButton.textContent() === 'Prikaži') {
            await showFiltersButton.click();
        }


        // Sortiraj po trajanju rastuće
        await page.selectOption('select[name="sort"]', { value: SortByOptionsType.ascDuration.toString() });
        await page.getByRole('button', { name: /primeni filtere/i }).click();
        await page.waitForResponse(response => response.url().includes('Course/getCoursesByFilter') && response.status() === 200);


        // Proveri da li su svi prikazani kursevi sortirani rastuće po trajanju na svakoj stranici
        let prevLast = undefined;
        do {

            const durationTexts = await page.locator('.course-card .duration-in-weeks').allTextContents();
            const durations = durationTexts.map(text => {
                const match = text.match(/(\d+)/);
                return match ? parseInt(match[1]) : 0;
            }).filter(d => d > 0);
            for (let i = 0; i < durations.length - 1; i++) {
                expect(durations[i]).toBeLessThanOrEqual(durations[i + 1]);
            }
            if (prevLast !== undefined && durations.length > 0) {
                expect(prevLast).toBeLessThanOrEqual(durations[0]);
            }
            prevLast = durations[durations.length - 1];
            const nextButton = page.locator('.next-button');
            if (await nextButton.isVisible() && !(await nextButton.isDisabled())) {
                await nextButton.click();
                await page.waitForResponse(response => response.url().includes('Course/getCoursesByFilter') && response.status() === 200);
                await page.waitForSelector('.course-card .duration-in-weeks');
            } else {
                break;
            }
        } while (true);
    });

    test('sorting by duration descending shows courses in correct order', async ({ page }) => {
        const showFiltersButton = page.locator('.show-hide-button');
        if (await showFiltersButton.isVisible() && await showFiltersButton.textContent() === 'Prikaži') {
            await showFiltersButton.click();
        }

        // Sortiraj po trajanju opadajuće
        await page.selectOption('select[name="sort"]', { value: SortByOptionsType.descDuration.toString() });
        await page.getByRole('button', { name: /primeni filtere/i }).click();

        await page.waitForResponse(response => response.url().includes('Course/getCoursesByFilter') && response.status() === 200);

        // Proveri da li su svi prikazani kursevi sortirani opadajuće po trajanju na svakoj stranici
        let prevLast = undefined;
        do {
            const durationTexts = await page.locator('.course-card .duration-in-weeks').allTextContents();
            const durations = durationTexts.map(text => {
                const match = text.match(/(\d+)/);
                return match ? parseInt(match[1]) : 0;
            }).filter(d => d > 0);
            for (let i = 0; i < durations.length - 1; i++) {
                expect(durations[i]).toBeGreaterThanOrEqual(durations[i + 1]);
            }
            if (prevLast !== undefined && durations.length > 0) {
                expect(prevLast).toBeGreaterThanOrEqual(durations[0]);
            }
            prevLast = durations[durations.length - 1];
            const nextButton = page.locator('.next-button');
            if (await nextButton.isVisible() && !(await nextButton.isDisabled())) {
                await nextButton.click();
                await page.waitForResponse(response => response.url().includes('Course/getCoursesByFilter') && response.status() === 200);
                await page.waitForSelector('.course-card .duration-in-weeks');
            } else {
                break;
            }
        } while (true);
    });

    test('pagination shows different courses on different pages', async ({ page }) => {
        // Uzmi nazive kurseva sa prve stranice
        const firstPageCourses = await page.locator('.course-card h2').allTextContents();

        // Idi na drugu stranicu
        await page.locator('.next-button').click();
        await page.waitForResponse(response => response.url().includes('Course/getCoursesByFilter') && response.status() === 200);
        await expect(page).toHaveURL(/page=2/);

        // Uzmi nazive kurseva sa druge stranice
        const secondPageCourses = await page.locator('.course-card h2').allTextContents();

        // Proveri da kursevi nisu isti (da nema preklapanja)
        const overlap = firstPageCourses.some(course => secondPageCourses.includes(course));
        expect(overlap).toBeFalsy();
    });
});