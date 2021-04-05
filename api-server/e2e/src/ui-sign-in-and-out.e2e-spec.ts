/* Autor: Victor Corbet */

import { chromium, ChromiumBrowser, Page, ChromiumBrowserContext } from 'playwright';
import { singUpUserAndGoToProfile } from './ui-snake.e2e-spec';
import { v4 as uuidv4 } from 'uuid';
const configFile = require('./config.json');

let browser: ChromiumBrowser;
let browserContext: ChromiumBrowserContext;
let page: Page;
const password = 'h4llo?flo+M';
let name : string;



describe('User-Interface: Testing sing-in / sign-out: ', () => {
  beforeAll(async () => {
    browser = await chromium.launch({
      headless: configFile.headless
    });
  });
  beforeEach(async () => {
    name = uuidv4();
    browserContext = await browser.newContext();
    page = await singUpUserAndGoToProfile(name, password,  browserContext);
  });
  afterEach( async () => {
    await page.close();
    await browserContext.close();
  })
  afterAll(async () => {
    await browser.close();
  });

  it('(the user Profile) should only be accessable for signed-in Users', async () => {
    await page.click('text=Abmelden');
    await Promise.all([
      page.waitForNavigation({ url: 'http://localhost:8080/app/users/sign-in' }),
      page.click('text=Mein Profil')
    ]);
    expect(await page.url()).not.toBe('http://localhost:8080/app/users/profile'); // should redirect because user is logged out.
    expect(await page.url()).toBe('http://localhost:8080/app/users/sign-in'); // whenever a user is not signed-in; he should be redirected to sign-in.
  });

  it('should be able to sign in after creating an account and being loged out', async () => {
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
