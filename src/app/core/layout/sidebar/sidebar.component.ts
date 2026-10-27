import {
  Component,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { filter, map } from 'rxjs/operators';

import { RoleSwitcherComponent } from '@core/layout/role-switcher/role-switcher.component';
import type { NavSection, UserProfile, UserRole } from '@core/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, TitleCasePipe, RoleSwitcherComponent, CdkTrapFocus],
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
  // True below 1024px, where the open drawer behaves as a modal dialog (focus trap, aria-modal)
  readonly modal = input<boolean>(false);
  // Emitted when the drawer should close (close button or a nav link was activated)
  readonly closed = output<void>();
  // A nav link was activated: the drawer closes but focus must follow the navigation, not return to the menu button
  readonly navigated = output<void>();
  // Role picked from the drawer's role switcher (the header hides its own below 1024px)
  readonly roleChange = output<UserRole>();

  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');

  constructor() {
    // Opening the modal drawer moves focus into it (WCAG 2.4.3). Done by hand rather than with
    // cdkTrapFocusAutoCapture, which also fires at page load while the trap is still disabled and
    // would steal focus from the page (breaking the skip link as the first Tab stop).
    effect(() => {
      if (this.open() && this.modal()) {
        afterNextRender(() => this.closeButton()?.nativeElement.focus(), { injector: this.injector });
      }
    });
  }

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
