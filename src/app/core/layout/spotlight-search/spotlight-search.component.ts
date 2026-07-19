import {
  
  Component,
  ElementRef,
  HostListener,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { map } from 'rxjs/operators';
import type { Device } from '@core/models';

@Component({
  selector: 'app-spotlight-search',
  standalone: true,
  imports: [CdkTrapFocus],
  templateUrl: './spotlight-search.component.html',
  styleUrl: './spotlight-search.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class SpotlightSearchComponent {
  readonly isOpen = input<boolean>(false);
  readonly closed  = output<void>();

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly allDevices = toSignal(
    this.http.get<{ devices: Device[] }>('assets/mock/devices.json').pipe(
      map(r => r.devices),
    ),
    { initialValue: [] as Device[] },
  );

  readonly query       = signal('');
  readonly activeIndex = signal(-1);

  readonly results = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (q.length < 2) return [] as Device[];
    return this.allDevices().filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.ipAddress.toLowerCase().includes(q) ||
      d.productFamily.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q),
    );
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        setTimeout(() => this.searchInput()?.nativeElement.focus(), 0);
      }
    });
  }

  close(): void {
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) this.close();
  }

  onQueryChange(value: string): void {
    this.query.set(value);
    this.activeIndex.set(-1);
  }

  onKeyDown(event: KeyboardEvent): void {
    const count = this.results().length;
    if (!count) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.set(Math.min(this.activeIndex() + 1, count - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.set(Math.max(this.activeIndex() - 1, -1));
    }
  }

  clearQuery(): void {
    this.query.set('');
    this.activeIndex.set(-1);
    this.searchInput()?.nativeElement.focus();
  }

  openResult(device: Device): void {
    this.router.navigate(['/assets/devices', device.id]);
    this.close();
  }

  healthLabel(status: Device['healthStatus']): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  formatExpiry(dateStr: string | null): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
}
