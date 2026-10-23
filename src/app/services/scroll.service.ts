import { Injectable, NgZone, inject, signal } from '@angular/core';
import Lenis from 'lenis';

@Injectable({ providedIn: 'root' })
export class ScrollService {
  private lenis?: Lenis;
  private readonly zone = inject(NgZone);
  /** 0..1 progress of the whole page */
  readonly progress = signal(0);
  /** current scroll direction: 1 down, -1 up */
  readonly direction = signal(1);

  init(): void {
    if (typeof window === 'undefined' || this.lenis) return;
    // The idle RAF loop must not trigger Angular checks on every frame.
    this.zone.runOutsideAngular(() => {
      this.lenis = new Lenis({
        autoRaf: true,
        lerp: 0.09,
        wheelMultiplier: 1,
        smoothWheel: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      });

      this.lenis.on('scroll', (e: { progress: number; direction: number }) => {
        this.zone.run(() => {
          this.progress.set(e.progress ?? 0);
          // Lenis emits direction 0 when settling; preserve the last direction.
          if (e.direction) this.direction.set(e.direction);
        });
      });
    });
  }

  scrollTo(target: string | number): void {
    this.lenis?.scrollTo(target as never, {
      offset: 0,
      immediate: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
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
    this.lenis = undefined;
  }
}
