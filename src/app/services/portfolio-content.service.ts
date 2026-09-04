import { Injectable, signal } from '@angular/core';
import { DEFAULT_PORTFOLIO, PortfolioContent } from '../content';
import { SupabaseService } from './supabase.service';

function cloneContent(content: PortfolioContent): PortfolioContent {
  return structuredClone(content);
}

@Injectable({ providedIn: 'root' })
export class PortfolioContentService {
  readonly content = signal<PortfolioContent>(cloneContent(DEFAULT_PORTFOLIO));
  readonly loading = signal(true);
  readonly source = signal<'supabase' | 'fallback'>('fallback');
  readonly error = signal<string | null>(null);

  constructor(private readonly supabase: SupabaseService) {}

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    const { data, error } = await this.supabase.client.rpc('get_public_portfolio');

    if (error || !data) {
      this.source.set('fallback');
      this.error.set(error?.message ?? 'Published portfolio content is unavailable.');
      this.loading.set(false);
      return;
    }

    this.content.set(data as PortfolioContent);
    this.source.set('supabase');
    this.loading.set(false);
  }
}
