import {
  
  Component,
  ViewEncapsulation,
  computed,
  inject,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { map } from 'rxjs';
import type { Device } from '@core/models';
import type { EChartsOption } from 'echarts';
import { CHART_TOOLTIP } from '@core/utils/chart.utils';

@Component({
  selector: 'app-health-scorecard',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  templateUrl: './health-scorecard.component.html',
  styleUrl: './health-scorecard.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class HealthScorecardComponent {
  private readonly http = inject(HttpClient);

  readonly devices = toSignal(
    this.http
      .get<{ devices: Device[] }>('assets/mock/devices.json')
      .pipe(map(r => r.devices)),
    { initialValue: [] as Device[] },
  );

  // ── Security panel ──────────────────────────────────────────────────────────
  readonly securityGrade = computed((): string => {
    const total = this.devices().reduce((s, d) => s + d.criticalAdvisoryCount, 0);
    if (total === 0) return 'A';
    if (total <= 2) return 'B+';
    if (total <= 5) return 'B';
    return 'C';
  });

  readonly securitySubtitle = computed((): string => {
    const total = this.devices().reduce((s, d) => s + d.criticalAdvisoryCount, 0);
    return total === 0
      ? 'No critical CVEs pending'
      : `${total} critical CVE${total !== 1 ? 's' : ''} pending`;
  });

  readonly securityGradeColor = computed((): string => {
    switch (this.securityGrade()) {
      case 'A':  return '#10b981';
      case 'B+': return '#4f46e5';
      case 'B':  return '#f59e0b';
      default:   return '#ef4444';
    }
  });

  private readonly securityGaugeValue = computed((): number => {
    switch (this.securityGrade()) {
      case 'A':  return 95;
      case 'B+': return 75;
      case 'B':  return 55;
      default:   return 35;
    }
  });

  // ── Lifecycle panel ─────────────────────────────────────────────────────────
  readonly lifecycleStats = computed(() => {
    const devices = this.devices();
    const total = devices.length || 1;
    let active = 0, nearEos = 0, eol = 0, unknown = 0;
    for (const d of devices) {
      if (d.daysToLdos === null) unknown++;
      else if (d.daysToLdos > 180) active++;
      else if (d.daysToLdos >= 0) nearEos++;
      else eol++;
    }
    return {
      active:  Math.round((active  / total) * 100),
      nearEos: Math.round((nearEos / total) * 100),
      eol:     Math.round((eol     / total) * 100),
      unknown: Math.round((unknown / total) * 100),
    };
  });

  readonly lifecycleSubtitle = computed((): string => {
    const pct = this.lifecycleStats().nearEos;
    return `${pct}% devices nearing End-of-Support`;
  });

  // ── Coverage panel ──────────────────────────────────────────────────────────
  readonly coverageStats = computed(() => {
    const devices = this.devices();
    const total = devices.length || 1;
    const covered = devices.filter(d => d.contractStatus === 'active').length;
    const pct = Math.round((covered / total) * 100);
    const grade = pct >= 95 ? 'A' : pct >= 85 ? 'B+' : pct >= 75 ? 'B' : 'C';
    return { pct, grade };
  });

  readonly coverageGradeColor = computed((): string => {
    switch (this.coverageStats().grade) {
      case 'A':  return '#10b981';
      case 'B+': return '#4f46e5';
      case 'B':  return '#f59e0b';
      default:   return '#ef4444';
    }
  });

  // ── Connectivity panel (static mock — no time-series in device data) ─────────
  readonly connectivityPoints = [
    { day: 'Mon', uptime: 99.2 },
    { day: 'Tue', uptime: 99.5 },
    { day: 'Wed', uptime: 98.8 },
    { day: 'Thu', uptime: 99.6 },
    { day: 'Fri', uptime: 99.4 },
    { day: 'Sat', uptime: 99.7 },
    { day: 'Sun', uptime: 99.3 },
  ];

  // ── ECharts options ─────────────────────────────────────────────────────────
  // Visual style follows the Figma scorecard (gradient gauge with needle, vertical
  // stacked bar, segmented donut, teal line); the values stay driven by the mock data.

  readonly securityChartOpt = computed((): EChartsOption => {
    const grade = this.securityGrade();
    const color = this.securityGradeColor();
    const value = this.securityGaugeValue();
    // green → lime → amber → orange → red, compressed into the filled part of the arc
    const palette = ['#10b981', '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444'];
    const fill = value / 100;
    const stops: [number, string][] = palette.map((c, i) => [fill * ((i + 1) / palette.length), c]);
    stops.push([1, 'rgba(255,255,255,0.07)']);
    return {
      backgroundColor: 'transparent',
      tooltip: {
        ...CHART_TOOLTIP,
        trigger: 'item',
        formatter: () => `Security Grade: <strong>${grade}</strong>`,
      },
      series: [{
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        radius: '100%',
        center: ['50%', '78%'],
        splitNumber: 4,
        axisLine: { roundCap: true, lineStyle: { width: 9, color: stops } },
        // Needle in the grade colour, as in the Figma gauge
        pointer: { show: true, length: '58%', width: 5, offsetCenter: [0, 0], itemStyle: { color } },
        anchor: { show: true, size: 7, itemStyle: { color } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        title: { show: false },
        detail: {
          formatter: () => grade,
          color,
          fontSize: 20,
          fontWeight: 700,
          fontFamily: 'Inter, system-ui, sans-serif',
          offsetCenter: ['0%', '38%'],
        },
        data: [{ value }],
      }],
    };
  });

  readonly lifecycleChartOpt = computed((): EChartsOption => {
    const d = this.lifecycleStats();
    const label = {
      show: true,
      color: '#fff',
      fontSize: 10,
      fontWeight: 700 as const,
      fontFamily: 'Inter, system-ui, sans-serif',
      formatter: (p: any) => (p.value > 0 ? `${p.value}%` : ''),
    };
    // One vertical stacked bar: Active at the bottom, then Near EoS, EoL, Unknown
    const seg = (name: string, value: number, color: string) => ({
      name, type: 'bar' as const, stack: 'total', data: [value], barWidth: '58%', barMaxWidth: 90,
      itemStyle: { color }, label,
    });
    return {
      backgroundColor: 'transparent',
      grid: { left: 30, right: 6, top: 6, bottom: 2, containLabel: false },
      xAxis: { type: 'category', data: [''], show: false },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        interval: 20,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#64748b', fontSize: 8, formatter: '{value}%', fontFamily: 'Inter, system-ui, sans-serif' },
        splitLine: { lineStyle: { color: 'rgba(148,163,184,0.12)' } },
      },
      series: [
        seg('Active', d.active, '#10b981'),
        seg('Near EoS', d.nearEos, '#f59e0b'),
        seg('EoL', d.eol, '#e11d48'),
        seg('Unknown', d.unknown, '#475569'),
      ],
      tooltip: { ...CHART_TOOLTIP, trigger: 'item', formatter: (p: any) => `${p.seriesName}: <strong>${p.value}%</strong>` },
    };
  });

  readonly coverageChartOpt = computed((): EChartsOption => {
    const { grade, pct } = this.coverageStats();
    const color = this.coverageGradeColor();
    // Uncovered devices are split into expiring (amber) and expired/uncovered (red) slices
    const devices = this.devices();
    const total = devices.length || 1;
    const expiring = Math.round((devices.filter(d => d.contractStatus === 'expiring').length / total) * 100);
    const lapsed = Math.max(0, 100 - pct - expiring);
    return {
      backgroundColor: 'transparent',
      series: [{
        type: 'pie',
        radius: ['58%', '84%'],
        center: ['50%', '50%'],
        startAngle: 90,
        itemStyle: { borderWidth: 0 },
        label: {
          show: true,
          position: 'center',
          formatter: () => grade,
          fontSize: 22,
          fontWeight: 700,
          color,
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        labelLine: { show: false },
        emphasis: { scale: false },
        data: [
          { value: pct,      name: 'Covered',        itemStyle: { color: '#10b981' } },
          { value: expiring, name: 'Expiring',       itemStyle: { color: '#f59e0b' } },
          { value: lapsed,   name: 'Expired / none', itemStyle: { color: '#e11d48' } },
        ],
      }],
      tooltip: {
        ...CHART_TOOLTIP,
        trigger: 'item',
        formatter: '{b}: {d}%',
      },
    };
  });

  readonly connectivityChartOpt = computed((): EChartsOption => {
    const pts = this.connectivityPoints;
    const teal = '#06b6d4';
    return {
      backgroundColor: 'transparent',
      grid: { left: 4, right: 30, top: 8, bottom: 16, containLabel: false },
      xAxis: {
        type: 'category',
        data: pts.map(p => p.day),
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#94a3b8', fontSize: 8, fontFamily: 'Inter, system-ui, sans-serif' },
      },
      yAxis: { type: 'value', min: 98.5, max: 100, show: false },
      tooltip: {
        ...CHART_TOOLTIP,
        trigger: 'axis',
        formatter: (params: any) =>
          `${params[0].name}: <strong>${params[0].value}%</strong> uptime`,
      },
      series: [{
        type: 'line',
        data: pts.map(p => p.uptime),
        smooth: true,
        lineStyle: { color: teal, width: 2 },
        itemStyle: { color: teal, borderColor: '#0f172a', borderWidth: 1 },
        symbol: 'circle',
        symbolSize: 5,
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(6,182,212,0.35)' },
              { offset: 1, color: 'rgba(6,182,212,0.02)' },
            ],
          },
        },
        // 99.5% uptime target, as in the Figma chart
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: 'rgba(148,163,184,0.5)', type: 'dashed', width: 1 },
          label: { show: true, position: 'end', formatter: '99.5%', color: '#94a3b8', fontSize: 8 },
          data: [{ yAxis: 99.5 }],
        },
      }],
    };
  });
}
