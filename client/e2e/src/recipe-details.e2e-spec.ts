/* Autor: Arne Hegemann */

import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { UserSession } from './user-session';
import config from './config';
import { exception } from 'node:console';

describe('/recipes/details', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let userSession: UserSession;

  beforeAll(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL=10000;
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
    
    await page.goto(config.clientUrl('/recipes/details/new'));

  });

  afterEach(async () => {
    await userSession.deleteUser();
    await context.close();
  });  
  
  it('should render the new recipe page', async () => {
    const recipeName = await page.textContent('#recipeName');
    expect(recipeName).toBe('Ihr Rezept');
  });
  
  it('should add a ingredient line', async () => {
      await page.click('#addLine')
      
      const ingredient = await page.innerHTML('app-ingredient');
      expect(ingredient).toBe;
  });
  
  it('should select an image', async () => {  
    await page.setInputFiles('#selectImage', './e2e/assets/RedPixel.png');
    await page.click('#selectImageMock');
    
    const src = await page.getAttribute('#selectedImage', 'src');
    expect(src).toBe('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAD0lEQVQIHQEEAPv/AP8AAAMBAQDHBpJvAAAAAElFTkSuQmCC'); // RedPixel.png
  });
  
  it('should save a new recipe', async () => {
    await page.fill('#title', 'Rezept 2');
    await page.fill('#description', 'Drölfte Rezept');

    await page.setInputFiles('#selectImage', './e2e/assets/RedPixel.png');
    await page.click('#selectImageMock');    

    await page.click('#addLine')    
    await page.fill('app-ingredient input[id="ingredient"]', 'Möhre')
    await page.fill('app-ingredient input[id="quantity"]', '1')
    await page.selectOption('app-ingredient select[id="unit"]', 'piece')

    await page.click('#save');
    await Promise.all([page.waitForNavigation(), await page.keyboard.press("F5")]);
    expect(page.url()).not.toContain('/recipes/details/new');
  });
  
  it('should update a recipe', async () => {
    await page.fill('#title', 'Rezept 2');
    await page.fill('#description', 'Drölfte Rezept');

    await page.setInputFiles('#selectImage', './e2e/assets/RedPixel.png');
    await page.click('#selectImageMock');    

    await page.click('#addLine')    
    await page.fill('app-ingredient input[id="ingredient"]', 'Möhre')
    await page.fill('app-ingredient input[id="quantity"]', '1')
    await page.selectOption('app-ingredient select[id="unit"]', 'piece')

    await page.click('#save');
    await Promise.all([page.waitForNavigation(), await page.keyboard.press("F5")]);
    expect(page.url()).not.toContain('/recipes/details/new');
    const url = page.url();    

    await page.fill('#title', 'Rezept 3');
    await page.click('#save');
    await Promise.all([page.waitForNavigation(), await page.keyboard.press("F5")]);

    expect(page.url()).toBe(url);
    const recipeName = await page.textContent('#recipeName');
    expect(recipeName).toBe('Ihr Rezept "Rezept 3"');
  });
  
  it('should delete a recipe', async () => {
    await page.fill('#title', 'Rezept 2');
    await page.fill('#description', 'Drölfte Rezept');

    await page.setInputFiles('#selectImage', './e2e/assets/RedPixel.png');
    await page.click('#selectImageMock');    

    await page.click('#addLine')    
    await page.fill('app-ingredient input[id="ingredient"]', 'Möhre')
    await page.fill('app-ingredient input[id="quantity"]', '1')
    await page.selectOption('app-ingredient select[id="unit"]', 'piece')

    await page.click('#save');
    await Promise.all([page.waitForNavigation(), await page.keyboard.press("F5")]);
    expect(page.url()).not.toContain('/recipes/details/new');

    await page.click('#delete');
    expect(page.url()).toContain('/recipes');

    const recipeItem = await page.$('app-recipe-list-item');
    expect(recipeItem).toBeFalsy();
  });
  
  // it('should zoom the recipe image', async () => {
  //   await page.fill('#title', 'Rezept 2');
  //   await page.fill('#description', 'Drölfte Rezept');

  //   await page.setInputFiles('#selectImage', './e2e/assets/RedPixel.png');
  //   await page.click('#selectImageMock');    

  //   await page.click('#addLine')    
  //   await page.fill('app-ingredient input[id="ingredient"]', 'Möhre')
  //   await page.fill('app-ingredient input[id="quantity"]', '1')
  //   await page.selectOption('app-ingredient select[id="unit"]', 'piece')

  //   await page.click('#save');
  //   await Promise.all([page.waitForNavigation(), await page.keyboard.press("F5")]);
  //   expect(page.url()).not.toContain('/recipes/details/new');
    
  //   await page.screenshot({path: `C:\\test\\test1.png`});

  //   await page.click('label img[class="imgOriginal"]');

  //   await page.screenshot({path: `C:\\test\\test2.png`});

  //   page.getAttribute('#selectedImageCopy', '');
  // });
});