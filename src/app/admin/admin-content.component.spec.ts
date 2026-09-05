import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { DEFAULT_PORTFOLIO } from '../content';
import { PortfolioAdminService } from '../services/portfolio-admin.service';
import { AdminContentComponent } from './admin-content.component';

describe('AdminContentComponent project ordering', () => {
  let fixture: ComponentFixture<AdminContentComponent>;
  let component: AdminContentComponent;
  let admin: jasmine.SpyObj<PortfolioAdminService>;

  beforeEach(async () => {
    admin = jasmine.createSpyObj<PortfolioAdminService>('PortfolioAdminService', ['getDocument', 'saveDraft', 'publish']);
    await TestBed.configureTestingModule({
      imports: [AdminContentComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ section: 'projects' })) },
        },
        {
          provide: PortfolioAdminService,
          useValue: admin,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminContentComponent);
    component = fixture.componentInstance;
    component.section.set('projects');
    component.draft.set(structuredClone(DEFAULT_PORTFOLIO));
    component.loading.set(false);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('moves a project, selects it, and normalizes every position', () => {
    component.moveProject(0, 1);

    const projects = component.draft()!.projects;
    expect(projects[0].title).toBe('ngCommerce');
    expect(projects[1].title).toBe('Styloviz');
    expect(projects.map((project) => project.index)).toEqual(['01', '02', '03', '04', '05', '06', '07']);
    expect(component.selectedProject()).toBe(1);
    expect(component.dirty()).toBeTrue();
    expect(component.reorderMessage()).toContain('Styloviz moved to position 2 of 7');
  });

  it('does not move a project beyond the list boundaries', () => {
    const originalOrder = component.draft()!.projects.map((project) => project.title);

    component.moveProject(0, -1);

    expect(component.draft()!.projects.map((project) => project.title)).toEqual(originalOrder);
    expect(component.dirty()).toBeFalse();
    expect(component.reorderMessage()).toBe('');
  });

  it('keeps boundary controls visible and disabled', () => {
    const host = fixture.nativeElement as HTMLElement;
    const rows = host.querySelectorAll<HTMLElement>('.admin-record-row');
    const firstUp = rows[0].querySelector<HTMLButtonElement>('[aria-label="Move Styloviz at position 1 up"]');
    const lastDown = rows[rows.length - 1].querySelector<HTMLButtonElement>('[aria-label="Move Kids Toys at position 7 down"]');

    expect(firstUp?.disabled).toBeTrue();
    expect(lastDown?.disabled).toBeTrue();
  });

  it('reorders from the rendered control and preserves keyboard focus', () => {
    const host = fixture.nativeElement as HTMLElement;
    const moveDown = host.querySelector<HTMLButtonElement>('[aria-label="Move Styloviz at position 1 down"]')!;

    moveDown.focus();
    moveDown.click();
    fixture.detectChanges();

    const rows = host.querySelectorAll<HTMLElement>('.admin-record-row');
    const movedControl = host.querySelector<HTMLButtonElement>('[aria-label="Move Styloviz at position 2 down"]');
    const saveDraft = Array.from(host.querySelectorAll<HTMLButtonElement>('button')).find((button) => button.textContent?.trim() === 'Save draft');

    expect(rows[0].textContent).toContain('01 · ngCommerce');
    expect(rows[1].textContent).toContain('02 · Styloviz');
    expect(document.activeElement).toBe(movedControl);
    expect(host.querySelector('.admin-reorder-status')?.textContent).toContain('Styloviz moved to position 2 of 7');
    expect(saveDraft?.disabled).toBeFalse();
  });

  it('persists the reordered draft through the existing save workflow', async () => {
    component.moveProject(0, 1);

    const saved = await component.save();

    expect(saved).toBeTrue();
    expect(admin.saveDraft).toHaveBeenCalledOnceWith(component.draft()!);
    expect(admin.saveDraft.calls.mostRecent().args[0].projects[0].title).toBe('ngCommerce');
    expect(admin.saveDraft.calls.mostRecent().args[0].projects[1].title).toBe('Styloviz');
    expect(component.dirty()).toBeFalse();
    expect(component.message()).toBe('Draft saved just now');
  });
});
