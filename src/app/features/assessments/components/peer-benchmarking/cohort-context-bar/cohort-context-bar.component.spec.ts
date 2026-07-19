import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CohortContextBarComponent } from './cohort-context-bar.component';

describe('CohortContextBarComponent', () => {
  let fixture: ComponentFixture<CohortContextBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CohortContextBarComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(CohortContextBarComponent);
    fixture.detectChanges();
  });

  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
