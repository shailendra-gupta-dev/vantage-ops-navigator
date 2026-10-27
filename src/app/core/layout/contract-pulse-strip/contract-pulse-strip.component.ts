// Figma node 7:1425 — ContractPulseStrip
// bg rgba(15,23,42,0.9) | border-b rgba(148,163,184,0.12) | pt-[5.625px] pb-[6.625px] px-[18.75px]
import {
  
  Component,
  ViewEncapsulation,
  input,
  output,
  signal,
} from '@angular/core';

import type { ContractPill } from '@core/models';

const MOCK_CONTRACTS: ContractPill[] = [
  { id: 'C-2025-044', label: 'C-2025-044', daysLeft: 18, urgency: 'red' },
  { id: 'C-2024-881', label: 'C-2024-881', daysLeft: 52, urgency: 'amber' },
  { id: 'C-2023-199', label: 'C-2023-199', daysLeft: 71, urgency: 'green' },
];

@Component({
  selector: 'app-contract-pulse-strip',
  standalone: true,
  imports: [],
  templateUrl: './contract-pulse-strip.component.html',
  styleUrl: './contract-pulse-strip.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ContractPulseStripComponent {
  /** Colour alone must not carry meaning (WCAG 1.4.1): spoken equivalent of the pill colour. */
  urgencyLabel(urgency: string): string {
    switch (urgency) {
      case 'red':   return 'urgent';
      case 'amber': return 'expiring soon';
      default:      return 'on track';
    }
  }

  readonly contracts  = input<ContractPill[]>(MOCK_CONTRACTS);
  readonly dismissed  = output<void>();

  readonly isDismissed = signal(false);

  dismiss(): void {
    this.isDismissed.set(true);
    this.dismissed.emit();
  }
}
