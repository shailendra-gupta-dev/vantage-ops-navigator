import { Component, ViewEncapsulation, computed, input, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import type { Device, DeviceAdvisory, Severity } from '@core/models';

@Component({
  selector: 'app-advisory-table',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './advisory-table.component.html',
  styleUrl: './advisory-table.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AdvisoryTableComponent {
  readonly device     = input.required<Device>();
  readonly advisories = input.required<DeviceAdvisory[]>();

  readonly query          = signal('');
  readonly activeSeverity = signal<Severity | 'all'>('all');

  readonly filtered = computed(() => {
    let list = this.advisories();
    const sev = this.activeSeverity();
    if (sev !== 'all') list = list.filter(a => a.severity === sev);
    const q = this.query().trim().toLowerCase();
    if (q) list = list.filter(a =>
      (a.cveId ?? '').toLowerCase().includes(q) ||
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q),
    );
    return list;
  });

  readonly severityFilters: Array<{ id: Severity | 'all'; label: string }> = [
    { id: 'all',      label: 'All'      },
    { id: 'critical', label: 'Critical' },
    { id: 'high',     label: 'High'     },
    { id: 'medium',   label: 'Medium'   },
    { id: 'low',      label: 'Low'      },
  ];

  cvssColor(score: number): string {
    if (score >= 9.0) return 'var(--color-critical-text)';
    if (score >= 7.0) return 'var(--color-high)';
    if (score >= 4.0) return 'var(--color-warning)';
    return 'var(--color-info)';
  }
}
