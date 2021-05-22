import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { UserSession } from './user-session';
import config from './config';

describe('my-cookbooks', () => {
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
    await page.goto(config.clientUrl('/my-cookbooks'));
    const title = await page.textContent('h1');
    expect(title).toBe(`${userSession.name}'s Kochbücher`);
  });

  it('should dislpay no cookbooks message', async () => {
    await page.goto(config.clientUrl('/my-cookbooks'));
    const msg = await page.textContent('.no-cookbooks');
    expect(msg).toBe('Es wurde noch kein Kochbuch erstellt.');
  });

  it('should add a new cookbook', async () => {
    // create cookbook
    await page.goto(config.clientUrl('/my-cookbooks'));
    await page.fill('#title', 'Meine Backrezepte');
    await page.keyboard.press('Enter');

    // validate created cookbook
    expect(await page.textContent('app-cookbook-list-item span[slot="title"]')).toBe('Meine Backrezepte');
    expect(await page.textContent('app-cookbook-list-item span[slot="description"]')).toBe(
      'Diesem Kochbuch wurde noch keine Beschreibung hinzugefügt.'
    );

    // validate that no cookbooks message is hidden
    const noCookbooks = await page.$eval('.no-cookbooks', (el: HTMLElement) => el.style.display);
    expect(noCookbooks).toBe('none');
  });

  it('should fail to add a cookbook with no title', async () => {
    await page.goto(config.clientUrl('/my-cookbooks'));
    await page.fill('#title', '');
    await page.keyboard.press('Enter');
    expect(await page.$('app-cookbook-list-item')).toBeNull();
  });

  it('should delete a cookbook', async () => {
    // create cookbook
    await page.goto(config.clientUrl('/my-cookbooks'));
    await page.fill('#title', 'Meine Backrezepte');
    await page.keyboard.press('Enter');

    // validate created cookbook
    expect(await page.textContent('app-cookbook-list-item span[slot="title"]')).toBe('Meine Backrezepte');

    // delete cookbook
    await page.click('app-cookbook-list-item .remove-cookbook', { delay: 1000 });

    // validate deleted cookbook
    expect(await page.$('app-cookbook-list-item')).toBeNull();
  });

  it('should open the cookbook', async () => {
    // create cookbook
    await page.goto(config.clientUrl('/my-cookbooks'));
    await page.fill('#title', 'Meine Backrezepte');
    await page.keyboard.press('Enter');

    // validate url change
    const url = await page.url();
    await page.click('app-cookbook-list-item span[slot="title"]', { delay: 1000 });
    expect(url).not.toBe(await page.url());
    expect(await page.url().endsWith('?own')).toBeTrue();
  });
});
