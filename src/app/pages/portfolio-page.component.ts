import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { AboutComponent } from '../components/about.component';
import { CaseStudyComponent } from '../components/case-study.component';
import { ContactComponent } from '../components/contact.component';
import { CursorComponent } from '../components/cursor.component';
import { ExperienceComponent } from '../components/experience.component';
import { HeroComponent } from '../components/hero.component';
import { MarqueeComponent } from '../components/marquee.component';
import { NavComponent } from '../components/nav.component';
import { ProjectsComponent } from '../components/projects.component';
import { SkillsComponent } from '../components/skills.component';
import { Project } from '../content';
import { PortfolioContentService } from '../services/portfolio-content.service';
import { ScrollService } from '../services/scroll.service';

@Component({
  selector: 'app-portfolio-page',
  standalone: true,
  imports: [CursorComponent, NavComponent, HeroComponent, MarqueeComponent, AboutComponent, ExperienceComponent, ProjectsComponent, SkillsComponent, ContactComponent, CaseStudyComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="preloader fixed inset-0 z-95 flex flex-col items-center justify-center bg-ink" [class.is-done]="loaded()" aria-hidden="true">
      <svg class="mb-8 h-16 w-16 text-paper transition-all duration-700 ease-expo" [style.opacity]="counter() > 5 ? 1 : 0" [style.transform]="counter() > 5 ? 'scale(1) rotate(0deg)' : 'scale(0.6) rotate(-90deg)'" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="1" />
        <circle cx="24" cy="24" r="16.5" stroke="currentColor" stroke-width="0.75" stroke-dasharray="2 6" opacity="0.45" />
        <path d="M29.5 14.5c-1.6-1.7-3.8-2.6-6-2.4-3 .2-5.3 2.3-5.3 5 0 6.3 12 3.2 12 9.9 0 3-2.6 5.2-5.9 5.2-2.5 0-4.8-1.2-6.3-3.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        <path d="M12 24h24" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        <circle cx="38.5" cy="11" r="2.4" fill="#b0704f" />
      </svg>
      <p class="overflow-hidden font-display text-3xl font-light text-paper md:text-5xl">
        <span class="block transition-transform duration-700 ease-expo" [style.transform]="counter() > 20 ? 'translateY(0)' : 'translateY(110%)'">{{ content.content().profile.name }}</span>
      </p>
      <p class="mt-4 font-mono text-[11px] uppercase tracking-[0.3em] text-paper/40 transition-opacity duration-500" [class.opacity-0]="counter() < 20">Portfolio — 2026</p>
      <p class="absolute bottom-8 right-8 font-mono text-sm tabular-nums text-paper/50">{{ counter() }}%</p>
    </div>
    <div class="grain min-h-screen">
      <app-cursor />
      <app-nav />
      <main>
        <app-hero [active]="loaded()" />
        <app-marquee />
        <app-about />
        <app-marquee />
        <app-experience />
        <app-projects (openCase)="selectedProject.set($event)" />
        <app-skills />
      </main>
      <app-contact />
      <app-case-study [project]="selectedProject()" (closed)="selectedProject.set(null)" />
    </div>
  `,
})
export class PortfolioPageComponent implements AfterViewInit, OnDestroy {
  readonly content = inject(PortfolioContentService);
  readonly loaded = signal(false);
  readonly counter = signal(0);
  readonly selectedProject = signal<Project | null>(null);
  private readonly scroll = inject(ScrollService);
  private readonly platformId = inject(PLATFORM_ID);
  private intervalId?: ReturnType<typeof setInterval>;
  private timeoutId?: ReturnType<typeof setTimeout>;

  constructor() {
    void this.content.load();
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loaded.set(true);
      return;
    }
    this.scroll.init();
    this.intervalId = setInterval(() => {
      this.counter.set(Math.min(this.counter() + Math.ceil(Math.random() * 14), 100));
      if (this.counter() >= 100) {
        clearInterval(this.intervalId);
        this.timeoutId = setTimeout(() => this.loaded.set(true), 250);
      }
    }, 90);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    clearTimeout(this.timeoutId);
    this.scroll.destroy();
  }
}
