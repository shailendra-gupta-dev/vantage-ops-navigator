import {
  Component,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendShort: string;
  tone: 'good' | 'critical' | 'info';
}

// Figma mobile 444:437 | tablet portrait 414:1951 | compact desktop 414:2898 — KPI summary row.
// Only rendered below 1280px, matching the frames (the 1359px desktop frame has no metrics row).
@Component({
  selector: 'app-metric-cards',
  standalone: true,
  templateUrl: './metric-cards.component.html',
  styleUrl: './metric-cards.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class MetricCardsComponent {
  private readonly http = inject(HttpClient);

  readonly metrics = toSignal(
    this.http
      .get<{ metrics: DashboardMetric[] }>('assets/mock/dashboard/metrics.json')
      .pipe(map(r => r.metrics)),
    { initialValue: [] as DashboardMetric[] },
  );
}
