import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthService, PORTFOLIO_ADMIN_EMAIL } from '../services/admin-auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="admin-login min-h-screen bg-ink text-paper">
      <a routerLink="/" class="admin-back-link">← Back to portfolio</a>
      <section class="admin-login-panel" aria-labelledby="login-title">
        <div class="admin-mark" aria-hidden="true">SH</div>
        <p class="admin-kicker">Portfolio Admin</p>
        <h1 id="login-title" class="admin-login-title">Welcome back.</h1>
        <p class="admin-login-copy">Sign in with your authorized administrator account.</p>

        <form class="mt-12 space-y-6" (ngSubmit)="submit()">
          <label class="admin-field">
            <span>Administrator email</span>
            <input name="email" type="email" autocomplete="email" required readonly [(ngModel)]="email" />
          </label>
          <label class="admin-field">
            <span>Password</span>
            <input name="password" type="password" autocomplete="current-password" required [(ngModel)]="password" />
          </label>

          @if (error()) {
            <p class="admin-error" role="alert">{{ error() }}</p>
          }
          @if (notice()) {
            <p class="admin-notice" role="status">{{ notice() }}</p>
          }

          <button class="admin-primary w-full" type="submit" [disabled]="submitting()">
            {{ submitting() ? 'Signing in…' : 'Sign in' }}
          </button>
          <div class="admin-login-divider"><span>or</span></div>
          <button class="admin-secondary w-full" type="button" (click)="sendMagicLink()" [disabled]="submitting()">
            Email me a sign-in link
          </button>
        </form>
      </section>
    </main>
  `,
})
export class AdminLoginComponent implements OnInit {
  email = PORTFOLIO_ADMIN_EMAIL;
  password = '';
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    if (this.auth.isAdmin()) await this.router.navigateByUrl('/admin');
  }

  async submit(): Promise<void> {
    if (!this.email || !this.password || this.submitting()) return;
    this.submitting.set(true);
    this.error.set(null);
    this.notice.set(null);
    const error = await this.auth.signIn(this.email.trim(), this.password);
    this.submitting.set(false);
    if (error) {
      this.error.set(error);
      return;
    }
    await this.router.navigateByUrl('/admin');
  }

  async sendMagicLink(): Promise<void> {
    if (!this.email || this.submitting()) return;
    this.submitting.set(true);
    this.error.set(null);
    this.notice.set(null);
    const error = await this.auth.sendMagicLink(this.email.trim());
    this.submitting.set(false);
    if (error) {
      this.error.set(error);
      return;
    }
    this.notice.set('Check your email and open the secure sign-in link on this device.');
  }
}
