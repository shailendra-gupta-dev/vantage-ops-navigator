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

interface NeedsFocusData {
  you: number;
  gapToMedian: number;
  aboveMedian: number;
}

@Component({
  selector: 'app-needs-focus-card',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  templateUrl: './needs-focus-card.component.html',
  styleUrl: './needs-focus-card.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class NeedsFocusCardComponent {
  private readonly http = inject(HttpClient);

  private readonly chartData = toSignal(
    this.http.get<{ needsFocus: NeedsFocusData }>(
      'assets/mock/assessments/peer-benchmarking-charts.json',
    ),
    {
      initialValue: {
        needsFocus: { you: 34, gapToMedian: 16, aboveMedian: 50 },
      },
    },
  );

  readonly chartOpt = computed((): EChartsOption => {
    const d = this.chartData().needsFocus;
    return {
      backgroundColor: 'transparent',
      grid: { left: 0, right: 0, top: 4, bottom: 20, containLabel: false },
      tooltip: { ...CHART_TOOLTIP, trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: {
        bottom: 0,
        textStyle: { color: '#64748b', fontSize: 9, fontFamily: 'Inter, system-ui, sans-serif' },
        itemWidth: 10,
        itemHeight: 6,
      },
      xAxis: { type: 'value', max: 100, show: false },
      yAxis: { type: 'category', data: [''], show: false },
      series: [
        {
          name: `You: ${d.you}th %ile`,
          type: 'bar',
          stack: 'total',
          data: [d.you],
          barMaxWidth: 12,
          itemStyle: { color: 'rgba(245,158,11,0.9)', borderRadius: [6, 0, 0, 6] },
        },
        {
          name: `Gap: ${d.gapToMedian} pts`,
          type: 'bar',
          stack: 'total',
          data: [d.gapToMedian],
          barMaxWidth: 12,
          itemStyle: { color: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.4)' },
        },
        {
          name: 'Median: 50th %ile',
          type: 'bar',
          stack: 'total',
          data: [d.aboveMedian],
          barMaxWidth: 12,
          itemStyle: { color: 'rgba(255,255,255,0.04)', borderRadius: [0, 6, 6, 0] },
        },
      ],
    };
  });
}
