import { Injectable } from '@angular/core';
import { PortfolioContent } from '../content';
export interface RecoveredDraft { content: PortfolioContent; savedAt: number; baseUpdatedAt: string; }
/** Tab-scoped content only. No credentials; expires after 24 hours. */
@Injectable({ providedIn: 'root' })
export class DraftRecoveryService {
  private readonly key = 'portfolio-draft-recovery-v1';
  write(content: PortfolioContent, baseUpdatedAt: string): boolean {
    try { sessionStorage.setItem(this.key, JSON.stringify({ content, baseUpdatedAt, savedAt: Date.now() })); return true; }
    catch { return false; }
  }
  read(): RecoveredDraft | null {
    try {
      const value = JSON.parse(sessionStorage.getItem(this.key) || 'null') as RecoveredDraft | null;
      if (!value || !value.content?.profile || !Array.isArray(value.content.projects) || !Number.isFinite(value.savedAt) || Date.now() - value.savedAt > 86400000) { this.clear(); return null; }
      return value;
    } catch { this.clear(); return null; }
  }
  clear(): void { try { sessionStorage.removeItem(this.key); } catch { /* Storage may be unavailable. */ } }
}
