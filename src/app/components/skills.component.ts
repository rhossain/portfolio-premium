import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, inject, signal } from '@angular/core';
import { RevealDirective } from '../directives/reveal.directive';
import { ScrollService } from '../services/scroll.service';
import { Project, projectSlug } from '../content';
import { PortfolioContentService } from '../services/portfolio-content.service';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <section tabindex="-1" id="skills" class="capabilities-section relative overflow-hidden py-28 text-ink md:py-40">
      <div class="capabilities-grid" aria-hidden="true"></div>
      <div class="capabilities-watermark" aria-hidden="true">Interface stack</div>

      <div class="relative mx-auto max-w-[1400px] px-6 md:px-10">
        <header class="grid gap-10 md:grid-cols-12 md:items-end" appReveal>
          <div class="md:col-span-3">
            <p class="font-mono text-[12px] uppercase tracking-[0.1em] text-ink/70">04 — Capabilities</p>
            <span class="mt-4 block h-px w-16 bg-ink/28"></span>
          </div>

          <div class="md:col-span-6">
            <h2 class="font-display text-[2.8rem] font-light leading-[0.98] text-ink md:text-[4.25rem]">
              One interface.<br />
              <em class="font-light text-rust">Every layer considered.</em>
            </h2>
          </div>

          <p class="max-w-xs text-base leading-relaxed text-ink/58 md:col-span-3 md:justify-self-end">
            A connected toolkit for shaping the experience, engineering the system and carrying it confidently into production.
          </p>
        </header>

        @if (groups().length) {
          <div class="capability-map mt-16 border border-ink/15 md:mt-24">
            <div class="map-toolbar grid gap-6 bg-ink px-5 py-5 text-paper md:grid-cols-12 md:items-center md:px-7">
              <div class="flex items-center gap-3 md:col-span-5">
                <span class="live-indicator" aria-hidden="true"></span>
                <span class="font-mono text-[12px] uppercase tracking-[0.1em] text-paper/72">Capabilities in practice</span>
              </div>

              <div class="flex gap-8 md:col-span-4 md:justify-center">
                <p class="font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70">
                  Disciplines
                  <strong class="ml-2 text-[12px] font-normal tabular-nums text-paper">{{ padded(groups().length) }}</strong>
                </p>
                <p class="font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70">
                  Tools
                  <strong class="ml-2 text-[12px] font-normal tabular-nums text-paper">{{ padded(totalTools()) }}</strong>
                </p>
              </div>

              <p class="font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70 md:col-span-3 md:text-right">
                Select a tool to see its context
              </p>
            </div>

            <div class="stack-lanes">
              @for (group of groups(); track group.title; let gi = $index) {
                <article
                  class="stack-lane capability-group relative grid md:grid-cols-12"
                  [class.is-active]="activeGroupIndex() === gi"
                  [style.--lane-accent]="laneAccent(gi)"
                >
                  <div class="lane-meta relative px-5 py-7 md:col-span-4 md:px-7 md:py-9 lg:col-span-3">
                    <div class="flex items-center justify-between gap-5">
                      <span class="lane-number font-mono text-[12px] tabular-nums tracking-[0.1em] text-ink/70">
                        {{ padded(gi + 1) }}
                      </span>
                      <span class="font-mono text-[12px] uppercase tracking-[0.1em] text-ink/70">
                        {{ padded(group.items.length) }} tools
                      </span>
                    </div>
                    <h3 class="mt-5 max-w-[11ch] font-display text-[2rem] font-light leading-[0.95] text-ink md:text-[2.4rem]">
                      {{ group.title }}<span class="lane-period">.</span>
                    </h3>
                    <span class="lane-rule mt-6 block h-px w-12"></span>
                  </div>

                  @if (group.items.length) {
                    <div class="signal-grid md:col-span-8 lg:col-span-9" role="group" [attr.aria-label]="group.title + ' capabilities'">
                      @for (item of group.items; track item; let si = $index) {
                        <button
                          type="button"
                          class="skill-option group relative min-h-[92px] px-5 py-5 text-left md:min-h-[108px] md:px-6"
                          [class.is-active]="activeGroupIndex() === gi && activeSkillIndex() === si"
                          [attr.aria-pressed]="activeGroupIndex() === gi && activeSkillIndex() === si"
                          (click)="selectSkill(gi, si)"
                          data-cursor="Inspect"
                        >
                          <span class="flex items-center justify-between gap-3">
                            <span class="signal-dot" aria-hidden="true"></span>
                            <span class="font-mono text-[12px] tabular-nums tracking-[0.1em] text-ink/70">
                              {{ padded(si + 1) }}
                            </span>
                          </span>
                          <span class="skill-label mt-5 block max-w-[17rem] text-[13px] font-medium leading-snug text-ink/62 transition-colors duration-300 group-hover:text-ink">
                            {{ item }}
                          </span>
                          <span class="signal-corner" aria-hidden="true"></span>
                        </button>
                      }
                    </div>
                  } @else {
                    <p class="flex min-h-28 items-center border-t border-ink/12 px-5 text-sm text-ink/70 md:col-span-8 md:border-l md:border-t-0 md:px-7 lg:col-span-9">
                      This layer is ready for its first capability.
                    </p>
                  }
                </article>
              }
            </div>

            @if (activeSkill(); as skill) {
              <div class="active-readout grid bg-ink text-paper md:grid-cols-12" aria-live="polite">
                <div class="flex items-center gap-4 border-paper/10 px-5 py-6 md:col-span-3 md:border-r md:px-7">
                  <span class="readout-crosshair" aria-hidden="true"></span>
                  <span class="font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70">Selected capability</span>
                </div>
                <div class="px-5 py-6 md:col-span-6 md:px-7">
                  <p class="font-display text-[2rem] font-light leading-none text-paper md:text-[2.7rem]">
                    {{ skill }}<span class="text-accent">.</span>
                  </p>
                  <p class="capability-evidence">{{ capabilityContext() }}</p>
                  @if (relatedProjects().length) {
                    <p class="capability-evidence">Used in these portfolio projects:</p>
                    <div class="capability-projects">@for (project of relatedProjects(); track project.title) {
                      <a [href]="'/?project=' + slug(project) + '#work'" (click)="$event.preventDefault(); openCase.emit(project)">{{ project.title }} ↗</a>
                    }</div>
                  } @else { <p class="capability-evidence">Part of the {{ activeGroup()?.title }} toolkit. <a href="#work" (click)="scroll.navigate($event, '#work')">Explore the project work ↗</a></p> }

                </div>
                <div class="flex items-center justify-between gap-4 border-paper/10 px-5 py-5 md:col-span-3 md:border-l md:px-7">
                  <span class="font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70">Layer</span>
                  <span class="font-mono text-[12px] uppercase tracking-[0.1em] text-paper/78">{{ activeGroup()?.title }}</span>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="mt-16 border-y border-ink/15 py-16 text-center md:mt-24" appReveal>
            <p class="font-display text-3xl font-light text-ink/70">Capabilities are being curated.</p>
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .capabilities-section {
      background: var(--color-paper);
    }

    .capabilities-grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(10, 10, 10, 0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(10, 10, 10, 0.035) 1px, transparent 1px);
      background-size: 5rem 5rem;
      mask-image: linear-gradient(to bottom, transparent, #000 16%, #000 88%, transparent);
      pointer-events: none;
    }

    .capabilities-watermark {
      position: absolute;
      right: -0.03em;
      top: 1.5rem;
      color: rgba(10, 10, 10, 0.026);
      font-family: Fraunces, Georgia, serif;
      font-size: clamp(5rem, 14vw, 14rem);
      font-weight: 300;
      line-height: 1;
      pointer-events: none;
      white-space: nowrap;
    }

    .capability-map {
      background: rgba(239, 239, 239, 0.76);
      box-shadow: 0 24px 80px rgba(10, 10, 10, 0.07);
    }

    .live-indicator {
      width: 7px;
      height: 7px;
      border-radius: 999px;
      background: var(--color-accent);
      box-shadow: 0 0 0 0 rgba(176, 112, 79, 0.48);
      animation: signal-pulse 2.6s ease-out infinite;
    }

    .stack-lane + .stack-lane {
      border-top: 1px solid rgba(10, 10, 10, 0.15);
    }

    .lane-meta {
      background: rgba(10, 10, 10, 0.018);
      transition: background-color 350ms ease;
    }

    .stack-lane.is-active .lane-meta {
      background: color-mix(in srgb, var(--lane-accent) 10%, transparent);
    }

    .lane-period,
    .stack-lane.is-active .lane-number {
      color: var(--lane-accent);
    }

    .lane-rule {
      background: var(--lane-accent);
      transition: width 500ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .stack-lane.is-active .lane-rule {
      width: 5rem;
    }

    .signal-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 10.5rem), 1fr));
      border-top: 1px solid rgba(10, 10, 10, 0.12);
    }

    .skill-option {
      cursor: pointer;
      border-right: 1px solid rgba(10, 10, 10, 0.12);
      border-bottom: 1px solid rgba(10, 10, 10, 0.12);
      transition: background-color 300ms ease;
    }

    .skill-option:hover {
      background: rgba(255, 255, 255, 0.48);
    }

    .skill-option.is-active {
      background: color-mix(in srgb, var(--lane-accent) 11%, white);
    }

    .skill-option:focus-visible {
      z-index: 2;
      outline: 2px solid var(--lane-accent);
      outline-offset: -2px;
    }

    .signal-dot {
      display: block;
      width: 6px;
      height: 6px;
      border: 1px solid var(--lane-accent);
      border-radius: 999px;
      transition: background-color 250ms ease, box-shadow 250ms ease, transform 250ms ease;
    }

    .skill-option:hover .signal-dot,
    .skill-option.is-active .signal-dot {
      background: var(--lane-accent);
      transform: scale(1.18);
    }

    .skill-option.is-active .signal-dot {
      box-shadow: 0 0 0 5px color-mix(in srgb, var(--lane-accent) 18%, transparent);
    }

    .skill-option.is-active .skill-label {
      color: var(--color-ink);
    }

    .signal-corner {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 0;
      height: 0;
      border-right: 0 solid transparent;
      border-bottom: 0 solid var(--lane-accent);
      border-left: 12px solid transparent;
      transition: border-bottom-width 250ms ease;
    }

    .skill-option.is-active .signal-corner {
      border-bottom-width: 12px;
    }

    .readout-crosshair {
      position: relative;
      width: 18px;
      height: 18px;
      border: 1px solid rgba(176, 112, 79, 0.7);
      border-radius: 999px;
    }

    .readout-crosshair::before,
    .readout-crosshair::after {
      position: absolute;
      top: 50%;
      left: 50%;
      background: var(--color-accent);
      content: '';
      transform: translate(-50%, -50%);
    }

    .readout-crosshair::before {
      width: 24px;
      height: 1px;
    }

    .readout-crosshair::after {
      width: 1px;
      height: 24px;
    }

    @keyframes signal-pulse {
      70%,
      100% {
        box-shadow: 0 0 0 10px rgba(176, 112, 79, 0);
      }
    }

    @media (min-width: 768px) {
      .lane-meta {
        border-right: 1px solid rgba(10, 10, 10, 0.15);
      }

      .signal-grid {
        border-top: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .live-indicator {
        animation: none;
      }

      .lane-rule,
      .signal-dot,
      .signal-corner {
        transition-duration: 1ms;
      }
    }
  `,
})
export class SkillsComponent {
  @Output() readonly openCase = new EventEmitter<Project>();
  private readonly content = inject(PortfolioContentService);

  readonly scroll = inject(ScrollService);
  readonly slug = projectSlug;
  readonly relatedProjects = computed(() => {
    const skill = (this.activeSkill() || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return this.content.content().projects.filter(project => skill && project.stack.some(item => {
      const technology = item.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/\d+$/g, '');
      return technology === skill || (skill === 'html5' && technology === 'html') || (skill === 'css3' && technology === 'css');
    })).slice(0, 3);
  });
  readonly capabilityContext = computed(() => {
    const context: Record<string, string> = {
      'HTML5': 'Semantic page structure, accessible forms and clear document outlines.',
      'CSS3': 'Responsive layouts, visual hierarchy and adaptable component styling.',
      'SCSS': 'Reusable styling patterns and consistent component presentation.',
      'JavaScript': 'Interactive behavior, browser events and application logic.',
      'TypeScript': 'Typed interfaces that keep component and data contracts explicit.',
      'Angular': 'Component composition, typed templates and application interfaces.',
      'RxJS': 'Composing asynchronous data streams and user interactions.',
      'jQuery': 'Maintaining interactive behavior in established web and CMS interfaces.',
      'Tailwind CSS': 'Consistent layout, spacing and responsive styling through shared utilities.',
      'Bootstrap': 'Responsive grids and reusable interface patterns for existing products.',
      'Angular Material': 'Accessible application controls and familiar interaction patterns.',
      'PrimeNG': 'Data-rich application controls, forms and interface composition.',
      'Figma': 'Translating design structure, layout and component details into interfaces.',
      'Responsive Design': 'Adapting content and interaction to narrow and wide screens.',
      'SEO-friendly markup': 'Meaningful structure and readable content for people and search engines.',
      'nopCommerce': 'Storefront themes and reusable commerce interface patterns.',
      'WordPress': 'Custom themes and content-driven website interfaces.',
      'Sanity': 'Structured content models connected to frontend presentation.',
      'Git / GitHub / Bitbucket': 'Versioned changes, code review and collaborative delivery.',
      'JIRA': 'Tracking delivery work and keeping implementation decisions visible.',
      'Agile & Scrum': 'Iterative planning, feedback and collaboration throughout delivery.',
      'PHP & MySQL': 'Server-rendered interfaces and database-backed content systems.',
    };
    return context[this.activeSkill() || ''] || 'Explore this capability in the context of the published project work.';
  });
  readonly groups = computed(() => this.content.content().skillGroups);
  readonly activeGroupIndex = signal(0);
  readonly activeSkillIndex = signal(0);
  readonly totalTools = computed(() => this.groups().reduce((total, group) => total + group.items.length, 0));

  readonly activeGroup = computed(() => {
    const groups = this.groups();
    const safeIndex = Math.min(this.activeGroupIndex(), Math.max(groups.length - 1, 0));
    return groups[safeIndex] ?? null;
  });

  readonly activeSkill = computed(() => {
    const group = this.activeGroup();
    if (!group?.items.length) return null;
    const safeIndex = Math.min(this.activeSkillIndex(), group.items.length - 1);
    return group.items[safeIndex] ?? null;
  });

  selectSkill(groupIndex: number, skillIndex: number): void {
    const group = this.groups()[groupIndex];
    if (!group || skillIndex < 0 || skillIndex >= group.items.length) return;
    this.activeGroupIndex.set(groupIndex);
    this.activeSkillIndex.set(skillIndex);
  }

  laneAccent(index: number): string {
    return ['var(--color-rust)', 'var(--color-sage)', 'var(--color-lavender)'][index % 3];
  }

  padded(value: number): string {
    return String(value).padStart(2, '0');
  }
}
