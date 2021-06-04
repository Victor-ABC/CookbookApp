/* Autor: Victor Corbet */

import { chromium, ChromiumBrowser, Page, ChromiumBrowserContext } from 'playwright';
import { singUpUserAndGoToProfile } from './ui-snake.e2e-spec';
import { v4 as uuidv4 } from 'uuid';
const configFile = require('./config.json');

let browser: ChromiumBrowser;
let browserContext: ChromiumBrowserContext;
let page: Page;
const password = 'abAB12asd*!';
let name: string;

describe('User-Interface: Testing sing-in / sign-out: ', () => {
  beforeAll(async () => {
    browser = await chromium.launch({
      headless: configFile.headless,
      slowMo : configFile.slowMo
    });
  });
  beforeEach(async () => {
    name = uuidv4();
    browserContext = await browser.newContext();
    page = await singUpUserAndGoToProfile(name, password, browserContext);
  });
  afterEach(async () => {
    await page.close();
    await browserContext.close();
  });
  afterAll(async () => {
    await browser.close();
  });

  it('(the user Profile) should only be accessable for signed-in Users', async () => {
    await page.click('text=Abmelden');
    const element = await page.$('text=Mein Profil');
    expect(element).toBeNull();
  });

  it('should not be possible to sign-out, if you are not signed in', async () => {
    await page.click('text=Abmelden');
    await page.waitForTimeout(100);
    // waiting for event to trigger render on component by
    // chanching property.
    const element = await page.$('text=Abmelden');
    expect(element).toBeNull();
  });

  it('should be able to sign in after creating an account and being loged out', async () => {
    await page.click('text=Abmelden');
    await page.click('text=Anmelden');
    await page.click('input[name="name"]');
    await page.fill('input[name="name"]', name);
    await page.click('input[name="password"]');
    await page.fill('input[name="password"]', password);
    await Promise.all([
      page.waitForNavigation({ url: 'http://localhost:8080/app/rezepte' }),
      page.click('button:has-text("Anmelden")')
    ]);
    await page.click('text=Mein Profil');
    expect(await page.url()).toBe('http://localhost:8080/app/users/profile'); // should work because user should be signed in.
  });
});
