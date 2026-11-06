/* global console, process, window, localStorage, sessionStorage, Event */
import { chromium } from '@playwright/test';
import { preview } from 'vite';
import * as path from 'node:path';

const ARTIFACTS_DIR = 'C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b';
const webRoot = path.resolve(process.cwd(), 'apps/web');
const PORT = 4225;

async function run() {
  console.log('[Capture Phase 2] Starting Vite preview server on port', PORT);
  const server = await preview({
    root: webRoot,
    preview: { port: PORT },
  });

  const browser = await chromium.launch({ headless: true });

  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });

  const desktopPage = await desktopContext.newPage();
  const mobilePage = await mobileContext.newPage();

  const baseUrl = `http://localhost:${PORT}`;

  try {
    // -------------------------------------------------------------
    // 1. Unconfigured Production State (Clear Warnings & Disabled Buttons)
    // -------------------------------------------------------------
    console.log('[Capture] Capturing Unconfigured Production Warning (Desktop & Mobile)...');
    await desktopPage.goto(`${baseUrl}/?view=login`);
    await desktopPage.waitForSelector('[data-testid="unconfigured-auth-banner"]');
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'auth-unconfigured-login-desktop.png'),
      fullPage: true,
    });

    await mobilePage.goto(`${baseUrl}/?view=login`);
    await mobilePage.waitForSelector('[data-testid="unconfigured-auth-banner"]');
    await mobilePage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'auth-unconfigured-login-mobile.png'),
      fullPage: true,
    });

    await desktopPage.goto(`${baseUrl}/?view=signup`);
    await desktopPage.waitForSelector('[data-testid="unconfigured-auth-banner"]');
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'auth-unconfigured-signup-desktop.png'),
      fullPage: true,
    });

    // -------------------------------------------------------------
    // 2. Enable Test Harness Mock Mode for Screen & Interaction Testing
    // -------------------------------------------------------------
    console.log('[Capture] Enabling Test Harness Mode...');
    const enableMock = () => {
      localStorage.setItem('epaper_studio_auth_mode', 'mock');
      localStorage.setItem('epaper_studio_locale', 'en');
    };
    await desktopPage.evaluate(enableMock);
    await mobilePage.evaluate(enableMock);

    // -------------------------------------------------------------
    // 3. Desktop & Mobile: English Login in Test Mode (Badge Visible)
    // -------------------------------------------------------------
    console.log('[Capture] Capturing English Login (Desktop & Mobile)...');
    await desktopPage.goto(`${baseUrl}/?view=login`);
    await desktopPage.waitForSelector('input[type="email"]');
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'auth-login-desktop-en.png'),
      fullPage: true,
    });

    await mobilePage.goto(`${baseUrl}/?view=login`);
    await mobilePage.waitForSelector('input[type="email"]');
    await mobilePage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'auth-login-mobile-en.png'),
      fullPage: true,
    });

    // -------------------------------------------------------------
    // 4. Desktop & Mobile: Hindi Login (Devanagari Typography)
    // -------------------------------------------------------------
    console.log('[Capture] Capturing Hindi Login (Devanagari typography)...');
    const setHindi = () => {
      localStorage.setItem('epaper_studio_locale', 'hi');
      window.dispatchEvent(new Event('storage'));
    };
    await desktopPage.evaluate(setHindi);
    await desktopPage.reload();
    await desktopPage.waitForSelector('input[type="email"]');
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'auth-login-desktop-hi.png'),
      fullPage: true,
    });

    await mobilePage.evaluate(setHindi);
    await mobilePage.reload();
    await mobilePage.waitForSelector('input[type="email"]');
    await mobilePage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'auth-login-mobile-hi.png'),
      fullPage: true,
    });

    // Reset language back to en
    await desktopPage.evaluate(() => localStorage.setItem('epaper_studio_locale', 'en'));
    await mobilePage.evaluate(() => localStorage.setItem('epaper_studio_locale', 'en'));

    // -------------------------------------------------------------
    // 5. Form Validation & Error State
    // -------------------------------------------------------------
    console.log('[Capture] Capturing Form Validation error banner...');
    await desktopPage.goto(`${baseUrl}/?view=login`);
    await desktopPage.waitForSelector('input[type="email"]');
    await desktopPage.fill('input[type="email"]', 'not-a-valid-email');
    await desktopPage.fill('input[type="password"]', 'pass');
    await desktopPage.click('button[type="submit"]');
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'auth-validation-error.png'),
      fullPage: true,
    });

    // -------------------------------------------------------------
    // 6. Sign-Up Page with Real-time Password Strength Meter
    // -------------------------------------------------------------
    console.log('[Capture] Capturing Sign-Up Page (Desktop & Mobile)...');
    await desktopPage.goto(`${baseUrl}/?view=signup`);
    await desktopPage.waitForSelector('input[type="password"]');
    await desktopPage.fill('input[type="email"]', 'editorial.chief@themorningpost.com');
    await desktopPage.fill('input[type="password"]', 'PressHerald2026!#');
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'auth-signup-desktop.png'),
      fullPage: true,
    });

    await mobilePage.goto(`${baseUrl}/?view=signup`);
    await mobilePage.waitForSelector('input[type="password"]');
    await mobilePage.fill('input[type="email"]', 'editorial.chief@themorningpost.com');
    await mobilePage.fill('input[type="password"]', 'PressHerald2026!#');
    await mobilePage.waitForTimeout(300);
    await mobilePage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'auth-signup-mobile.png'),
      fullPage: true,
    });

    // -------------------------------------------------------------
    // 7. Email Verification Notice Screen
    // -------------------------------------------------------------
    console.log('[Capture] Capturing Email Verification Notice...');
    await desktopPage.goto(`${baseUrl}/?view=verify-email&email=managing.editor@dailyherald.co.in`);
    await desktopPage.waitForSelector('text=Verify Your Email');
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'auth-verify-email-desktop.png'),
      fullPage: true,
    });

    await mobilePage.goto(`${baseUrl}/?view=verify-email&email=managing.editor@dailyherald.co.in`);
    await mobilePage.waitForSelector('text=Verify Your Email');
    await mobilePage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'auth-verify-email-mobile.png'),
      fullPage: true,
    });

    // -------------------------------------------------------------
    // 8. Password Recovery Screens
    // -------------------------------------------------------------
    console.log('[Capture] Capturing Password Recovery Screens...');
    await desktopPage.goto(`${baseUrl}/?view=forgot-password`);
    await desktopPage.waitForSelector('input[type="email"]');
    await desktopPage.fill('input[type="email"]', 'publisher@epaper-studio.org');
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'auth-forgot-password-desktop.png'),
      fullPage: true,
    });

    await desktopPage.goto(`${baseUrl}/?view=reset-password`);
    await desktopPage.waitForSelector('input[type="password"]');
    await desktopPage.fill('input[type="password"]', 'NewSecurePassword2026!');
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'auth-reset-password-desktop.png'),
      fullPage: true,
    });

    // -------------------------------------------------------------
    // 9. Onboarding Wizard (Desktop & Mobile)
    // -------------------------------------------------------------
    console.log('[Capture] Capturing Onboarding Wizard (Desktop & Mobile)...');
    const authSessionInit = () => {
      const demoUser = {
        id: 'usr-press-publisher-99',
        email: 'publisher.senior@nationalchronicle.org',
        fullName: 'Rajeshwar Varma',
        avatarUrl: null,
        emailConfirmed: true,
        createdAt: new Date().toISOString(),
        role: 'owner',
        publicationName: 'National Chronicle',
        primaryLanguage: 'en',
        preferredPageSize: 'broadsheet',
        isOnboarded: false,
      };
      localStorage.setItem('epaper_studio_local_session', JSON.stringify({ userId: demoUser.id }));
      localStorage.setItem('epaper_studio_local_users', JSON.stringify([demoUser]));
      sessionStorage.setItem('epaper_studio_onboarding_step', '1');
    };

    await desktopPage.evaluate(authSessionInit);
    await desktopPage.goto(`${baseUrl}/?view=onboarding`);
    await desktopPage.waitForTimeout(400);
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'auth-onboarding-desktop.png'),
      fullPage: true,
    });

    await mobilePage.evaluate(authSessionInit);
    await mobilePage.goto(`${baseUrl}/?view=onboarding`);
    await mobilePage.waitForTimeout(400);
    await mobilePage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'auth-onboarding-mobile.png'),
      fullPage: true,
    });

    // -------------------------------------------------------------
    // 10. Dashboard & Account Settings Modal (With Connection Status Card)
    // -------------------------------------------------------------
    console.log('[Capture] Capturing Dashboard & Account Settings Modal...');
    const markOnboarded = () => {
      const users = JSON.parse(localStorage.getItem('epaper_studio_local_users') || '[]');
      if (users[0]) {
        users[0].isOnboarded = true;
        localStorage.setItem('epaper_studio_local_users', JSON.stringify(users));
      }
    };
    await desktopPage.evaluate(markOnboarded);
    await desktopPage.goto(`${baseUrl}/?view=dashboard`);
    await desktopPage.waitForTimeout(600);

    const profileBtn = desktopPage.locator('[data-testid="profile-dropdown-btn"]').first();
    if (await profileBtn.isVisible()) {
      await profileBtn.click();
      await desktopPage.waitForTimeout(250);
      const settingsOption = desktopPage.locator('text=Account Settings, text=Settings').first();
      if (await settingsOption.isVisible()) {
        await settingsOption.click();
        await desktopPage.waitForTimeout(400);
      }
    }
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'auth-account-settings-modal.png'),
      fullPage: true,
    });

    console.log('[Capture Phase 2] All visual regression screenshots captured successfully with exit code 0!');
  } finally {
    await browser.close();
    server.httpServer.close();
  }
}

run().catch((err) => {
  console.error('[Capture] Error running capture script:', err);
  process.exit(1);
});
