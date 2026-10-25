import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvisoryTableComponent } from './advisory-table.component';
import type { Device, DeviceAdvisory } from '@core/models';

const device = { id: 'dev-001', name: 'SW-TEST-01' } as Device;

const advisories: DeviceAdvisory[] = [
  {
    id: 'a1',
    cveId: 'CVE-2026-0001',
    title: 'Remote code execution',
    description: 'Remote code execution via crafted packet',
    severity: 'critical',
    cvss: 9.6,
    fixedInVersion: '17.12.1',
    status: 'open',
    publishedAt: '2026-01-01',
  },
  {
    id: 'a2',
    cveId: null,
    title: 'Information disclosure',
    description: 'Information disclosure in SNMP handler',
    severity: 'medium',
    cvss: 5.3,
    fixedInVersion: null,
    status: 'acknowledged',
    publishedAt: '2026-02-01',
  },
];

describe('AdvisoryTableComponent', () => {
  let fixture: ComponentFixture<AdvisoryTableComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AdvisoryTableComponent] }).compileComponents();

    fixture = TestBed.createComponent(AdvisoryTableComponent);
    fixture.componentRef.setInput('device', device);
    fixture.componentRef.setInput('advisories', advisories);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('should render one row per advisory', () => {
    expect(el.querySelectorAll('.advisory-table__row').length).toBe(2);
  });

  // The mobile (<768px) card layout prints each cell's data-label as a caption, so every
  // data cell must carry one.
  it('should label every cell so the mobile card layout can caption it', () => {
    const cells = Array.from(el.querySelector('.advisory-table__row')!.querySelectorAll('td'));
    expect(cells.map((c) => c.getAttribute('data-label'))).toEqual([
      'Severity',
      'CVE ID',
      'Description',
      'CVSS',
      'Fixed In',
      'Status',
      'Actions',
    ]);
  });

  it('should filter by severity', () => {
    fixture.componentInstance.activeSeverity.set('critical');
    fixture.detectChanges();
    expect(el.querySelectorAll('.advisory-table__row').length).toBe(1);
  });

  it('should show the empty state when nothing matches', () => {
    fixture.componentInstance.query.set('no-such-advisory');
    fixture.detectChanges();
    expect(el.querySelector('.advisory-table__empty')).toBeTruthy();
  });
});
