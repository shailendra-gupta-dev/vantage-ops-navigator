import { Component, ViewEncapsulation, computed, input, signal } from '@angular/core';
import type { Device, DeviceAdvisory, DeviceDetailInfo, ActivityLogEvent, DeviceTab } from '@core/models';
import { AdvisoryTableComponent }    from './advisory-table/advisory-table.component';
import { DeviceInfoPanelComponent }  from './device-info-panel/device-info-panel.component';
import { ContractLifecycleComponent } from './contract-lifecycle/contract-lifecycle.component';
import { ActivityLogComponent }      from './activity-log/activity-log.component';

@Component({
  selector: 'app-device-tabs',
  standalone: true,
  imports: [
    AdvisoryTableComponent,
    DeviceInfoPanelComponent,
    ContractLifecycleComponent,
    ActivityLogComponent,
  ],
  templateUrl: './device-tabs.component.html',
  styleUrl: './device-tabs.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DeviceTabsComponent {
  readonly device       = input.required<Device>();
  readonly advisories   = input.required<DeviceAdvisory[]>();
  readonly deviceDetail = input.required<DeviceDetailInfo | null>();
  readonly activityLog  = input.required<ActivityLogEvent[]>();

  readonly activeTab = signal<DeviceTab>('advisories');

  readonly tabs = computed(() => [
    { id: 'advisories'         as DeviceTab, label: 'Advisories',           badge: this.advisories().length  || null },
    { id: 'device-details'     as DeviceTab, label: 'Device Details',       badge: null },
    { id: 'contract-lifecycle' as DeviceTab, label: 'Contract & Lifecycle', badge: null },
    { id: 'activity-log'       as DeviceTab, label: 'Activity Log',         badge: this.activityLog().length || null },
  ]);

  tabId(id: DeviceTab): string {
    return `device-tab-${id}`;
  }

  /**
   * WAI-ARIA tabs keyboard model (WCAG 2.1.1): ←/→ move between tabs (wrapping), Home/End jump to
   * the first/last tab. Selection follows focus; only the active tab is in the Tab order
   * (roving tabindex), so Tab moves on to the panel instead of through every tab.
   */
  onTabKeydown(event: KeyboardEvent, index: number): void {
    const tabs = this.tabs();
    let next: number;
    switch (event.key) {
      case 'ArrowRight': next = (index + 1) % tabs.length; break;
      case 'ArrowLeft':  next = (index - 1 + tabs.length) % tabs.length; break;
      case 'Home':       next = 0; break;
      case 'End':        next = tabs.length - 1; break;
      default: return;
    }
    event.preventDefault();
    const id = tabs[next]?.id;
    if (!id) return;
    this.activeTab.set(id);
    queueMicrotask(() => document.getElementById(this.tabId(id))?.focus());
  }
}
