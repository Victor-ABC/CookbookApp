const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();

  // Open new page
  const page = await context.newPage();

  // Go to http://localhost:8080/
  await page.goto('http://localhost:8080/');

  // Click text=Konto erstellen
  await page.click('text=Konto erstellen');
  // assert.equal(page.url(), 'http://localhost:8080/app/users/sign-up');

  // Click input[name="name"]
  await page.click('input[name="name"]');

  // Fill input[name="name"]
  await page.fill('input[name="name"]', 'simon');

  // Press Tab
  await page.press('input[name="name"]', 'Tab');

  // Press Enter
  await page.press('text=Name vergeben?', 'Enter');

  // Press Tab
  await page.press('text=Name vergeben?', 'Tab');

  // Fill input[name="email"]
  await page.fill('input[name="email"]', 'simon');

  // Press AltGraph
  await page.press('input[name="email"]', 'AltGraph');

  // Fill input[name="email"]
  await page.fill('input[name="email"]', 'simon@simon.de');

  // Press Tab
  await page.press('input[name="email"]', 'Tab');

  // Fill input[name="password"]
  await page.fill('input[name="password"]', '1234512345');

  // Press Tab
  await page.press('input[name="password"]', 'Tab');

  // Fill input[name="passwordCheck"]
  await page.fill('input[name="passwordCheck"]', '1234512345');

  // Click button:has-text("Konto erstellen")
  await Promise.all([
    page.waitForNavigation(/*{ url: 'http://localhost:8080/app/api' }*/),
    page.click('button:has-text("Konto erstellen")')
  ]);

  // Click text=Konto erstellen
  await page.click('text=Konto erstellen');
  // assert.equal(page.url(), 'http://localhost:8080/app/users/sign-up');

  // Click input[name="name"]
  await page.click('input[name="name"]');

  // Fill input[name="name"]
  await page.fill('input[name="name"]', 'simon');

  // Click text=Name vergeben?
  await page.click('text=Name vergeben?');

  // Click input[name="email"]
  await page.click('input[name="email"]');

  // Fill input[name="email"]
  await page.fill('input[name="email"]', 'simon');

  // Press AltGraph
  await page.press('input[name="email"]', 'AltGraph');

  // Fill input[name="email"]
  await page.fill('input[name="email"]', 'simon@simon.de');

  // Press Tab
  await page.press('input[name="email"]', 'Tab');

  // Fill input[name="password"]
  await page.fill('input[name="password"]', '123412341234');

  // Click input[name="passwordCheck"]
  await page.click('input[name="passwordCheck"]');

  // Fill input[name="passwordCheck"]
  await page.fill('input[name="passwordCheck"]', '123412341234');

  // Click button:has-text("Konto erstellen")
  await page.click('button:has-text("Konto erstellen")');

  // ---------------------
  await context.close();
  await browser.close();
})();