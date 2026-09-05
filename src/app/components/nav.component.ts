import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { ScrollService } from '../services/scroll.service';
import { PortfolioContentService } from '../services/portfolio-content.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <!-- Scroll progress line -->
    <div class="fixed top-0 left-0 z-80 h-px w-full bg-paper/10">
      <div
        class="h-full bg-paper origin-left"
        [style.transform]="'scaleX(' + scroll.progress() + ')'"
      ></div>
    </div>

    <header
      class="fixed top-0 left-0 right-0 z-70 transition-transform duration-700 ease-expo"
      [class.-translate-y-full]="hidden()"
    >
      <nav
        class="mx-auto mt-5 flex max-w-[1400px] items-center justify-between px-6 md:px-10"
      >
        <a
          href="#top"
          (click)="go($event, '#top')"
          class="logo group flex items-center gap-3"
          aria-label="Home"
        >
          <img class="logo-mark" src="brand-mark.svg" alt="" width="44" height="44" aria-hidden="true" />
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
  private readonly content = inject(PortfolioContentService);
  get profile() { return this.content.content().profile; }
  get links() { return this.content.content().navLinks; }

  /** hide nav when scrolling down past the hero, show when scrolling up */
  readonly hidden = computed(
    () => this.scroll.direction() === 1 && this.scroll.progress() > 0.08
  );

  go(event: Event, target: string): void {
    event.preventDefault();
    if (target === '#top') {
      this.scroll.scrollTo('#top');
    } else {
      this.scroll.scrollTo(target);
    }
  }
}
