import {
  
  Component,
  ViewEncapsulation,
  computed,
  inject,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import type { DigestItem, Severity } from '@core/models';

interface DisplayDigestItem extends DigestItem {
  emoji: string;
  badgeLabel: string;
  badgeColor: string;
  timeLabel: string;
}

@Component({
  selector: 'app-network-digest',
  standalone: true,
  imports: [],
  templateUrl: './network-digest.component.html',
  styleUrl: './network-digest.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class NetworkDigestComponent {
  private readonly http = inject(HttpClient);

  private readonly rawItems = toSignal(
    this.http
      .get<{ items: DigestItem[] }>('assets/mock/digest.json')
      .pipe(map(r => r.items)),
    { initialValue: [] as DigestItem[] },
  );

  readonly newCount = computed(
    () => this.rawItems().filter(i => i.isNew !== false).length,
  );

  readonly items = computed<DisplayDigestItem[]>(() =>
    this.rawItems().map(item => ({
      ...item,
      emoji: this.severityEmoji(item.severity),
      badgeLabel: item.isNew !== false ? 'NEW' : 'UPD',
      badgeColor:
        item.isNew !== false
          ? this.severityBadgeColor(item.severity)
          : '#06b6d4',
      timeLabel: this.formatTime(item.publishedAt),
    })),
  );

  private severityEmoji(s: Severity): string {
    switch (s) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟡';
      case 'medium':
        return '🟠';
      default:
        return '🔵';
    }
  }

  private severityBadgeColor(s: Severity): string {
    switch (s) {
      case 'critical':
        return '#e11d48';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#f59e0b';
      default:
        return '#06b6d4';
    }
  }

  private formatTime(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
}
