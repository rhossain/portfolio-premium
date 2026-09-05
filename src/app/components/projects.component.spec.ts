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
});
