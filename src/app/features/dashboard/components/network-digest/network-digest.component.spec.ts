import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { NetworkDigestComponent } from './network-digest.component';
import type { DigestItem } from '@core/models';

const MOCK_ITEMS: DigestItem[] = [
  {
    id: 'dig-001',
    type: 'advisory',
    title: 'CVE-2026-2047 affects 12 of your devices',
    subtitle: 'Critical · Published Wednesday 11:30 AM',
    severity: 'critical',
    publishedAt: '2026-06-08T11:30:00Z',
    route: '/assessments/timeline',
    isNew: true,
  },
  {
    id: 'dig-004',
    type: 'case',
    title: 'Support Case #8821044 — resolution notes added',
    subtitle: 'Engineer: K. Ramirez',
    severity: 'info',
    publishedAt: '2026-06-09T14:22:00Z',
    route: '/support/cases',
    isNew: false,
  },
];

describe('NetworkDigestComponent', () => {
  let fixture: ComponentFixture<NetworkDigestComponent>;
  let component: NetworkDigestComponent;
  let httpCtrl: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkDigestComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(NetworkDigestComponent);
    component = fixture.componentInstance;
    httpCtrl = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpCtrl.verify());

  it('should create', () => {
    httpCtrl.expectOne('assets/mock/digest.json').flush({ items: MOCK_ITEMS });
    expect(component).toBeTruthy();
  });

  it('should count only new items', () => {
    httpCtrl.expectOne('assets/mock/digest.json').flush({ items: MOCK_ITEMS });
    fixture.detectChanges();
    expect(component.newCount()).toBe(1);
  });

  it('should show NEW badge for new items and UPD for seen', () => {
    httpCtrl.expectOne('assets/mock/digest.json').flush({ items: MOCK_ITEMS });
    fixture.detectChanges();
    const badges = fixture.nativeElement.querySelectorAll('.network-digest__item-badge');
    expect(badges[0]?.textContent?.trim()).toBe('NEW');
    expect(badges[1]?.textContent?.trim()).toBe('UPD');
  });

  it('should render 🔴 emoji for critical severity', () => {
    httpCtrl.expectOne('assets/mock/digest.json').flush({ items: [MOCK_ITEMS[0]] });
    fixture.detectChanges();
    const emoji = fixture.nativeElement.querySelector('.network-digest__item-emoji');
    expect(emoji?.textContent?.trim()).toBe('🔴');
  });
});
