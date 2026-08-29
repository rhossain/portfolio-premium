import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MARQUEE_ITEMS } from '../content';

@Component({
  selector: 'app-marquee',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="marquee overflow-hidden border-y border-paper/10 py-5" aria-hidden="true">
      <div class="marquee-track flex w-max items-center gap-10 pr-10">
        @for (item of doubled; track $index) {
          <span
            class="whitespace-nowrap font-mono text-sm uppercase tracking-[0.3em]"
            [class]="$index % 2 === 1
              ? 'whitespace-nowrap font-mono text-sm uppercase tracking-[0.3em] text-outline'
              : 'whitespace-nowrap font-mono text-sm uppercase tracking-[0.3em] text-paper/70'"
            >{{ item }}</span
          >
          <span class="text-accent text-xs">✦</span>
        }
      </div>
    </div>
  `,
})
export class MarqueeComponent {
  readonly doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
}
