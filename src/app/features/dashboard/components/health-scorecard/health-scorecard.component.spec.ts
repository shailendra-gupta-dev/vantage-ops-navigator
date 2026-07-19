import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { HealthScorecardComponent } from './health-scorecard.component';
import type { Device } from '@core/models';

const makeDevice = (overrides: Partial<Device> = {}): Device => ({
  id: 'dev-001',
  name: 'SW-TEST-01',
  productFamily: 'Vertex 9500',
  location: 'Chicago DC',
  role: 'Core Layer',
  healthStatus: 'healthy',
  contractStatus: 'active',
  contractExpiry: '2027-01-01',
  criticalAdvisoryCount: 0,
  highAdvisoryCount: 0,
  mediumAdvisoryCount: 0,
  lowAdvisoryCount: 0,
  daysToLdos: 638,
  ldosDate: '2028-03-15',
  productIconSlug: 'vertex-9500',
  ipAddress: '10.0.0.1',
  softwareVersion: '17.12.03',
  latestAvailableVersion: null,
  ...overrides,
});

describe('HealthScorecardComponent', () => {
  let fixture: ComponentFixture<HealthScorecardComponent>;
  let component: HealthScorecardComponent;
  let httpCtrl: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthScorecardComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(HealthScorecardComponent);
    component = fixture.componentInstance;
    httpCtrl = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpCtrl.verify());

  it('should create', () => {
    httpCtrl.expectOne('assets/mock/devices.json').flush({ devices: [makeDevice()] });
    expect(component).toBeTruthy();
  });

  it('should grade security A when no critical advisories', () => {
    httpCtrl
      .expectOne('assets/mock/devices.json')
      .flush({ devices: [makeDevice({ criticalAdvisoryCount: 0 })] });
    fixture.detectChanges();
    expect(component.securityGrade()).toBe('A');
    expect(component.securityGradeColor()).toBe('#10b981');
  });

  it('should grade security B when total critical count is between 3 and 5', () => {
    httpCtrl
      .expectOne('assets/mock/devices.json')
      .flush({ devices: [makeDevice({ criticalAdvisoryCount: 4 })] });
    fixture.detectChanges();
    expect(component.securityGrade()).toBe('B');
  });

  it('should compute coverage based on active contract ratio', () => {
    const devices = [
      makeDevice({ id: 'a', contractStatus: 'active' }),
      makeDevice({ id: 'b', contractStatus: 'active' }),
      makeDevice({ id: 'c', contractStatus: 'expiring' }),
      makeDevice({ id: 'd', contractStatus: 'active' }),
      makeDevice({ id: 'e', contractStatus: 'active' }),
    ];
    httpCtrl.expectOne('assets/mock/devices.json').flush({ devices });
    fixture.detectChanges();
    expect(component.coverageStats().pct).toBe(80);
    expect(component.coverageStats().grade).toBe('B');
  });

  it('should classify lifecycle segments correctly', () => {
    const devices = [
      makeDevice({ id: 'a', daysToLdos: 638 }),  // active
      makeDevice({ id: 'b', daysToLdos: 18 }),   // nearEos
      makeDevice({ id: 'c', daysToLdos: null }),  // unknown
    ];
    httpCtrl.expectOne('assets/mock/devices.json').flush({ devices });
    fixture.detectChanges();
    const stats = component.lifecycleStats();
    expect(stats.active).toBe(33);
    expect(stats.nearEos).toBe(33);
    expect(stats.unknown).toBe(33);
  });
});
