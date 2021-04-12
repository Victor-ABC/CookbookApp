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
  await page.fill('input[name="name"]', 'kevin');

  // Press Tab
  await page.press('input[name="name"]', 'Tab');

  // Press Tab
  await page.press('text=Name vergeben?', 'Tab');

  // Fill input[name="email"]
  await page.fill('input[name="email"]', 'kevin');

  // Press AltGraph
  await page.press('input[name="email"]', 'AltGraph');

  // Fill input[name="email"]
  await page.fill('input[name="email"]', 'kevin@kevin.de');

  // Press Tab
  await page.press('input[name="email"]', 'Tab');

  // Fill input[name="password"]
  await page.fill('input[name="password"]', '1234567890');

  // Click text=Passwort nochmals eingeben Eine erneute Eingabe ist erforderlich und muss mit de
  await page.click('text=Passwort nochmals eingeben Eine erneute Eingabe ist erforderlich und muss mit de');

  // Fill input[name="passwordCheck"]
  await page.fill('input[name="passwordCheck"]', '1234567890');

  // Click button:has-text("Konto erstellen")
  await Promise.all([
    page.waitForNavigation(/*{ url: 'http://localhost:8080/app/api' }*/),
    page.click('button:has-text("Konto erstellen")')
  ]);

  // Click text=Mein Profil
  await page.click('text=Mein Profil');
  // assert.equal(page.url(), 'http://localhost:8080/app/users/profile');

  // Click text=Nachricht Senden refresh
  await page.click('text=Nachricht Senden refresh');

  // Click text=Abmelden
  await page.click('text=Abmelden');
  // assert.equal(page.url(), 'http://localhost:8080/app/users/sign-out');

  // Click text=Konto erstellen
  await page.click('text=Konto erstellen');
  // assert.equal(page.url(), 'http://localhost:8080/app/users/sign-up');

  // Click input[name="name"]
  await page.click('input[name="name"]');

  // Fill input[name="name"]
  await page.fill('input[name="name"]', 'arne');

  // Press Tab
  await page.press('input[name="name"]', 'Tab');

  // Press Tab
  await page.press('text=Name vergeben?', 'Tab');

  // Fill input[name="email"]
  await page.fill('input[name="email"]', 'arne');

  // Press AltGraph
  await page.press('input[name="email"]', 'AltGraph');

  // Fill input[name="email"]
  await page.fill('input[name="email"]', 'arne@arne.de');

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

  // Click text=Mein Profil
  await page.click('text=Mein Profil');
  // assert.equal(page.url(), 'http://localhost:8080/app/users/profile');

  // Click text=Nachricht Senden refresh
  await page.click('text=Nachricht Senden refresh');

  // Click input[name="name"]
  await page.click('input[name="name"]');

  // Fill input[name="name"]
  await page.fill('input[name="name"]', 'kevin');

  // Press Tab
  await page.press('input[name="name"]', 'Tab');

  // Press Enter
  await page.press('text=Name existiert?', 'Enter');

  // Press Tab
  await page.press('text=Name existiert?', 'Tab');

  // Fill input[name="title"]
  await page.fill('input[name="title"]', 'Dies ist ein titel');

  // Click textarea[name="content"]
  await page.click('textarea[name="content"]');

  // Fill textarea[name="content"]
  await page.fill('textarea[name="content"]', 'Dies ist der inhalt');

  // Click button:has-text("Senden")
  await page.click('button:has-text("Senden")');

  // Click text=Abmelden
  await page.click('text=Abmelden');
  // assert.equal(page.url(), 'http://localhost:8080/app/users/sign-out');

  // Click text=Anmelden
  await page.click('text=Anmelden');
  // assert.equal(page.url(), 'http://localhost:8080/app/users/sign-in');

  // Click input[name="name"]
  await page.click('input[name="name"]');

  // Fill input[name="name"]
  await page.fill('input[name="name"]', 'kevin');

  // Press Tab
  await page.press('input[name="name"]', 'Tab');

  // Fill input[name="password"]
  await page.fill('input[name="password"]', '1234567890');

  // Click button:has-text("Anmelden")
  await Promise.all([
    page.waitForNavigation(/*{ url: 'http://localhost:8080/app/rezepte' }*/),
    page.click('button:has-text("Anmelden")')
  ]);

  // Click text=Mein Profil
  await page.click('text=Mein Profil');
  // assert.equal(page.url(), 'http://localhost:8080/app/users/profile');

  // Click text=Dies ist ein titel Dies ist der inhalt am 5.3.2021 um 17:55 Uhr löschen
  await page.click('text=Dies ist ein titel Dies ist der inhalt am 5.3.2021 um 17:55 Uhr löschen');

  // Close page
  await page.close();

  // ---------------------
  await context.close();
  await browser.close();
})();