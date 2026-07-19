import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AssetsComponent } from './assets.component';

describe('AssetsComponent', () => {
  let fixture: ComponentFixture<AssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(AssetsComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the card title', () => {
    const title = fixture.nativeElement.querySelector('.assets-page__card-title');
    expect(title?.textContent?.trim()).toBe('Device Spotlight Search');
  });

  it('renders three bullet items', () => {
    const items = fixture.nativeElement.querySelectorAll('.assets-page__card-list-item');
    expect(items.length).toBe(3);
  });
});
