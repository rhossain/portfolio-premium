import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  PLATFORM_ID,
  ViewChild,
  inject,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { DialogDirective } from '../shared/dialog.directive';
import { ImageViewerComponent } from '../shared/image-viewer.component';
import { Project } from '../content';
import { ScrollService } from '../services/scroll.service';

@Component({
  selector: 'app-case-study',
  standalone: true,
  imports: [DialogDirective, ImageViewerComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    @if (project) {
      <dialog appDialog (dismissed)="requestClose()"
        class="case-study fixed inset-0 z-90"
        [class.is-open]="open()"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="project.title + ' — case study'"
      >
        <!-- backdrop -->
        <div class="case-backdrop absolute inset-0 bg-ink/80 backdrop-blur-md" (click)="requestClose()"></div>

        <!-- panel -->
        <div class="case-panel absolute inset-x-0 bottom-0 top-[4vh] overflow-hidden md:inset-x-[3vw] md:top-[5vh]">
          <div class="relative h-full w-full overflow-y-auto bg-ink case-scroll" tabindex="0" role="region" [attr.aria-label]="project.title + ' case study content'" #scroller data-lenis-prevent>
            <!-- sticky header -->
            <header
              class="sticky top-0 z-10 flex items-center justify-between border-b border-paper/10 bg-ink/85 px-6 py-4 backdrop-blur-md md:px-12"
            >
              <div class="flex items-baseline gap-4">
                <span class="font-display text-xl font-light text-accent md:text-2xl">{{ project.index }}</span>
                <span class="font-display text-xl font-light text-paper md:text-2xl">{{ project.title }}</span>
                <span class="hidden font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70 md:inline">
                  {{ project.category }} — {{ project.year }}
                </span>
              </div>
              <div class="flex items-center gap-3">
                @if (project.url) {
                  <a
                    [href]="project.url"
                    target="_blank"
                    rel="noopener"
                    class="hidden border border-paper/20 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70 transition-colors duration-300 hover:border-accent hover:text-accent sm:block"
                    >Visit live ↗</a
                  >
                }
                <button
                  type="button" autofocus
                  (click)="requestClose()"
                  aria-label="Close case study"
                  class="case-close flex h-10 w-10 items-center justify-center rounded-full border border-paper/20 text-paper/80 transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-ink"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.4" />
                  </svg>
                </button>
              </div>
            </header>

            <!-- body -->
            <div class="mx-auto max-w-[1100px] px-6 pb-28 pt-14 md:px-10 md:pt-20">
              <p class="font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70">Case study</p>
              <h2 class="mt-6 font-display text-4xl font-light leading-[1.05] text-paper md:text-6xl">
                {{ project.title }}<span class="text-accent">.</span>
              </h2>
              <p class="mt-4 font-mono text-[12px] uppercase tracking-[0.1em] text-accent">
                {{ project.category }} — {{ project.year }}
              </p>

              <!-- meta strip -->
              <div class="mt-12 grid gap-8 border-y border-paper/10 py-8 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <p class="font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70">Role</p>
                  <p class="mt-2 text-sm text-paper/80">{{ project.caseStudy.role }}</p>
                </div>
                <div>
                  <p class="font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70">Stack</p>
                  <p class="mt-2 text-sm text-paper/80">{{ project.stack.join(' · ') }}</p>
                </div>
                <div>
                  <p class="font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70">Delivered</p>
                  <p class="mt-2 text-sm text-paper/80">{{ project.year }} — {{ project.category }}</p>
                </div>
              </div>

              <!-- overview -->
              <p class="mt-12 max-w-2xl font-display text-xl font-light leading-relaxed text-paper/85 md:text-2xl">
                {{ project.caseStudy.overview }}
              </p>

              @if (project.caseStudy.problem) { <section class="case-narrative"><h3 class="eyebrow">The problem</h3><p>{{ project.caseStudy.problem }}</p></section> }
              <section class="case-narrative"><h3 class="eyebrow">My responsibility</h3><p>{{ project.caseStudy.role }}</p></section>
              @if (project.caseStudy.decisions?.length) { <section class="case-narrative"><h3 class="eyebrow">Key decisions</h3><ul>@for (decision of project.caseStudy.decisions; track $index) { <li>{{ decision }}</li> }</ul></section> }
              @if (project.caseStudy.result) { <section class="case-narrative"><h3 class="eyebrow">The result</h3><p>{{ project.caseStudy.result }}</p></section> }
              <!-- highlights -->
              <div class="mt-14">
                <p class="font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70">Highlights</p>
                <ul class="mt-6 grid gap-px bg-paper/10 md:grid-cols-2">
                  @for (h of project.caseStudy.highlights; track h; let i = $index) {
                    <li class="group flex gap-5 bg-ink p-6 md:p-8">
                      <span class="font-mono text-[12px] tabular-nums text-accent">0{{ i + 1 }}</span>
                      <span class="text-base leading-relaxed text-paper/70 transition-colors duration-300 group-hover:text-paper">
                        {{ h }}
                      </span>
                    </li>
                  }
                </ul>
              </div>

              <!-- screens: full-page screenshots, scrolled like a page -->
              <div class="mt-16">
                <p class="font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70">Screens</p>
                <div class="mt-8 space-y-8">
                  @for (img of project.images; track img.src; let i = $index) {
                    <figure class="case-shot border border-paper/10" [style.background]="project.palette.base">
                      <button class="case-image-button" type="button" (click)="viewerIndex.set(i)" [attr.aria-label]="'Open screen ' + (i + 1) + ' full screen'">
                      <img
                        [src]="img.src"
                        [alt]="img.alt || project.title + ' — screen ' + (i + 1)"
                        class="block w-full"
                        loading="lazy"
                        (error)="imageFailed(img.src)"
                      />
                      <span>{{ failedScreens().has(img.src) ? 'Image unavailable · open viewer to retry ↗' : 'View full screen ↗' }}</span></button>
                      <figcaption class="image-caption">{{ img.alt }}</figcaption>
                    </figure>
                  }
                </div>
              </div>

              <!-- footer nav -->
              <div class="mt-20 flex items-center justify-between border-t border-paper/10 pt-8">
                <button
                  type="button"
                  (click)="requestClose()"
                  class="case-footer-action font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70 transition-colors duration-300 hover:text-accent"
                >
                  ← Back to work
                </button>
                @if (project.url) {
                  <a
                    [href]="project.url"
                    target="_blank"
                    rel="noopener"
                    class="case-footer-action font-mono text-[12px] uppercase tracking-[0.1em] text-accent transition-colors duration-300 hover:text-paper"
                    >Visit live site ↗</a
                  >
                }
              </div>
            </div>
          </div>
        </div>
      </dialog>
      @if (viewerIndex() !== null) { <app-image-viewer [images]="project.images" [initialIndex]="viewerIndex()!" (closed)="viewerIndex.set(null)" /> }
    }
  `,
})
export class CaseStudyComponent implements OnChanges, OnDestroy {
  @Input() project: Project | null = null;
  @Output() closed = new EventEmitter<void>();
  @ViewChild('scroller') scroller?: ElementRef<HTMLElement>;

  readonly open = signal(false);
  readonly failedScreens = signal(new Set<string>());
  imageFailed(src: string): void { this.failedScreens.update(previous => new Set([...previous, src])); }
  readonly viewerIndex = signal<number | null>(null);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly scroll = inject(ScrollService);
  private openFrame = 0;

  ngOnChanges(): void {
    cancelAnimationFrame(this.openFrame);
    this.viewerIndex.set(null);
    if (!this.project) { this.open.set(false); this.scroll.start(); document.documentElement.classList.remove('case-open'); return; }
    if (this.project && isPlatformBrowser(this.platformId)) {
      this.scroll.stop();
      this.openFrame = requestAnimationFrame(() => {
        if (!this.project) return;
        this.open.set(true);
        document.documentElement.classList.add('case-open');

      });
    }
  }

  requestClose(): void {
    cancelAnimationFrame(this.openFrame);
    this.open.set(false);
    this.closed.emit();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.openFrame);
    document.documentElement.classList.remove('case-open');
    this.scroll.start();
  }
}
