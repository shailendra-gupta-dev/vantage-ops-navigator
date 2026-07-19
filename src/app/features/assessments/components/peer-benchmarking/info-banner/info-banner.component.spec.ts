import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoBannerComponent } from './info-banner.component';

describe('InfoBannerComponent', () => {
  let fixture: ComponentFixture<InfoBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoBannerComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(InfoBannerComponent);
    fixture.detectChanges();
  });

  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
