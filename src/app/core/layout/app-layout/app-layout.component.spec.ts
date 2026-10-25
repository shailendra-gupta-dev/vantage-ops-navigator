import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppLayoutComponent } from './app-layout.component';

describe('AppLayoutComponent', () => {
  let fixture: ComponentFixture<AppLayoutComponent>;
  let component: AppLayoutComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppLayoutComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Answer the mock-data requests (nav config, contracts, ...) without touching the network
    const http = TestBed.inject(HttpTestingController);
    http.match(() => true).forEach((req) =>
      req.flush(req.request.url.includes('nav.config') ? { navigation: [] } : { contracts: [] }),
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the sidebar', () => {
    expect(fixture.nativeElement.querySelector('app-sidebar')).toBeTruthy();
  });

  it('should render the router outlet', () => {
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });

  it('should render the header, contract pulse strip and footer', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-header')).toBeTruthy();
    expect(el.querySelector('app-contract-pulse-strip')).toBeTruthy();
    expect(el.querySelector('app-footer')).toBeTruthy();
  });

  describe('navigation drawer', () => {
    const sidebar = () => fixture.nativeElement.querySelector('.sidebar') as HTMLElement;
    const scrim = () => fixture.nativeElement.querySelector('.app-layout__scrim') as HTMLElement;

    it('should start closed', () => {
      expect(component.navOpen()).toBe(false);
      expect(sidebar().classList.contains('sidebar--open')).toBe(false);
    });

    it('should open from the header hamburger', () => {
      (fixture.nativeElement.querySelector('.app-header__menu') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(component.navOpen()).toBe(true);
      expect(sidebar().classList.contains('sidebar--open')).toBe(true);
      expect(scrim().classList.contains('app-layout__scrim--visible')).toBe(true);
    });

    it('should close from the drawer close button', () => {
      component.navOpen.set(true);
      fixture.detectChanges();
      (fixture.nativeElement.querySelector('.sidebar__close') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(component.navOpen()).toBe(false);
    });

    it('should close when the scrim is clicked', () => {
      component.navOpen.set(true);
      fixture.detectChanges();
      scrim().click();
      fixture.detectChanges();
      expect(component.navOpen()).toBe(false);
    });

    it('should close on Escape', () => {
      component.navOpen.set(true);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();
      expect(component.navOpen()).toBe(false);
    });
  });

  describe('profile role', () => {
    const roleText = () =>
      (fixture.nativeElement.querySelector('.sidebar__profile-role') as HTMLElement).textContent!.trim();

    it('should show the current role capitalised', () => {
      expect(roleText()).toBe('Engineer');
    });

    it('should follow the role chosen in the header switcher', () => {
      component.currentRole.set('admin');
      fixture.detectChanges();
      expect(component.profile().role).toBe('admin');
      expect(roleText()).toBe('Admin');
    });

    it('should follow the role chosen in the drawer switcher', () => {
      const sidebarEl = fixture.nativeElement.querySelector('app-sidebar') as HTMLElement;
      const trigger = sidebarEl.querySelector('.role-switcher__trigger') as HTMLButtonElement;
      trigger.click();
      fixture.detectChanges();
      const options = Array.from(sidebarEl.querySelectorAll('.role-switcher__option')) as HTMLElement[];
      options.find((o) => o.textContent!.trim() === 'Manager')!.click();
      fixture.detectChanges();
      expect(component.currentRole()).toBe('manager');
      expect(roleText()).toBe('Manager');
    });
  });
});
