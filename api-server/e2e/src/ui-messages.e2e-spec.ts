/* Autor: Victor Corbet */
// npx playwright codegen http://localhost:8080 -o codemessage.js

import { chromium, ChromiumBrowser, Page, ChromiumBrowserContext } from 'playwright';
import { singUpUserAndGoToProfile } from './ui-snake.e2e-spec';
const configFile = require('./config.json');

let browser: ChromiumBrowser;
let browserContext: ChromiumBrowserContext;
let page: Page;
const password = 'h4llo?flo+M';  //alle user use the same password in the texts


describe('User-Interface: Message-Service: ', () => {
  beforeAll(async () => {
    browser = await chromium.launch({
      headless: true
    });
  });
  beforeEach(async () => {
    browserContext = await browser.newContext();
  });
  afterEach( async () => {
    await page.close();
    await browserContext.close();
  })
  afterAll(async () => {
    await browser.close();
  });

  it('should check (user A), if user B exists -> success <- ', async () => {
    const userB = 'Frank';
    const userA = 'Tobias'
    page = await singUpUserAndGoToProfile(userB, password, browserContext);
    await page.click('text=Abmelden');
    page.close();
    page = await singUpUserAndGoToProfile(userA, password, browserContext);
    await page.click('text=Nachricht Senden refresh');
    await page.click('input[name="name"]');
    await page.fill('input[name="name"]', userB);
    await page.click('text=Name existiert?');
    const message = await page.waitForSelector('#name-check', { state : 'attached' , timeout : 0});
    expect(await message.textContent()).toBe("Benutzer existiert");
  });
  it('should check (user A), if user B exists -> error <- ', async () => {
    const userB = 'Frank2';
    const userA = 'Tobias2'
    page = await singUpUserAndGoToProfile(userB, password, browserContext);
    await page.click('text=Abmelden');
    page.close();
    page = await singUpUserAndGoToProfile(userA, password, browserContext);
    await page.click('text=Nachricht Senden refresh');
    await page.click('input[name="name"]');
    await page.fill('input[name="name"]', `x${userB}x`);
    await page.click('text=Name existiert?');
    const message = await page.waitForSelector('#name-check', { state : 'attached' , timeout : 0});
    expect(await message.textContent()).toBe("Benutzer existiert nicht");
  });
  it('should send a message from A to B', async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    const userA = 'arne';
    const message = {
      to : 'steve', // user B
      title : 'Apfelkuchen',
      content : 'das Apfelkuchenrezept ist super'
    }
    page = await singUpUserAndGoToProfile(message.to , password, browserContext);
    await page.click('text=Abmelden');
    page.close();
    page = await singUpUserAndGoToProfile(userA, password, browserContext);
    await page.click('text=Nachricht Senden refresh');
    await page.click('input[name="name"]');
    await page.fill('input[name="name"]', message.to);
    await page.press('input[name="name"]', 'Tab');
    await page.press('text=Name existiert?', 'Enter'); // A checks, if B exists befor he sends the message
    expect(await page.textContent('#name-check')).toBe("Benutzer existiert");
    await page.press('text=Name existiert?', 'Tab');
    await page.fill('input[name="title"]', message.title );
    await page.click('textarea[name="content"]');
    await page.fill('textarea[name="content"]', message.content);
    await page.click('button:has-text("Senden")');
    expect(await page.getAttribute('#content' , 'value')).toBeNull();
    await page.click('text=Abmelden');
    await page.click('text=Anmelden');
    await page.click('input[name="name"]');
    await page.fill('input[name="name"]', message.to);
    await page.press('input[name="name"]', 'Tab');
    await page.fill('input[name="password"]', password);
    await Promise.all([
      page.waitForNavigation( { url: 'http://localhost:8080/app/rezepte' } ),
      page.click('button:has-text("Anmelden")')
    ]);
    await page.click('text=Mein Profil');
    const messageTitle = await page.waitForSelector('.container-one-message h5', { state : 'attached' , timeout : 0});
    expect(await messageTitle.textContent()).toBe(message.title);
    const messageContent = await page.waitForSelector('.container-one-message p', { state : 'attached' , timeout : 0});
    expect(await messageContent.textContent()).toBe(message.content);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
  });
});
