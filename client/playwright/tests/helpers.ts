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