/* Autor: Victor Corbet */

import { chromium, ChromiumBrowser, Page, ChromiumBrowserContext } from 'playwright';
const configFile = require('./config.json');

let browser: ChromiumBrowser;
let browserContext: ChromiumBrowserContext;
let page: Page;

describe('User-Interface: Testing sing-up', () => {
  beforeAll(async () => {
    browser = await chromium.launch({
      headless: configFile.headless
    });
  });
  afterAll(async () => {
    await browser.close();
  });
  beforeEach(async () => {
    browserContext = await browser.newContext();
    page = await browserContext.newPage();
  });
  afterEach(async () => {
    await page.close();
  });

  it('should not be possible to create two users with the same Name', async () => {
    await page.goto('http://localhost:8080/');
    await page.click('text=Konto erstellen');
    await page.click('input[name="name"]');
    await page.fill('input[name="name"]', 'simon');
    await page.press('input[name="name"]', 'Tab');
    await page.press('text=Name vergeben?', 'Enter');
    await page.press('text=Name vergeben?', 'Tab');
    await page.fill('input[name="email"]', 'simon');
    await page.press('input[name="email"]', 'AltGraph');
    await page.fill('input[name="email"]', 'simon@simon.de');
    await page.press('input[name="email"]', 'Tab');
    await page.fill('input[name="password"]', '1234512345');
    await page.press('input[name="password"]', 'Tab');
    await page.fill('input[name="passwordCheck"]', '1234512345');
    await Promise.all([
      page.waitForNavigation({ url: 'http://localhost:8080/app/api' }),
      page.click('button:has-text("Konto erstellen")')
    ]);
    await page.click('text=Konto erstellen');
    await page.click('input[name="name"]');
    await page.fill('input[name="name"]', 'simon');
    await page.click('text=Name vergeben?');
    const message = await page.textContent('#name-check');
    const classAttribute = await page.getAttribute('#name-check', 'class');
    expect(message).toBe('Name ist bereits vergeben');
    expect(classAttribute).toBe('error');
  });

  it('should render a green text saying that this name is available', async () => {
    await page.goto('http://localhost:8080/');
    await page.click('text=Konto erstellen');
    await page.click('input[name="name"]');
    await page.fill('input[name="name"]', 'Maximilian');
    await page.click('text=Name vergeben?');
    const message = await page.textContent('#name-check');
    const classAttribute = await page.getAttribute('#name-check', 'class');
    expect(message).toBe('Name ist noch nicht vergeben');
    expect(classAttribute).toBe('success');
  });
});
