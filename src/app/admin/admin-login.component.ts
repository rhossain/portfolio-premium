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
        <img class="admin-mark" src="brand-mark.svg" alt="" width="64" height="64" aria-hidden="true" />
        <p class="admin-kicker">Portfolio Admin</p>
        <h1 id="login-title" class="admin-login-title">Welcome back.</h1>
        <p class="admin-login-copy">Sign in with your authorized administrator account.</p>

        <form novalidate class="mt-12 space-y-6" (ngSubmit)="submit()">
          <label class="admin-field">
            <span>Administrator email</span>
            <input name="email" type="email" autocomplete="email" required readonly [(ngModel)]="email" />
          </label>
          <div class="admin-field">
            <label for="login-password">Password</label>
            <div class="password-input"><input id="login-password" name="password" [type]="showPassword() ? 'text' : 'password'" autocomplete="current-password" required [(ngModel)]="password" [attr.aria-invalid]="!!error()" [attr.aria-describedby]="error() ? 'login-error' : null" />
              <button type="button" (click)="showPassword.set(!showPassword())" [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'" [attr.aria-pressed]="showPassword()">{{ showPassword() ? 'Hide' : 'Show' }}</button></div>
          </div>

          @if (error()) {
            <p id="login-error" class="admin-error" role="alert">{{ error() }}</p>
          }
          @if (notice()) {
            <p class="admin-notice" role="status">{{ notice() }}</p>
          }

          <button class="admin-primary w-full" type="submit" [disabled]="submitting()">
            {{ pendingAction() === 'password' ? 'Signing in…' : 'Sign in' }}
          </button>
          <div class="admin-login-divider"><span>or</span></div>
          <button class="admin-secondary w-full" type="button" (click)="sendMagicLink()" [disabled]="submitting()">
            {{ pendingAction() === 'link' ? 'Sending sign-in link…' : 'Email me a sign-in link' }}
          </button>
        </form>
      </section>
    </main>
  `,
})
export class AdminLoginComponent implements OnInit {
  email = PORTFOLIO_ADMIN_EMAIL;
  password = '';
  readonly showPassword = signal(false);
  readonly pendingAction = signal<'password' | 'link' | null>(null);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    if (this.auth.isAdmin()) await this.router.navigateByUrl('/admin');
  }

  async submit(): Promise<void> {
    if (this.submitting()) return;
    if (!this.password) { this.error.set('Enter your password or request a sign-in link.'); document.getElementById('login-password')?.focus(); return; }
    this.submitting.set(true);
    this.pendingAction.set('password');
    this.error.set(null);
    this.notice.set(null);
    let error: string | null;
    try { error = await this.auth.signIn(this.email.trim(), this.password); } catch { error = 'Unable to sign in. Check your connection and try again.'; }
    this.submitting.set(false); this.pendingAction.set(null);
    if (error) {
      this.error.set(error);
      return;
    }
    await this.router.navigateByUrl('/admin');
  }

  async sendMagicLink(): Promise<void> {
    if (!this.email || this.submitting()) return;
    this.submitting.set(true); this.pendingAction.set('link');
    this.error.set(null);
    this.notice.set(null);
    let error: string | null;
    try { error = await this.auth.sendMagicLink(this.email.trim()); } catch { error = 'Unable to send the link. Check your connection and try again.'; }
    this.submitting.set(false); this.pendingAction.set(null);
    if (error) {
      this.error.set(error);
      return;
    }
    this.notice.set('Check your email and open the secure sign-in link on this device.');
  }
}
