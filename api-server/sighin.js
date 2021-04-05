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
  await page.fill('input[name="name"]', 'freddi');

  // Click input[name="email"]
  await page.click('input[name="email"]');

  // Fill input[name="email"]
  await page.fill('input[name="email"]', 'freddi');

  // Press AltGraph
  await page.press('input[name="email"]', 'AltGraph');

  // Fill input[name="email"]
  await page.fill('input[name="email"]', 'freddi@freddi.de');

  // Click input[name="password"]
  await page.click('input[name="password"]');

  // Fill input[name="password"]
  await page.fill('input[name="password"]', 'h4llo?flo+M');

  // Click input[name="passwordCheck"]
  await page.click('input[name="passwordCheck"]');

  // Fill input[name="passwordCheck"]
  await page.fill('input[name="passwordCheck"]', 'h4llo?flo+M');

  // Click button:has-text("Konto erstellen")
  await Promise.all([
    page.waitForNavigation(/*{ url: 'http://localhost:8080/app/api' }*/),
    page.click('button:has-text("Konto erstellen")')
  ]);

  // Click text=Abmelden
  await page.click('text=Abmelden');
  // assert.equal(page.url(), 'http://localhost:8080/app/users/sign-out');

  // Click text=Anmelden
  await page.click('text=Anmelden');
  // assert.equal(page.url(), 'http://localhost:8080/app/users/sign-in');

  // Click input[name="name"]
  await page.click('input[name="name"]');

  // Fill input[name="name"]
  await page.fill('input[name="name"]', 'freddi');

  // Click input[name="password"]
  await page.click('input[name="password"]');

  // Fill input[name="password"]
  await page.fill('input[name="password"]', 'h4llo?flo+M');

  // Click button:has-text("Anmelden")
  await Promise.all([
    page.waitForNavigation(/*{ url: 'http://localhost:8080/app/tasks' }*/),
    page.click('button:has-text("Anmelden")')
  ]);

  // Close page
  await page.close();

  // ---------------------
  await context.close();
  await browser.close();
})();