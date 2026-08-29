import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { PROFILE, SOCIALS } from '../content';
import { RevealDirective } from '../directives/reveal.directive';
import { MagneticDirective } from '../directives/magnetic.directive';
import { ScrollService } from '../services/scroll.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [RevealDirective, MagneticDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <footer id="contact" class="bg-cream text-creamtext">
      <div class="mx-auto max-w-[1400px] px-6 pb-10 pt-28 md:px-10 md:pt-40">
        <p appReveal class="font-mono text-[11px] uppercase tracking-[0.3em] text-creamtext/50">
          05 — Contact
        </p>

        <h2
          appReveal
          [revealDelay]="120"
          class="mt-10 max-w-5xl font-display text-[2.6rem] font-light leading-[1.05] md:text-[5.2rem]"
        >
          Let's build something<br />
          <span class="text-accent">worth using</span><span class="text-outline-dark"> — together.</span>
        </h2>

        <div class="mt-16 flex flex-wrap items-baseline gap-x-12 gap-y-4 md:mt-24" appReveal [revealDelay]="250">
          <a
            appMagnetic
            [href]="'mailto:' + profile.email"
            class="u-sweep inline-block font-display text-2xl font-light md:text-4xl"
            >{{ profile.email }}</a
          >
          <a
            appMagnetic
            [href]="telHref"
            class="u-sweep inline-block font-display text-xl font-light text-creamtext/70 md:text-2xl"
            >{{ profile.phone }}</a
          >
        </div>

        <div
          appReveal
          [revealDelay]="350"
          class="mt-24 flex flex-wrap items-center justify-between gap-6 border-t border-creamtext/15 pt-8"
        >
          <ul class="flex flex-wrap gap-x-8 gap-y-3">
            @for (s of socials; track s.label) {
              <li>
                <a
                  [href]="s.url"
                  target="_blank"
                  rel="noopener"
                  class="invert-link px-1 font-mono text-[11px] uppercase tracking-[0.2em] text-creamtext/70"
                  >{{ s.label }} ↗</a
                >
              </li>
            }
          </ul>

          <button
            (click)="toTop()"
            class="invert-link px-1 font-mono text-[11px] uppercase tracking-[0.2em] text-creamtext/70"
          >
            Back to top ↑
          </button>
        </div>

        <div class="mt-8 flex items-center justify-between pb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-creamtext/40">
          <span>© 2026 {{ profile.name }}</span>
          <span>{{ profile.location }}</span>
        </div>
      </div>
    </footer>
  `,
})
export class ContactComponent {
  readonly profile = PROFILE;
  readonly socials = SOCIALS;
  readonly telHref = 'tel:' + PROFILE.phone.replace(/\s/g, '');
  private readonly scroll = inject(ScrollService);

  toTop(): void {
    this.scroll.scrollTo(0);
  }
}
