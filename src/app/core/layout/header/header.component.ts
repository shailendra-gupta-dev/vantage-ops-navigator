// Figma node 7:1393 — Header
// bg rgba(15,23,42,0.95) | border-b rgba(148,163,184,0.12) | h-[45px] | px-[18.75px]
import {
  
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';

import { RoleSwitcherComponent } from '@core/layout/role-switcher/role-switcher.component';
import type { UserProfile, UserRole } from '@core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RoleSwitcherComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent {
  readonly currentRole = input.required<UserRole>();
  readonly profile     = input.required<UserProfile>();
  readonly pageTitle   = input<string>('Dashboard');

  readonly roleChange  = output<UserRole>();
  readonly searchOpen  = output<void>();
  readonly menuToggle  = output<void>();
}
