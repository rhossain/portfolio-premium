import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-cursor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div #ring class="cursor-ring">
      <span #label class="cursor-label"></span>
    </div>
    <div #dot class="cursor-dot"></div>
  `,
})
export class CursorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('dot', { static: true }) dot!: ElementRef<HTMLElement>;
  @ViewChild('ring-3', { static: true }) ring!: ElementRef<HTMLElement>;
  @ViewChild('label', { static: true }) label!: ElementRef<HTMLElement>;

  private readonly zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private moveListener?: (e: MouseEvent) => void;
  private overListener?: (e: MouseEvent) => void;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    document.body.classList.add('cursor-active');

    const dotToX = gsap.quickTo(this.dot.nativeElement, 'x', { duration: 0.12, ease: 'power2.out' });
    const dotToY = gsap.quickTo(this.dot.nativeElement, 'y', { duration: 0.12, ease: 'power2.out' });
    const ringToX = gsap.quickTo(this.ring.nativeElement, 'x', { duration: 0.55, ease: 'power3.out' });
    const ringToY = gsap.quickTo(this.ring.nativeElement, 'y', { duration: 0.55, ease: 'power3.out' });

    this.zone.runOutsideAngular(() => {
      this.moveListener = (e: MouseEvent) => {
        dotToX(e.clientX - 3);
        dotToY(e.clientY - 3);
        ringToX(e.clientX - this.ring.nativeElement.offsetWidth / 2);
        ringToY(e.clientY - this.ring.nativeElement.offsetHeight / 2);
      };
      this.overListener = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const labelled = target.closest('[data-cursor]') as HTMLElement | null;
        const interactive = target.closest('a, button');
        const ring = this.ring.nativeElement;
        if (labelled) {
          ring.classList.add('is-label');
          ring.classList.remove('is-hover');
          this.label.nativeElement.textContent = labelled.dataset['cursor'] ?? '';
        } else {
          ring.classList.remove('is-label');
          this.label.nativeElement.textContent = '';
          ring.classList.toggle('is-hover', !!interactive);
        }
      };
      window.addEventListener('mousemove', this.moveListener, { passive: true });
      window.addEventListener('mouseover', this.overListener, { passive: true });
    });
  }

  ngOnDestroy(): void {
    if (this.moveListener) window.removeEventListener('mousemove', this.moveListener);
    if (this.overListener) window.removeEventListener('mouseover', this.overListener);
  }
}
