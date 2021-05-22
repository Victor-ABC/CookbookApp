/* Autor: Felix Schaphaus */

import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { UserSession } from './user-session';
import config from './config';

describe('/cookbooks', () => {
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
  });

  afterEach(async () => {
    await userSession.deleteUser();
    await context.close();
  });

  it('should render the title', async () => {
    await Promise.all([page.waitForNavigation(), await page.goto(config.clientUrl('/cookbooks'))]);
    const title = await page.textContent('h1');
    expect(title).toBe('Alle Kochbücher');
  });

  it('should not render form to add cookbook', async () => {
    await Promise.all([page.waitForNavigation(), await page.goto(config.clientUrl('/cookbooks'))]);
    expect(await page.$('#title')).toBeNull();
  });
});
