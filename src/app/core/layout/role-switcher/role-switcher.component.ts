// Figma node 7:1417 — Role switcher button
// bg rgba(79,70,229,0.1) | border rgba(79,70,229,0.3) | h-[31.25px] | rounded-[11.25px]
//
// Accessibility (WCAG 2.1.1 Keyboard, 2.4.3 Focus Order, 4.1.2 Name/Role/Value):
// menu-button + listbox pattern. The trigger opens the list with Enter/Space/ArrowDown/ArrowUp;
// the list takes focus and exposes the highlighted option through aria-activedescendant.
// ↑/↓ move, Home/End jump, Enter/Space select, Escape closes and returns focus to the trigger.
import {
  Component,
  ElementRef,
  HostListener,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';

import type { UserRole } from '@core/models';

const ROLES: UserRole[] = ['engineer', 'manager', 'admin', 'partner'];

let nextId = 0;

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
  /** Index of the option highlighted with the keyboard (aria-activedescendant). */
  readonly activeIndex = signal(0);

  /** Unique per instance: the switcher renders in the header and in the mobile drawer. */
  readonly uid = `role-switcher-${nextId++}`;

  private readonly elRef = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly listbox = viewChild<ElementRef<HTMLUListElement>>('listbox');

  optionId(index: number): string {
    return `${this.uid}-option-${index}`;
  }

  toggle(): void {
    if (this.isOpen()) this.close(true);
    else this.open();
  }

  open(): void {
    this.activeIndex.set(Math.max(0, this.roles.indexOf(this.selectedRole())));
    this.isOpen.set(true);
    // Move focus into the list once it exists so arrow keys work immediately.
    afterNextRender(() => this.listbox()?.nativeElement.focus(), { injector: this.injector });
  }

  close(returnFocus: boolean): void {
    this.isOpen.set(false);
    if (returnFocus) this.trigger()?.nativeElement.focus();
  }

  select(role: UserRole): void {
    this.roleChange.emit(role);
    this.close(true);
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      // Closed: open. Already open but focus has not reached the list yet: act on the list.
      if (!this.isOpen()) this.open();
      else this.onListKeydown(event);
    }
  }

  onListKeydown(event: KeyboardEvent): void {
    const last = this.roles.length - 1;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.update(i => (i >= last ? 0 : i + 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update(i => (i <= 0 ? last : i - 1));
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(0);
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(last);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        {
          const role = this.roles[this.activeIndex()];
          if (role) this.select(role);
        }
        break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        this.close(true);
        break;
      case 'Tab':
        // Let focus move on naturally, but do not leave the list open behind it.
        this.close(false);
        break;
    }
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (target instanceof HTMLElement && !this.elRef.nativeElement.contains(target)) {
      this.isOpen.set(false);
    }
  }
}
