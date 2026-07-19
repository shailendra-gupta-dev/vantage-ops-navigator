import {
  
  Component,
  ViewEncapsulation,
  computed,
  inject,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import type { Advisory } from '@core/models';

@Component({
  selector: 'app-risk-spotlight',
  standalone: true,
  imports: [],
  templateUrl: './risk-spotlight.component.html',
  styleUrl: './risk-spotlight.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class RiskSpotlightComponent {
  private readonly http = inject(HttpClient);

  readonly advisories = toSignal(
    this.http
      .get<{ advisories: Advisory[] }>('assets/mock/advisories.json')
      .pipe(map(r => [...r.advisories].sort((a, b) => b.cvss - a.cvss))),
    { initialValue: [] as Advisory[] },
  );

  readonly top = computed(() => this.advisories()[0] ?? null);

  readonly severityLabel = computed(() =>
    (this.top()?.severity ?? '').toUpperCase(),
  );

  readonly cvssBarWidth = computed(() =>
    this.top() ? `${(this.top()!.cvss / 10) * 100}%` : '0%',
  );

  readonly exploitDate = computed(() => {
    const d = this.top()?.publishedAt;
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  });
}
