import { Component, HostListener, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ScrollService } from '../services/scroll.service';
import { PortfolioContentService } from '../services/portfolio-content.service';
@Component({
  selector: 'app-nav', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="reading-progress" aria-hidden="true"><span [style.transform]="'scaleX(' + scroll.progress() + ')' "></span></div>
    <header class="public-header" [class.is-hidden]="hidden()">
      <nav class="public-nav" aria-label="Main navigation">
        <a href="#top" (click)="go($event, '#top')" aria-label="Home" class="logo"><img class="logo-mark" src="brand-mark.svg" alt="" width="44" height="44" /></a>
        <div class="desktop-links">
          @for (link of links; track link.target) { <a class="u-sweep" [href]="link.target" (click)="go($event, link.target)" [attr.aria-current]="scroll.activeSection() === link.target.slice(1) ? 'location' : null">{{ link.label }}</a> }
        </div>
        <div class="nav-actions"><a class="nav-contact" [href]="'mailto:' + profile.email">
          <span class="availability-indicator" aria-hidden="true"><span class="availability-pulse animate-ping"></span><span class="availability-dot"></span></span>
          <span class="nav-availability-full">{{ profile.availability }}</span><span class="nav-availability-short">Available</span></a>
          <button id="mobile-menu-toggle" class="menu-toggle" type="button" [attr.aria-expanded]="menuOpen()" aria-controls="mobile-navigation" (click)="menuOpen.set(!menuOpen())">{{ menuOpen() ? 'Close' : 'Menu' }} <span aria-hidden="true">{{ menuOpen() ? '−' : '+' }}</span></button>
        </div>
      </nav>
      <nav id="mobile-navigation" class="mobile-navigation" aria-label="Mobile navigation" [hidden]="!menuOpen()">
        @for (link of mobileLinks; track link.target) { <a [href]="link.target" (click)="go($event, link.target)" [attr.aria-current]="scroll.activeSection() === link.target.slice(1) ? 'location' : null">{{ link.label }} <span aria-hidden="true">↗</span></a> }
      </nav>
    </header>
  `,
})
export class NavComponent {
  readonly scroll = inject(ScrollService);
  private readonly content = inject(PortfolioContentService);
  readonly menuOpen = signal(false);
  get profile() { return this.content.content().profile; }
  get links() { return this.content.content().navLinks; }
  get mobileLinks() {
    const links = [...this.links];
    if (!links.some(link => link.target === '#skills')) {
      const contact = links.findIndex(link => link.target === '#contact');
      links.splice(contact < 0 ? links.length : contact, 0, { target: '#skills', label: 'Capabilities' });
    }
    return links;
  }
  readonly hidden = computed(() => !this.menuOpen() && this.scroll.direction() === 1 && this.scroll.progress() > 0.08);
  go(event: Event, target: string): void {
    this.menuOpen.set(false); this.scroll.navigate(event, target);
    if (window.innerWidth < 900) document.getElementById(target.slice(1))?.focus({ preventScroll: true });
  }
  @HostListener('document:keydown.escape') dismiss(): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false); document.getElementById('mobile-menu-toggle')?.focus();
  }
  @HostListener('document:click', ['$event']) outside(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('.public-header')) this.menuOpen.set(false);
  }
  @HostListener('window:resize') resize(): void { if (window.innerWidth >= 900) this.menuOpen.set(false); }
}
