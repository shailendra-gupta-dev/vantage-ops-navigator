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

type SourceRow = [string, string] | [string, number];

@Component({
  selector: 'app-percentile-ranking',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  templateUrl: './percentile-ranking.component.html',
  styleUrl: './percentile-ranking.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class PercentileRankingComponent {
  private readonly http = inject(HttpClient);

  private readonly chartData = toSignal(
    this.http.get<{ percentileRanking: { source: SourceRow[] } }>(
      'assets/mock/assessments/peer-benchmarking-charts.json',
    ),
    {
      initialValue: {
        percentileRanking: {
          source: [
            ['dimension', 'percentile'],
            ['Security', 68],
            ['Lifecycle', 34],
            ['Coverage', 91],
            ['Config', 74],
            ['Uptime', 82],
          ] as SourceRow[],
        },
      },
    },
  );

  private readonly dimColors = ['#4f46e5', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6'];

  readonly chartOpt = computed((): EChartsOption => {
    const source = this.chartData().percentileRanking.source;
    const colors = this.dimColors;
    return {
      backgroundColor: 'transparent',
      // Text alternative for the canvas (WCAG 1.1.1): ECharts generates role=img + an aria-label from the data
      aria: { enabled: true, decal: { show: false } },
      grid: { left: 56, right: 32, top: 8, bottom: 20, containLabel: false },
      tooltip: {
        ...CHART_TOOLTIP,
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) =>
          `${params[0].name}: <strong>${params[0].value}th %ile</strong>`,
      },
      dataset: { source },
      xAxis: {
        type: 'value',
        // An inverted category axis would otherwise move the % axis to the top
        position: 'bottom',
        min: 0,
        max: 100,
        axisLabel: {
          color: '#475569',
          fontSize: 10,
          fontFamily: 'Inter, system-ui, sans-serif',
          formatter: '{value}%',
        },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLine: { show: false },
      },
      yAxis: {
        type: 'category',
        // First dataset row (Security) at the top, as in the Figma frame
        inverse: true,
        axisLabel: {
          color: '#94a3b8',
          fontSize: 12,
          fontWeight: 700,
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [{
        type: 'bar',
        encode: { x: 'percentile', y: 'dimension' },
        barMaxWidth: 18,
        itemStyle: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          color: (params: any) => colors[params.dataIndex] ?? '#64748b',
          borderRadius: [0, 4, 4, 0],
        },
        label: {
          show: true,
          position: 'right',
          color: '#64748b',
          fontSize: 11,
          fontFamily: 'Inter, system-ui, sans-serif',
          formatter: '{@percentile}%',
        },
        markLine: {
          silent: true,
          data: [{ xAxis: 50 }],
          lineStyle: { type: 'dashed', color: 'rgba(51,65,85,0.9)' },
          label: { formatter: 'Median', color: '#94a3b8', fontSize: 9 },
        },
      }],
    };
  });
}
