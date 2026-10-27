import {
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { filter, map, skip } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { SidebarComponent } from '@core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '@core/layout/header/header.component';
import { ContractPulseStripComponent } from '@core/layout/contract-pulse-strip/contract-pulse-strip.component';
import { SpotlightSearchComponent } from '@core/layout/spotlight-search/spotlight-search.component';
import { FooterComponent } from '@core/layout/footer/footer.component';
import type { NavSection, UserProfile, UserRole } from '@core/models';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    ContractPulseStripComponent,
    SpotlightSearchComponent,
    FooterComponent,
  ],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: { '(document:keydown.escape)': 'closeNav()' },
})
export class AppLayoutComponent {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly header = viewChild(HeaderComponent);
  private readonly mainEl = viewChild<ElementRef<HTMLElement>>('main');

  constructor() {
    // WCAG 2.4.3 Focus Order: in a single-page app a route change must also move focus, otherwise
    // keyboard and screen-reader users are left on a link that no longer leads anywhere. Skip the
    // very first navigation (initial page load) so focus is not stolen on arrival.
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), skip(1), takeUntilDestroyed())
      .subscribe(() => this.focusMain());
  }

  readonly currentRole = signal<UserRole>('engineer');
  readonly navConfig = toSignal(
    this.http
      .get<{ navigation: NavSection[] }>('assets/mock/nav.config.json')
      .pipe(map(res => res.navigation)),
    { initialValue: [] as NavSection[] },
  );

  // The profile's role mirrors the role selected in the top bar's role switcher.
  readonly profile = computed<UserProfile>(() => ({
    name: 'Shailendra G.',
    role: this.currentRole(),
    initials: 'SG',
  }));
  
  readonly searchOpen = signal(false);

  // Below 1024px the sidebar is an off-canvas drawer; this tracks whether it is open.
  readonly navOpen = signal(false);

  // True while the sidebar is a drawer (<1024px): it then behaves as a modal dialog.
  readonly drawerMode = toSignal(
    inject(BreakpointObserver).observe('(max-width: 1023px)').pipe(map(r => r.matches)),
    { initialValue: false },
  );

  /** Close the drawer; by default hand focus back to the hamburger that opened it (WCAG 2.4.3). */
  closeNav(restoreFocus = true): void {
    const wasOpen = this.navOpen();
    this.navOpen.set(false);
    if (wasOpen && restoreFocus) queueMicrotask(() => this.header()?.focusMenu());
  }

  /** Skip link target (WCAG 2.4.1 Bypass Blocks). A plain #hash would be swallowed by the router. */
  skipToMain(event: Event): void {
    event.preventDefault();
    this.focusMain();
  }

  private focusMain(): void {
    this.mainEl()?.nativeElement.focus({ preventScroll: true });
  }

  private readonly activeUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly pageTitle = computed(() => {
    const url = this.activeUrl();
    if (url.startsWith('/assets/devices/')) return 'Device Details';
    if (url.startsWith('/assets'))          return 'Device Spotlight Search';
    if (url.startsWith('/assessments'))     return 'Peer Benchmarking';
    if (url.startsWith('/planning'))        return 'Planning';
    if (url.startsWith('/reports'))         return 'Reports';
    if (url.startsWith('/settings'))        return 'Settings';
    return 'Dashboard';
  });
}
