// Figma node 7:1766 area — Footer
// bg inferred from app layout | border-t | px-[18.75px] pt-[10.375px] pb-[9.375px]
import {
  
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class FooterComponent implements OnInit, OnDestroy {
  readonly currentTime = signal('');

  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.tick();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private tick(): void {
    this.currentTime.set(
      new Date().toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      }),
    );
  }
}
