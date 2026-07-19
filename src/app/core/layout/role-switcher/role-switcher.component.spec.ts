import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { RoleSwitcherComponent } from './role-switcher.component';

describe('RoleSwitcherComponent', () => {
  let fixture: ComponentFixture<RoleSwitcherComponent>;
  let component: RoleSwitcherComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleSwitcherComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleSwitcherComponent);
    fixture.componentRef.setInput('selectedRole', 'engineer');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should show selected role in trigger', () => {
    const label = fixture.nativeElement.querySelector('.role-switcher__label');
    expect(label.textContent.trim().toLowerCase()).toContain('engineer');
  });

  it('should open dropdown on trigger click', () => {
    fixture.nativeElement.querySelector('.role-switcher__trigger').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.role-switcher__menu')).toBeTruthy();
  });

  it('should emit roleChange when a role is selected', () => {
    const spy = vi.spyOn(component.roleChange, 'emit');
    component.select('manager');
    expect(spy).toHaveBeenCalledWith('manager');
  });
});
