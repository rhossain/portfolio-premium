import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RevealDirective } from '../directives/reveal.directive';
import { PortfolioContentService } from '../services/portfolio-content.service';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <section tabindex="-1" id="experience" class="experience-section relative overflow-hidden border-y border-paper/7">
      <div class="experience-glow" aria-hidden="true"></div>

      <div class="relative mx-auto max-w-[1400px] px-6 py-28 md:px-10 md:py-40">
        <div class="grid gap-16 md:grid-cols-12 md:gap-10">
          <header class="md:col-span-4 lg:col-span-3">
            <div class="md:sticky md:top-32" appReveal>
              <p class="font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70">03 — Experience</p>
              <span class="mt-4 block h-px w-16 bg-paper/25"></span>

              <h2 class="mt-10 max-w-xs font-display text-[2.65rem] font-light leading-[0.98] text-paper md:mt-14 md:text-5xl">
                Building interfaces<br />
                <em class="font-light text-accent">since 2009.</em>
              </h2>
              <p class="mt-7 max-w-[18rem] text-base leading-relaxed text-paper/70">
                A career shaped by the web’s evolution — from custom CMS builds to leading modern UI engineering.
              </p>

              <div class="mt-10 flex items-end gap-4 border-t border-paper/10 pt-6 md:mt-14">
                <strong class="font-display text-5xl font-light leading-none text-paper">{{ profile.years }}</strong>
                <span class="max-w-24 pb-1 font-mono text-[12px] uppercase leading-relaxed tracking-[0.1em] text-paper/70">
                  Years of<br />digital craft
                </span>
              </div>
            </div>
          </header>

          <div class="md:col-span-8 md:pl-4 lg:col-span-8 lg:col-start-5">
            <div appReveal class="mb-8 flex items-center justify-between gap-4 md:mb-10">
              <p class="font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70">Career ledger</p>
              <p class="hidden items-center gap-2 font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70 sm:flex">
                <span class="h-1.5 w-1.5 rounded-full bg-accent"></span>
                Select a role to explore
              </p>
            </div>

            <div class="career-rail relative">
              @for (job of items; track job.company; let i = $index) {
                @if (i === 0 || items[i - 1].era !== job.era) {
                  <div
                    appReveal
                    class="era-marker relative flex items-center gap-4 pb-4"
                    [class.mt-10]="i > 0"
                  >
                    <span class="era-dot relative z-10 block h-2.5 w-2.5 rounded-full border border-accent bg-ink"></span>
                    <span class="font-mono text-[12px] uppercase tracking-[0.1em] text-accent">
                      {{ job.era === 'Now' ? 'Current chapter' : 'Earlier chapters' }}
                    </span>
                  </div>
                }

                <article
                  appReveal
                  [revealDelay]="i * 70"
                  class="experience-entry relative ml-1 border-t border-paper/10"
                  [class.is-active]="activeIndex() === i"
                >
                  <span class="entry-node absolute left-[-4.5px] top-[2.25rem] z-10 block h-[7px] w-[7px] rounded-full bg-paper/25"></span>

                  <button
                    type="button"
                    class="entry-trigger group grid w-full gap-4 py-8 pl-8 text-left md:grid-cols-12 md:gap-6 md:py-10 md:pl-10"
                    [attr.aria-expanded]="activeIndex() === i"
                    [attr.aria-controls]="'experience-panel-' + i"
                    (click)="toggle(i)"
                    data-cursor="Explore"
                  >
                    <span class="font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70 md:col-span-3 md:pt-1">
                      {{ job.period }}
                    </span>

                    <span class="md:col-span-7">
                      <span class="block font-display text-[1.7rem] font-light leading-tight text-paper/78 transition-colors duration-500 group-hover:text-paper md:text-[2.15rem]">
                        {{ job.role }}
                      </span>
                      <span class="mt-2 block text-sm text-paper/70 transition-colors duration-500 group-hover:text-paper/60">
                        {{ job.company }}
                      </span>
                    </span>

                    <span class="flex items-center justify-between md:col-span-2 md:justify-end">
                      @if (i === 0) {
                        <span class="mr-4 font-mono text-[12px] uppercase tracking-[0.1em] text-accent">Present</span>
                      }
                      <span class="entry-toggle relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-paper/15 text-paper/70 transition-all duration-500 group-hover:border-paper/35 group-hover:text-paper">
                        <span class="block h-px w-3.5 bg-current"></span>
                        <span class="toggle-vertical absolute block h-3.5 w-px bg-current transition-transform duration-500"></span>
                      </span>
                    </span>
                  </button>

                  <div
                    [id]="'experience-panel-' + i"
                    class="entry-detail grid pl-8 md:pl-10"
                    [attr.aria-hidden]="activeIndex() !== i"
                  >
                    <div class="overflow-hidden">
                      <div class="grid gap-6 pb-9 md:grid-cols-12 md:pb-10">
                        <div class="hidden md:col-span-3 md:block" aria-hidden="true"></div>
                        <div class="md:col-span-7">
                          <p class="max-w-xl text-[14px] leading-[1.8] text-paper/70">{{ job.note }}</p>
                          <div class="mt-6 flex flex-wrap gap-x-5 gap-y-3">
                            @for (tag of job.tags; track tag) {
                              <span class="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em] text-paper/70">
                                <span class="text-accent" aria-hidden="true">+</span>{{ tag }}
                              </span>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .experience-section {
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.012), transparent 24%, transparent 78%, rgba(255, 255, 255, 0.012)),
          #0a0a0a;
      }

      .experience-glow {
        position: absolute;
        top: 18%;
        right: -18rem;
        width: 36rem;
        height: 36rem;
        border-radius: 9999px;
        background: radial-gradient(circle, rgba(176, 112, 79, 0.11), transparent 68%);
        filter: blur(24px);
        pointer-events: none;
      }

      .career-rail::before {
        position: absolute;
        inset: 0 auto 0 0;
        width: 1px;
        content: '';
        background: linear-gradient(to bottom, rgba(176, 112, 79, 0.7), rgba(239, 239, 239, 0.1) 22%, rgba(239, 239, 239, 0.1) 82%, transparent);
      }

      .era-dot::after {
        position: absolute;
        inset: -5px;
        border: 1px solid rgba(176, 112, 79, 0.18);
        border-radius: 9999px;
        content: '';
      }

      .experience-entry::after {
        position: absolute;
        inset: 0 0 auto 0;
        height: 1px;
        content: '';
        background: linear-gradient(90deg, #b0704f, transparent 70%);
        opacity: 0;
        transform: scaleX(0);
        transform-origin: left;
        transition: opacity 500ms ease, transform 700ms cubic-bezier(0.83, 0, 0.17, 1);
      }

      .experience-entry.is-active::after {
        opacity: 0.8;
        transform: scaleX(1);
      }

      .entry-trigger {
        cursor: pointer;
      }

      .entry-trigger::before {
        position: absolute;
        inset: 0;
        z-index: -1;
        content: '';
        background: linear-gradient(90deg, rgba(176, 112, 79, 0.055), transparent 70%);
        opacity: 0;
        transition: opacity 500ms ease;
      }

      .experience-entry.is-active .entry-trigger::before,
      .entry-trigger:hover::before {
        opacity: 1;
      }

      .entry-node {
        transition: background-color 400ms ease, box-shadow 400ms ease, transform 400ms cubic-bezier(0.83, 0, 0.17, 1);
      }

      .experience-entry.is-active .entry-node {
        background: #b0704f;
        box-shadow: 0 0 0 5px rgba(176, 112, 79, 0.12), 0 0 24px rgba(176, 112, 79, 0.45);
        transform: scale(1.15);
      }

      .experience-entry.is-active .entry-trigger > span:nth-child(2) > span:first-child {
        color: #efefef;
      }

      .experience-entry.is-active .entry-toggle {
        border-color: rgba(176, 112, 79, 0.65);
        color: #b0704f;
        transform: rotate(180deg);
      }

      .experience-entry.is-active .toggle-vertical {
        transform: rotate(90deg) scaleY(0);
      }

      .entry-detail {
        grid-template-rows: 0fr;
        opacity: 0;
        transition: grid-template-rows 650ms cubic-bezier(0.83, 0, 0.17, 1), opacity 350ms ease;
      }

      .experience-entry.is-active .entry-detail {
        grid-template-rows: 1fr;
        opacity: 1;
      }

      @media (prefers-reduced-motion: reduce) {
        .experience-entry::after,
        .entry-trigger::before,
        .entry-node,
        .entry-toggle,
        .toggle-vertical,
        .entry-detail {
          transition: none;
        }
      }
    `,
  ],
})
export class ExperienceComponent {
  private readonly content = inject(PortfolioContentService);

  readonly activeIndex = signal<number | null>(0);

  get items() {
    return this.content.content().experience;
  }

  get profile() {
    return this.content.content().profile;
  }

  toggle(index: number): void {
    this.activeIndex.update((active) => (active === index ? null : index));
  }
}
