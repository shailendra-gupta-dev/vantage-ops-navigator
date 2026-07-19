import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NeedsFocusCardComponent } from './needs-focus-card.component';

describe('NeedsFocusCardComponent', () => {
  let fixture: ComponentFixture<NeedsFocusCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeedsFocusCardComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(NeedsFocusCardComponent);
    fixture.detectChanges();
  });

  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
