import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { RiskSpotlightComponent } from './risk-spotlight.component';
import type { Advisory } from '@core/models';

const MOCK_ADVISORY: Advisory = {
  id: 'adv-001',
  title: 'CVE-2026-1823: Remote Code Execution in MeridianOS XE',
  cveId: 'CVE-2026-1823',
  cvss: 9.8,
  severity: 'critical',
  activeExploit: true,
  publishedAt: '2026-06-03T00:00:00Z',
  patchAvailableAt: '2026-06-03T00:00:00Z',
  daysSincePatch: 7,
  affectedDeviceIds: ['dev-001'],
  affectedDeviceCount: 47,
  priorityScore: 98,
  patchInstructions: 'Upgrade to MeridianOS XE 17.12.3 or later.',
};

describe('RiskSpotlightComponent', () => {
  let fixture: ComponentFixture<RiskSpotlightComponent>;
  let component: RiskSpotlightComponent;
  let httpCtrl: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskSpotlightComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RiskSpotlightComponent);
    component = fixture.componentInstance;
    httpCtrl = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpCtrl.verify());

  it('should create', () => {
    httpCtrl.expectOne('assets/mock/advisories.json').flush({ advisories: [MOCK_ADVISORY] });
    expect(component).toBeTruthy();
  });

  it('should display the top advisory title', () => {
    httpCtrl.expectOne('assets/mock/advisories.json').flush({ advisories: [MOCK_ADVISORY] });
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.risk-spotlight__title')?.textContent).toContain('CVE-2026-1823');
  });

  it('should show exploit pill when activeExploit is true', () => {
    httpCtrl.expectOne('assets/mock/advisories.json').flush({ advisories: [MOCK_ADVISORY] });
    fixture.detectChanges();
    const pill = fixture.nativeElement.querySelector('.risk-spotlight__exploit-pill');
    expect(pill).toBeTruthy();
  });

  it('should sort advisories by cvss descending', () => {
    const low: Advisory = { ...MOCK_ADVISORY, id: 'adv-low', cvss: 4.0 };
    httpCtrl.expectOne('assets/mock/advisories.json').flush({ advisories: [low, MOCK_ADVISORY] });
    fixture.detectChanges();
    expect(component.top()?.cvss).toBe(9.8);
  });
});
