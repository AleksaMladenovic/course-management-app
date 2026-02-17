import { DTOCourseResponse } from '../../src/interfaces/DTOCourseResponse'; // Adjust the path to where your DTOs are defined

export const makeTestEmail = (prefix: string) => {
    const stamp = Date.now() - Math.floor(Math.random() * 1000000);
    return `test-${prefix}-${stamp}@test.com`;
};

export const fillRegisterForm = async (page: any, data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dob: string;
    password: string;
    confirmPassword: string;
}) => {
    await page.fill('input[name="firstName"]', data.firstName);
    await page.fill('input[name="lastName"]', data.lastName);
    await page.fill('input[name="email"]', data.email);
    await page.fill('input[name="phone"]', data.phone);
    await page.fill('input[name="dob"]', data.dob);
    await page.fill('input[name="password"]', data.password);
    await page.fill('input[name="confirmPassword"]', data.confirmPassword);
};


export const fillLoginForm = async (page: any, data: {
  email: string;
  password: string;
}) => {
  await page.fill('input[name="email"]', data.email);
  await page.fill('input[name="password"]', data.password);
};

// Helper za seedovanje kurseva i autora
export const seedCoursesAndAuthor = async (request: any) => {
  // Prvo seeduj autora
  const authorEmail = makeTestEmail('seed-author');
  const authorPassword = 'test1234';
  
  // Kreiraj autora kroz backend (registracija ili direktno u bazu)
  // Za sada predpostavljamo da seed api kreira i autora
  
  const response = await request.post('http://localhost:5173/api/Seed/seed-random-courses');
  return {
    courses: response.data as DTOCourseResponse[],
    authorEmail,
    authorPassword
  };
};

// Helper za login korisnika (bez registracije)
export const loginUser = async (page: any, email: string, password: string) => {
  await page.goto('/login');
  await fillLoginForm(page, { email, password });
  await page.getByRole('button', { name: 'Prijavi se' }).click();
  await page.waitForURL('/');
};

// Helper function to add a lesson
export const addLessonHelper = async (page: any, lessonName: string, duration: number, description: string) => {
  await page.locator('.add-lesson-button').click();
  const lessonForm = page.getByText('Nova Lekcija').locator('..');
  await lessonForm.locator('input').first().fill(lessonName);
  await lessonForm.locator('input[type="number"]').fill(String(duration));
  await lessonForm.locator('textarea').fill(description);
  await Promise.all([
    page.waitForResponse((res: any) => res.url().includes('/Lessons/addLesson/') && res.status() === 200),
    page.locator('.save-lesson-button').click(),
  ]);
  await page.waitForSelector('.lesson-div .lesson-name');
};