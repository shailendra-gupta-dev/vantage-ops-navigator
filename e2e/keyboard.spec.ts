import { expect, test, type Page } from '@playwright/test';

/**
 * Keyboard & behavioural WCAG 2.2 checks that axe-core cannot verify statically.
 *
 * Covered success criteria:
 *  1.4.10 Reflow · 2.1.1 Keyboard · 2.1.2 No Keyboard Trap · 2.4.1 Bypass Blocks · 2.4.2 Page Titled ·
 *  2.4.3 Focus Order · 2.4.7 Focus Visible · 2.4.11 Focus Not Obscured (Minimum) · 4.1.2 Name/Role/Value ·
 *  4.1.3 Status Messages · plus the user preference for reduced motion.
 */

async function ready(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  // Wait for the app shell itself (not just the network): keys pressed before Angular has rendered the
  // layout and attached its handlers land on the wrong element and make the tests flaky under load.
  await page.locator('#main-content').waitFor({ state: 'attached' });
  await page.getByRole('link', { name: /skip to main content/i }).waitFor({ state: 'attached' });
  await page.waitForTimeout(400);
}

const activeInfo = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id,
      cls: String(el.className).split(' ')[0],
      outlineStyle: cs.outlineStyle,
      outlineWidth: parseFloat(cs.outlineWidth),
      top: r.top,
      bottom: r.bottom,
    };
  });

test.describe('bypass blocks & page titles', () => {
  test('skip link is the first Tab stop, is visible on focus, and moves focus to the main content', async ({ page }) => {
    await ready(page, '/dashboard');
    await page.keyboard.press('Tab');
    const link = page.getByRole('link', { name: /skip to main content/i });
    await expect(link).toBeFocused();
    const box = await link.boundingBox();
    expect(box, 'skip link has no box').not.toBeNull();
    expect(box!.y, `skip link y=${box!.y} (box ${JSON.stringify(box)})`).toBeGreaterThanOrEqual(0);
    expect(box!.y, 'skip link must be on screen when focused').toBeLessThan(100);
    await page.keyboard.press('Enter');
    expect(await page.evaluate(() => document.activeElement?.id)).toBe('main-content');
    expect(new URL(page.url()).pathname, 'skip link must not navigate away').toBe('/dashboard');
  });

  test('every route has its own descriptive page title', async ({ page }) => {
    const titles = new Set<string>();
    for (const path of ['/dashboard', '/assets', '/assessments', '/assets/devices/dev-001']) {
      await ready(page, path);
      const title = await page.title();
      expect(title, `${path} title`).toMatch(/Vantage Ops Navigator/);
      expect(title, `${path} title`).not.toBe('VantageOpsNavigator');
      titles.add(title);
    }
    expect(titles.size, 'titles should differ per route').toBe(4);
  });

  test('route changes move focus to the main content (SPA focus management)', async ({ page }) => {
    await ready(page, '/dashboard');
    await page.locator('.sidebar__nav a[href="/assessments"]').click();
    await expect(page).toHaveURL(/assessments/);
    expect(await page.evaluate(() => document.activeElement?.id)).toBe('main-content');
  });
});

test.describe('focus visibility', () => {
  test('keyboard focus always shows a ≥2px outline', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await ready(page, '/dashboard');
    const seen: string[] = [];
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Tab');
      const a = await activeInfo(page);
      if (!a || a.tag === 'body') break;
      seen.push(`${a.tag}.${a.cls}`);
      expect(a.outlineStyle, `${a.tag}.${a.cls} has no visible focus outline`).not.toBe('none');
      expect(a.outlineWidth, `${a.tag}.${a.cls} focus outline too thin`).toBeGreaterThanOrEqual(2);
    }
    expect(seen.length, 'should have tabbed through several controls').toBeGreaterThan(8);
  });

  test('focused controls are never hidden behind the sticky header (2.4.11)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await ready(page, '/dashboard');
    const headerBottom = await page.locator('.app-header').evaluate((e) => e.getBoundingClientRect().bottom);
    let checked = 0;
    for (let i = 0; i < 70; i++) {
      await page.keyboard.press('Tab');
      const a = await activeInfo(page);
      if (!a || a.tag === 'body') break;
      const inHeader = await page.evaluate(() => !!document.activeElement?.closest('.app-header, .skip-link'));
      if (inHeader) continue;
      expect(a.top, `${a.tag}.${a.cls} is hidden under the sticky header`).toBeGreaterThanOrEqual(headerBottom - 1);
      checked++;
    }
    expect(checked, 'should have checked controls below the header').toBeGreaterThan(5);
  });
});

