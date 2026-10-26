import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DialogDirective } from './dialog.directive';
@Component({ standalone: true, imports: [DialogDirective], template: `<dialog appDialog aria-label="Test dialog" style="visibility:hidden"><a href="#unused" style="display:none">Hidden action</a><button autofocus>Cancel</button><button>Continue</button></dialog>` })
class DialogTestComponent {}

describe('Shared modal behavior', () => {
  const fixtures: ComponentFixture<DialogTestComponent>[] = [];
  beforeEach(() => TestBed.configureTestingModule({ imports: [DialogTestComponent] }));
  afterEach(() => { fixtures.forEach(fixture => fixture.destroy()); fixtures.length = 0; });
  function open() {
    const fixture = TestBed.createComponent(DialogTestComponent); fixtures.push(fixture); fixture.detectChanges(); fixture.nativeElement.querySelector('dialog').style.visibility = 'visible'; return fixture;
  }
  it('focuses the safe action and wraps both keyboard directions', fakeAsync(() => {
    const fixture = open(); tick(40);
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    const [first, last] = [...dialog.querySelectorAll('button')];
    expect(dialog.open).toBeTrue(); expect(document.activeElement).toBe(first);
    last.focus(); last.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(first);
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(last);
  }));
  it('waits for a delayed entrance before moving focus to the safe action', fakeAsync(() => {
    const fixture = TestBed.createComponent(DialogTestComponent); fixtures.push(fixture); fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    const safeAction = dialog.querySelector('button');
    tick(80);
    expect(document.activeElement).not.toBe(safeAction);
    dialog.style.visibility = 'visible';
    tick(20);
    expect(document.activeElement).toBe(safeAction);
  }));
  it('retries when controls become focusable after the dialog itself is visible', fakeAsync(() => {
    const fixture = TestBed.createComponent(DialogTestComponent); fixtures.push(fixture); fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    const buttons = [...dialog.querySelectorAll('button')];
    buttons.forEach(button => button.style.display = 'none');
    dialog.style.visibility = 'visible';
    tick(80);
    buttons.forEach(button => button.style.display = '');
    tick(20);
    expect(document.activeElement).toBe(buttons[0]);
  }));
  it('keeps the document locked until the final nested dialog is destroyed', fakeAsync(() => {
    const original = document.body.style.overflow;
    const first = open(); const second = open(); tick(40);
    first.destroy(); expect(document.body.style.overflow).toBe('hidden');
    second.destroy(); expect(document.body.style.overflow).toBe(original);
  }));
  it('emits dismissal for Escape without silently leaving an open component behind', () => {
    const fixture = open();
    const directive = fixture.debugElement.children[0].injector.get(DialogDirective);
    spyOn(directive.dismissed, 'emit');
    fixture.nativeElement.querySelector('dialog').dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(directive.dismissed.emit).toHaveBeenCalled();
  });
});
