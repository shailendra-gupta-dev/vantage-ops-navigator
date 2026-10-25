import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PercentileRankingComponent } from './percentile-ranking.component';

describe('PercentileRankingComponent', () => {
  let fixture: ComponentFixture<PercentileRankingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PercentileRankingComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(PercentileRankingComponent);
    fixture.detectChanges();
  });

  it('should create', () => expect(fixture.componentInstance).toBeTruthy());

  // Figma lists Security first (top) down to Uptime; ECharts draws the first category at the
  // bottom unless the axis is inverted, which used to render the list upside down.
  it('should list the first dimension at the top (inverted category axis)', () => {
    const opt = fixture.componentInstance.chartOpt() as { yAxis: { inverse?: boolean }; xAxis: { position?: string } };
    expect(opt.yAxis.inverse).toBe(true);
    // ...and keep the % axis at the bottom rather than letting the inversion move it up
    expect(opt.xAxis.position).toBe('bottom');
  });
});
