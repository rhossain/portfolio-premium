import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DEFAULT_PORTFOLIO } from '../content';
import { ScrollService } from '../services/scroll.service';
import { CaseStudyComponent } from './case-study.component';

describe('CaseStudyComponent', () => {
  it('opens after an animation frame without depending on a global scroll tick', async () => {
    let frame!: FrameRequestCallback;
    spyOn(window, 'requestAnimationFrame').and.callFake(callback => {
      frame = callback;
      return 1;
    });
    const scroll = jasmine.createSpyObj<ScrollService>('scroll', ['stop', 'start']);
    await TestBed.configureTestingModule({
      imports: [CaseStudyComponent],
      providers: [{ provide: ScrollService, useValue: scroll }],
    }).compileComponents();
    const fixture = TestBed.createComponent(CaseStudyComponent);
    fixture.componentRef.setInput('project', DEFAULT_PORTFOLIO.projects[0]);
    fixture.autoDetectChanges();

    expect(scroll.stop).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.case-study.is-open')).toBeNull();
    TestBed.inject(NgZone).runOutsideAngular(() => frame(0));
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.case-study.is-open')).not.toBeNull();
    fixture.destroy();
    expect(scroll.start).toHaveBeenCalled();
  });
});
