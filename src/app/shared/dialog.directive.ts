import { AfterViewInit, Directive, ElementRef, EventEmitter, HostListener, OnDestroy, Output, inject } from '@angular/core';

/** Native top-layer dialogs own focus containment, background inertness and restoration. */
@Directive({ selector: 'dialog[appDialog]', standalone: true })
export class DialogDirective implements AfterViewInit, OnDestroy {
  @Output() readonly dismissed = new EventEmitter<void>();
  private readonly element: ElementRef<HTMLDialogElement> = inject(ElementRef);
  private previousFocus: HTMLElement | null = null;
  private static activeDialogs = 0;
  private static initialOverflow = '';
  private opened = false;
  private focusFrame = 0;

  ngAfterViewInit(): void {
    this.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (DialogDirective.activeDialogs === 0) DialogDirective.initialOverflow = document.body.style.overflow;
    this.element.nativeElement.showModal();
    DialogDirective.activeDialogs++;
    document.body.style.overflow = 'hidden';
    this.opened = true;
    // Angular may apply an entrance's visibility after more than one frame.
    // A hidden control still has client rects, but the browser refuses its focus.
    let attempts = 0;
    const focusWhenVisible = () => {
      const dialog = this.element.nativeElement;
      if (!dialog.isConnected || !dialog.open) return;
      if (getComputedStyle(dialog).visibility !== 'visible') {
        if (++attempts < 60) this.focusFrame = requestAnimationFrame(focusWhenVisible);
        return;
      }
      const visible = (control: HTMLElement) => control.getClientRects().length > 0 && getComputedStyle(control).visibility === 'visible' && !control.closest('[hidden], [inert]');
      const preferred = dialog.querySelector<HTMLElement>('[autofocus]');
      const target = preferred && visible(preferred) ? preferred : [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled)')].find(visible);
      target?.focus({ preventScroll: true });
      if ((!target || document.activeElement !== target) && ++attempts < 60) {
        this.focusFrame = requestAnimationFrame(focusWhenVisible);
      }
    };
    this.focusFrame = requestAnimationFrame(focusWhenVisible);
  }

  @HostListener('keydown', ['$event']) containFocus(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    const dialog = this.element.nativeElement;
    const controls = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter(control => control.getClientRects().length && !control.closest('[hidden], [inert]'));
    const first = controls[0], last = controls.at(-1);
    if (!first || !last) { event.preventDefault(); dialog.focus(); return; }
    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
  }

  @HostListener('cancel', ['$event']) onCancel(event: Event): void {
    event.preventDefault();
    this.dismissed.emit();
  }

  @HostListener('click', ['$event']) onBackdrop(event: MouseEvent): void {
    if (event.target !== this.element.nativeElement) return;
    const rect = this.element.nativeElement.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) this.dismissed.emit();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.focusFrame);
    if (!this.opened) return;
    this.element.nativeElement.close();
    DialogDirective.activeDialogs = Math.max(0, DialogDirective.activeDialogs - 1);
    if (DialogDirective.activeDialogs === 0) document.body.style.overflow = DialogDirective.initialOverflow;
    if (this.previousFocus?.isConnected) this.previousFocus.focus({ preventScroll: true });
  }
}
