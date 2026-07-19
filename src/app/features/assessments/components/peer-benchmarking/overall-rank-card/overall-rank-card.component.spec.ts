import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverallRankCardComponent } from './overall-rank-card.component';

describe('OverallRankCardComponent', () => {
  let fixture: ComponentFixture<OverallRankCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverallRankCardComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(OverallRankCardComponent);
    fixture.detectChanges();
  });

  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
