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
} from '@angular/core';
import { Project } from '../content';
import { ScrollService } from '../services/scroll.service';

@Component({
  selector: 'app-case-study',
  standalone: true,
  template: `
    @if (project) {
      <div
        class="case-study fixed inset-0 z-[90]"
        [class.is-open]="open"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="project.title + ' — case study'"
      >
        <!-- backdrop -->
        <div class="case-backdrop absolute inset-0 bg-ink/80 backdrop-blur-md" (click)="requestClose()"></div>

        <!-- panel -->
        <div class="case-panel absolute inset-x-0 bottom-0 top-[4vh] overflow-hidden md:inset-x-[3vw] md:top-[5vh]">
          <div class="relative h-full w-full overflow-y-auto bg-ink case-scroll" #scroller data-lenis-prevent>
            <!-- sticky header -->
            <header
              class="sticky top-0 z-10 flex items-center justify-between border-b border-paper/10 bg-ink/85 px-6 py-4 backdrop-blur-md md:px-12"
            >
              <div class="flex items-baseline gap-4">
                <span class="font-display text-xl font-light text-accent md:text-2xl">{{ project.index }}</span>
                <span class="font-display text-xl font-light text-paper md:text-2xl">{{ project.title }}</span>
                <span class="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-paper/40 md:inline">
                  {{ project.category }} — {{ project.year }}
                </span>
              </div>
              <div class="flex items-center gap-3">
                @if (project.url) {
                  <a
                    [href]="project.url"
                    target="_blank"
                    rel="noopener"
                    class="hidden border border-paper/20 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/70 transition-colors duration-300 hover:border-accent hover:text-accent sm:block"
                    >Visit live ↗</a
                  >
                }
                <button
                  type="button"
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
              <p class="font-mono text-[11px] uppercase tracking-[0.3em] text-paper/40">Case study</p>
              <h2 class="mt-6 font-display text-4xl font-light leading-[1.05] text-paper md:text-6xl">
                {{ project.title }}<span class="text-accent">.</span>
              </h2>
              <p class="mt-4 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
                {{ project.category }} — {{ project.year }}
              </p>

              <!-- meta strip -->
              <div class="mt-12 grid gap-8 border-y border-paper/10 py-8 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <p class="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/40">Role</p>
                  <p class="mt-2 text-sm text-paper/80">{{ project.caseStudy.role }}</p>
                </div>
                <div>
                  <p class="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/40">Stack</p>
                  <p class="mt-2 text-sm text-paper/80">{{ project.stack.join(' · ') }}</p>
                </div>
                <div>
                  <p class="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/40">Delivered</p>
                  <p class="mt-2 text-sm text-paper/80">{{ project.year }} — {{ project.category }}</p>
                </div>
              </div>

              <!-- overview -->
              <p class="mt-12 max-w-2xl font-display text-xl font-light leading-relaxed text-paper/85 md:text-2xl">
                {{ project.caseStudy.overview }}
              </p>

              <!-- highlights -->
              <div class="mt-14">
                <p class="font-mono text-[11px] uppercase tracking-[0.3em] text-paper/40">Highlights</p>
                <ul class="mt-6 grid gap-px bg-paper/10 md:grid-cols-2">
                  @for (h of project.caseStudy.highlights; track h; let i = $index) {
                    <li class="group flex gap-5 bg-ink p-6 md:p-8">
                      <span class="font-mono text-[11px] tabular-nums text-accent">0{{ i + 1 }}</span>
                      <span class="text-sm leading-relaxed text-paper/70 transition-colors duration-300 group-hover:text-paper">
                        {{ h }}
                      </span>
                    </li>
                  }
                </ul>
              </div>

              <!-- screens: full-page screenshots, scrolled like a page -->
              <div class="mt-16">
                <p class="font-mono text-[11px] uppercase tracking-[0.3em] text-paper/40">Screens</p>
                <div class="mt-8 space-y-8">
                  @for (img of project.images; track img; let i = $index) {
                    <figure class="case-shot border border-paper/10" [style.background]="project.palette.base">
                      <img
                        [src]="img"
                        [alt]="project.title + ' — screen ' + (i + 1)"
                        class="block w-full"
                        loading="lazy"
                      />
                    </figure>
                  }
                </div>
              </div>

              <!-- footer nav -->
              <div class="mt-20 flex items-center justify-between border-t border-paper/10 pt-8">
                <button
                  type="button"
                  (click)="requestClose()"
                  class="font-mono text-[11px] uppercase tracking-[0.25em] text-paper/50 transition-colors duration-300 hover:text-accent"
                >
                  ← Back to work
                </button>
                @if (project.url) {
                  <a
                    [href]="project.url"
                    target="_blank"
                    rel="noopener"
                    class="font-mono text-[11px] uppercase tracking-[0.25em] text-accent transition-colors duration-300 hover:text-paper"
                    >Visit live site ↗</a
                  >
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class CaseStudyComponent implements OnChanges, OnDestroy {
  @Input() project: Project | null = null;
  @Output() closed = new EventEmitter<void>();
  @ViewChild('scroller') scroller?: ElementRef<HTMLElement>;

  open = false;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly scroll = inject(ScrollService);
  private escListener = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.requestClose();
  };

  ngOnChanges(): void {
    if (this.project && isPlatformBrowser(this.platformId)) {
      this.scroll.stop();
      requestAnimationFrame(() => {
        this.open = true;
        document.documentElement.classList.add('case-open');
        window.addEventListener('keydown', this.escListener);
      });
    }
  }

  requestClose(): void {
    this.open = false;
    this.scroll.start();
    document.documentElement.classList.remove('case-open');
    window.removeEventListener('keydown', this.escListener);
    // let the exit animation play before unmounting
    setTimeout(() => this.closed.emit(), 500);
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.escListener);
    document.documentElement.classList.remove('case-open');
    this.scroll.start();
  }
}
