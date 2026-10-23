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
import { Project } from '../content';
import { RevealDirective } from '../directives/reveal.directive';
import { PortfolioContentService } from '../services/portfolio-content.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <section id="work" class="work-section relative overflow-hidden py-28 md:py-40">
      <div class="work-watermark" aria-hidden="true">Selected work</div>

      <div class="relative mx-auto max-w-[1400px] px-6 md:px-10">
        <header class="grid gap-10 md:grid-cols-12 md:items-end" appReveal>
          <div class="md:col-span-3">
            <p class="font-mono text-[11px] uppercase tracking-[0.3em] text-paper/40">03 — Selected Work</p>
            <span class="mt-4 block h-px w-16 bg-paper/25"></span>
          </div>

          <div class="md:col-span-6">
            <h2 class="font-display text-[2.8rem] font-light leading-[0.98] text-paper md:text-[4.25rem]">
              Interfaces built<br />
              <em class="font-light text-accent">to perform.</em>
            </h2>
          </div>

          <p class="max-w-xs text-sm leading-relaxed text-paper/42 md:col-span-3 md:justify-self-end">
            A curated view of product systems, commerce and digital platforms — engineered across screens and stacks.
          </p>
        </header>

        @if (projects.length) {
          <div class="work-viewer mt-16 border-y border-paper/10 md:mt-24 md:grid md:grid-cols-12" appReveal>
            <nav class="project-index md:col-span-4 lg:col-span-3" aria-label="Select a project">
              <div class="hidden min-h-20 items-center justify-between border-b border-paper/10 pr-7 md:flex">
                <span class="font-mono text-[9px] uppercase tracking-[0.22em] text-paper/32">Project index</span>
                <span class="font-mono text-[9px] tabular-nums tracking-[0.18em] text-paper/30">
                  {{ paddedProject(activeProjectIndex() + 1) }} / {{ paddedProject(projects.length) }}
                </span>
              </div>

              <div class="project-index-list flex overflow-x-auto md:block md:overflow-visible">
                @for (project of projects; track project.index; let pi = $index) {
                  <button
                    type="button"
                    class="project-picker group relative grid min-w-[14rem] shrink-0 grid-cols-[2rem_1fr] gap-3 border-r border-paper/10 px-4 py-5 text-left md:min-h-[92px] md:w-full md:min-w-0 md:border-b md:border-r-0 md:px-0 md:py-5 md:pr-7"
                    [class.is-active]="activeProjectIndex() === pi"
                    [attr.aria-pressed]="activeProjectIndex() === pi"
                    (click)="selectProject(pi)"
                    data-cursor="View"
                  >
                    <span class="picker-index font-mono text-[9px] tabular-nums tracking-[0.18em] text-paper/28">
                      {{ project.index }}
                    </span>
                    <span>
                      <span class="picker-title block font-display text-xl font-light leading-none text-paper/55 transition-colors duration-300 group-hover:text-paper md:text-[1.35rem]">
                        {{ project.title }}
                      </span>
                      <span class="mt-2 block font-mono text-[8px] uppercase tracking-[0.17em] text-paper/28">
                        {{ project.category }} · {{ project.year }}
                      </span>
                    </span>
                    <span class="picker-line absolute inset-y-0 right-0 hidden w-px origin-top scale-y-0 bg-accent transition-transform duration-500 ease-expo md:block"></span>
                  </button>
                }
              </div>

              <div class="hidden items-center gap-3 py-7 pr-7 md:flex">
                <span class="h-px flex-1 bg-paper/10"></span>
                <span class="font-mono text-[8px] uppercase tracking-[0.17em] text-paper/25">Choose a project</span>
              </div>
            </nav>

            <div class="relative md:col-span-8 md:border-l md:border-paper/10 lg:col-span-9">
              @for (project of projects; track project.index; let pi = $index) {
                @if (activeProjectIndex() === pi) {
                  <article class="active-project project-stage" [style.--project-color]="project.palette.orb">
                    <div
                      class="slider relative aspect-[16/10] touch-pan-y overflow-hidden md:aspect-[16/9]"
                      [style.background]="project.palette.base"
                      [class.is-dragging]="dragging() === pi"
                      [class.touring]="hovering() === pi"
                      (pointerdown)="onDragStart($event, pi)"
                      (pointermove)="onDragMove($event, pi)"
                      (pointerup)="onDragEnd($event, pi, project)"
                      (pointercancel)="onDragEnd($event, pi, project)"
                      (pointerleave)="onDragLeave($event, pi, project)"
                      (mouseenter)="onHoverStart(pi)"
                      (mouseleave)="onHoverEnd(pi)"
                      data-cursor="Drag"
                    >
                      <div
                        class="project-orb absolute right-[-10%] top-[-35%] h-[85%] w-[65%] rounded-full blur-3xl"
                        [style.background]="'radial-gradient(circle at 35% 35%, ' + project.palette.orb + 'bb, transparent 68%)'"
                      ></div>
                      <div
                        class="project-orb-secondary absolute bottom-[-45%] left-[-15%] h-[75%] w-[55%] rounded-full blur-3xl"
                        [style.background]="'radial-gradient(circle, ' + project.palette.orb2 + '70, transparent 70%)'"
                      ></div>

                      <div
                        class="slider-track flex h-full will-change-transform"
                        [style.transform]="trackTransform(pi)"
                        [class.no-anim]="dragging() === pi"
                      >
                        @for (image of project.images; track image.src; let ii = $index) {
                          <div class="relative h-full w-full shrink-0 select-none overflow-hidden">
                            <div
                              class="slider-pan absolute left-0 top-0 w-full"
                              [style.height]="panHeight(pi, ii)"
                              [style.transform]="panTransform(pi, ii)"
                              [style.--tour-dur]="tourDur(pi, ii)"
                              [class.panning]="hovering() === pi && slide(pi) === ii"
                            >
                              <img
                                class="slider-img absolute inset-0"
                                [src]="image.src"
                                [alt]="image.alt || project.title + ' — screen ' + (ii + 1)"
                                loading="lazy"
                                decoding="async"
                                draggable="false"
                                (load)="onImageLoad($event, image.src)"
                              />
                            </div>
                          </div>
                        }
                      </div>

                      <div class="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/75 via-transparent to-ink/20"></div>
                      <div class="pointer-events-none absolute inset-0 border border-paper/8"></div>

                      <div class="absolute left-5 top-5 flex items-center gap-3 md:left-7 md:top-7">
                        <span class="rounded-full border border-paper/15 bg-ink/55 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-paper/60 backdrop-blur-md">
                          Screen {{ slide(pi) + 1 }} of {{ project.images.length }}
                        </span>
                        <span class="tour-label hidden font-mono text-[8px] uppercase tracking-[0.16em] text-paper/38 sm:block">
                          Hover to tour
                        </span>
                      </div>

                      <span class="project-ghost pointer-events-none absolute bottom-[-0.16em] left-5 font-display text-[7rem] font-light leading-none text-paper/[0.07] md:left-7 md:text-[11rem]">
                        {{ project.index }}
                      </span>

                      <button
                        type="button"
                        (click)="step(pi, -1, project); $event.stopPropagation()"
                        [attr.aria-label]="'Previous screen — ' + project.title"
                        class="slider-arrow left-4 md:left-6"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <path d="M9 1L3 7l6 6" stroke="currentColor" stroke-width="1.5" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        (click)="step(pi, 1, project); $event.stopPropagation()"
                        [attr.aria-label]="'Next screen — ' + project.title"
                        class="slider-arrow right-4 md:right-6"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <path d="M5 1l6 6-6 6" stroke="currentColor" stroke-width="1.5" />
                        </svg>
                      </button>

                      <div class="absolute bottom-5 right-5 flex items-center gap-2 md:bottom-7 md:right-7">
                        @for (image of project.images; track image.src; let ii = $index) {
                          <button
                            type="button"
                            (click)="goTo(pi, ii); $event.stopPropagation()"
                            [attr.aria-label]="'Show screen ' + (ii + 1) + ' — ' + project.title"
                            [attr.aria-pressed]="slide(pi) === ii"
                            class="screen-dot group/dot grid h-7 w-7 cursor-pointer place-items-center"
                          >
                            <span
                              class="block h-px transition-all duration-500"
                              [class.w-6]="slide(pi) === ii"
                              [class.w-3]="slide(pi) !== ii"
                              [style.background]="slide(pi) === ii ? '#b0704f' : 'rgba(239,239,239,0.35)'"
                            ></span>
                          </button>
                        }
                      </div>
                    </div>

                    <div class="project-copy grid gap-8 border-t border-paper/10 px-5 py-8 md:grid-cols-12 md:px-8 md:py-10 lg:px-10">
                      <div class="md:col-span-7">
                        <p class="font-mono text-[9px] uppercase tracking-[0.22em] text-accent">
                          {{ project.category }} — {{ project.year }}
                        </p>
                        <h3 class="mt-3 font-display text-4xl font-light leading-none text-paper md:text-5xl">
                          {{ project.title }}<span class="text-accent">.</span>
                        </h3>
                        <p class="mt-5 max-w-xl text-sm leading-[1.8] text-paper/48">{{ project.description }}</p>
                      </div>

                      <div class="flex flex-col justify-between gap-8 md:col-span-5 md:border-l md:border-paper/10 md:pl-8">
                        <div class="flex flex-wrap gap-x-5 gap-y-3">
                          @for (technology of project.stack; track technology) {
                            <span class="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-paper/42">
                              <span class="text-accent" aria-hidden="true">+</span>{{ technology }}
                            </span>
                          }
                        </div>

                        <div class="flex flex-col items-stretch gap-3">
                          <button
                            type="button"
                            class="case-study-link group/case inline-flex min-h-12 cursor-pointer items-center justify-between gap-4 border border-accent/60 px-5 font-mono text-[11px] uppercase tracking-[0.15em] text-paper transition-colors duration-300 hover:bg-accent hover:text-ink"
                            (click)="openCase.emit(project)"
                            data-cursor="View"
                          >
                            View case study
                            <span class="transition-transform duration-300 group-hover/case:translate-x-1" aria-hidden="true">→</span>
                          </button>
                          @if (project.url) {
                            <a
                              [href]="project.url"
                              target="_blank"
                              rel="noopener"
                              [attr.aria-label]="'Visit ' + project.title + ' live site (opens in a new tab)'"
                              class="live-site-link inline-flex min-h-12 cursor-pointer items-center justify-between gap-4 border border-paper bg-paper px-5 font-mono text-[11px] uppercase tracking-[0.15em] text-ink transition-colors duration-300 hover:border-accent hover:bg-accent active:bg-paper/80"
                            >
                              Visit live site
                              <span aria-hidden="true">↗</span>
                            </a>
                          }
                        </div>
                      </div>
                    </div>
                  </article>
                }
              }

              <button
                type="button"
                class="next-project group hidden min-h-16 w-full cursor-pointer items-center justify-end gap-3 border-t border-paper/10 px-5 font-mono text-[9px] uppercase tracking-[0.18em] text-paper/60 transition-colors hover:text-paper lg:flex lg:px-10"
                (click)="selectNextProject()"
              >
                Next project
                <span class="grid h-8 w-8 place-items-center rounded-full border border-paper/15 transition-all duration-300 group-hover:border-accent group-hover:text-accent" aria-hidden="true">↓</span>
              </button>
            </div>
          </div>
        } @else {
          <div class="mt-16 border-y border-paper/10 py-20 text-center md:mt-24">
            <p class="font-display text-2xl font-light text-paper/65">Selected work is being prepared.</p>
            <p class="mt-3 text-sm text-paper/35">Please check back soon.</p>
          </div>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .work-section {
        background: linear-gradient(180deg, #0a0a0a, #0b0a0a 48%, #0a0a0a);
      }

      .work-watermark {
        position: absolute;
        top: 2rem;
        right: -0.03em;
        color: rgba(239, 239, 239, 0.018);
        font-family: Fraunces, Georgia, serif;
        font-size: clamp(6rem, 17vw, 18rem);
        font-weight: 300;
        line-height: 1;
        pointer-events: none;
        white-space: nowrap;
      }

      .work-viewer {
        background: rgba(255, 255, 255, 0.008);
      }

      .project-picker {
        cursor: pointer;
        transition: background-color 350ms ease;
      }

      .project-picker:hover,
      .project-picker.is-active {
        background: rgba(239, 239, 239, 0.025);
      }

      .project-picker.is-active .picker-title {
        color: #efefef;
      }

      .project-picker.is-active .picker-index {
        color: #b0704f;
      }

      .project-picker.is-active .picker-line {
        transform: scaleY(1);
      }

      .active-project {
        animation: project-enter 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      @keyframes project-enter {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .project-orb,
      .project-orb-secondary {
        pointer-events: none;
        transition: transform 1.4s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .project-stage:hover .project-orb {
        transform: translate(5%, -7%) scale(1.12);
      }

      .project-stage:hover .project-orb-secondary {
        transform: translate(-4%, 5%) scale(1.1);
      }

      .project-stage:hover .slider-arrow,
      .slider.is-dragging .slider-arrow {
        opacity: 1;
        transform: translateY(-50%) scale(1);
      }

      .tour-label {
        transition: color 300ms ease;
      }

      .slider.touring .tour-label {
        color: rgba(239, 239, 239, 0.72);
      }

      .screen-dot:hover span {
        width: 1.5rem;
      }

      @media (max-width: 767px) {
        .project-index-list {
          scrollbar-gutter: stable;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .active-project {
          animation: none;
        }

        .project-orb,
        .project-orb-secondary,
        .picker-line {
          transition: none;
        }
      }
    `,
  ],
})
export class ProjectsComponent implements AfterViewInit, OnDestroy {
  private readonly content = inject(PortfolioContentService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);
  private parallaxFrame = 0;
  private readonly scrollListener = () => this.scheduleParallax();
  private parallaxEnabled = false;

  @Output() readonly openCase = new EventEmitter<Project>();

  readonly activeProjectIndex = signal(0);
  readonly dragging = signal(-1);
  readonly hovering = signal(-1);

  private readonly slides: Record<number, number> = {};
  private readonly dragOffset: Record<number, number> = {};
  private readonly naturalSize: Record<string, [number, number]> = {};
  private dragStartX = 0;
  private dragStartOffset = 0;

  get projects() {
    return this.content.content().projects;
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.parallaxEnabled = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!this.parallaxEnabled) return;
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.scrollListener, { passive: true });
      window.addEventListener('resize', this.scrollListener, { passive: true });
      this.scheduleParallax();
    });
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.removeEventListener('scroll', this.scrollListener);
    window.removeEventListener('resize', this.scrollListener);
    cancelAnimationFrame(this.parallaxFrame);
  }

  paddedProject(value: number): string {
    return String(value).padStart(2, '0');
  }

  selectProject(index: number): void {
    if (index < 0 || index >= this.projects.length || index === this.activeProjectIndex()) return;

    this.dragging.set(-1);
    this.hovering.set(-1);
    this.activeProjectIndex.set(index);
    if (this.parallaxEnabled) this.zone.runOutsideAngular(() => this.scheduleParallax());
  }

  selectNextProject(): void {
    if (!this.projects.length) return;
    this.selectProject((this.activeProjectIndex() + 1) % this.projects.length);
  }

  onHoverStart(projectIndex: number): void {
    this.hovering.set(projectIndex);
  }

  onHoverEnd(projectIndex: number): void {
    if (this.hovering() === projectIndex) this.hovering.set(-1);
  }

  tourDur(projectIndex: number, imageIndex: number): string {
    const extra = this.tourExtra(projectIndex, imageIndex);
    if (extra < 40) return '7s';

    const boxHeight = this.sliderElement()?.clientHeight || 1;
    return `${Math.min(1.6 + (extra / boxHeight) * 2.2, 14).toFixed(2)}s`;
  }

  slide(projectIndex: number): number {
    return this.slides[projectIndex] ?? 0;
  }

  trackTransform(projectIndex: number): string {
    const offset = this.dragOffset[projectIndex] ?? 0;
    const width = this.sliderElement()?.clientWidth ?? 1;
    const offsetPercent = (offset / width) * 100;
    return `translate3d(calc(${-this.slide(projectIndex) * 100}% + ${offsetPercent}%), 0, 0)`;
  }

  panHeight(projectIndex: number, imageIndex: number): string {
    const naturalSize = this.naturalSize[this.projects[projectIndex]?.images[imageIndex]?.src];
    const slider = this.sliderElement();
    if (!naturalSize || !slider || !slider.clientWidth) return '100%';

    const imageHeight = slider.clientWidth * (naturalSize[1] / naturalSize[0]);
    return imageHeight > slider.clientHeight ? `${imageHeight.toFixed(1)}px` : '100%';
  }

  panTransform(projectIndex: number, imageIndex: number): string {
    if (this.hovering() !== projectIndex || this.slide(projectIndex) !== imageIndex) return 'translateY(0px)';

    const extra = this.tourExtra(projectIndex, imageIndex);
    return extra > 40 ? `translateY(${(-extra).toFixed(1)}px)` : 'translateY(0px)';
  }

  step(projectIndex: number, direction: number, project: Project): void {
    const imageCount = project.images.length;
    if (!imageCount) return;
    this.slides[projectIndex] = (this.slide(projectIndex) + direction + imageCount) % imageCount;
  }

  goTo(projectIndex: number, imageIndex: number): void {
    this.slides[projectIndex] = imageIndex;
  }

  onDragStart(event: PointerEvent, projectIndex: number): void {
    if ((event.target as HTMLElement).closest('button')) return;

    this.dragging.set(projectIndex);
    this.dragStartX = event.clientX;
    this.dragStartOffset = 0;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  onDragMove(event: PointerEvent, projectIndex: number): void {
    if (this.dragging() !== projectIndex) return;

    this.dragStartOffset = event.clientX - this.dragStartX;
    this.dragOffset[projectIndex] = this.dragStartOffset;
    this.zone.run(() => this.cdr.markForCheck());
  }

  onDragEnd(event: PointerEvent, projectIndex: number, project: Project): void {
    if (this.dragging() !== projectIndex) return;

    const delta = this.dragStartOffset;
    this.dragging.set(-1);
    this.dragOffset[projectIndex] = 0;

    const threshold = Math.min((event.currentTarget as HTMLElement).clientWidth * 0.14, 90);
    if (delta < -threshold) this.step(projectIndex, 1, project);
    if (delta > threshold) this.step(projectIndex, -1, project);
  }

  onDragLeave(event: PointerEvent, projectIndex: number, project: Project): void {
    if (this.dragging() === projectIndex && !event.buttons) {
      this.onDragEnd(event, projectIndex, project);
    }
  }

  onImageLoad(event: Event, source: string): void {
    const image = event.target as HTMLImageElement;
    if (!image.naturalWidth || !image.naturalHeight) return;
    this.naturalSize[source] = [image.naturalWidth, image.naturalHeight];
    this.cdr.markForCheck();
  }

  private sliderElement(): HTMLElement | undefined {
    const slider = (this.host.nativeElement as HTMLElement).querySelector('.slider') as HTMLElement | null;
    return slider ?? undefined;
  }

  private tourExtra(projectIndex: number, imageIndex: number): number {
    const naturalSize = this.naturalSize[this.projects[projectIndex]?.images[imageIndex]?.src];
    const slider = this.sliderElement();
    if (!naturalSize || !slider) return 0;

    return (slider.clientWidth || 1) * (naturalSize[1] / naturalSize[0]) - (slider.clientHeight || 1);
  }

  private scheduleParallax(): void {
    if (this.parallaxFrame) return;
    this.parallaxFrame = requestAnimationFrame(() => {
      this.parallaxFrame = 0;
      const slider = this.sliderElement();
      if (!slider) return;
      const viewportHeight = window.innerHeight || 1;
      const rect = slider.getBoundingClientRect();
      // Preserve the effect while avoiding offscreen style writes.
      if (rect.bottom < 0 || rect.top > viewportHeight) return;
      const progress = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
      slider.style.transform = `translateY(${progress * -18}px)`;
    });
  }
}
