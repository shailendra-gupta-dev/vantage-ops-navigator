import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';

import { SpotlightSearchComponent } from './spotlight-search.component';

describe('SpotlightSearchComponent', () => {
  let fixture: ComponentFixture<SpotlightSearchComponent>;
  let component: SpotlightSearchComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotlightSearchComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SpotlightSearchComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should not render panel when closed', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.spotlight')).toBeNull();
  });

  it('should render panel when open', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.spotlight__panel')).toBeTruthy();
  });

  it('should emit closed on Escape', () => {
    const spy = vi.spyOn(component.closed, 'emit');
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    component.onEscape();
    expect(spy).toHaveBeenCalled();
  });
});
