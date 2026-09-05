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
      <img class="preloader-mark mb-8 h-16 w-16 transition-all duration-700 ease-expo" src="brand-mark.svg" alt="" [style.opacity]="counter() > 5 ? 1 : 0" [style.transform]="counter() > 5 ? 'scale(1) rotate(0deg)' : 'scale(0.6) rotate(-8deg)'" />
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
