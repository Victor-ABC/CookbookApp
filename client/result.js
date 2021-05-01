const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();

  // Open new page
  const page = await context.newPage();

  // Go to http://localhost:8080/app
  await page.goto('http://localhost:8080/app');

  // Click text=Konto erstellen
  await page.click('text=Konto erstellen');
  // assert.equal(page.url(), 'http://localhost:8080/app/users/sign-up');

  // Click input[name="name"]
  await page.click('input[name="name"]');

  // Fill input[name="name"]
  await page.fill('input[name="name"]', 'tim');

  // Press Tab
  await page.press('input[name="name"]', 'Tab');

  // Press Tab
  await page.press('text=Name vergeben?', 'Tab');

  // Fill input[name="email"]
  await page.fill('input[name="email"]', 'tim');

  // Press AltGraph
  await page.press('input[name="email"]', 'AltGraph');

  // Fill input[name="email"]
  await page.fill('input[name="email"]', 'tim@tim.de');

  // Press Tab
  await page.press('input[name="email"]', 'Tab');

  // Fill input[name="password"]
  await page.fill('input[name="password"]', '1234567890');

  // Click input[name="passwordCheck"]
  await page.click('input[name="passwordCheck"]');

  // Fill input[name="passwordCheck"]
  await page.fill('input[name="passwordCheck"]', '1234567890');

  // Click button:has-text("Konto erstellen")
  await Promise.all([
    page.waitForNavigation(/*{ url: 'http://localhost:8080/app/api' }*/),
    page.click('button:has-text("Konto erstellen")')
  ]);

  // Click text=Abmelden
  await page.click('text=Abmelden');
  // assert.equal(page.url(), 'http://localhost:8080/app/users/sign-out');

  // Close page
  await page.close();

  // ---------------------
  await context.close();
  await browser.close();
})();