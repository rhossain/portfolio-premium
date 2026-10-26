import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DEFAULT_PORTFOLIO } from '../content';
import { ScrollService } from '../services/scroll.service';
import { CaseStudyComponent } from './case-study.component';

describe('CaseStudyComponent', () => {
  it('opens after an animation frame without depending on a global scroll tick', async () => {
    const frames: FrameRequestCallback[] = [];
    spyOn(window, 'requestAnimationFrame').and.callFake(callback => {
      frames.push(callback);
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
    for (let iteration = 0; iteration < 3; iteration++) {
      const pending = frames.splice(0);
      TestBed.inject(NgZone).runOutsideAngular(() => pending.forEach(callback => callback(0)));
      fixture.detectChanges();
    }
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.case-study.is-open')).not.toBeNull();
    fixture.destroy();
    expect(scroll.start).toHaveBeenCalled();
  });
});
