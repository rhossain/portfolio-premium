import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  NgZone,
  OnDestroy,
  Output,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { PROJECTS, Project } from '../content';
import { RevealDirective } from '../directives/reveal.directive';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <section id="work" class="mx-auto max-w-[1400px] px-6 py-28 md:px-10 md:py-40">
      <div class="mb-16 flex items-end justify-between md:mb-24">
        <div appReveal>
          <p class="font-mono text-[11px] uppercase tracking-[0.3em] text-paper/40">03 — Selected Work</p>
          <span class="mt-4 block h-px w-16 bg-paper/25"></span>
        </div>
        <p appReveal class="hidden font-mono text-[11px] uppercase tracking-[0.25em] text-paper/40 md:block">
          {{ projects.length }} projects — hover to tour, drag to browse
        </p>
      </div>

      <div class="grid gap-y-20 md:grid-cols-12 md:gap-x-10 md:gap-y-36">
        @for (p of projects; track p.index; let pi = $index) {
          <article
            appReveal
            class="project-card group md:col-span-7"
            [class.md:col-span-7]="p.wide"
            [class.md:col-span-5]="!p.wide"
            [class.md:col-start-8]="!p.wide && pi % 2 === 1"
            [class.md:mt-24]="!p.wide && pi % 2 === 1"
          >
            <!-- slider -->
            <div
              class="slider relative aspect-3/2 touch-pan-y overflow-hidden"
              [style.background]="p.palette.base"
              data-cursor="Drag"
              [class.is-dragging]="dragging() === pi"
              [class.touring]="hovering() === pi"
              (pointerdown)="onDragStart($event, pi, p)"
              (pointermove)="onDragMove($event, pi)"
              (pointerup)="onDragEnd($event, pi, p)"
              (pointercancel)="onDragEnd($event, pi, p)"
              (pointerleave)="onDragLeave($event, pi, p)"
              (mouseenter)="onHoverStart(pi)"
              (mouseleave)="onHoverEnd(pi)"
            >
              <!-- palette glow behind images while loading -->
              <div
                class="project-orb absolute right-[-15%] top-[-25%] h-[75%] w-[60%] rounded-full blur-2xl"
                [style.background]="'radial-gradient(circle at 35% 35%, ' + p.palette.orb + 'cc, transparent 65%)'"
              ></div>

              <div
                class="slider-track flex h-full will-change-transform"
                [style.transform]="trackTransform(pi)"
                [class.no-anim]="dragging() === pi"
              >
                @for (img of p.images; track img; let ii = $index) {
                  <div class="relative h-full w-full shrink-0 select-none overflow-hidden">
                    <div
                      class="slider-pan absolute left-0 top-0 w-full"
                      [style.height]="panHeight(pi, ii)"
                      [style.transform]="panTransform(pi, ii)"
                      [style.--tour-dur]="tourDur(pi, ii)"
                      [class.panning]="hovering() === pi && slide(pi) === ii"
                    >
                      <div
                        class="slider-img absolute inset-0"
                        role="img"
                        [attr.aria-label]="p.title + ' — screen ' + (ii + 1)"
                        [attr.data-pi]="pi"
                        [attr.data-ii]="ii"
                        [attr.data-src]="img"
                        [style.background-image]="'url(' + img + ')'"
                      ></div>
                    </div>
                  </div>
                }
              </div>

              <!-- gradient veil + hover tint -->
              <div class="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/55 via-transparent to-ink/10"></div>
              <div class="pointer-events-none absolute inset-0 bg-ink/25 transition-colors duration-700 group-hover:bg-ink/0"></div>



              <!-- index counter -->
              <span class="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-paper/15 bg-ink/50 px-3 py-1 font-mono text-[10px] tabular-nums tracking-[0.2em] text-paper/80 backdrop-blur-xs">
                {{ slide(pi) + 1 }} / {{ p.images.length }}
                <span class="text-accent" aria-hidden="true">↕</span>
              </span>

              <!-- project number -->
              <span class="pointer-events-none absolute bottom-4 left-6 font-display text-6xl font-light text-paper/30 md:text-7xl">
                {{ p.index }}
              </span>

              <!-- arrows -->
              <button
                type="button"
                (click)="step(pi, -1, p); $event.stopPropagation()"
                [attr.aria-label]="'Previous image — ' + p.title"
                class="slider-arrow left-4"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 1L3 7l6 6" stroke="currentColor" stroke-width="1.5"/></svg>
              </button>
              <button
                type="button"
                (click)="step(pi, 1, p); $event.stopPropagation()"
                [attr.aria-label]="'Next image — ' + p.title"
                class="slider-arrow right-4"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 1l6 6-6 6" stroke="currentColor" stroke-width="1.5"/></svg>
              </button>

              <!-- progress segments -->
              <div class="absolute bottom-5 right-5 flex gap-1.5">
                @for (img of p.images; track img; let ii = $index) {
                  <button
                    type="button"
                    (click)="goTo(pi, ii); $event.stopPropagation()"
                    [attr.aria-label]="'Go to image ' + (ii + 1)"
                    class="h-[3px] w-7 transition-colors duration-500"
                    [style.background]="slide(pi) === ii ? '#b0704f' : 'rgba(239,239,239,0.25)'"
                  ></button>
                }
              </div>
            </div>

            <!-- meta -->
            <div class="mt-6 flex items-start justify-between gap-6">
              <div>
                <div class="flex items-baseline gap-4">
                  <button
                    type="button"
                    class="group/title text-left"
                    data-cursor="View"
                    (click)="openCase.emit(p)"
                    [attr.aria-label]="'Open case study — ' + p.title"
                  >
                    <h3
                      class="font-display text-2xl font-light text-paper underline-offset-4 transition-all duration-500 ease-expo group-hover:translate-x-2 group-hover/title:underline md:text-[2rem]"
                    >
                      {{ p.title }}
                    </h3>
                  </button>
                  @if (p.url) {
                    <a
                      [href]="p.url"
                      target="_blank"
                      rel="noopener"
                      aria-label="Visit live site"
                      class="translate-y-1 font-mono text-lg text-accent opacity-0 transition-all duration-500 hover:text-paper group-hover:translate-y-0 group-hover:opacity-100"
                      >↗</a
                    >
                  }
                </div>
                <p class="mt-1 font-mono text-[11px] uppercase tracking-[0.25em] text-paper/40">
                  {{ p.category }} — {{ p.year }}
                </p>
                <p class="mt-4 max-w-md text-sm leading-relaxed text-paper/50">{{ p.description }}</p>
                <button
                  type="button"
                  data-cursor="View"
                  (click)="openCase.emit(p)"
                  class="mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-accent transition-colors duration-300 hover:text-paper"
                >
                  Read the case study
                  <span aria-hidden="true" class="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </button>
                <div class="mt-4 flex flex-wrap gap-2">
                  @for (s of p.stack; track s) {
                    <span class="font-mono text-[10px] uppercase tracking-[0.15em] text-paper/40">{{ s }}</span>
                    @if (!$last) {<span class="text-accent/60">·</span>}
                  }
                </div>
              </div>
            </div>
          </article>
        }
      </div>
    </section>
  `,
})
export class ProjectsComponent implements AfterViewInit, OnDestroy {
  readonly projects = PROJECTS;
  @Output() readonly openCase = new EventEmitter<Project>();

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);

  /** current slide index per project index */
  private slides: Record<number, number> = {};
  /** transient drag offset in px per project index */
  private dragOffset: Record<number, number> = {};
  /** project index currently being dragged, or -1 (signal so template reacts) */
  readonly dragging = signal(-1);
  /** project index currently hovered (touring), or -1 */
  readonly hovering = signal(-1);
  /** natural image size per slide, filled on load: "pi-ii" -> [w, h] */
  private natSize: Record<string, [number, number]> = {};
  private dragStartX = 0;
  private dragStartOffset = 0;

  private scrollListener = () => this.scheduleParallax();
  private scheduled = false;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.scrollListener, { passive: true });
      this.scheduleParallax();
      this.measureImages();
    });
  }

  /** cache natural sizes (via preload) so tour distance/duration are exact */
  private measureImages(): void {
    const el = this.host.nativeElement as HTMLElement;
    const divs = Array.from(el.querySelectorAll('.slider-img')) as HTMLElement[];
    divs.forEach((d) => {
      const src = d.dataset['src'];
      if (!src) return;
      const pi = Number(d.dataset['pi']);
      const ii = Number(d.dataset['ii']);
      const probe = new Image();
      probe.onload = () => {
        this.natSize[`${pi}-${ii}`] = [probe.naturalWidth, probe.naturalHeight];
        this.zone.run(() => this.cdr.markForCheck());
      };
      probe.src = src;
    });
  }

  onHoverStart(pi: number): void {
    this.hovering.set(pi);
  }

  onHoverEnd(pi: number): void {
    if (this.hovering() === pi) this.hovering.set(-1);
  }

  /**
   * Smart tour timing: the taller the page screenshot (relative to the
   * slider viewport), the longer the top-to-bottom scroll takes,
   * so every project reads at a similar perceived speed.
   */
  /** tour duration scales with how far the screenshot travels */
  tourDur(pi: number, ii: number): string {
    const extra = this.tourExtra(pi, ii);
    if (extra < 40) return '7s';
    const el = this.host.nativeElement as HTMLElement;
    const slider = el?.querySelectorAll('.slider')[pi] as HTMLElement | undefined;
    const boxH = slider?.clientHeight || 1;
    return `${Math.min(1.6 + (extra / boxH) * 2.2, 14).toFixed(2)}s`;
  }

  slide(pi: number): number {
    return this.slides[pi] ?? 0;
  }

  trackTransform(pi: number): string {
    const offset = this.dragOffset[pi] ?? 0;
    const el = this.host.nativeElement as HTMLElement;
    const slider = el.querySelectorAll('.slider')[pi] as HTMLElement | undefined;
    const width = slider?.clientWidth ?? 1;
    const pct = (offset / width) * 100;
    const x = `calc(${-this.slide(pi) * 100}% + ${pct}%)`;
    return `translate3d(${x}, 0, 0)`;
  }

  /** rendered image height when shown at full slide width (for the pan wrapper) */
  panHeight(pi: number, ii: number): string {
    const nat = this.natSize[`${pi}-${ii}`];
    const el = this.host.nativeElement as HTMLElement;
    const slider = el?.querySelectorAll('.slider')[pi] as HTMLElement | undefined;
    if (!nat || !slider || !slider.clientWidth) return '100%';
    const imgH = slider.clientWidth * (nat[1] / nat[0]);
    return imgH > slider.clientHeight ? `${imgH.toFixed(1)}px` : '100%';
  }

  /** vertical pan: 0 at rest, -(imgH - boxH) while touring the current slide */
  panTransform(pi: number, ii: number): string {
    if (!(this.hovering() === pi && this.slide(pi) === ii)) return 'translateY(0px)';
    const extra = this.tourExtra(pi, ii);
    return extra > 40 ? `translateY(${(-extra).toFixed(1)}px)` : 'translateY(0px)';
  }

  /** how many px the screenshot overflows the slider box for a slide */
  private tourExtra(pi: number, ii: number): number {
    const nat = this.natSize[`${pi}-${ii}`];
    const el = this.host.nativeElement as HTMLElement;
    const slider = el?.querySelectorAll('.slider')[pi] as HTMLElement | undefined;
    if (!nat || !slider) return 0;
    return (slider.clientWidth || 1) * (nat[1] / nat[0]) - (slider.clientHeight || 1);
  }

  step(pi: number, dir: number, p: Project): void {
    const len = p.images.length;
    this.slides[pi] = (this.slide(pi) + dir + len) % len;
  }

  goTo(pi: number, ii: number): void {
    this.slides[pi] = ii;
  }

  onDragStart(e: PointerEvent, pi: number, p: Project): void {
    if ((e.target as HTMLElement).closest('button')) return;
    this.dragging.set(pi);
    this.dragStartX = e.clientX;
    this.dragStartOffset = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  onDragMove(e: PointerEvent, pi: number): void {
    if (this.dragging() !== pi) return;
    this.dragStartOffset = e.clientX - this.dragStartX;
    this.dragOffset[pi] = this.dragStartOffset;
    // run inside Angular so the track transform updates live
    this.zone.run(() => this.cdr.markForCheck());
  }

  onDragEnd(e: PointerEvent, pi: number, p: Project): void {
    if (this.dragging() !== pi) return;
    const delta = this.dragStartOffset;
    this.dragging.set(-1);
    this.dragOffset[pi] = 0;
    const el = e.currentTarget as HTMLElement;
    const threshold = Math.min(el.clientWidth * 0.14, 90);
    if (delta < -threshold) this.step(pi, 1, p);
    else if (delta > threshold) this.step(pi, -1, p);
  }

  onDragLeave(e: PointerEvent, pi: number, p: Project): void {
    // pointer capture keeps events flowing; only reset if buttons released (edge case)
    if (this.dragging() === pi && !e.buttons) {
      this.dragging.set(-1);
      this.dragOffset[pi] = 0;
    }
  }

  private scheduleParallax(): void {
    if (this.scheduled) return;
    this.scheduled = true;
    requestAnimationFrame(() => {
      this.scheduled = false;
      const vh = window.innerHeight;
      const el = this.host.nativeElement as HTMLElement;
      const cards = Array.from(el.querySelectorAll('.slider')) as HTMLElement[];
      cards.forEach((card: HTMLElement) => {
        const r = card.getBoundingClientRect();
        const progress = (r.top + r.height / 2 - vh / 2) / vh;
        card.style.transform = `translateY(${progress * -22}px)`;
      });
    });
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }
}
