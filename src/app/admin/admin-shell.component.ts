import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-root min-h-screen bg-ink text-paper">
      <header class="admin-mobile-header">
        <a routerLink="/admin" aria-label="Portfolio Admin home"><img class="admin-mobile-brand" src="brand-mark.svg" alt="" width="36" height="36" /></a>
        <button type="button" class="admin-icon-button" (click)="menuOpen.set(!menuOpen())" id="admin-menu-toggle" [attr.aria-expanded]="menuOpen()" aria-controls="admin-sidebar" aria-label="Toggle navigation">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
      </header>

      <aside id="admin-sidebar" class="admin-sidebar" [attr.inert]="mobile() && !menuOpen() ? '' : null" [class.is-open]="menuOpen()">
        <a routerLink="/admin" class="admin-brand" (click)="menuOpen.set(false)">
          <img class="admin-brand-mark" src="brand-mark.svg" alt="" width="52" height="52" />
          <span>Portfolio Admin</span>
        </a>
        <div class="admin-sidebar-rule"></div>
        <nav aria-label="Admin navigation" class="admin-nav">
          @for (item of navigation; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="is-active" ariaCurrentWhenActive="page" [routerLinkActiveOptions]="item.exact ? exactMatch : partialMatch" (click)="menuOpen.set(false)">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="item.icon" /></svg>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>
        <div class="admin-sidebar-footer">
          <a routerLink="/" target="_blank" class="admin-utility-link">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" /></svg>
            Open portfolio
          </a>
          <button type="button" class="admin-utility-link" (click)="auth.signOut()">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h5M14 8l4 4-4 4M8 12h10" /></svg>
            Sign out
          </button>
          <div class="admin-user">
            <span class="admin-avatar">SH</span>
            <span><strong>Sazzad Hossain</strong><small>{{ auth.session()?.user?.email }}</small></span>
          </div>
        </div>
      </aside>

      @if (menuOpen()) {
        <button class="admin-menu-scrim" type="button" (click)="dismissMenu()" aria-label="Close navigation"></button>
      }

      <div class="admin-main"><router-outlet /></div>
    </div>
  `,
})
export class AdminShellComponent {
  readonly auth = inject(AdminAuthService);
  readonly menuOpen = signal(false);
  readonly mobile = signal(window.innerWidth <= 800);
  @HostListener('window:resize') resize(): void {
    this.mobile.set(window.innerWidth <= 800);
    if (!this.mobile()) this.menuOpen.set(false);
  }
  @HostListener('document:focusin', ['$event']) revealFocusedContent(event: FocusEvent): void {
    if (!this.mobile() || !this.menuOpen() || !(event.target instanceof HTMLElement)) return;
    // This is a disclosure, not a modal: tabbing into the page dismisses its scrim.
    if (!event.target.closest('#admin-sidebar, #admin-menu-toggle, .admin-menu-scrim')) this.menuOpen.set(false);
  }
  @HostListener('document:keydown.escape') dismissMenu(): void {
    if (this.menuOpen()) { this.menuOpen.set(false); document.getElementById('admin-menu-toggle')?.focus(); }
  }
  readonly exactMatch = { exact: true };
  readonly partialMatch = { exact: false };
  readonly navigation = [
    { label: 'Overview', path: '/admin', exact: true, icon: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z' },
    { label: 'Profile & About', path: '/admin/content/profile', exact: false, icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0' },
    { label: 'Experience', path: '/admin/content/experience', exact: false, icon: 'M4 7h16v13H4zM9 7V4h6v3M4 12h16' },
    { label: 'Projects', path: '/admin/content/projects', exact: false, icon: 'M3 6h7l2 2h9v11H3z' },
    { label: 'Skills', path: '/admin/content/skills', exact: false, icon: 'm8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14' },
    { label: 'Navigation', path: '/admin/content/navigation', exact: false, icon: 'M4 7h16M4 12h16M4 17h16' },
    { label: 'Settings', path: '/admin/content/settings', exact: false, icon: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.5 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.5 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.14.38.36.72.65 1 .3.26.68.4 1.08.4H21v4h-.1a1.7 1.7 0 0 0-1.5.6Z' },
  ];
}
