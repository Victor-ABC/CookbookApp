/* Autor: Victor Corbet */

import { chromium, ChromiumBrowser, Page, ChromiumBrowserContext } from 'playwright';
const configFile = require('./config.json');

let browser: ChromiumBrowser;
let browserContext: ChromiumBrowserContext;
let page: Page;
const name = 'Jonathan';
const password = 'h4llo?flo+M';

async function singUpUser(name: string, password: string, browser: ChromiumBrowser) {
  browserContext = await browser.newContext();
  page = await browserContext.newPage();
  await page.goto('http://localhost:8080/');
  await page.click('text=Konto erstellen');
  await page.fill('input[name="name"]', name);
  await page.fill('input[name="email"]', `${name}@${name}.de`);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="passwordCheck"]', password);
  await page.click('button:has-text("Konto erstellen")');
  return page;
}

describe('User-Interface: Testing sing-in / sign-out: ', () => {
  beforeAll(async () => {
    browser = await chromium.launch({
      headless: configFile.headless
    });
    page = await singUpUser(name, password, browser);
  });
  afterAll(async () => {
    await page.close();
    await browserContext.close();
    await browser.close();
  });

  it('should sign out when pressing sign out button', async () => {
    await page.click('text=Abmelden');
    await Promise.all([
      page.waitForNavigation({ url: 'http://localhost:8080/app/users/sign-in' }),
      page.click('text=Mein Profil')
    ]);
    expect(await page.url()).not.toBe('http://localhost:8080/app/users/profile'); // should redirect because user is logged out.
    expect(await page.url()).toBe('http://localhost:8080/app/users/sign-in'); // whenever a user is not signed-in; he should be redirected to sign-in.
  });

  it('should be able to sign in after creating an account and log out', async () => {
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
