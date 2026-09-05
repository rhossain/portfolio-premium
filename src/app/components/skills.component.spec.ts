import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DEFAULT_PORTFOLIO } from '../content';
import { PortfolioContentService } from '../services/portfolio-content.service';
import { SkillsComponent } from './skills.component';

describe('SkillsComponent', () => {
  let fixture: ComponentFixture<SkillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsComponent],
      providers: [
        {
          provide: PortfolioContentService,
          useValue: { content: signal(DEFAULT_PORTFOLIO) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SkillsComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('renders every discipline and every capability at once', () => {
    const host = fixture.nativeElement as HTMLElement;
    const groups = host.querySelectorAll<HTMLElement>('.capability-group');
    const skills = host.querySelectorAll<HTMLButtonElement>('.skill-option');

    expect(groups.length).toBe(DEFAULT_PORTFOLIO.skillGroups.length);
    expect(skills.length).toBe(DEFAULT_PORTFOLIO.skillGroups.reduce((total, group) => total + group.items.length, 0));
    expect(skills[0].getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector('.active-readout')?.textContent).toContain('HTML5');
  });

  it('updates the selected signal across disciplines', () => {
    const host = fixture.nativeElement as HTMLElement;
    const groups = host.querySelectorAll<HTMLElement>('.capability-group');
    const skills = host.querySelectorAll<HTMLButtonElement>('.skill-option');
    const secondGroupFirstSkillIndex = DEFAULT_PORTFOLIO.skillGroups[0].items.length;

    skills[secondGroupFirstSkillIndex].click();
    fixture.detectChanges();

    expect(groups[1].classList.contains('is-active')).toBe(true);
    expect(skills[secondGroupFirstSkillIndex].getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector('.active-readout')?.textContent).toContain('Tailwind CSS');
    expect(host.querySelector('.active-readout')?.textContent).toContain('UI & Design');
  });

  it('updates the focused capability from its semantic button', () => {
    const host = fixture.nativeElement as HTMLElement;
    const skills = host.querySelectorAll<HTMLButtonElement>('.skill-option');

    skills[5].click();
    fixture.detectChanges();

    expect(skills[5].getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector('.active-readout')?.textContent).toContain('Angular');
  });
});
