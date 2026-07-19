import { Component, ViewEncapsulation, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Device, RelatedContract, RelatedDevice } from '@core/models';

@Component({
  selector: 'app-device-actions-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './device-actions-sidebar.component.html',
  styleUrl: './device-actions-sidebar.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DeviceActionsSidebarComponent {
  readonly device          = input.required<Device>();
  readonly relatedContracts = input.required<RelatedContract[]>();
  readonly relatedDevices  = input.required<RelatedDevice[]>();
}
