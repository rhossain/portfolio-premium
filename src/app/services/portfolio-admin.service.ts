import { Injectable } from '@angular/core';
import { PortfolioContent, MediaAsset } from '../content';
import { SupabaseService } from './supabase.service';

export interface PortfolioDocument {
  draft: PortfolioContent;
  published: PortfolioContent;
  version: number;
  updatedAt: string;
  publishedAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class PortfolioAdminService {
  constructor(private readonly supabase: SupabaseService) {}

  async getDocument(): Promise<PortfolioDocument> {
    const { data, error } = await this.supabase.client
      .from('portfolio_documents')
      .select('draft_content,published_content,version,updated_at,published_at')
      .eq('document_key', 'main')
      .single();

    if (error) throw error;

    return {
      draft: data['draft_content'] as PortfolioContent,
      published: data['published_content'] as PortfolioContent,
      version: data['version'] as number,
      updatedAt: data['updated_at'] as string,
      publishedAt: data['published_at'] as string | null,
    };
  }

  async saveDraft(content: PortfolioContent): Promise<void> {
    const { error } = await this.supabase.client
      .from('portfolio_documents')
      .update({ draft_content: content })
      .eq('document_key', 'main');

    if (error) throw error;
  }

  async publish(): Promise<PortfolioContent> {
    const { data, error } = await this.supabase.client.rpc('publish_portfolio');
    if (error) throw error;
    return data as PortfolioContent;
  }

  async uploadImage(file: File, folder: string, alt: string): Promise<MediaAsset> {
    const optimized = await this.optimizeImage(file);
    const safeName = file.name
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'image';
    const path = `${folder}/${crypto.randomUUID()}-${safeName}.webp`;
    const { error } = await this.supabase.client.storage
      .from('portfolio-media')
      .upload(path, optimized, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: false,
      });

    if (error) throw error;

    const { data } = this.supabase.client.storage.from('portfolio-media').getPublicUrl(path);
    return { src: data.publicUrl, alt, storagePath: path };
  }

  async removeImage(asset: MediaAsset): Promise<void> {
    if (!asset.storagePath) return;
    const { error } = await this.supabase.client.storage
      .from('portfolio-media')
      .remove([asset.storagePath]);
    if (error) throw error;
  }

  exportJson(content: PortfolioContent): void {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `portfolio-content-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private async optimizeImage(file: File): Promise<Blob> {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('Use a JPEG, PNG, or WebP image.');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Images must be 5 MB or smaller.');
    }

    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser cannot optimize images.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Image optimization failed.'))),
        'image/webp',
        0.84,
      );
    });
  }
}
