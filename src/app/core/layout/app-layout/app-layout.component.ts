import {
  Component,
  ViewEncapsulation,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
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
  host: { '(document:keydown.escape)': 'navOpen.set(false)' },
})
export class AppLayoutComponent {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

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
