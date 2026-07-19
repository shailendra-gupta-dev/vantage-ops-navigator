// Figma node 7:1417 — Role switcher button
// bg rgba(79,70,229,0.1) | border rgba(79,70,229,0.3) | h-[31.25px] | rounded-[11.25px]
import {
  
  Component,
  ElementRef,
  HostListener,
  ViewEncapsulation,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';

import type { UserRole } from '@core/models';

const ROLES: UserRole[] = ['engineer', 'manager', 'admin', 'partner'];

@Component({
  selector: 'app-role-switcher',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './role-switcher.component.html',
  styleUrl: './role-switcher.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class RoleSwitcherComponent {
  readonly selectedRole = input.required<UserRole>();
  readonly roleChange   = output<UserRole>();

  readonly roles  = ROLES;
  readonly isOpen = signal(false);

  private readonly elRef = inject(ElementRef);

  toggle(): void {
    this.isOpen.update(v => !v);
  }

  select(role: UserRole): void {
    this.roleChange.emit(role);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (target instanceof HTMLElement && !this.elRef.nativeElement.contains(target)) {
      this.isOpen.set(false);
    }
  }
}
