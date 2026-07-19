import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Device } from '@core/models';

@Component({
  selector: 'app-device-detail-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './device-detail-header.component.html',
  styleUrl: './device-detail-header.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DeviceDetailHeaderComponent {
  readonly device = input.required<Device>();

  readonly healthLabel = computed(() => {
    const s = this.device().healthStatus;
    return s.charAt(0).toUpperCase() + s.slice(1);
  });
}
