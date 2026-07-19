import { Component, ViewEncapsulation, input } from '@angular/core';
import type { ActivityLogEvent } from '@core/models';

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [],
  templateUrl: './activity-log.component.html',
  styleUrl: './activity-log.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ActivityLogComponent {
  readonly events = input.required<ActivityLogEvent[]>();

  formatTimestamp(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
