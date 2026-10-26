import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title, Meta } from '@angular/platform-browser';
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
import { PortfolioContent, Project, projectSlug } from '../content';
import { PortfolioContentService } from '../services/portfolio-content.service';
import { ScrollService } from '../services/scroll.service';

@Component({
  selector: 'app-portfolio-page', standalone: true,
  imports: [CursorComponent, NavComponent, HeroComponent, MarqueeComponent, AboutComponent, ExperienceComponent, ProjectsComponent, SkillsComponent, ContactComponent, CaseStudyComponent],
  providers: [PortfolioContentService, ScrollService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!previewContent) {
    <div class="preloader fixed inset-0 z-95 flex flex-col items-center justify-center bg-ink" [class.is-done]="loaded()" aria-hidden="true">
      <img class="preloader-mark mb-8 h-16 w-16 transition-all duration-700 ease-expo" src="brand-mark.svg" alt="" [style.opacity]="counter() > 5 ? 1 : 0" [style.transform]="counter() > 5 ? 'scale(1) rotate(0deg)' : 'scale(0.6) rotate(-8deg)'" />
      <p class="overflow-hidden font-display text-3xl font-light text-paper md:text-5xl">
        <span class="block transition-transform duration-700 ease-expo" [style.transform]="counter() > 20 ? 'translateY(0)' : 'translateY(110%)'">{{ content.content().profile.name }}</span>
      </p>
      <p class="mt-4 font-mono text-[11px] uppercase tracking-[0.3em] text-paper/40 transition-opacity duration-500" [class.opacity-0]="counter() < 20">Portfolio — 2026</p>
      <p class="absolute bottom-8 right-8 font-mono text-sm tabular-nums text-paper/50">{{ counter() }}%</p>
    </div>
    }
    <div class="portfolio-surface grain min-h-screen" [class.is-preview]="!!previewContent" [attr.inert]="!loaded() ? '' : null">
      @if (!previewContent) { <a class="skip-link" href="#work">Skip to selected work</a><app-cursor /><app-nav /> }
      <main>
        <app-hero [active]="loaded()" />
        <app-projects (openCase)="openProject($event)" />
        <app-about />
        <app-marquee />
        <app-experience />
        <app-skills (openCase)="openProject($event)" />
      </main>
      <app-contact />
      <app-case-study [project]="selectedProject()" (closed)="closeProject()" />
      @if (!previewContent && projectMissing()) {
        <p class="route-notice" role="status">That case study is unavailable. <button type="button" (click)="closeProject()">Browse selected work</button></p>
      }
    </div>
  `,
})
export class PortfolioPageComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() previewContent: PortfolioContent | null = null;
  readonly loaded = signal(false);
  readonly counter = signal(0);
  private introInterval?: ReturnType<typeof setInterval>;
  private introTimeout?: ReturnType<typeof setTimeout>;
  readonly content = inject(PortfolioContentService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly scroll = inject(ScrollService);
  private readonly params = toSignal(this.route.queryParamMap);
  private readonly previewProject = signal<Project | null>(null);
  private openedHere = false;
  readonly selectedProject = computed(() => this.previewContent ? this.previewProject() : this.content.content().projects.find(project => projectSlug(project) === this.params()?.get('project')) ?? null);
  readonly projectMissing = computed(() => !!this.params()?.get('project') && !this.content.loading() && !this.selectedProject());

  constructor() {
    effect(() => {
      if (this.previewContent) return;
      const profile = this.content.content().profile;
      const project = this.selectedProject();
      this.title.setTitle(project ? `${project.title} — ${profile.name}` : `${profile.name} — ${profile.role}`);
      this.meta.updateTag({ name: 'description', content: project?.description || `${profile.name}, ${profile.role}. ${profile.tagline}` });
    });
  }

  ngOnInit(): void {
    if (this.previewContent || this.params()?.get('project') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.loaded.set(true); this.counter.set(100);
    }
    if (this.previewContent) { this.scroll.preview = true; this.content.content.set(structuredClone(this.previewContent)); this.content.loading.set(false); }
    else void this.content.load().then(() => {
      if (window.location.hash && !this.params()?.get('project')) requestAnimationFrame(() => this.scroll.scrollTo(window.location.hash));
    });
  }
  ngAfterViewInit(): void {
    if (this.previewContent) return;
    this.scroll.init();
    if (this.loaded()) return;
    this.scroll.stop();
    // This counter belongs to the brand entrance timeline, not network loading.
    const startedAt = performance.now();
    this.introInterval = setInterval(() => {
      this.counter.set(Math.min(100, Math.round((performance.now() - startedAt) / 12)));
      if (this.counter() < 100) return;
      clearInterval(this.introInterval);
      this.introTimeout = setTimeout(() => {
        this.loaded.set(true);
        if (!this.selectedProject()) this.scroll.start();
        if (window.location.hash && !this.selectedProject()) this.scroll.scrollTo(window.location.hash);
      }, 250);
    }, 60);
  }
  openProject(project: Project): void {
    if (this.previewContent) { this.previewProject.set(project); return; }
    this.openedHere = true;
    void this.router.navigate([], { relativeTo: this.route, queryParams: { project: projectSlug(project) }, queryParamsHandling: 'merge', fragment: 'work' });
  }
  closeProject(): void {
    if (this.previewContent) { this.previewProject.set(null); return; }
    if (this.openedHere && this.params()?.get('project')) { this.openedHere = false; window.history.back(); }
    else void this.router.navigate([], { relativeTo: this.route, queryParams: { project: null }, queryParamsHandling: 'merge', fragment: 'work', replaceUrl: true }).then(() => requestAnimationFrame(() => this.scroll.scrollTo('#work')));
  }
  ngOnDestroy(): void {
    clearInterval(this.introInterval); clearTimeout(this.introTimeout);
    if (!this.previewContent) this.scroll.destroy();
  }
}
