import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PercentileRankingComponent } from './percentile-ranking.component';

describe('PercentileRankingComponent', () => {
  let fixture: ComponentFixture<PercentileRankingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PercentileRankingComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(PercentileRankingComponent);
    fixture.detectChanges();
  });

  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
