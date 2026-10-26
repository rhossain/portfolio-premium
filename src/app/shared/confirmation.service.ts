import { Injectable, signal } from '@angular/core';
export interface Confirmation {
  title: string;
  description: string;
  action: string;
  cancel?: string;
  danger?: boolean;
}
@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  readonly pending = signal<Confirmation | null>(null);
  private resolve?: (accepted: boolean) => void;
  ask(options: Confirmation): Promise<boolean> {
    if (this.pending()) return Promise.resolve(false);
    this.pending.set(options);
    return new Promise(resolve => { this.resolve = resolve; });
  }
  answer(accepted: boolean): void {
    const resolve = this.resolve;
    this.resolve = undefined;
    this.pending.set(null);
    resolve?.(accepted);
  }
}
