/* Autor: Arne Hegemann */

import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { UserSession } from './user-session';
import config from './config';

describe('/recipes', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let userSession: UserSession;

  beforeAll(async () => {
    browser = await chromium.launch(config.launchOptions);
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    context = await browser.newContext();
    page = await context.newPage();
    userSession = new UserSession(context);
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
    await context.close();
  });

  it('should render title "Rezepte"', async () => {
    await Promise.all([page.waitForNavigation(), await page.goto(config.clientUrl('/recipes'))]);
    const title = await page.textContent('h1');
    expect(title).toBe('Rezepte');
  });

  it('should render title "Deine Rezepte"', async () => {
    await Promise.all([page.waitForNavigation(), await page.goto(config.clientUrl('/my-recipes'))]);
    const title = await page.textContent('h1');
    expect(title).toBe('Deine Rezepte');
  });

  it('should render a recipe', async () => {
    await Promise.all([page.waitForNavigation(), await page.goto(config.clientUrl('/recipes/details/new'))]);

    await page.fill('#title', 'Rezept 2');
    await page.fill('#description', 'Drölfte Rezept');

    await page.setInputFiles('#selectImage', './e2e/assets/RedPixel.png');
    await page.click('#selectImageMock');    

    await page.click('#addLine')    
    await page.fill('app-ingredient input[id="ingredient"]', 'Möhre')
    await page.fill('app-ingredient input[id="quantity"]', '1')
    await page.selectOption('app-ingredient select[id="unit"]', 'piece')    
    await page.click('#save');

    await Promise.all([page.waitForNavigation(), await page.goto(config.clientUrl('/recipes'))]);    
    expect(await page.textContent('app-recipe-list-item span[slot="title"]')).toBe('Rezept 2');
  });

  it('should open a recipe', async () => {
    await Promise.all([page.waitForNavigation(), await page.goto(config.clientUrl('/recipes/details/new'))]);
    
    await page.fill('#title', 'Rezept 2');
    await page.fill('#description', 'Drölfte Rezept');

    await page.setInputFiles('#selectImage', './e2e/assets/RedPixel.png');
    await page.click('#selectImageMock');    

    await page.click('#addLine')    
    await page.fill('app-ingredient input[id="ingredient"]', 'Möhre')
    await page.fill('app-ingredient input[id="quantity"]', '1')
    await page.selectOption('app-ingredient select[id="unit"]', 'piece')    
    await page.click('#save');

    await Promise.all([page.waitForNavigation(), await page.goto(config.clientUrl('/recipes'))]);
    await page.click('app-recipe-list-item span[slot="title"]');

    expect(page.url()).toContain('/recipes/details/')
  });

});