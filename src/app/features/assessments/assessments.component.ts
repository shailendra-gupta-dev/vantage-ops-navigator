import {  Component, ViewEncapsulation } from '@angular/core';
import { CohortContextBarComponent } from './components/peer-benchmarking/cohort-context-bar/cohort-context-bar.component';
import { OverallRankCardComponent } from './components/peer-benchmarking/overall-rank-card/overall-rank-card.component';
import { BestDimensionCardComponent } from './components/peer-benchmarking/best-dimension-card/best-dimension-card.component';
import { NeedsFocusCardComponent } from './components/peer-benchmarking/needs-focus-card/needs-focus-card.component';
import { NetworkHealthRadarComponent } from './components/peer-benchmarking/network-health-radar/network-health-radar.component';
import { PercentileRankingComponent } from './components/peer-benchmarking/percentile-ranking/percentile-ranking.component';
import { InfoBannerComponent } from './components/peer-benchmarking/info-banner/info-banner.component';

@Component({
  selector: 'app-assessments',
  standalone: true,
  imports: [
    CohortContextBarComponent,
    OverallRankCardComponent,
    BestDimensionCardComponent,
    NeedsFocusCardComponent,
    NetworkHealthRadarComponent,
    PercentileRankingComponent,
    InfoBannerComponent,
  ],
  templateUrl: './assessments.component.html',
  styleUrl: './assessments.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AssessmentsComponent {}
