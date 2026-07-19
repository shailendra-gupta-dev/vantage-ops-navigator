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

  readonly securityChartOpt = computed((): EChartsOption => {
    const grade = this.securityGrade();
    const color = this.securityGradeColor();
    const value = this.securityGaugeValue();
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
        radius: '90%',
        center: ['50%', '70%'],
        splitNumber: 4,
        axisLine: {
          lineStyle: {
            width: 8,
            color: [[value / 100, color], [1, 'rgba(255,255,255,0.07)']],
          },
        },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        title: { show: false },
        detail: {
          formatter: () => grade,
          color,
          fontSize: 18,
          fontWeight: 700,
          fontFamily: 'Inter, system-ui, sans-serif',
          offsetCenter: ['0%', '-10%'],
        },
        data: [{ value }],
      }],
    };
  });

  readonly lifecycleChartOpt = computed((): EChartsOption => {
    const d = this.lifecycleStats();
    return {
      backgroundColor: 'transparent',
      grid: { left: 0, right: 0, top: 4, bottom: 0, containLabel: false },
      xAxis: { type: 'value', max: 100, show: false },
      yAxis: { type: 'category', data: [''], show: false },
      series: [
        { name: 'Active',   type: 'bar', stack: 'total', data: [d.active],  barMaxWidth: 14, itemStyle: { color: '#10b981', borderRadius: [7, 0, 0, 7] } },
        { name: 'Near EoS', type: 'bar', stack: 'total', data: [d.nearEos], barMaxWidth: 14, itemStyle: { color: '#f59e0b' } },
        { name: 'EoL',      type: 'bar', stack: 'total', data: [d.eol],     barMaxWidth: 14, itemStyle: { color: '#ef4444' } },
        { name: 'Unknown',  type: 'bar', stack: 'total', data: [d.unknown],  barMaxWidth: 14, itemStyle: { color: '#334155', borderRadius: [0, 7, 7, 0] } },
      ],
      tooltip: { ...CHART_TOOLTIP, trigger: 'axis', axisPointer: { type: 'shadow' } },
    };
  });

  readonly coverageChartOpt = computed((): EChartsOption => {
    const grade = this.coverageStats().grade;
    const pct   = this.coverageStats().pct;
    const color = this.coverageGradeColor();
    return {
      backgroundColor: 'transparent',
      series: [{
        type: 'pie',
        radius: ['62%', '80%'],
        center: ['50%', '50%'],
        startAngle: 90,
        itemStyle: { borderRadius: 5, borderColor: 'transparent', borderWidth: 2 },
        label: {
          show: true,
          position: 'center',
          formatter: () => grade,
          fontSize: 20,
          fontWeight: 700,
          color,
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        data: [
          { value: pct,       name: 'Covered',   itemStyle: { color } },
          { value: 100 - pct, name: 'Uncovered', itemStyle: { color: 'rgba(255,255,255,0.07)' } },
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
    return {
      backgroundColor: 'transparent',
      grid: { left: 4, right: 4, top: 4, bottom: 16, containLabel: false },
      xAxis: {
        type: 'category',
        data: pts.map(p => p.day),
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#475569', fontSize: 8, fontFamily: 'Inter, system-ui, sans-serif' },
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
        lineStyle: { color: '#6366f1', width: 2 },
        itemStyle: { color: '#6366f1' },
        symbol: 'none',
        areaStyle: { color: 'rgba(99,102,241,0.12)' },
      }],
    };
  });
}
