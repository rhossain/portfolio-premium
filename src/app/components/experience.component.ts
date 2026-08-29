import { Component } from '@angular/core';
import { EXPERIENCE } from '../content';
import { RevealDirective } from '../directives/reveal.directive';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [RevealDirective],
  template: `
    <section id="experience" class="mx-auto max-w-[1400px] px-6 py-28 md:px-10 md:py-40">
      <div class="grid gap-12 md:grid-cols-12">
        <div class="md:col-span-3">
          <div class="md:sticky md:top-32" appReveal>
            <p class="font-mono text-[11px] uppercase tracking-[0.3em] text-paper/40">02 — Experience</p>
            <span class="mt-4 block h-px w-16 bg-paper/25"></span>
          </div>
        </div>

        <div class="md:col-span-9">
          @for (era of eras; track era) {
            <p
              appReveal
              class="mb-2 mt-14 font-mono text-[11px] uppercase tracking-[0.3em] text-accent first:mt-0"
            >
              {{ era }}
            </p>
            <ul>
              @for (job of byEra(era); track job.company) {
                <li
                  appReveal
                  [revealDelay]="$index * 80"
                  class="group relative border-t border-paper/10 py-8 transition-colors duration-500 last:border-b hover:bg-paper/[0.03] md:py-10"
                >
                  <div
                    class="pointer-events-none absolute -left-6 top-1/2 h-24 w-40 -translate-y-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                    style="background: radial-gradient(circle, rgba(176,112,79,0.22), transparent 70%);"
                  ></div>
                  <div class="grid items-baseline gap-4 md:grid-cols-12">
                    <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-paper/40 md:col-span-3">
                      {{ job.period }}
                    </p>
                    <div class="md:col-span-6">
                      <h3
                        class="font-display text-2xl font-light text-paper transition-transform duration-500 ease-expo group-hover:translate-x-2 md:text-3xl"
                      >
                        {{ job.role }}
                      </h3>
                      <p class="mt-1 text-sm text-paper/50">{{ job.company }}</p>
                      <p class="mt-4 max-w-lg text-sm leading-relaxed text-paper/45">{{ job.note }}</p>
                    </div>
                    <div class="flex flex-wrap gap-2 md:col-span-3 md:justify-end">
                      @for (tag of job.tags; track tag) {
                        <span class="border border-paper/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-paper/50">
                          {{ tag }}
                        </span>
                      }
                    </div>
                  </div>
                </li>
              }
            </ul>
          }
        </div>
      </div>
    </section>
  `,
})
export class ExperienceComponent {
  readonly items = EXPERIENCE;
  readonly eras = ['Now', 'Then'] as const;

  byEra(era: string) {
    return this.items.filter((i) => i.era === era);
  }
}
