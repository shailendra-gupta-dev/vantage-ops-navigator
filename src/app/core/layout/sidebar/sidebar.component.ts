import {
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';

import { RoleSwitcherComponent } from '@core/layout/role-switcher/role-switcher.component';
import type { NavSection, UserProfile, UserRole } from '@core/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, TitleCasePipe, RoleSwitcherComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent {
  readonly currentRole = input.required<UserRole>();
  readonly navConfig = input.required<NavSection[]>();
  readonly profile = input.required<UserProfile>();
  // Drawer state — only has a visual effect below 1024px
  readonly open = input<boolean>(false);
  // Emitted when the drawer should close (close button or a nav link was activated)
  readonly closed = output<void>();
  // Role picked from the drawer's role switcher (the header hides its own below 1024px)
  readonly roleChange = output<UserRole>();

  onNavClick(event: Event): void {
    if ((event.target as HTMLElement).closest('a')) this.closed.emit();
  }

  private readonly router = inject(Router);

  private readonly activeUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  isActive = (path: string) => computed(() => this.activeUrl().startsWith(path));

  // For child items: exact-segment match to avoid /assets matching /assets/devices/...
  isChildActive = (path: string) => computed(() => {
    const url = this.activeUrl();
    return url === path || url.startsWith(path + '/');
  });

  // Returns the pre-colored icon asset path for a nav section.
  // Active variants exist for: dashboard, assets, assessments.
  // Planning, reports, settings only have inactive variants.
  getNavIconSrc(icon: string, active: boolean): string {
    const hasActiveVariant = icon === 'dashboard' || icon === 'assets' || icon === 'assessments';
    const suffix = active && hasActiveVariant ? 'active' : 'inactive';
    return `assets/icons/${icon}-icon-${suffix}.svg`;
  }
}
