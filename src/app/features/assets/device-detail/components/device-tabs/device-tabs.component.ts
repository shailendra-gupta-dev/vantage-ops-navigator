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
}
