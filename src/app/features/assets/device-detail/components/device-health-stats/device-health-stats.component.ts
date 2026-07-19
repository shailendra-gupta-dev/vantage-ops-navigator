import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import type { ContractStatus, Device } from '@core/models';

@Component({
  selector: 'app-device-health-stats',
  standalone: true,
  imports: [],
  templateUrl: './device-health-stats.component.html',
  styleUrl: './device-health-stats.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DeviceHealthStatsComponent {
  readonly device = input.required<Device>();

  readonly ldosUrgency = computed((): string => {
    const days = this.device().daysToLdos;
    if (days == null) return 'healthy';
    if (days <= 90)   return 'critical';
    if (days <= 365)  return 'warning';
    return 'healthy';
  });

  readonly contractLabel = computed(() => {
    const map: Record<ContractStatus, string> = {
      active:    'Active',
      expiring:  'Expiring',
      expired:   'Expired',
      uncovered: 'Uncovered',
    };
    return map[this.device().contractStatus];
  });

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
