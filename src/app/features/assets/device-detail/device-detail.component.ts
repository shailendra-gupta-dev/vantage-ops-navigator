import { Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import type {
  Device, DeviceDetailData, DeviceAdvisory, DeviceDetailInfo,
  ActivityLogEvent, RelatedContract, RelatedDevice,
} from '@core/models';
import { DeviceDetailHeaderComponent }   from './components/device-detail-header/device-detail-header.component';
import { DeviceHealthStatsComponent }    from './components/device-health-stats/device-health-stats.component';
import { DeviceTabsComponent }           from './components/device-tabs/device-tabs.component';
import { DeviceActionsSidebarComponent } from './components/device-actions-sidebar/device-actions-sidebar.component';

@Component({
  selector: 'app-device-detail',
  standalone: true,
  imports: [
    DeviceDetailHeaderComponent,
    DeviceHealthStatsComponent,
    DeviceTabsComponent,
    DeviceActionsSidebarComponent,
  ],
  templateUrl: './device-detail.component.html',
  styleUrl: './device-detail.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DeviceDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly http  = inject(HttpClient);

  readonly deviceId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('deviceId') ?? '')),
    { initialValue: '' },
  );

  private readonly allDevices = toSignal(
    this.http.get<{ devices: Device[] }>('assets/mock/devices.json').pipe(map(r => r.devices)),
    { initialValue: [] as Device[] },
  );

  private readonly detailData = toSignal(
    this.http.get<DeviceDetailData | null>('assets/mock/device-details.json'),
    { initialValue: null },
  );

  readonly device           = computed(() => this.allDevices().find(d => d.id === this.deviceId()) ?? null);
  readonly advisories       = computed((): DeviceAdvisory[]      => this.detailData()?.advisories[this.deviceId()]       ?? []);
  readonly deviceDetail     = computed((): DeviceDetailInfo | null => this.detailData()?.details[this.deviceId()]        ?? null);
  readonly activityLog      = computed((): ActivityLogEvent[]    => this.detailData()?.activityLog[this.deviceId()]      ?? []);
  readonly relatedContracts = computed((): RelatedContract[]     => this.detailData()?.relatedContracts[this.deviceId()] ?? []);
  readonly relatedDevices   = computed((): RelatedDevice[]       => this.detailData()?.relatedDevices[this.deviceId()]   ?? []);
}
