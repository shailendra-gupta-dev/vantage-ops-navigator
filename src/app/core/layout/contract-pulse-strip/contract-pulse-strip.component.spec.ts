import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractPulseStripComponent } from './contract-pulse-strip.component';

describe('ContractPulseStripComponent', () => {
  let fixture: ComponentFixture<ContractPulseStripComponent>;
  let component: ContractPulseStripComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractPulseStripComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractPulseStripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should render 3 contract pills by default', () => {
    const pills = fixture.nativeElement.querySelectorAll('.pulse-strip__pill');
    expect(pills.length).toBe(3);
  });

  it('should hide strip after dismiss', () => {
    fixture.nativeElement.querySelector('.pulse-strip__dismiss').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pulse-strip')).toBeNull();
  });
});
