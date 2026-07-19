import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
  });

  it('should create', () => expect(fixture.componentInstance).toBeTruthy());

  it('should render version badge', () => {
    expect(fixture.nativeElement.querySelector('.app-footer__version').textContent.trim())
      .toBe('v3.6.9-rc');
  });

  it('should render footer navigation links', () => {
    const links = fixture.nativeElement.querySelectorAll('.app-footer__link');
    expect(links.length).toBe(5);
  });

  it('should render live time', () => {
    const time = fixture.nativeElement.querySelector('.app-footer__time');
    expect(time).toBeTruthy();
  });
});
