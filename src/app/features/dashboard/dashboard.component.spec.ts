import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the risk spotlight', () => {
    expect(fixture.nativeElement.querySelector('app-risk-spotlight')).toBeTruthy();
  });

  it('should render the metrics row', () => {
    expect(fixture.nativeElement.querySelector('app-metric-cards')).toBeTruthy();
  });

  it('should render the network digest and health scorecard inside the shared row', () => {
    const row = fixture.nativeElement.querySelector('.dashboard-page__row');
    expect(row).toBeTruthy();
    expect(row.querySelector('app-network-digest')).toBeTruthy();
    expect(row.querySelector('app-health-scorecard')).toBeTruthy();
  });

  it('should keep the sections in design order', () => {
    const order = Array.from(
      fixture.nativeElement.querySelectorAll(
        'app-risk-spotlight, app-metric-cards, app-network-digest, app-health-scorecard',
      ),
    ).map((el) => (el as HTMLElement).tagName.toLowerCase());
    expect(order).toEqual([
      'app-risk-spotlight',
      'app-metric-cards',
      'app-network-digest',
      'app-health-scorecard',
    ]);
  });
});
