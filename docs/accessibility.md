# Accessibility (WCAG 2.2 AA)

The goal is conformance with **WCAG 2.2 Level AA**. Instead of fixing issues by hand and hoping they
stay fixed, accessibility is **checked automatically on every pull request**, and the check fails the build.

## What is automated

| Layer | Tool | What it catches | Where |
|---|---|---|---|
| 1. Static lint | `angular-eslint` template accessibility rules | Missing alt text, click handlers without keyboard support, non-focusable interactive elements, invalid ARIA, positive `tabindex`, … | `eslint.config.js` → `npm run lint:a11y` |
| 2. Rendered-page audit | `axe-core` (via `@axe-core/playwright`) in Chromium | Colour contrast, names/roles/values, landmarks, headings, target size (2.5.8), labels, scrollable regions, … | `e2e/a11y.spec.ts` |
| 3. Behaviour tests | Playwright keyboard tests | Skip link, focus order/visibility/return, focus traps, arrow-key widgets, focus not hidden under the sticky header, page titles, reflow, reduced motion | `e2e/keyboard.spec.ts` |

The axe audit covers **every route × 4 viewports (375, 768, 1024, 1440)** and the interactive states that
render extra DOM: the search overlay (idle and with results), the open role menu, the open navigation
drawer, and every device-details tab. Rule tags: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`.

### Run it

```bash
npm run lint:a11y        # template lint (fast)
npm run a11y:install     # once: downloads the Chromium Playwright uses
npm run a11y             # axe audit + keyboard tests (starts `ng serve` on :4300 by itself)
npx playwright test e2e/a11y.spec.ts -g "dashboard"   # a subset
npx playwright show-report                            # HTML report after a CI-style run
```

CI runs the same commands in the `accessibility` job of `.github/workflows/ci.yml`; on failure the HTML
report is attached to the run as the `playwright-report` artifact.

### Adding a screen or a new interactive state

* New route → add it to `ROUTES` in `e2e/a11y.spec.ts` (and to the reflow list in `keyboard.spec.ts`).
* New overlay/menu/drawer → add a test that opens it and calls `audit(page, '…')`.
* New custom widget → add a keyboard test next to the existing ones.

## Success criteria and how each is verified

| SC | Level | Verified by |
|---|---|---|
| 1.1.1 Non-text content | A | axe (`image-alt`, `role-img-alt`, …); charts get ECharts' generated `aria-label` and each panel also states its value in text |
| 1.3.1 Info and relationships | A | axe (headings, lists, tables, landmarks); lint (`table-scope`, `valid-aria`) |
| 1.4.1 Use of colour | A | Severity/urgency always has a text equivalent (digest severity, contract-pill urgency, status labels) — code review |
| 1.4.3 Contrast (minimum) | AA | axe `color-contrast` on every screen/state |
| 1.4.4 Resize text / 1.4.10 Reflow | AA | `keyboard.spec.ts` — no horizontal scrolling at 320 CSS px on every route |
| 1.4.11 Non-text contrast | AA | Focus ring is `#a5b4fc` (≥ 3:1 on every surface); other UI boundaries by design review |
| 1.4.12 Text spacing | AA | **Manual** (not automated) |
| 1.4.13 Content on hover/focus | AA | **Manual** (chart tooltips are supplementary; the same data is available as text) |
| 2.1.1 Keyboard / 2.1.2 No keyboard trap | A | `keyboard.spec.ts` (drawer, role menu, search overlay, tabs); axe `scrollable-region-focusable`; lint |
| 2.4.1 Bypass blocks | A | Skip link — `keyboard.spec.ts` |
| 2.4.2 Page titled | A | Per-route titles — `keyboard.spec.ts` |
| 2.4.3 Focus order | A | Focus moves into the drawer/overlay, returns to the opener on close, moves to `<main>` on route change — `keyboard.spec.ts` |
| 2.4.6 Headings and labels | AA | axe (`page-has-heading-one`, `heading-order`, `label`) |
| 2.4.7 Focus visible | AA | Global `:focus-visible` ring — `keyboard.spec.ts` asserts a ≥ 2px outline on every tab stop |
| **2.4.11 Focus not obscured (min)** *(new in 2.2)* | AA | Sticky header + `scroll-padding-top` — `keyboard.spec.ts` tabs the whole mobile page and asserts nothing sits under the header |
| 2.4.13 Focus appearance | AAA | 2px outline, 2px offset, high contrast (met, though AAA) |
| **2.5.7 Dragging movements** *(new)* | AA | N/A — no drag interactions |
| **2.5.8 Target size (minimum)** *(new)* | AA | axe `target-size` (≥ 24px or sufficient spacing) |
| 2.5.3 Label in name | A | axe `label-content-name-mismatch` |
| **3.2.6 Consistent help** *(new)* | A | N/A — no help mechanism on the pages |
| **3.3.7 Redundant entry / 3.3.8 Accessible authentication** *(new)* | A / AA | N/A — no forms or sign-in |
| 3.1.1 Language | A | `<html lang="en">`; axe `html-has-lang` |
| 4.1.2 Name, role, value | A | axe `aria-*`, `button-name`, `link-name`; lint `valid-aria`; combobox/listbox/tab/dialog patterns |
| 4.1.3 Status messages | AA | Polite live region announces search-result counts |

## Design changes made for contrast

WCAG 1.4.3 needs 4.5:1 for normal text. The original palette used several greys at 1.4–3.6:1 on the dark
surfaces, so these text colours changed (fills, borders and chart series colours were left alone):

| Was | Now | Used for |
|---|---|---|
| `#334155`, `#475569`, `#5c6f88`, `#64748b` (text) | `#94a3b8` | De-emphasised text: timestamps, captions, footer, placeholders, scale labels |
| `#e11d48`, `#ef4444` (text) | `#fb7185` | Critical/error **text** (red fills unchanged) |
| `#6366f1` (text) | `#a5b4fc` | Version chip |
| white on amber / cyan / green badges | `#0b1120` / `#04261c` | NEW/UPD digest badges, LIVE badge |
| avatar `#0784d1`; gradient ending `#06b6d4` | `#0369a1`; ending `#0e7490` | White initials on avatars / brand mark |
| 80 % opacity on pill "days" text | 100 % | Contract-pulse pills |

Tokens: `--color-text-muted` is now `#94a3b8`; `--color-critical-text` (`#fb7185`) is the red to use for text.

## What automation cannot tell you (do these by hand)

Automated tools find roughly a third to a half of real-world accessibility problems. Before a release, also check:

* **Screen reader pass** (VoiceOver + Safari, NVDA + Firefox/Chrome): the drawer, role menu, search overlay and tabs are
  built to the WAI-ARIA patterns, but real announcements should be heard at least once.
* **200 % zoom and text-spacing** override (1.4.12) on each screen.
* **Windows High Contrast / forced colors** and `prefers-contrast`.
* **Charts**: the canvas `aria-label` is generated by ECharts; confirm it reads sensibly, and that the text beside each chart carries the key figure.
* **Footer links** are placeholders (`href="#"`) in this proof of concept; real destinations need real link text/targets.
* **Cognitive/plain-language** review of copy, and any new motion.

## Known limitations

* Axe checks the DOM, not canvas pixels — chart label contrast is set in the ECharts options (`#94a3b8`) and reviewed by eye.
* Mock data is static; states such as an empty advisory list or very long device names are not yet exercised by the audit.
