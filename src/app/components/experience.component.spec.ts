import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { DEFAULT_PORTFOLIO } from '../content';
import { PortfolioContentService } from '../services/portfolio-content.service';
import { ExperienceComponent } from './experience.component';

describe('ExperienceComponent', () => {
  let fixture: ComponentFixture<ExperienceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperienceComponent],
      providers: [
        {
          provide: PortfolioContentService,
          useValue: { content: signal(DEFAULT_PORTFOLIO) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExperienceComponent);
    fixture.detectChanges();
  });

  it('renders every career entry with the current role expanded', () => {
    const host = fixture.nativeElement as HTMLElement;
    const triggers = host.querySelectorAll<HTMLButtonElement>('.entry-trigger');

    expect(triggers.length).toBe(DEFAULT_PORTFOLIO.experience.length);
    expect(triggers[0].getAttribute('aria-expanded')).toBe('true');
    expect(host.querySelector('.experience-entry.is-active')).not.toBeNull();
  });

  it('moves the expanded state when another role is selected', () => {
    const host = fixture.nativeElement as HTMLElement;
    const triggers = host.querySelectorAll<HTMLButtonElement>('.entry-trigger');

    triggers[1].click();
    fixture.detectChanges();

    expect(triggers[0].getAttribute('aria-expanded')).toBe('false');
    expect(triggers[1].getAttribute('aria-expanded')).toBe('true');
    expect(host.querySelector('#experience-panel-1')?.getAttribute('aria-hidden')).toBe('false');
  });
});
