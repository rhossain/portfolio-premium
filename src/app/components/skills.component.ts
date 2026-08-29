import { Component } from '@angular/core';
import { SKILL_GROUPS } from '../content';
import { RevealDirective } from '../directives/reveal.directive';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [RevealDirective],
  template: `
    <section id="skills" class="mx-auto max-w-[1400px] px-6 py-28 md:px-10 md:py-40">
      <div class="grid gap-12 md:grid-cols-12">
        <div class="md:col-span-3">
          <div class="md:sticky md:top-32" appReveal>
            <p class="font-mono text-[11px] uppercase tracking-[0.3em] text-paper/40">04 — Capabilities</p>
            <span class="mt-4 block h-px w-16 bg-paper/25"></span>
          </div>
        </div>

        <div class="md:col-span-9">
          @for (group of groups; track group.title) {
            <div appReveal [revealDelay]="$index * 100" class="border-t border-paper/10 py-10 last:border-b">
              <div class="grid gap-6 md:grid-cols-12">
                <h3 class="font-display text-xl font-light text-paper/80 md:col-span-4">{{ group.title }}</h3>
                <div class="flex flex-wrap gap-x-3 gap-y-3 md:col-span-8">
                  @for (item of group.items; track item) {
                    <span
                      class="border border-paper/15 px-4 py-2 text-[13px] text-paper/60 transition-colors duration-300 hover:border-accent hover:text-paper"
                      data-cursor
                      >{{ item }}</span
                    >
                  }
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class SkillsComponent {
  readonly groups = SKILL_GROUPS;
}
