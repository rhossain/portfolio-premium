import { Component, computed, inject } from '@angular/core';
import { NAV_LINKS, PROFILE } from '../content';
import { ScrollService } from '../services/scroll.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  template: `
    <!-- Scroll progress line -->
    <div class="fixed top-0 left-0 z-[80] h-px w-full bg-paper/10">
      <div
        class="h-full bg-paper origin-left"
        [style.transform]="'scaleX(' + scroll.progress() + ')'"
      ></div>
    </div>

    <header
      class="fixed top-0 left-0 right-0 z-[70] transition-transform duration-700 ease-expo"
      [class.-translate-y-full]="hidden()"
    >
      <nav
        class="mx-auto mt-5 flex max-w-[1400px] items-center justify-between px-6 md:px-10"
      >
        <a
          href="#top"
          (click)="go($event, '#top')"
          class="logo group flex items-center gap-3"
          data-cursor
          aria-label="Home"
        >
          <svg class="logo-mark" width="44" height="44" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <circle class="logo-ring" cx="24" cy="24" r="22" stroke="currentColor" stroke-width="1" />
            <circle class="logo-ring logo-ring-dash" cx="24" cy="24" r="16.5" stroke="currentColor" stroke-width="0.75" />
            <!-- S -->
            <path
              d="M29.5 14.5c-1.6-1.7-3.8-2.6-6-2.4-3 .2-5.3 2.3-5.3 5 0 6.3 12 3.2 12 9.9 0 3-2.6 5.2-5.9 5.2-2.5 0-4.8-1.2-6.3-3.1"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
            <!-- H crossbar -->
            <path d="M12 24h24" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            <!-- accent dot -->
            <circle class="logo-dot" cx="38.5" cy="11" r="2.4" fill="#b0704f" stroke="none" />
          </svg>
        </a>

        <div
          class="hidden items-center gap-8 rounded-full border border-paper/10 bg-ink/40 px-8 py-3 backdrop-blur-md md:flex"
        >
          @for (link of links; track link.target) {
            <a
              [href]="link.target"
              (click)="go($event, link.target)"
              class="u-sweep font-mono text-[11px] uppercase tracking-[0.2em] text-paper/60 transition-colors hover:text-paper"
              >{{ link.label }}</a
            >
          }
        </div>

        <a
          [href]="'mailto:' + profile.email"
          class="group flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-paper/60 transition-colors hover:text-paper"
        >
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
          </span>
          <span class="hidden sm:inline">{{ profile.availability }}</span>
          <span class="sm:hidden">Available</span>
        </a>
      </nav>
    </header>
  `,
})
export class NavComponent {
  readonly scroll = inject(ScrollService);
  readonly profile = PROFILE;
  readonly links = NAV_LINKS;

  /** hide nav when scrolling down past the hero, show when scrolling up */
  readonly hidden = computed(
    () => this.scroll.direction() === 1 && this.scroll.progress() > 0.08
  );

  go(event: Event, target: string): void {
    event.preventDefault();
    if (target === '#top') {
      this.scroll.scrollTo(0);
    } else {
      this.scroll.scrollTo(target);
    }
  }
}
