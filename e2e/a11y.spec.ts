import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Automated WCAG 2.2 AA audit (axe-core) of every screen, at every responsive breakpoint,
 * including the interactive states that render extra DOM (search overlay, role menu, drawer,
 * device tabs). Any violation fails the build.
 *
 * Tags: WCAG 2.0/2.1/2.2 levels A + AA (incl. 2.5.8 target size) and axe best practices
 * (landmarks, headings, ...).
 */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

const VIEWPORTS = [
  { name: 'mobile 375', width: 375, height: 812 },
  { name: 'tablet 768', width: 768, height: 1024 },
  { name: 'compact 1024', width: 1024, height: 768 },
  { name: 'desktop 1440', width: 1440, height: 900 },
];

const ROUTES = [
  { name: 'dashboard', path: '/dashboard' },
  { name: 'assets', path: '/assets' },
  { name: 'assessments', path: '/assessments' },
  { name: 'device details (dev-001)', path: '/assets/devices/dev-001' },
  { name: 'device details (dev-002)', path: '/assets/devices/dev-002' },
];

async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  // Charts (ECharts) render on idle; give them a beat so their DOM/labels exist.
  await page.waitForTimeout(600);
}

async function audit(page: Page, label: string): Promise<void> {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const summary = violations.map(
    (v) =>
      `[${v.impact}] ${v.id}: ${v.help}\n` +
      v.nodes
        .slice(0, 4)
        .map((n) => `    - ${n.target.join(' ')}\n      ${(n.failureSummary ?? '').split('\n').slice(0, 2).join(' | ')}`)
        .join('\n') +
      (v.nodes.length > 4 ? `\n    … +${v.nodes.length - 4} more` : '') +
      `\n    ${v.helpUrl}`,
  );
  expect(summary, `${label}: ${violations.length} accessibility violation(s)\n\n${summary.join('\n\n')}\n`).toEqual([]);
}

for (const vp of VIEWPORTS) {
  test.describe(`a11y @ ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const route of ROUTES) {
      test(`${route.name}`, async ({ page }) => {
        await page.goto(route.path);
        await settle(page);
        await audit(page, `${route.name} @ ${vp.name}`);
      });
    }

    test('device details — every tab', async ({ page }) => {
      await page.goto('/assets/devices/dev-001');
      await settle(page);
      const tabs = page.getByRole('tab');
      const count = await tabs.count();
      expect(count).toBeGreaterThan(1);
      for (let i = 0; i < count; i++) {
        await tabs.nth(i).click();
        await page.waitForTimeout(250);
        await audit(page, `device details tab #${i + 1} @ ${vp.name}`);
      }
    });

    test('search overlay (idle and with results)', async ({ page }) => {
      await page.goto('/dashboard');
      await settle(page);
      await page.getByRole('button', { name: /search/i }).first().click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await audit(page, `search overlay (idle) @ ${vp.name}`);
      await dialog.getByRole('combobox').fill('chi');
      await page.waitForTimeout(400);
      await audit(page, `search overlay (results) @ ${vp.name}`);
    });

    test('role switcher menu open', async ({ page }) => {
      await page.goto('/dashboard');
      await settle(page);
      // Header switcher on ≥1024px; inside the drawer below that.
      if (vp.width < 1024) {
        await page.getByRole('button', { name: 'Navigation menu', exact: true }).click();
      }
      await page.locator('.role-switcher__trigger:visible').first().click();
      await audit(page, `role switcher open @ ${vp.name}`);
    });

    if (vp.width < 1024) {
      test('navigation drawer open', async ({ page }) => {
        await page.goto('/dashboard');
        await settle(page);
        await page.getByRole('button', { name: 'Navigation menu', exact: true }).click();
        await page.waitForTimeout(300);
        await audit(page, `navigation drawer @ ${vp.name}`);
      });
    }
  });
}
