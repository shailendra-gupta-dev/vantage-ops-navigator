import type { TooltipComponentOption } from 'echarts';

export const CHART_TOOLTIP: TooltipComponentOption = {
  backgroundColor: 'rgba(15,23,42,0.92)',
  borderColor: 'rgba(255,255,255,0.08)',
  borderWidth: 1,
  textStyle: {
    color: '#e2e8f0',
    fontSize: 12,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  extraCssText: 'box-shadow: 0 4px 16px rgba(0,0,0,0.4);',
};
