import { Injectable, NgZone, inject, signal } from '@angular/core';
import Lenis from 'lenis';

@Injectable({ providedIn: 'root' })
export class ScrollService {
  private lenis?: Lenis;
  preview = false;
  readonly activeSection = signal('top');
  private frame = 0;
  private readonly update = () => {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      const sections = [...document.querySelectorAll<HTMLElement>('.portfolio-surface main > * > section, .portfolio-surface footer')];
      const current = sections.filter(section => section.getBoundingClientRect().top <= 160).at(-1);
      this.activeSection.set(current?.id || 'top');
      this.progress.set(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight));
    });
  };
  private readonly restoreAnchor = () => { if (window.location.hash && !document.querySelector('dialog[open]')) this.scrollTo(window.location.hash); };

  navigate(event: Event, target: string): void {
    if (!target.startsWith('#') || !document.getElementById(target.slice(1))) return;
    event.preventDefault();
    if (!this.preview && window.location.hash !== target) window.history.pushState(window.history.state, '', window.location.pathname + window.location.search + target);
    this.scrollTo(target);
  }
  private readonly zone = inject(NgZone);
  /** 0..1 progress of the whole page */
  readonly progress = signal(0);
  /** current scroll direction: 1 down, -1 up */
  readonly direction = signal(1);

  init(): void {
    if (typeof window === 'undefined' || this.lenis) return;
    window.addEventListener('scroll', this.update, { passive: true });
    window.addEventListener('hashchange', this.restoreAnchor);
    window.addEventListener('popstate', this.restoreAnchor);
    this.update();
    this.restoreAnchor();
    // The idle RAF loop must not trigger Angular checks on every frame.
    this.zone.runOutsideAngular(() => {
      this.lenis = new Lenis({
        autoRaf: true,
        prevent: (node: HTMLElement) => !!node.closest('dialog'),
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
    if (!this.lenis) {
      if (typeof target === 'string') document.getElementById(target.slice(1))?.scrollIntoView({ behavior: 'instant', block: 'start' });
      else window.scrollTo({ top: target, behavior: 'instant' });
      return;
    }
    this.lenis.scrollTo(target as never, {
      // Lenis reads the section's scroll-margin-top; do not apply it twice.
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
    window.removeEventListener('scroll', this.update);
    window.removeEventListener('hashchange', this.restoreAnchor);
    window.removeEventListener('popstate', this.restoreAnchor);
    cancelAnimationFrame(this.frame);
    this.lenis?.destroy();
    this.lenis = undefined;
  }
}
