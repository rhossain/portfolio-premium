import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DEFAULT_PORTFOLIO } from '../content';
import { PortfolioContentService } from '../services/portfolio-content.service';
import { ProjectsComponent } from './projects.component';

describe('ProjectsComponent', () => {
  let fixture: ComponentFixture<ProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [
        {
          provide: PortfolioContentService,
          useValue: { content: signal(DEFAULT_PORTFOLIO) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('renders the project index with the first project selected', () => {
    const host = fixture.nativeElement as HTMLElement;
    const selectors = host.querySelectorAll<HTMLButtonElement>('.project-picker');

    expect(selectors.length).toBe(DEFAULT_PORTFOLIO.projects.length);
    expect(selectors[0].getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector('.active-project h3')?.textContent).toContain('Styloviz');
  });

  it('updates the stage when another project is selected', () => {
    const host = fixture.nativeElement as HTMLElement;
    const selectors = host.querySelectorAll<HTMLButtonElement>('.project-picker');

    selectors[1].click();
    fixture.detectChanges();

    expect(selectors[0].getAttribute('aria-pressed')).toBe('false');
    expect(selectors[1].getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector('.active-project h3')?.textContent).toContain('ngCommerce');
  });

  it('emits the active project when its case study is opened', () => {
    const emitted: string[] = [];
    fixture.componentInstance.openCase.subscribe((project) => emitted.push(project.title));

    const button = fixture.nativeElement.querySelector('.case-study-link') as HTMLButtonElement;
    button.click();

    expect(emitted).toEqual(['Styloviz']);
  });

  it('loads screenshots lazily without probing every project image', () => {
    const imageConstructor = spyOn(window, 'Image').and.callThrough();
    const otherFixture = TestBed.createComponent(ProjectsComponent);
    otherFixture.detectChanges();
    const images = otherFixture.nativeElement.querySelectorAll('.slider-img') as NodeListOf<HTMLImageElement>;

    expect(imageConstructor).not.toHaveBeenCalled();
    expect(images.length).toBe(DEFAULT_PORTFOLIO.projects[0].images.length);
    expect(Array.from(images).every(image => image.loading === 'lazy' && image.decoding === 'async')).toBeTrue();
    otherFixture.destroy();
  });

  it('resets a cancelled touch gesture without changing the screenshot', () => {
    const slider = fixture.nativeElement.querySelector('.slider') as HTMLElement;
    spyOn(slider, 'setPointerCapture');
    slider.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, clientX: 250, button: 0 }));
    slider.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: 50 }));
    expect(fixture.componentInstance.dragging()).toBe(0);
    slider.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1 }));
    expect(fixture.componentInstance.dragging()).toBe(-1);
    expect(fixture.componentInstance.slide(0)).toBe(0);

    // A later intentional swipe still works after the browser cancels scrolling.
    slider.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 2, clientX: 250, button: 0 }));
    slider.dispatchEvent(new PointerEvent('pointermove', { pointerId: 2, clientX: 50 }));
    slider.dispatchEvent(new PointerEvent('pointerup', { pointerId: 2, clientX: 50 }));
    expect(fixture.componentInstance.slide(0)).toBe(1);
  });

  it('ignores secondary mouse buttons on the screenshot slider', () => {
    const slider = fixture.nativeElement.querySelector('.slider') as HTMLElement;
    const capture = spyOn(slider, 'setPointerCapture');
    slider.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, clientX: 250, button: 2 }));
    expect(capture).not.toHaveBeenCalled();
    expect(fixture.componentInstance.dragging()).toBe(-1);
  });

  it('uses the loaded screenshot dimensions to preserve its full-page tour', () => {
    const host = fixture.nativeElement as HTMLElement;
    const slider = host.querySelector('.slider') as HTMLElement;
    const image = host.querySelector('.slider-img') as HTMLImageElement;
    Object.defineProperties(slider, {
      clientWidth: { value: 800 },
      clientHeight: { value: 450 },
    });
    Object.defineProperties(image, {
      naturalWidth: { value: 1200 },
      naturalHeight: { value: 2400 },
    });
    image.dispatchEvent(new Event('load'));
    fixture.componentInstance.onHoverStart(0);
    fixture.detectChanges();

    expect(fixture.componentInstance.panHeight(0, 0)).toBe('1600.0px');
    expect(fixture.componentInstance.panTransform(0, 0)).toBe('translateY(-1150.0px)');
  });
});
