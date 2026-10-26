import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DialogDirective } from './dialog.directive';
import { ConfirmationService } from './confirmation.service';
@Component({
  selector: 'app-confirmation', standalone: true, imports: [DialogDirective], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (confirmation.pending(); as item) {
    <dialog appDialog class="app-confirmation" aria-labelledby="confirmation-title" aria-describedby="confirmation-description" (dismissed)="confirmation.answer(false)">
      <p class="eyebrow">Portfolio admin</p>
      <h2 id="confirmation-title">{{ item.title }}</h2>
      <p id="confirmation-description" class="confirmation-description">{{ item.description }}</p>
      <div class="confirmation-actions">
        <button autofocus type="button" class="admin-secondary" (click)="confirmation.answer(false)">{{ item.cancel || 'Cancel' }}</button>
        <button type="button" class="admin-primary" [class.intent-danger]="item.danger" (click)="confirmation.answer(true)">{{ item.action }}</button>
      </div>
    </dialog>
  }`,
})
export class ConfirmationComponent { readonly confirmation = inject(ConfirmationService); }
