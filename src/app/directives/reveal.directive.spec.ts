import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RevealDirective } from './reveal.directive';

describe('RevealDirective', () => {
  let node: HTMLElement;
  let directive: RevealDirective;

  beforeEach(() => {
    node = document.createElement('div');
    TestBed.configureTestingModule({
      providers: [{ provide: ElementRef, useValue: new ElementRef(node) }],
    });
    directive = TestBed.runInInjectionContext(() => new RevealDirective());
  });

  afterEach(() => directive.ngOnDestroy());

  it('reveals even a tall section before it enters the viewport and stops observing it', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);
    const observer = jasmine.createSpyObj<IntersectionObserver>('observer', ['observe', 'unobserve', 'disconnect']);
    let onIntersection!: IntersectionObserverCallback;
    let settings: IntersectionObserverInit | undefined;
    spyOn(window, 'IntersectionObserver').and.callFake(function (callback, options) {
      onIntersection = callback;
      settings = options;
      return observer;
    });
    directive.revealDelay = 900;
    directive.ngAfterViewInit();

    expect(settings?.rootMargin).toBe('250px 0px');
    expect(settings?.threshold).toBe(0);
    expect(node.style.getPropertyValue('--reveal-delay')).toBe('900ms');
    onIntersection([{
      target: node, isIntersecting: true, intersectionRatio: 0.01, time: 0,
      boundingClientRect: node.getBoundingClientRect(),
      intersectionRect: node.getBoundingClientRect(), rootBounds: null,
    }], observer);
    expect(node.classList.contains('is-inview')).toBeTrue();
    expect(observer.unobserve).toHaveBeenCalledWith(node);
    directive.ngOnDestroy();
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it('keeps content visible without an observer for reduced-motion users', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
    const observe = spyOn(window, 'IntersectionObserver');
    directive.ngAfterViewInit();

    expect(node.hasAttribute('data-reveal')).toBeFalse();
    expect(observe).not.toHaveBeenCalled();
  });
});
