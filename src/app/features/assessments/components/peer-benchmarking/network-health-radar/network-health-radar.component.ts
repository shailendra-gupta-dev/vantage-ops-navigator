import {
  
  Component,
  ViewEncapsulation,
  computed,
  inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { distinctUntilChanged, fromEvent, map, of, startWith } from 'rxjs';
import type { EChartsOption } from 'echarts';
import { CHART_TOOLTIP } from '@core/utils/chart.utils';

interface RadarChartData {
  indicators: Array<{ name: string; max: number }>;
  yourNetwork: number[];
  industryAvg: number[];
}

@Component({
  selector: 'app-network-health-radar',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  templateUrl: './network-health-radar.component.html',
  styleUrl: './network-health-radar.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class NetworkHealthRadarComponent {
  private readonly http = inject(HttpClient);
  private readonly doc = inject(DOCUMENT);

  // True on phone-width viewports. The radar shrinks there so the outer axis labels
  // (e.g. "Lifecycle Currency") are not clipped by the panel. SSR-safe: no window on the server.
  private readonly narrow = toSignal(
    this.doc.defaultView
      ? fromEvent(this.doc.defaultView, 'resize').pipe(
          map(() => this.isNarrow()),
          startWith(this.isNarrow()),
          distinctUntilChanged(),
        )
      : of(false),
    { initialValue: false },
  );

  private isNarrow(): boolean {
    return (this.doc.defaultView?.innerWidth ?? 1024) < 768;
  }

  private readonly chartData = toSignal(
    this.http.get<{ radar: RadarChartData }>(
      'assets/mock/assessments/peer-benchmarking-charts.json',
    ),
    {
      initialValue: {
        radar: {
          indicators: [
            { name: 'Security Posture', max: 100 },
            { name: 'Uptime SLA',       max: 100 },
            { name: 'Config Standard',  max: 100 },
            { name: 'Support Coverage', max: 100 },
            { name: 'Lifecycle Currency', max: 100 },
          ],
          yourNetwork: [68, 82, 74, 91, 34],
          industryAvg: [58, 68, 55, 70, 52],
        },
      },
    },
  );

  readonly chartOpt = computed((): EChartsOption => {
    const d = this.chartData().radar;
    const narrow = this.narrow();
    return {
      backgroundColor: 'transparent',
      tooltip: { ...CHART_TOOLTIP, trigger: 'item' },
      legend: {
        bottom: 4,
        textStyle: { color: '#64748b', fontSize: 11, fontFamily: 'Inter, system-ui, sans-serif' },
        itemWidth: 16,
        itemHeight: 2,
      },
      radar: {
        indicator: d.indicators,
        shape: 'polygon',
        center: ['50%', '48%'],
        radius: narrow ? '44%' : '62%',
        splitNumber: 3,
        axisName: { color: '#64748b', fontSize: narrow ? 10 : 11, fontFamily: 'Inter, system-ui, sans-serif' },
        splitLine: { lineStyle: { color: 'rgba(71,85,105,0.35)' } },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: 'rgba(71,85,105,0.3)' } },
      },
      series: [{
        type: 'radar',
        data: [
          {
            name: 'Your Network',
            value: d.yourNetwork,
            lineStyle: { color: 'rgba(124,134,255,0.8)', width: 1.5 },
            areaStyle: { color: 'rgba(79,70,229,0.2)' },
            itemStyle: { color: '#7c86ff' },
          },
          {
            name: 'Industry Avg',
            value: d.industryAvg,
            lineStyle: { color: 'rgba(100,116,139,0.5)', width: 1.5, type: 'dashed' },
            areaStyle: { color: 'transparent' },
            itemStyle: { color: '#64748b' },
          },
        ],
      }],
    };
  });
}
