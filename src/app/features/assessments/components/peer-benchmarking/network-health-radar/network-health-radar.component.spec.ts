import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NetworkHealthRadarComponent } from './network-health-radar.component';

describe('NetworkHealthRadarComponent', () => {
  let fixture: ComponentFixture<NetworkHealthRadarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkHealthRadarComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(NetworkHealthRadarComponent);
    fixture.detectChanges();
  });

  it('should create', () => expect(fixture.componentInstance).toBeTruthy());

  // On phones the radar shrinks so outer axis labels such as "Lifecycle Currency" are not clipped.
  // The default test viewport is desktop-wide, so the full-size radius applies.
  it('should use the full radar radius on wide viewports', () => {
    const opt = fixture.componentInstance.chartOpt() as { radar: { radius: string } };
    expect(opt.radar.radius).toBe('62%');
  });
});
