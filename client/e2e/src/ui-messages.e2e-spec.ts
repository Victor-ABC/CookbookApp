/* Autor: Victor Corbet */

import { chromium, ChromiumBrowser, Page, ChromiumBrowserContext } from 'playwright';
import { singUpUserAndGoToProfile } from './ui-snake.e2e-spec';
const configFile = require('./config.json');

let browser: ChromiumBrowser;
let browserContext: ChromiumBrowserContext;
let browserContext2: ChromiumBrowserContext;
let page: Page;
const password = 'abAB12asd*!'; //alle user use the same password in the texts

describe('User-Interface: Message-Service: ', () => {
  beforeAll(async () => {
    browser = await chromium.launch({
      headless: configFile.headless,
      slowMo: configFile.slowMo
    });
  });
  beforeEach(async () => {
    // simulate 2 User Szenario
    browserContext = await browser.newContext();
    browserContext2 = await browser.newContext();
  });
  afterEach(async () => {
    await page.close();
    await browserContext.close();
  });
  afterAll(async () => {
    await browser.close();
  });

  it('should check (user A), if user B exists -> success <- ', async () => {
    const userB = 'Frank';
    const userA = 'Tobias';
    page = await singUpUserAndGoToProfile(userB, password, browserContext2);
    await page.click('text=Abmelden');
    page.close();
    page = await singUpUserAndGoToProfile(userA, password, browserContext);
    await page.click('text=Nachricht Senden refresh');
    await page.click('input[name="name"]');
    await page.fill('input[name="name"]', userB);
    await page.click('text=Name existiert?');
    const message = await page.waitForSelector('#name-check', { state: 'attached', timeout: 0 });
    expect(await message.textContent()).toBe('Benutzer existiert');
  });
  it('should check (user A), if user B exists -> error <- ', async () => {
    const userB = 'Frank2';
    const userA = 'Tobias2';
    page = await singUpUserAndGoToProfile(userB, password, browserContext2);
    await page.click('text=Abmelden');
    page.close();
    page = await singUpUserAndGoToProfile(userA, password, browserContext);
    await page.click('text=Nachricht Senden refresh');
    await page.click('input[name="name"]');
    await page.fill('input[name="name"]', `x${userB}x`);
    await page.click('text=Name existiert?');
    const sendResponse = await page.waitForResponse('http://localhost:3000/api/users/**');
    expect(sendResponse.status()).toBe(200);
    const message = await page.waitForSelector('#name-check', { state: 'attached', timeout: 0 });
    expect(await message.textContent()).toBe('Benutzer existiert nicht');
  });
  it('should send a message from A to B', async () => {
    const userA = 'arne';
    const message = {
      to: 'steve', // user B
      title: 'Apfelkuchen',
      content: 'das Apfelkuchenrezept ist super'
    };
    page = await singUpUserAndGoToProfile(message.to, password, browserContext2);
    await page.click('text=Abmelden');
    page.close();
    page = await singUpUserAndGoToProfile(userA, password, browserContext);
    await page.click('text=Nachricht Senden refresh');
    await page.click('input[name="name"]');
    await page.fill('input[name="name"]', message.to);
    await page.press('input[name="name"]', 'Tab');
    await page.press('text=Name existiert?', 'Enter');
    const existsResponse = await page.waitForResponse('http://localhost:3000/api/users/**');
    expect(existsResponse.status()).toBe(401);
    expect(await page.textContent('#name-check')).toBe('Benutzer existiert');
    await page.press('text=Name existiert?', 'Tab');
    await page.fill('input[name="title"]', message.title);
    await page.click('textarea[name="content"]');
    await page.fill('textarea[name="content"]', message.content);
    await page.click('button:has-text("Senden")');
    const sendResponse = await page.waitForResponse('http://localhost:3000/api/message/');
    expect(sendResponse.status()).toBe(200);
    expect(await page.getAttribute('#content', 'value')).toBeNull();
    await page.click('text=Abmelden');
    await page.click('text=Anmelden');
    await page.click('input[name="name"]');
    await page.fill('input[name="name"]', message.to);
    await page.press('input[name="name"]', 'Tab');
    await page.fill('input[name="password"]', password);
    await Promise.all([
      page.waitForNavigation({ url: 'http://localhost:8080/app/rezepte' }),
      page.click('button:has-text("Anmelden")')
    ]);
    await page.click('text=Mein Profil');
    const messageTitle = await page.waitForSelector('.container-one-message h5', { state: 'attached', timeout: 0 });
    expect(await messageTitle.textContent()).toBe(message.title);
    const messageContent = await page.waitForSelector('.container-one-message p', { state: 'attached', timeout: 0 });
    expect(await messageContent.textContent()).toBe(message.content);
  });

  it('should send a message from A to B. Then B should be able to delete the message and guard should work', async () => {
    const userA = 'arne2';
    const message = {
      to: 'steve2', // user B
      title: 'Apfelkuchen',
      content: 'das Apfelkuchenrezept ist super'
    };
    page = await singUpUserAndGoToProfile(message.to, password, browserContext2);
    await page.click('text=Abmelden');
    page.close();
    page = await singUpUserAndGoToProfile(userA, password, browserContext);
    await page.click('text=Nachricht Senden refresh');
    await page.click('input[name="name"]');
    await page.fill('input[name="name"]', message.to);
    await page.press('input[name="name"]', 'Tab');
    await page.press('text=Name existiert?', 'Enter');
    const existsResponse = await page.waitForResponse('http://localhost:3000/api/users/**');
    expect(existsResponse.status()).toBe(401);
    expect(await page.textContent('#name-check')).toBe('Benutzer existiert');
    await page.press('text=Name existiert?', 'Tab');
    await page.fill('input[name="title"]', message.title);
    await page.click('textarea[name="content"]');
    await page.fill('textarea[name="content"]', message.content);
    await page.click('button:has-text("Senden")');
    expect(await page.getAttribute('#content', 'value')).toBeNull();
    await page.click('text=Abmelden');
    await page.click('text=Anmelden');
    await page.click('input[name="name"]');
    await page.fill('input[name="name"]', message.to);
    await page.press('input[name="name"]', 'Tab');
    await page.fill('input[name="password"]', password);
    await Promise.all([
      page.waitForNavigation({ url: 'http://localhost:8080/app/rezepte' }),
      page.click('button:has-text("Anmelden")')
    ]);
    await page.click('text=Mein Profil');
    const messageTitle = await page.waitForSelector('.container-one-message h5', { state: 'attached', timeout: 0 });
    expect(await messageTitle.textContent()).toBe(message.title);
    const messageContent = await page.waitForSelector('.container-one-message p', { state: 'attached', timeout: 0 });
    expect(await messageContent.textContent()).toBe(message.content);
    await page.click('text=löschen');
    const response = await page.waitForResponse('http://localhost:3000/api/message/**');
    expect(response.status()).toBe(200);
    const titleElement = await page.$('.title');
    expect(titleElement).toBeNull();
  });

  it('should not be possible to send a message to yourself ', async () => {
    const message = {
      to: 'arne3',
      title: 'Apfelkuchen',
      content: 'das Apfelkuchenrezept ist super'
    };
    page = await singUpUserAndGoToProfile(message.to, password, browserContext);
    await page.click('text=Nachricht Senden refresh');
    await page.click('input[name="name"]');
    await page.fill('input[name="name"]', message.to);
    await page.press('input[name="name"]', 'Tab');
    await page.press('text=Name existiert?', 'Enter');
    const existsResponse = await page.waitForResponse('http://localhost:3000/api/users/**');
    expect(existsResponse.status()).toBe(401);
    expect(await page.textContent('#name-check')).toBe('Benutzer existiert');
    await page.press('text=Name existiert?', 'Tab');
    await page.fill('input[name="title"]', message.title);
    await page.click('textarea[name="content"]');
    await page.fill('textarea[name="content"]', message.content);
    await page.click('button:has-text("Senden")');
    const sendResponse = await page.waitForResponse('http://localhost:3000/api/message/');
    expect(sendResponse.status()).toBe(401);
  });

  it('should update all messages by clicking update button', async () => {
    const userA = 'arne4';
    const message = {
      to: 'steve4', // user B
      title: 'Apfelkuchen',
      content: 'das Apfelkuchenrezept ist super'
    };
    const page2 = await singUpUserAndGoToProfile(message.to, password, browserContext2);

    page = await singUpUserAndGoToProfile(userA, password, browserContext);

    await page.click('text=Nachricht Senden refresh');
    await page.click('input[name="name"]');
    await page.fill('input[name="name"]', message.to);
    await page.press('input[name="name"]', 'Tab');
    await page.press('text=Name existiert?', 'Enter');
    const existsResponse = await page.waitForResponse('http://localhost:3000/api/users/**');
    expect(existsResponse.status()).toBe(401);
    expect(await page.textContent('#name-check')).toBe('Benutzer existiert');
    await page.press('text=Name existiert?', 'Tab');
    await page.fill('input[name="title"]', message.title);
    await page.click('textarea[name="content"]');
    await page.fill('textarea[name="content"]', message.content);
    await page.click('button:has-text("Senden")');

    await page2.click('button:has-text("refresh")');
    const refreshResponse = await page2.waitForResponse('http://localhost:3000/api/message');
    expect(refreshResponse.status()).toBe(200);
    await page2.close();
  });

  it('should update all messages by clicking update button but no message was sent', async () => {
    const userA = 'arne5';
    page = await singUpUserAndGoToProfile(userA, password, browserContext);
    await page.click('button:has-text("refresh")');
    const refreshResponse = await page.waitForResponse('http://localhost:3000/api/message');
    expect(refreshResponse.status()).toBe(200);
    const titleElement = await page.$('.title');
    expect(titleElement).toBeNull();
  });
});
