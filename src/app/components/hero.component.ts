import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  inject,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { gsap } from 'gsap';
import Matter from 'matter-js';
import { ScrollService } from '../services/scroll.service';
import { PortfolioContentService } from '../services/portfolio-content.service';

interface MeasuredLetter {
  char: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  template: `
    <section
      id="top"
      #heroEl
      tabindex="-1" class="hero-section relative flex flex-col justify-between overflow-hidden px-6 pb-10 pt-28 md:px-10"
    >
      <!-- ambient layers -->
      <div class="hero-orb hero-orb-a"></div>
      <div class="hero-orb hero-orb-b"></div>
      <div class="beam" #beamA style="left: 18%;"></div>
      <div class="beam" #beamB style="left: 64%;"></div>

      <svg class="hero-rings opacity-[0.16]" viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <circle cx="100" cy="100" r="98" stroke="#EFEFEF" stroke-width="0.4" />
        <circle cx="100" cy="100" r="72" stroke="#EFEFEF" stroke-width="0.4" stroke-dasharray="1 5" />
        <circle cx="100" cy="100" r="46" stroke="#b0704f" stroke-width="0.6" stroke-dasharray="2 7" />
        <circle cx="100" cy="2" r="2.5" fill="#b0704f" />
      </svg>

      <!-- slow background word -->
      <div class="bg-marquee" aria-hidden="true">
        <div class="bg-marquee-track">
          @for (i of [0, 1]; track i) {
            <span class="font-display font-light" style="font-size: 22vw; line-height: 1;">
              {{ profile.firstName }} {{ profile.lastName }}&nbsp;—&nbsp;{{ profile.role }}&nbsp;—&nbsp;
            </span>
          }
        </div>
      </div>

      <!-- top meta row -->
      <div class="relative z-20 flex items-start justify-between font-mono text-[12px] uppercase tracking-[0.1em] text-paper/70">
        <p [class.opacity-0]="!active">
          {{ profile.role }}<br />
          <span class="text-paper/70">{{ profile.years }} years of craft</span>
        </p>
        <p class="text-right" [class.opacity-0]="!active">
          Based in {{ profile.location }}<br />
          <span class="text-paper/70">Portfolio — 2026</span>
        </p>
      </div>

      <!-- portrait card (desktop) -->
      @if (!physicsOn()) {
        <div
          #cardEl
          class="portrait-frame absolute right-[7vw] top-[20vh] z-5 hero-portrait w-[21vw] max-w-[330px]"
          [class.opacity-0]="!active"
          style="transition: opacity 1s ease 0.9s;"
        >
          <div class="portrait-clip relative overflow-hidden bg-ink2">
            <img
              [src]="profile.heroImage.src"
              [alt]="profile.heroImage.alt"
              class="portrait-img aspect-[2/2.6] w-full object-cover"
              style="filter: saturate(1.02) contrast(1.03);"
              loading="eager"
            />
            <div class="absolute inset-0 bg-linear-to-t from-ink/60 via-transparent to-transparent"></div>
            <span class="frame-corner left-3 top-3 border-l border-t"></span>
            <span class="frame-corner right-3 top-3 border-r border-t"></span>
            <span class="frame-corner bottom-3 left-3 border-b border-l"></span>
            <span class="frame-corner bottom-3 right-3 border-b border-r"></span>
            <p class="absolute bottom-5 left-5 right-5 font-mono text-[12px] uppercase leading-relaxed tracking-[0.1em] text-paper/80">
              {{ profile.name }}<br />
              <span class="text-paper/70">{{ profile.role }} — est. 2009</span>
            </p>
          </div>
        </div>
      }

      <div class="hero-intro relative z-20" [class.is-ready]="active">
        <p class="eyebrow text-accent">{{ profile.role }}</p>
        <p class="hero-value">Thoughtful interfaces.<br /><em>Dependable engineering.</em></p>
      </div>
      <!-- the name -->
      <div #nameEl class="relative z-10 select-none">
        @if (!physicsOn()) {
          <h1
            class="font-display font-light leading-[0.92] tracking-[0.01em] text-paper"
            style="font-size: clamp(4rem, 14.5vw, 13.5rem);"
            [attr.aria-label]="profile.name"
          >
            <span class="block">
              @for (ch of firstNameChars; track $index) {
                <span class="hero-letter-wrap"
                  ><span
                    class="hero-letter"
                    [class.is-shown]="active"
                    [style.transition-delay]="100 + $index * 55 + 'ms'"
                    >{{ ch }}</span
                  ></span
                >
              }
            </span>
            <span class="block md:pl-[12vw]">
              @for (ch of lastNameChars; track $index) {
                <span class="hero-letter-wrap"
                  ><span
                    class="hero-letter"
                    [class.is-shown]="active"
                    [style.transition-delay]="320 + $index * 55 + 'ms'"
                    >{{ ch }}</span
                  ></span
                >
              }
            </span>
          </h1>
        } @else {
          <div class="font-display font-light leading-[0.92] tracking-[0.01em]" style="font-size: clamp(4rem, 14.5vw, 13.5rem);">
            <span class="block invisible">{{ profile.firstName }}</span>
            <span class="block md:pl-[12vw] invisible">{{ profile.lastName }}</span>
            @for (l of measured; track $index) {
              <span class="hero-letter is-physics text-paper">{{ l.char }}</span>
            }
          </div>
        }
      </div>

      <div class="hero-bottom relative z-20" [class.is-ready]="active">
        <div class="hero-summary"><p>{{ profile.tagline }}</p>
          <div class="hero-actions"><a class="portfolio-button primary" href="#work" (click)="scroll.navigate($event, '#work')">View selected work <span aria-hidden="true">↘</span></a><a class="portfolio-button" href="#contact" (click)="scroll.navigate($event, '#contact')">Get in touch <span aria-hidden="true">↗</span></a></div>
        </div>
        <div class="hero-proof"><span class="eyebrow">{{ profile.years }} years of craft</span><p>{{ currentRole }}</p>
          @if (!physicsOn() && physicsAvailable()) { <button class="hero-play" type="button" (click)="startPhysics()">Do not press this ↗</button> }
          @if (physicsOn()) { <button class="hero-play" type="button" (click)="resetPhysics()">Put it back ↶</button> }
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [
    `
      @keyframes scrolldrip {
        0% { transform: scaleY(0); transform-origin: top; }
        45% { transform: scaleY(1); transform-origin: top; }
        55% { transform: scaleY(1); transform-origin: bottom; }
        100% { transform: scaleY(0); transform-origin: bottom; }
      }
    `,
  ],
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  @Input() active = false;

  @ViewChild('heroEl', { static: true }) heroEl!: ElementRef<HTMLElement>;
  @ViewChild('nameEl', { static: true }) nameEl!: ElementRef<HTMLElement>;
  @ViewChild('beamA') beamA?: ElementRef<HTMLElement>;
  @ViewChild('beamB') beamB?: ElementRef<HTMLElement>;
  @ViewChild('cardEl') cardEl?: ElementRef<HTMLElement>;

  readonly scroll = inject(ScrollService);
  get currentRole() { const job = this.content.content().experience[0]; return job ? job.role + ' · ' + job.company : this.profile.role; }
  private readonly content = inject(PortfolioContentService);
  get profile() { return this.content.content().profile; }
  get firstNameChars() { return this.profile.firstName.split(''); }
  get lastNameChars() { return this.profile.lastName.split(''); }
  readonly physicsOn = signal(false);
  readonly measured: MeasuredLetter[] = [];

  private readonly zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);

  /** physics hero is disabled on touch / small screens */
  readonly physicsAvailable = signal(false);

  private engine?: Matter.Engine;
  private rafId = 0;
  private running = false;
  private inView = true;
  private viewObserver?: IntersectionObserver;
  private resizeListener = () => this.rebuildWalls();
  private mouseListener = (e: MouseEvent) => this.onPointer(e);
  private walls: Matter.Body[] = [];
  private pairs: { body: Matter.Body; el: HTMLElement; w: number; h: number }[] = [];

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const finePointer = window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.physicsAvailable.set(finePointer && window.innerWidth >= 768);

    this.zone.runOutsideAngular(() => {
      this.viewObserver = new IntersectionObserver(
        (entries) => {
          this.inView = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0.05 }
      );
      this.viewObserver.observe(this.heroEl.nativeElement);

      // cursor-tracked light beams
      if (finePointer) {
        window.addEventListener('mousemove', this.mouseListener, { passive: true });
      }
    });
  }

  private onPointer(e: MouseEvent): void {
    if (!this.inView || this.physicsOn() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    if (this.beamA) {
      gsap.to(this.beamA.nativeElement, {
        x: nx * 60,
        duration: 1.4,
        ease: 'power3.out',
      });
    }
    if (this.beamB) {
      gsap.to(this.beamB.nativeElement, {
        x: nx * -80,
        duration: 1.8,
        ease: 'power3.out',
      });
    }
    if (this.cardEl) {
      gsap.to(this.cardEl.nativeElement, {
        rotateY: nx * 6,
        rotateX: ny * -5,
        y: ny * 14,
        transformPerspective: 900,
        duration: 1.1,
        ease: 'power3.out',
      });
    }
  }

  startPhysics(): void {
    if (!this.physicsAvailable() || this.physicsOn() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const container = this.heroEl.nativeElement;
    const containerRect = container.getBoundingClientRect();

    // measure every letter in normal flow
    this.measured.length = 0;
    const spans = container.querySelectorAll<HTMLElement>('.hero-letter');
    spans.forEach((el) => {
      const r = el.getBoundingClientRect();
      this.measured.push({
        char: el.textContent ?? '',
        x: r.left - containerRect.left,
        y: r.top - containerRect.top,
        w: r.width,
        h: r.height,
      });
    });

    this.physicsOn.set(true);

    // wait for the physics-mode DOM to render
    setTimeout(() => this.initEngine(), 0);
  }

  private initEngine(): void {
    const container = this.heroEl.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.zone.runOutsideAngular(() => {
      this.engine = Matter.Engine.create({ enableSleeping: false });
      this.engine.gravity.y = 1.15;

      this.buildWalls(width, height);

      const spans = Array.from(
        container.querySelectorAll<HTMLElement>('.hero-letter.is-physics')
      );
      spans.forEach((el, i) => {
        const m = this.measured[i];
        if (!m) return;
        el.style.width = m.w + 'px';
        el.style.height = m.h + 'px';
        const body = Matter.Bodies.rectangle(m.x + m.w / 2, m.y + m.h / 2, m.w, m.h, {
          isSleeping: false,
          density: 1,
          restitution: 0.7,
          frictionAir: 0.01,
          angle: (Math.random() - 0.5) * 0.15,
          chamfer: { radius: 2 },
        });
        Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 5, y: -Math.random() * 3 });
        Matter.Composite.add(this.engine!.world, body);
        this.pairs.push({ body, el, w: m.w, h: m.h });
      });

      // mouse interaction — drag letters around
      const mouse = Matter.Mouse.create(container);
      Matter.Mouse.setScale(mouse, { x: 1, y: 1 });
      const mouseConstraint = Matter.MouseConstraint.create(this.engine, {
        mouse,
        constraint: { stiffness: 0.5, render: { visible: false } },
      });
      Matter.Composite.add(this.engine.world, mouseConstraint);

      window.addEventListener('resize', this.resizeListener);

      this.running = true;
      const tick = () => {
        if (!this.running) return;
        if (this.inView && this.engine) {
          Matter.Engine.update(this.engine, 1000 / 60);
          for (const p of this.pairs) {
            p.el.style.transform = `translate(${p.body.position.x - p.w / 2}px, ${
              p.body.position.y - p.h / 2
            }px) rotate(${p.body.angle}rad)`;
          }
        }
        this.rafId = requestAnimationFrame(tick);
      };
      this.rafId = requestAnimationFrame(tick);
    });
  }

  private buildWalls(width: number, height: number): void {
    const opts: Matter.IChamferableBodyDefinition = { isStatic: true };
    this.walls = [
      Matter.Bodies.rectangle(width / 2, -25, width + 100, 50, opts),
      Matter.Bodies.rectangle(width / 2, height - 2, width + 100, 50, opts),
      Matter.Bodies.rectangle(-25, height / 2, 50, height * 2, opts),
      Matter.Bodies.rectangle(width + 25, height / 2, 50, height * 2, opts),
    ];
    Matter.Composite.add(this.engine!.world, this.walls);
  }

  private rebuildWalls(): void {
    if (!this.engine) return;
    const container = this.heroEl.nativeElement;
    Matter.Composite.remove(this.engine.world, this.walls);
    this.buildWalls(container.clientWidth, container.clientHeight);
  }

  resetPhysics(): void {
    this.teardownEngine();
    this.physicsOn.set(false);
    setTimeout(() => {
      this.heroEl.nativeElement
        .querySelectorAll('.hero-letter')
        .forEach((el) => el.classList.add('is-shown'));
    }, 0);
  }

  private teardownEngine(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.resizeListener);
    if (this.engine) {
      Matter.Composite.clear(this.engine.world, false);
      Matter.Engine.clear(this.engine);
      this.engine = undefined;
    }
    this.pairs = [];
    this.walls = [];
  }

  ngOnDestroy(): void {
    this.teardownEngine();
    this.viewObserver?.disconnect();
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('mousemove', this.mouseListener);
    }
  }
}
