import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NetworkHealthRadarComponent } from './network-health-radar.component';

describe('NetworkHealthRadarComponent', () => {
  let fixture: ComponentFixture<NetworkHealthRadarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkHealthRadarComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(NetworkHealthRadarComponent);
    fixture.detectChanges();
  });

  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
