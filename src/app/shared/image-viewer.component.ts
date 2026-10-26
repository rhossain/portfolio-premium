import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { MediaAsset } from '../content';
import { DialogDirective } from './dialog.directive';
@Component({
  selector: 'app-image-viewer', standalone: true, imports: [DialogDirective], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog appDialog class="image-viewer" aria-label="Project screen viewer" (dismissed)="closed.emit()" (keydown.arrowleft)="navigateByKey($event, -1)" (keydown.arrowright)="navigateByKey($event, 1)">
      <header class="image-viewer-toolbar">
        <span role="status">Screen {{ index() + 1 }} of {{ images.length }}</span>
        <div><button type="button" class="admin-secondary" [attr.aria-pressed]="zoomed()" (click)="zoomed.set(!zoomed())">{{ zoomed() ? 'Fit image' : 'Zoom in' }}</button>
        <button autofocus type="button" class="admin-secondary" (click)="closed.emit()">Close viewer</button></div>
      </header>
      <div tabindex="0" role="region" aria-label="Project image. Scroll to inspect when zoomed." class="image-viewer-body" [class.is-zoomed]="zoomed()" data-lenis-prevent>
        @if (images[index()]; as image) {
          @if (!failed()) { <img [src]="image.src" [alt]="image.alt" (error)="failed.set(true)" /> }
          @else { <div class="media-fallback" role="status"><p>This screen could not be loaded.</p><button class="admin-secondary" type="button" (click)="failed.set(false)">Try again</button></div> }
        }
      </div>
      <footer class="image-viewer-toolbar"><button type="button" class="admin-secondary" [disabled]="images.length < 2" (click)="step(-1)">← Previous</button><p>{{ images[index()]?.alt }}</p><button type="button" class="admin-secondary" [disabled]="images.length < 2" (click)="step(1)">Next →</button></footer>
    </dialog>
  `,
})
export class ImageViewerComponent implements OnInit {
  @Input() images: MediaAsset[] = [];
  @Input() initialIndex = 0;
  @Output() closed = new EventEmitter<void>();
  readonly index = signal(0);
  readonly zoomed = signal(false);
  readonly failed = signal(false);
  ngOnInit(): void { this.index.set(Math.max(0, Math.min(this.initialIndex, this.images.length - 1))); }
  navigateByKey(event: Event, direction: number): void {
    if (this.zoomed() && (event.target as HTMLElement).closest('.image-viewer-body')) return;
    event.preventDefault(); this.step(direction);
  }
  step(direction: number): void {
    if (!this.images.length) return;
    this.index.set((this.index() + direction + this.images.length) % this.images.length); this.failed.set(false); this.zoomed.set(false);
  }
}
