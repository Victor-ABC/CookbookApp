/* Autor: Victor Corbet */

import { chromium, ChromiumBrowser, Page, ChromiumBrowserContext } from 'playwright';
import { singUpUserAndGoToProfile } from './ui-snake.e2e-spec';
const configFile = require('./config.json');

let browser: ChromiumBrowser;
let browserContext: ChromiumBrowserContext;
let page: Page;

describe('User-Interface: Testing sing-up', () => {
  beforeAll(async () => {
    browser = await chromium.launch({
      headless: configFile.headless,
      slowMo: configFile.slowMo
    });
  });
  beforeEach(async () => {
    browserContext = await browser.newContext();
  });
  afterEach(async () => {
    await page.close();
    await browserContext.close();
  });
  afterAll(async () => {
    await browser.close();
  });

  it('should not be possible to create two users with the same Name', async () => {
    page = await singUpUserAndGoToProfile('victor', '1234567890', browserContext);
    await page.click('text=Abmelden');
    await page.click('text=Konto erstellen');
    await page.click('input[name="name"]');
    await page.fill('input[name="name"]', 'victor');
    await page.click('text=Name vergeben?');
    await page.waitForResponse(
      response => response.url() === 'http://localhost:3000/api/users/exists' && response.status() === 401
    );
    const message = await page.textContent('#name-check');
    const classAttribute = await page.getAttribute('#name-check', 'class');
    expect(message).toBe('Name ist bereits vergeben');
    expect(classAttribute).toBe('error');
  });

  it('should render a green text saying that this name is available', async () => {
    page = await browserContext.newPage();
    await page.goto('http://localhost:8080/app');
    await page.click('text=Konto erstellen');
    await page.click('input[name="name"]');
    await page.fill('input[name="name"]', 'Maximilian');
    await page.click('text=Name vergeben?');
    await page.waitForResponse(
      response => response.url() === 'http://localhost:3000/api/users/exists' && response.status() === 200
    );
    const message = await page.textContent('#name-check');
    const classAttribute = await page.getAttribute('#name-check', 'class');
    expect(message).toBe('Name ist noch nicht vergeben');
    expect(classAttribute).toBe('success');
  });
});
