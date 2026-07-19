import { Component, ViewEncapsulation, input } from '@angular/core';
import type { Device, DeviceDetailInfo } from '@core/models';

@Component({
  selector: 'app-device-info-panel',
  standalone: true,
  imports: [],
  templateUrl: './device-info-panel.component.html',
  styleUrl: './device-info-panel.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DeviceInfoPanelComponent {
  readonly device = input.required<Device>();
  readonly detail = input.required<DeviceDetailInfo | null>();

  utilLevel(pct: number): 'ok' | 'warning' | 'critical' {
    if (pct > 90) return 'critical';
    if (pct > 70) return 'warning';
    return 'ok';
  }

  relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
