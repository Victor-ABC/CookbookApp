/* Autor: Felix Schaphaus */

import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { UserSession } from './user-session';
import config from './config';

describe('/cookbooks/details/id', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let userSession: UserSession;

  beforeAll(async () => {
    browser = await chromium.launch(config.launchOptions);
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    context = await browser.newContext();
    page = await context.newPage();
    userSession = new UserSession(context);
    await userSession.registerUser();

    // create cookbook
    await page.goto(config.clientUrl('/my-cookbooks'));
    await page.fill('#title', 'Meine Backrezepte');
    await page.keyboard.press('Enter');
  });

  afterEach(async () => {
    await userSession.deleteUser();
    await context.close();
  });

  it('should render the cookbook', async () => {
    await Promise.all([page.waitForNavigation(), await page.click('app-cookbook-list-item span[slot="title"]')]);

    // validate title
    const title = await page.textContent('h1');
    expect(title).toBe('Meine Backrezepte');

    // validate description
    const description = await page.textContent('span.description');
    expect(description).toBe('');

    // validate author
    const author = await page.textContent('span.author');
    expect(author?.trim()).toBe(userSession.name);
  });

  it('should update the cookbook', async () => {
    await Promise.all([page.waitForNavigation(), await page.click('app-cookbook-list-item span[slot="title"]')]);
    // update cookbook
    await page.check('label:text-is("Bearbeiten")');
    await page.waitForSelector('form');

    await page.fill('#new-title', 'Meine Kuchenrezepte');
    await page.fill('#new-description', 'Meine leckersten Kuchen');
    await Promise.all([page.waitForResponse('**'), await page.click('button:text-is("Speichern")')]);

    // validate new title and description
    const title = await page.textContent('h1');
    expect(title).toBe('Meine Kuchenrezepte');

    const description = await page.textContent('span.description');
    expect(description).toBe('Meine leckersten Kuchen');
  });
});
