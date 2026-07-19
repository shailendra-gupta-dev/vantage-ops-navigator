# Vantage Ops Navigator

A network operations dashboard concept for tracking device health, security advisories, support contracts, and peer benchmarking across a fleet of network devices — built with Angular 22 using standalone components, Signals, and zoneless change detection.

This is a personal portfolio project backed by mock JSON data (no real backend). All company names, product families, and vendor references (e.g. "Meridian Networks", "MeridianOS", "Vertex", "Aegis") are fictional; any resemblance to real products is for realism only. This project is not affiliated with, endorsed by, or built for any real vendor.

## Features

- **Dashboard** — critical risk spotlight, a rolling network digest feed, and a health scorecard across four dimensions
- **Assets** — searchable device inventory with a device detail view (health stats, advisory table, contract lifecycle, activity log, related devices)
- **Assessments** — peer benchmarking (percentile ranking, network health radar, best/needs-focus dimensions, cohort context)
- **Spotlight search** (⌘K) — global search overlay across devices and nav destinations
- **Role-based navigation** — the sidebar, and the pages it exposes, change live as you switch between Engineer / Manager / Admin / Partner roles
- Server-side rendering via `@angular/ssr` + Express

## Tech stack

| | |
|---|---|
| Framework | Angular 22 — standalone components, Signals, zoneless change detection |
| Styling | Tailwind CSS v4 (`@theme` tokens) + SCSS (BEM) |
| Charts | ECharts via `ngx-echarts` |
| Data | Static JSON under `src/assets/mock/`, fetched via `HttpClient` + `toSignal` |
| Testing | Vitest |
| SSR | `@angular/ssr` + Express |

## Design & build workflow

Every screen started as a design, not a template:

1. **Mockups** — designed in Figma using **Figma Make** to generate the visual mockups (layout, screens, states) for the dashboard, device detail, and assessments views.
2. **Design-to-code** — implemented in **Claude Code**, connected to Figma via the **Figma MCP server**. Claude read the actual node structure, styles, and screenshots straight from the Figma file for each screen and translated them into the Angular components, matching spacing, color tokens, and typography rather than approximating from a static image.

The result is a codebase where the Tailwind `@theme` tokens, component layout, and BEM class structure trace directly back to the Figma source, rather than being hand-eyeballed from a screenshot.

## Getting started

```bash
npm install
npm start        # ng serve — http://localhost:4200
npm run build    # ng build — output in dist/
npm test         # ng test — Vitest
```

## Project structure

```
src/app/
  core/
    layout/       # AppLayoutComponent + Sidebar, Header, Footer, RoleSwitcher, SpotlightSearch, ContractPulseStrip
    models/        # Shared TypeScript interfaces (Device, Advisory, NavSection, ...)
    stores/        # Signal-based state (contracts, digest, risk, role, search)
    utils/         # Chart helpers
  features/
    dashboard/     # Risk spotlight, network digest, health scorecard
    assets/        # Device search + device-detail (tabs: advisories, details, contracts, activity)
    assessments/   # Peer benchmarking
src/assets/
  mock/            # JSON fixtures the app is entirely driven by
  icons/, logo/
```

## Navigation framework

The sidebar isn't hardcoded — it's driven entirely by a declarative, role-filtered nav config, so adding, removing, or reordering nav destinations (including gating them by role) never touches component templates.

**1. The config is data**, a JSON tree fetched at runtime (`src/assets/mock/nav.config.json`):

```json
{
  "id": "assets",
  "label": "Assets",
  "icon": "assets",
  "path": "/assets",
  "roles": ["admin", "engineer", "manager", "partner"],
  "badge": "live",
  "children": [
    { "id": "device-search", "label": "Device Search", "path": "/assets", "roles": [...] },
    { "id": "coverage-gap", "label": "Coverage Gap", "path": "/assets/coverage-gap", "roles": [...], "badge": "dev" }
  ]
}
```

**2. The shape is a typed contract** (`src/app/core/models/index.ts`):

```ts
export interface NavSection {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles: UserRole[];
  badge?: BadgeStatus;       // 'live' | 'dev' | 'none' — flags shipped vs in-progress destinations
  children: NavChild[];
}

export interface NavChild {
  id: string;
  label: string;
  path: string;
  roles: UserRole[];
  badge?: BadgeStatus;
}
```

**3. `AppLayoutComponent` loads it once** and exposes it as a signal, alongside the current role:

```ts
readonly navConfig = toSignal(
  this.http.get<{ navigation: NavSection[] }>('assets/mock/nav.config.json')
    .pipe(map(res => res.navigation)),
  { initialValue: [] as NavSection[] },
);
readonly currentRole = signal<UserRole>('engineer');
```

**4. `SidebarComponent` renders it reactively**, filtering every section and every child independently by role:

```html
@for (section of navConfig(); track section.id) {
  @if (section.roles.includes(currentRole())) {
    ...
    @for (child of section.children; track child.id) {
      @if (child.roles.includes(currentRole())) { ... }
    }
  }
}
```

Switching roles (via `RoleSwitcherComponent`, whose `roleChange` output bubbles up through the header to the layout's `currentRole` signal) instantly recomputes what's visible — no manual re-fetch, no extra subscriptions, since everything downstream of the signal reacts on its own.

**5. Other conventions baked into the framework:**
- **Active-state resolution** is derived from router events (`toSignal` over `NavigationEnd`), with `startsWith` matching for parent sections and exact-segment matching for children — so `/assets` doesn't falsely light up while viewing `/assets/devices/dev-001`.
- **Icons are resolved by convention**, not hardcoded per item: `getNavIconSrc(icon, active)` maps a nav item's `icon` slug to `assets/icons/{icon}-icon-{active|inactive}.svg`, decoupling the config from asset file naming.
- **A standalone `RoleStore`** (`core/stores/role.store.ts`, `providedIn: 'root'`) exposes role state as an injectable signal — available for components outside the layout tree to read/set role, though `AppLayoutComponent` currently keeps its own local signal rather than injecting it.

The result: shipping a new nav destination — including one that's role-gated or marked "in dev" — is a JSON edit, not a template change.

## License

All rights reserved. This code is public for portfolio/reference purposes; no license is granted for reuse.
