import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BestDimensionCardComponent } from './best-dimension-card.component';

describe('BestDimensionCardComponent', () => {
  let fixture: ComponentFixture<BestDimensionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BestDimensionCardComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(BestDimensionCardComponent);
    fixture.detectChanges();
  });

  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
