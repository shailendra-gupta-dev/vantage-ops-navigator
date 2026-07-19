import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import type { ContractStatus, Device } from '@core/models';

interface LifecycleMilestone {
  label: string;
  date: string;
  urgency: 'ok' | 'warning' | 'critical';
}

@Component({
  selector: 'app-contract-lifecycle',
  standalone: true,
  imports: [],
  templateUrl: './contract-lifecycle.component.html',
  styleUrl: './contract-lifecycle.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ContractLifecycleComponent {
  readonly device = input.required<Device>();

  readonly milestones = computed((): LifecycleMilestone[] => {
    const ldos = this.device().ldosDate;
    if (!ldos) return [];
    const ldosMs = new Date(ldos).getTime();
    const now = Date.now();
    const daysToLdos = Math.floor((ldosMs - now) / 86400000);

    const eosDate  = new Date(ldosMs - 3 * 365 * 86400000);
    const eoswDate = new Date(ldosMs - 2 * 365 * 86400000);
    const eosfDate = new Date(ldosMs - 1 * 365 * 86400000);
    const ldosDate = new Date(ldosMs);

    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const ldosUrgency = daysToLdos <= 90 ? 'critical' : daysToLdos <= 365 ? 'warning' : 'ok';
    const eosfUrgency = (ldosMs - 365 * 86400000 - now) <= 0 ? 'warning' : 'ok';

    return [
      { label: 'End of Sale',               date: fmt(eosDate),  urgency: 'ok' },
      { label: 'End of SW Maintenance',      date: fmt(eoswDate), urgency: 'ok' },
      { label: 'End of Security Fixes',      date: fmt(eosfDate), urgency: eosfUrgency },
      { label: 'Last Day of Support (LDOS)', date: fmt(ldosDate), urgency: ldosUrgency },
    ];
  });

  readonly contractDaysRemaining = computed(() => {
    const expiry = this.device().contractExpiry;
    if (!expiry) return null;
    return Math.floor((new Date(expiry).getTime() - Date.now()) / 86400000);
  });

  readonly statusLabel = computed(() => {
    const map: Record<ContractStatus, string> = {
      active: 'Active', expiring: 'Expiring', expired: 'Expired', uncovered: 'Uncovered',
    };
    return map[this.device().contractStatus];
  });

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
