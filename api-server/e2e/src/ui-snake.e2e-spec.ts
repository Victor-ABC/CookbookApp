/* Autor: Victor Corbet */

import { chromium, ChromiumBrowser, Page, ChromiumBrowserContext } from 'playwright';
const configFile = require('./config.json');

let browser: ChromiumBrowser;
let browserContext: ChromiumBrowserContext;
let page: Page;
const name = 'Max';
const password = 'h4llo?flo+M';

async function singUpUserAndGoToProfile(name: string, password: string, browser: ChromiumBrowser) {
  browserContext = await browser.newContext();
  page = await browserContext.newPage();
  await page.goto('http://localhost:8080/');
  await page.click('text=Konto erstellen');
  await page.fill('input[name="name"]', name);
  await page.fill('input[name="email"]', `${name}@${name}.de`);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="passwordCheck"]', password);
  await Promise.all([
    page.waitForNavigation({ url: 'http://localhost:8080/app/api' }),
    page.click('button:has-text("Konto erstellen")')
  ]);
  await Promise.all([
    page.waitForNavigation({ url: 'http://localhost:8080/app/users/profile' }),
    page.click('text=Mein Profil')
  ]);
  return page;
}

describe('User-Interface: Snake-Game: ', () => {
  beforeAll(async () => {
    browser = await chromium.launch({
      headless: configFile.headless
    });
    page = await singUpUserAndGoToProfile(name, password, browser);
  });
  afterAll(async () => {
    await page.close();
    await browserContext.close();
    await browser.close();
  });

  it('should start the game', async () => {
    await page.click('text=Kuchen im Backofen? Suppe auf dem Herd? Hier ein kleiner Zeitvertreib');
    await page.selectOption(
      'text=Grün Blau Rot Regenbogen Klein Mittel Groß XXL Langsam Normal Schnell Start show >> select',
      'rainbow'
    );
    await page.selectOption('#scale-select', '30');
    await page.selectOption('#speed-select', '180');
    await page.click('text=Start');

    const gameHeaderClass = await page.getAttribute('#game-header-container', 'class');
    expect(gameHeaderClass).toContain('hidden');
  });
});
