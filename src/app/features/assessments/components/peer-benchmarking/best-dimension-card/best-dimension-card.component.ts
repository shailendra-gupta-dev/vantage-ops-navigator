import {
  
  Component,
  ViewEncapsulation,
  computed,
  inject,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { CHART_TOOLTIP } from '@core/utils/chart.utils';

interface BestDimensionData {
  quarters: string[];
  percentiles: number[];
}

@Component({
  selector: 'app-best-dimension-card',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  templateUrl: './best-dimension-card.component.html',
  styleUrl: './best-dimension-card.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class BestDimensionCardComponent {
  private readonly http = inject(HttpClient);

  private readonly chartData = toSignal(
    this.http.get<{ bestDimension: BestDimensionData }>(
      'assets/mock/assessments/peer-benchmarking-charts.json',
    ),
    {
      initialValue: {
        bestDimension: {
          quarters: ["Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26"],
          percentiles: [79, 83, 88, 91],
        },
      },
    },
  );

  readonly chartOpt = computed((): EChartsOption => {
    const d = this.chartData().bestDimension;
    return {
      backgroundColor: 'transparent',
      // Text alternative for the canvas (WCAG 1.1.1): ECharts generates role=img + an aria-label from the data
      aria: { enabled: true, decal: { show: false } },
      tooltip: {
        ...CHART_TOOLTIP,
        trigger: 'axis',
        formatter: (params: any) =>
          `${params[0].name}: <strong>${params[0].value}th %ile</strong>`,
      },
      grid: { left: 0, right: 0, top: 8, bottom: 20, containLabel: false },
      xAxis: {
        type: 'category',
        data: d.quarters,
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#94a3b8', fontSize: 9, fontFamily: 'Inter, system-ui, sans-serif' },
      },
      yAxis: { type: 'value', min: 60, max: 100, show: false },
      series: [{
        type: 'line',
        data: d.percentiles,
        smooth: false,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: '#10b981', width: 1.5 },
        itemStyle: { color: '#10b981' },
        areaStyle: { color: 'rgba(16,185,129,0.15)' },
        label: {
          show: true,
          position: 'top',
          color: '#64748b',
          fontSize: 9,
          fontFamily: 'Inter, system-ui, sans-serif',
          formatter: '{c}%',
        },
      }],
    };
  });
}
