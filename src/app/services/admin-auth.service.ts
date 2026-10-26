import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

export const PORTFOLIO_ADMIN_EMAIL = 'rshossain.bd@gmail.com';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  readonly session = signal<Session | null>(null);
  readonly ready = signal(false);
  readonly isAdmin = signal(false);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly router: Router,
  ) {
    void this.initialize();
  }

  private async initialize(): Promise<void> {
    const { data } = await this.supabase.client.auth.getSession();
    this.session.set(data.session);
    await this.refreshAdminStatus();
    this.ready.set(true);

    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      void this.refreshAdminStatus();
    });
  }

  async signIn(email: string, password: string): Promise<string | null> {
    if (email.toLowerCase() !== PORTFOLIO_ADMIN_EMAIL) {
      return 'This account is not authorized to sign in.';
    }

    const { data, error } = await this.supabase.client.auth.signInWithPassword({ email, password });
    if (error) return error.message;

    this.session.set(data.session);
    await this.refreshAdminStatus();

    if (!this.isAdmin()) {
      await this.supabase.client.auth.signOut();
      return 'This account is not authorized to manage the portfolio.';
    }

    return null;
  }

  async sendMagicLink(email: string): Promise<string | null> {
    if (email.toLowerCase() !== PORTFOLIO_ADMIN_EMAIL) {
      return 'This account is not authorized to sign in.';
    }

    const redirectTo = `${window.location.origin}/admin`;
    const { error } = await this.supabase.client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
    });
    return error?.message ?? null;
  }

  async signOut(): Promise<void> {
    // Run the editor's navigation guard before revoking the session.
    const wasAdmin = this.isAdmin();
    this.isAdmin.set(false);
    const left = await this.router.navigateByUrl('/admin/login');
    if (!left) { this.isAdmin.set(wasAdmin); return; }
    await this.supabase.client.auth.signOut();
    this.session.set(null);
  }

  async refreshAdminStatus(): Promise<boolean> {
    if (!this.session()) {
      this.isAdmin.set(false);
      return false;
    }

    const { data, error } = await this.supabase.client.rpc('is_portfolio_admin');
    const allowed = !error && data === true;
    this.isAdmin.set(allowed);
    return allowed;
  }
}