test.describe('navigation drawer (mobile)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('closed drawer is not reachable; open drawer traps focus; Escape closes and returns focus', async ({ page }) => {
    await ready(page, '/dashboard');
    const menu = page.getByRole('button', { name: 'Navigation menu', exact: true });
    await expect(menu).toHaveAttribute('aria-expanded', 'false');

    // Closed: the off-canvas drawer is inert, so its links can neither be focused nor read by AT.
    await expect(page.locator('#app-sidebar')).toHaveAttribute('inert', '');
    await page.locator('#app-sidebar a').first().focus({ timeout: 500 }).catch(() => undefined);
    expect(await page.evaluate(() => !!document.activeElement?.closest('#app-sidebar')), 'closed drawer link took focus').toBe(false);

    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    const drawer = page.getByRole('dialog', { name: /navigation menu/i });
    await expect(drawer).toBeVisible();
    // Focus moved into the drawer…
    await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest('#app-sidebar'))).toBe(true);
    // …and cannot escape it with Tab (no keyboard trap *out*, but a modal must contain focus).
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('#app-sidebar')), `Tab #${i + 1} left the drawer`).toBe(true);
    }

    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeFocused();
  });

  test('role can be changed from the drawer using only the keyboard', async ({ page }) => {
    await ready(page, '/dashboard');
    await page.getByRole('button', { name: 'Navigation menu', exact: true }).click();
    await expect(page.getByRole('dialog', { name: /navigation menu/i })).toBeVisible();
    const trigger = page.locator('#app-sidebar .role-switcher__trigger');
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#app-sidebar [role="listbox"]')).toBeFocused();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await expect(trigger).toContainText(/partner/i);
    await expect(trigger).toBeFocused();
  });
});

test.describe('role switcher (desktop)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('arrow keys, Enter selects, Escape closes and restores focus', async ({ page }) => {
    await ready(page, '/dashboard');
    const trigger = page.locator('.app-header .role-switcher__trigger');
    await trigger.focus();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('ArrowDown');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const list = page.locator('.app-header [role="listbox"]');
    await expect(list).toBeFocused();
    const first = (await list.getAttribute('aria-activedescendant')) ?? '';
    await page.keyboard.press('ArrowDown');
    await expect(list).not.toHaveAttribute('aria-activedescendant', first);
    await page.keyboard.press('Escape');
    await expect(list).toHaveCount(0);
    await expect(trigger).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(list).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.locator('.sidebar__profile-role')).not.toHaveText(/engineer/i);
    await expect(trigger).toBeFocused();
  });
});

test.describe('search overlay', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('opens focused, announces results, opens a result with Enter, Escape returns focus to the opener', async ({ page }) => {
    await ready(page, '/dashboard');
    const opener = page.locator('.app-header__search');
    await opener.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: /device search/i });
    await expect(dialog).toBeVisible();
    const combo = dialog.getByRole('combobox');
    await expect(combo).toBeFocused();

    await page.keyboard.type('chi');
    await expect(dialog.getByRole('status')).toHaveText(/\d+ devices? found/);
    await expect(combo).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('ArrowDown');
    await expect(combo).toHaveAttribute('aria-activedescendant', 'spotlight-option-0');

    // Escape closes and focus goes back to where it was
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();

    // Enter on a result navigates
    await page.keyboard.press('Enter');
    await expect(combo).toBeFocused();
    await page.keyboard.type('chi');
    await expect(dialog.getByRole('status')).toHaveText(/found/);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/assets\/devices\/dev-\d+/);
  });
});

test.describe('device tabs', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('roving tabindex with arrow / Home / End keys; tab and panel are linked', async ({ page }) => {
    await ready(page, '/assets/devices/dev-001');
    const tabs = page.getByRole('tab');
    const n = await tabs.count();
    await expect(tabs.first()).toHaveAttribute('tabindex', '0');
    for (let i = 1; i < n; i++) await expect(tabs.nth(i)).toHaveAttribute('tabindex', '-1');

    await tabs.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(1)).toBeFocused();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('End');
    await expect(tabs.nth(n - 1)).toBeFocused();
    await page.keyboard.press('ArrowRight'); // wraps
    await expect(tabs.first()).toBeFocused();

    const panel = page.getByRole('tabpanel');
    await expect(panel).toHaveAttribute('aria-labelledby', (await tabs.first().getAttribute('id')) ?? '');
  });
});

test.describe('reflow (1.4.10) — no horizontal scrolling at 320 CSS px', () => {
  test.use({ viewport: { width: 320, height: 568 } });

  for (const path of ['/dashboard', '/assets', '/assessments', '/assets/devices/dev-001', '/assets/devices/dev-002']) {
    test(path, async ({ page }) => {
      await ready(page, path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${path} scrolls horizontally at 320px`).toBeLessThanOrEqual(1);
    });
  }
});

test('prefers-reduced-motion disables animations', async ({ page }) => {
  await ready(page, '/assets/devices/dev-001');
  const dur = await page
    .locator('.device-header__badge--critical')
    .evaluate((e) => parseFloat(getComputedStyle(e).animationDuration));
  expect(dur, 'critical badge pulse should be effectively instant').toBeLessThan(0.01);
});
