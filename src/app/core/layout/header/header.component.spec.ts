import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentRef.setInput('currentRole', 'engineer');
    fixture.componentRef.setInput('profile', { name: 'Shailendra G.', role: 'engineer', initials: 'SG' });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should render breadcrumb with default page title', () => {
    const page = fixture.nativeElement.querySelector('.app-header__breadcrumb-page');
    expect(page.textContent.trim()).toBe('Dashboard');
  });

  it('should render user initials in avatar', () => {
    const avatar = fixture.nativeElement.querySelector('.app-header__avatar');
    expect(avatar.textContent.trim()).toBe('SG');
  });

  it('should emit searchOpen when search button is clicked', () => {
    const spy = vi.spyOn(component.searchOpen, 'emit');
    fixture.nativeElement.querySelector('.app-header__search').click();
    expect(spy).toHaveBeenCalled();
  });
});
