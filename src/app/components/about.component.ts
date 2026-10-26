import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { RevealDirective } from '../directives/reveal.directive';
import { PortfolioContentService } from '../services/portfolio-content.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <section tabindex="-1" id="about" class="relative overflow-hidden py-20 md:py-28">
      <!-- faint section glow -->
      <div
        class="pointer-events-none absolute left-[-15vw] top-[10%] h-[40vw] w-[40vw] rounded-full opacity-60 blur-[110px]"
        style="background: radial-gradient(circle, rgba(176,112,79,0.12), transparent 60%);"
      ></div>

      <div class="mx-auto max-w-[1400px] px-6 md:px-10">
        <div class="mb-16 md:mb-24" appReveal>
          <p class="font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70">02 — About</p>
          <span class="mt-4 block h-px w-16 bg-paper/25"></span>
        </div>

        <div class="grid items-start gap-14 md:grid-cols-12 md:gap-10">
          <!-- text column -->
          <div class="md:col-span-7">
            <h2
              appReveal
              class="about-statement font-display text-3xl font-light leading-[1.15] text-paper md:text-[3.2rem] md:leading-[1.08]"
            >
              @for (w of statementWords; track $index; let last = $last) {
                <span class="stmt-word">{{ w }}</span>{{ last ? '' : ' ' }}
              }
            </h2>

            <p appReveal [revealDelay]="140" class="mt-8 font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70">
              {{ profile.firstName }} is a
              <span class="rotator text-accent">
                <span class="rotator-track" [style.transform]="'translateY(-' + wordIndex() * 1.25 + 'em)'">
                  @for (w of words; track w) {
                    <span>{{ w }}</span>
                  }
                </span> </span
              >.
            </p>

            <div class="mt-10 grid gap-10 md:grid-cols-2">
              @for (p of about.paragraphs; track $index) {
                <p
                  appReveal
                  [revealDelay]="180 + $index * 120"
                  class="max-w-md text-[15px] leading-relaxed text-paper/70"
                >
                  {{ p }}
                </p>
              }
            </div>

            <div
              appReveal
              [revealDelay]="250"
              class="mt-14 flex flex-wrap gap-2 border-t border-paper/10 pt-8"
            >
              @for (lang of about.languages; track lang) {
                <span class="border border-paper/15 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.15em] text-paper/70">
                  {{ lang }}
                </span>
              }
              <span class="border border-accent/50 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.15em] text-accent">
                {{ profile.location }}
              </span>
            </div>
          </div>

          <!-- photo column -->
          <div class="md:col-span-5">
            <figure appReveal [revealDelay]="200" class="portrait-frame relative md:mt-16">
              <div class="portrait-clip relative overflow-hidden bg-ink2">
                <img
                  [src]="profile.aboutImage.src"
                  [alt]="profile.aboutImage.alt"
                  class="portrait-img aspect-[3/2.4] w-full object-cover"
                  style="filter: saturate(1.0) contrast(1.03);"
                  loading="lazy"
                />
                <div class="absolute inset-0 bg-linear-to-t from-ink/50 via-transparent to-transparent"></div>
                <span class="frame-corner left-3 top-3 border-l border-t"></span>
                <span class="frame-corner bottom-3 right-3 border-b border-r"></span>
              </div>
              <figcaption class="mt-4 flex items-center justify-between font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70">
                <span>Where the work happens</span>
                <span class="text-accent">Dhaka, BD</span>
              </figcaption>
            </figure>
          </div>
        </div>

        <!-- stats -->
        <div class="mt-20 grid grid-cols-2 gap-y-12 border-t border-paper/10 pt-10 md:mt-28 md:grid-cols-4">
          @for (s of about.stats; track s.label) {
            <div appReveal [revealDelay]="$index * 100">
              <p class="font-display text-4xl font-light text-paper md:text-5xl">{{ s.value }}</p>
              <p class="mt-3 max-w-[140px] font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70">
                {{ s.label }}
              </p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class AboutComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly content = inject(PortfolioContentService);
  get about() { return this.content.content().about; }
  get profile() { return this.content.content().profile; }
  get words() { return this.about.descriptors; }
  readonly wordIndex = signal(0);
  get statementWords() { return this.about.statement.split(' '); }

  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);
  private readonly host = inject(ElementRef<HTMLElement>);
  private intervalId?: ReturnType<typeof setInterval>;

  private stmtEl?: HTMLElement;
  private wordSpans: HTMLElement[] = [];
  private scheduled = false;
  private scrollListener = () => this.scheduleHighlight();

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.intervalId = setInterval(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      this.wordIndex.set((this.wordIndex() + 1) % this.words.length);
    }, 2600);
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.zone.runOutsideAngular(() => {
      const el = this.host.nativeElement as HTMLElement;
      this.stmtEl = el.querySelector('.about-statement') as HTMLElement;
      this.wordSpans = Array.from(el.querySelectorAll('.stmt-word')) as HTMLElement[];
      window.addEventListener('scroll', this.scrollListener, { passive: true });
      this.scheduleHighlight();
    });
  }

  private scheduleHighlight(): void {
    if (this.scheduled) return;
    this.scheduled = true;
    requestAnimationFrame(() => {
      this.scheduled = false;
      this.updateHighlight();
    });
  }

  /** words light up one by one as the statement travels up the viewport */
  private updateHighlight(): void {
    if (!this.stmtEl || !this.wordSpans.length) return;
    const r = this.stmtEl.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    // 0 when the statement enters at 88% of the viewport, 1 when its top hits 38%
    const progress = Math.min(1, Math.max(0, (vh * 0.88 - r.top) / (vh * 0.5)));
    const lit = progress * this.wordSpans.length;
    this.wordSpans.forEach((s, i) => {
      const w = Math.min(1, Math.max(0, lit - i));
      s.style.opacity = (0.7 + 0.3 * w).toFixed(3);
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }
}
