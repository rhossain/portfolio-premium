import { Directive, ElementRef, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { gsap } from 'gsap';

/**
 * Magnetic hover: element is gently pulled toward the cursor
 * and elastically returns on leave. Apply to buttons / links.
 */
@Directive({
  selector: '[appMagnetic]',
  standalone: true,
})
export class MagneticDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  private move = (e: MouseEvent) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = this.el.nativeElement.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    gsap.to(this.el.nativeElement, {
      x: relX * 0.35,
      y: relY * 0.35,
      duration: 0.6,
      ease: 'power3.out',
    });
  };

  private leave = () => {
    gsap.to(this.el.nativeElement, {
      x: 0,
      y: 0,
      duration: 0.9,
      ease: 'elastic.out(1, 0.4)',
    });
  };

  ngOnInit(): void {
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return;
    this.zone.runOutsideAngular(() => {
      this.el.nativeElement.addEventListener('mousemove', this.move);
      this.el.nativeElement.addEventListener('mouseleave', this.leave);
    });
  }

  ngOnDestroy(): void {
    this.el.nativeElement.removeEventListener('mousemove', this.move);
    this.el.nativeElement.removeEventListener('mouseleave', this.leave);
  }
}
