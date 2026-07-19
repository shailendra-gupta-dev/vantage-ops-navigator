import {
  
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { RiskSpotlightComponent } from './components/risk-spotlight/risk-spotlight.component';
import { NetworkDigestComponent } from './components/network-digest/network-digest.component';
import { HealthScorecardComponent } from './components/health-scorecard/health-scorecard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RiskSpotlightComponent, NetworkDigestComponent, HealthScorecardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent {}
