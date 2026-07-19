import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AssessmentsComponent } from './assessments.component';

describe('AssessmentsComponent', () => {
  let fixture: ComponentFixture<AssessmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(AssessmentsComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the page title', () => {
    const title = fixture.nativeElement.querySelector('.assessments-page__title');
    expect(title?.textContent?.trim()).toBe('Peer Benchmarking');
  });

  it('renders 5 cohort items', () => {
    const items = fixture.nativeElement.querySelectorAll('.assessments-page__cohort-item');
    expect(items.length).toBe(5);
  });

  it('renders 3 rank cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('.assessments-page__rank-card');
    expect(cards.length).toBe(3);
  });

  it('renders the info banner', () => {
    const banner = fixture.nativeElement.querySelector('.assessments-page__info-banner');
    expect(banner).toBeTruthy();
    const headline = fixture.nativeElement.querySelector('.assessments-page__info-headline');
    expect(headline?.textContent).toContain('in development');
  });
});
