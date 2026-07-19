import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SidebarComponent } from './sidebar.component';
import type { NavSection, UserProfile } from '@core/models';

const mockNav: NavSection[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    path: '/dashboard',
    roles: ['engineer', 'manager', 'admin'],
    badge: 'live',
    children: [
      { id: 'risk',    label: 'Risk Spotlight',  path: '/dashboard/risk',    roles: ['engineer', 'manager', 'admin'] },
      { id: 'digest',  label: 'Network Digest',  path: '/dashboard/digest',  roles: ['engineer', 'manager', 'admin'] },
      { id: 'health',  label: 'Health Scorecard',path: '/dashboard/health',  roles: ['engineer', 'manager', 'admin'], badge: 'dev' },
    ],
  },
  {
    id: 'assets',
    label: 'Assets',
    icon: 'assets',
    path: '/assets',
    roles: ['engineer', 'manager', 'admin'],
    badge: 'live',
    children: [],
  },
];

const mockProfile: UserProfile = {
  name: 'Shailendra G.',
  role: 'engineer',
  initials: 'SG',
};

describe('SidebarComponent', () => {
  let fixture: ComponentFixture<SidebarComponent>;
  let component: SidebarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    fixture.componentRef.setInput('currentRole', 'engineer');
    fixture.componentRef.setInput('navConfig', mockNav);
    fixture.componentRef.setInput('profile', mockProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all nav sections visible to the current role', () => {
    const items = fixture.nativeElement.querySelectorAll('.sidebar__item--section');
    expect(items.length).toBe(2);
  });

  it('should display LIVE badge on dashboard section', () => {
    const badge = fixture.nativeElement.querySelector('.sidebar__badge--live');
    expect(badge?.textContent?.trim()).toBe('LIVE');
  });

  it('should display user profile name and initials', () => {
    const name = fixture.nativeElement.querySelector('.sidebar__profile-name');
    const avatar = fixture.nativeElement.querySelector('.sidebar__avatar');
    expect(name?.textContent?.trim()).toBe('Shailendra G.');
    expect(avatar?.textContent?.trim()).toBe('SG');
  });
});
