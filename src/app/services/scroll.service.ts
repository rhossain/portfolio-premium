import { Injectable, NgZone, signal } from '@angular/core';
import Lenis from 'lenis';

@Injectable({ providedIn: 'root' })
export class ScrollService {
  private lenis?: Lenis;
  /** 0..1 progress of the whole page */
  readonly progress = signal(0);
  /** current scroll direction: 1 down, -1 up */
  readonly direction = signal(1);

  init(): void {
    if (typeof window === 'undefined') return;
    this.lenis = new Lenis({
      autoRaf: true,
      lerp: 0.09,
      wheelMultiplier: 1,
    });
    document.documentElement.classList.add('lenis', 'lenis-smooth');

    this.lenis.on('scroll', (e: { progress: number; direction: number }) => {
      this.progress.set(e.progress ?? 0);
      this.direction.set(e.direction ?? 1);
    });
  }

  scrollTo(target: string | number): void {
    this.lenis?.scrollTo(target as never, {
      offset: 0,
      duration: 1.4,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
    });
  }

  stop(): void {
    this.lenis?.stop();
  }

  start(): void {
    this.lenis?.start();
  }

  destroy(): void {
    this.lenis?.destroy();
  }
}
