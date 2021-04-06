/* Autor: Victor Corbet */
// npx playwright codegen http://localhost:8080 -o code.js

import { chromium, ChromiumBrowser, Page, ChromiumBrowserContext } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
const configFile = require('./config.json');

let browser: ChromiumBrowser;
let browserContext: ChromiumBrowserContext;
let page: Page;
const password = 'h4llo?flo+M';

export async function singUpUserAndGoToProfile(name: string, password: string, browserContext: ChromiumBrowserContext) {
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
  });
  beforeEach(async () => {
    const uuid = uuidv4();
    browserContext = await browser.newContext();
    page = await singUpUserAndGoToProfile(uuid, password, browserContext);
  });
  afterEach(async () => {
    await page.close();
    await browserContext.close();
  });
  afterAll(async () => {
    await browser.close();
  });

  it('should start the game and hide header-section while playing', async () => {
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

  it('should show/hide arrow keys for smartphone devices by clicking the "#toggleVisibility" button ', async () => {
    await page.click('text=Kuchen im Backofen? Suppe auf dem Herd? Hier ein kleiner Zeitvertreib');
    await page.selectOption(
      'text=Grün Blau Rot Regenbogen Klein Mittel Groß XXL Langsam Normal Schnell Start show >> select',
      'blue'
    );
    await page.selectOption('#scale-select', '30');
    expect(await page.getAttribute('#flex-container-keys', 'value')).toBe('visible');
    await page.click('#toggleVisibility');
    expect(await page.getAttribute('#flex-container-keys', 'value')).toBe('invisible');
  });
});
