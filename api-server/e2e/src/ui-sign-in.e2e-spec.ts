/* Autor: Victor Corbet */

import { chromium, ChromiumBrowser, Page , ChromiumBrowserContext } from 'playwright';
const configFile = require('./config.json');

let browser: ChromiumBrowser;
let browserContext : ChromiumBrowserContext;
let page: Page;

async function singUpUser (name : string , browser : ChromiumBrowser) {
    browserContext = await browser.newContext();
    page = await browserContext.newPage();
    await page.goto('http://localhost:8080/');
    await page.click('text=Konto erstellen');
    await page.fill('input[name="name"]', name);
    await page.fill('input[name="email"]', `${name}@${name}.de`);
    await page.fill('input[name="password"]', '1234512345');
    await page.fill('input[name="passwordCheck"]', '1234512345');
    await Promise.all([
      page.waitForNavigation({ url: 'http://localhost:8080/app/api' }),
      page.click('button:has-text("Konto erstellen")')
    ]);
    return page;
}

describe('User-Interface: Testing sing-in' , () => {

  beforeAll(async () => {
    browser = await chromium.launch({
      headless: configFile.headless
    });
  });
  afterAll(async () => {
    await browser.close();
  });

  it('should not be possible to create two users with the same Name', async () => {
    let page = await singUpUser("freddi" , browser);
    await page.goto('http://localhost:8080/');
  });

})