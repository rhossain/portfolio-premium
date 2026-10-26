import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { DEFAULT_PORTFOLIO } from '../content';
import { PortfolioAdminService } from '../services/portfolio-admin.service';
import { ConfirmationService } from '../shared/confirmation.service';
import { DraftRecoveryService } from '../services/draft-recovery.service';
import { AdminContentComponent } from './admin-content.component';

describe('AdminContentComponent project ordering', () => {
  let fixture: ComponentFixture<AdminContentComponent>;
  let component: AdminContentComponent;
  let admin: jasmine.SpyObj<PortfolioAdminService>;

  beforeEach(async () => {
    admin = jasmine.createSpyObj<PortfolioAdminService>('PortfolioAdminService', ['getDocument', 'saveDraft', 'publish', 'uploadImage']);
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

  afterEach(() => { fixture.destroy(); TestBed.inject(DraftRecoveryService).clear(); });

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
  it('preserves unsaved work and a recovery copy after a failed save', async () => {
    component.draft()!.profile.name = 'Recovered author';
    component.markDirty();
    admin.saveDraft.and.rejectWith(new Error('Offline'));
    expect(await component.save()).toBeFalse();
    expect(component.dirty()).toBeTrue();
    expect(component.draft()!.profile.name).toBe('Recovered author');
    expect(TestBed.inject(DraftRecoveryService).read()?.content.profile.name).toBe('Recovered author');
    expect(component.formError()).toBe('Offline');
  });

  it('requires explicit permission to leave unsaved edits and preserves cancellation', async () => {
    const confirmation = TestBed.inject(ConfirmationService);
    spyOn(confirmation, 'ask').and.resolveTo(false);
    component.markDirty();
    expect(await component.canLeave()).toBeFalse();
    expect(component.dirty()).toBeTrue();
    expect(confirmation.ask).toHaveBeenCalled();
  });

  it('removes media only from the draft and can undo the removal', async () => {
    spyOn(TestBed.inject(ConfirmationService), 'ask').and.resolveTo(true);
    const project = component.draft()!.projects[0];
    const before = project.images.length;
    await component.deleteImage(project, project.images[0], 0);
    expect(component.draft()!.projects[0].images.length).toBe(before - 1);
    expect(component.dirty()).toBeTrue();
    component.undoRemoval();
    expect(component.draft()!.projects[0].images.length).toBe(before);
  });

  it('expires removal undo when subsequent edits would be overwritten', async () => {
    spyOn(TestBed.inject(ConfirmationService), 'ask').and.resolveTo(true);
    const project = component.draft()!.projects[0];
    await component.deleteImage(project, project.images[0], 0);
    expect(component.undoDraft()).not.toBeNull();
    component.draft()!.profile.name = 'Later edit';
    component.markDirty();
    expect(component.undoDraft()).toBeNull();
  });

  it('summarizes all changed sections and does not publish after cancellation', async () => {
    const confirmation = TestBed.inject(ConfirmationService);
    const ask = spyOn(confirmation, 'ask').and.resolveTo(false);
    component.document.set({ draft: structuredClone(DEFAULT_PORTFOLIO), published: structuredClone(DEFAULT_PORTFOLIO), version: 1, updatedAt: '', publishedAt: null });
    component.draft()!.profile.name = 'Changed profile';
    component.draft()!.projects[0].title = 'Changed project';
    component.markDirty();
    await component.reviewPublication();
    expect(ask.calls.mostRecent().args[0].description).toContain('Profile');
    expect(ask.calls.mostRecent().args[0].description).toContain('Projects');
    expect(admin.publish).not.toHaveBeenCalled();
  });

  it('blocks leaving and duplicate saving while a mutation is pending', async () => {
    component.saving.set(true);
    expect(await component.canLeave()).toBeFalse();
    expect(await component.save()).toBeFalse();
    expect(admin.saveDraft).not.toHaveBeenCalled();
    expect(component.formError()).toContain('Wait for the current operation');
  });

  function uploadEvent(...names: string[]): Event {
    return { target: { files: names.map(name => new File(['fixture'], name, { type: 'image/png' })), value: 'selected' } } as unknown as Event;
  }

  it('does not dirty a draft or replace a portrait when uploads fail, and allows reselection', async () => {
    admin.uploadImage.and.rejectWith(new Error('Storage unavailable'));
    const project = component.draft()!.projects[0];
    const before = structuredClone(component.draft());
    const event = uploadEvent('failed.png');
    await component.uploadProjectImages(event, project);
    expect(component.draft()).toEqual(before);
    expect(component.dirty()).toBeFalse();
    expect(component.formError()).toContain('failed.png');
    expect((event.target as HTMLInputElement).value).toBe('');
    await component.uploadPortrait(uploadEvent('portrait.png'), 'hero');
    expect(component.draft()).toEqual(before);
    expect(component.dirty()).toBeFalse();
    expect(component.uploading()).toBeFalse();
  });

  it('recovers successful images from a partial batch and identifies the retry boundary', async () => {
    const asset = { src: '/fixture.webp', alt: 'Fixture', storagePath: 'fixture.webp' };
    admin.uploadImage.and.returnValues(Promise.resolve(asset), Promise.reject(new Error('Offline')));
    const before = component.draft()!.projects[0].images.length;
    await component.uploadProjectImages(uploadEvent('first.png', 'failed.png', 'remaining.png'), component.draft()!.projects[0]);
    expect(admin.uploadImage).toHaveBeenCalledTimes(2);
    expect(component.draft()!.projects[0].images.length).toBe(before + 1);
    expect(TestBed.inject(DraftRecoveryService).read()?.content.projects[0].images.length).toBe(before + 1);
    expect(component.formError()).toContain('failed.png');
    expect(component.formError()).toContain('1 of 3');
    expect(component.dirty()).toBeTrue();
  });

  it('preserves edits after session expiry and permits a successful retry', async () => {
    component.draft()!.profile.name = 'Session recovery'; component.markDirty();
    admin.saveDraft.and.rejectWith({ code: 'PGRST301', message: 'JWT expired' });
    expect(await component.save()).toBeFalse();
    expect(component.formError()).toContain('Sign in again');
    expect(component.dirty()).toBeTrue();
    expect(TestBed.inject(DraftRecoveryService).read()?.content.profile.name).toBe('Session recovery');
    admin.saveDraft.and.resolveTo();
    expect(await component.save()).toBeTrue();
    expect(component.draft()!.profile.name).toBe('Session recovery');
    expect(TestBed.inject(DraftRecoveryService).read()).toBeNull();
  });

  it('blocks concurrent uploads, saves, and publication until an upload settles', async () => {
    let finish!: (asset: {src: string; alt: string}) => void;
    admin.uploadImage.and.returnValue(new Promise(resolve => finish = resolve));
    const upload = component.uploadPortrait(uploadEvent('portrait.png'), 'hero');
    await component.uploadProjectImages(uploadEvent('duplicate.png'), component.draft()!.projects[0]);
    await component.uploadPortrait(uploadEvent('duplicate.png'), 'about');
    expect(await component.save()).toBeFalse(); await component.publish();
    expect(admin.uploadImage).toHaveBeenCalledTimes(1);
    expect(admin.saveDraft).not.toHaveBeenCalled(); expect(admin.publish).not.toHaveBeenCalled();
    finish({src: '/fixture.webp', alt: 'Fixture'}); await upload;
    expect(component.uploading()).toBeFalse();
  });

  it('saves before publishing and blocks repeated submission while that save is pending', async () => {
    component.markDirty();
    let finish!: () => void;
    admin.saveDraft.and.returnValue(new Promise<void>(resolve => finish = resolve));
    admin.publish.and.rejectWith(new Error('Publication unavailable'));
    const publication = component.publish();
    await component.publish(); expect(await component.save()).toBeFalse();
    expect(admin.saveDraft).toHaveBeenCalledTimes(1); expect(admin.publish).not.toHaveBeenCalled();
    finish(); await publication;
    expect(admin.publish).toHaveBeenCalledTimes(1);
    expect(component.draft()).not.toBeNull();
    expect(component.formError()).toBe('Publication unavailable');
    expect(component.busy()).toBeFalse();
  });

  it('publishes the saved draft only after confirmation and refreshes published state', async () => {
    spyOn(TestBed.inject(ConfirmationService), 'ask').and.resolveTo(true);
    component.document.set({ draft: structuredClone(DEFAULT_PORTFOLIO), published: structuredClone(DEFAULT_PORTFOLIO), version: 1, updatedAt: 'old', publishedAt: null });
    component.draft()!.profile.name = 'Confirmed publication'; component.markDirty();
    const saved = structuredClone(component.draft()!);
    admin.publish.and.resolveTo(saved);
    admin.getDocument.and.resolveTo({ draft: saved, published: saved, version: 2, updatedAt: 'new', publishedAt: '2026-10-25T00:00:00Z' });
    const operations: string[] = [];
    admin.saveDraft.and.callFake(async () => { operations.push('save'); });
    admin.publish.and.callFake(async () => { operations.push('publish'); return saved; });
    await component.reviewPublication();
    expect(operations).toEqual(['save', 'publish']);
    expect(component.document()?.published.profile.name).toBe('Confirmed publication');
    expect(component.document()?.version).toBe(2);
    expect(component.dirty()).toBeFalse();
    expect(component.message()).toBe('Published just now');
    expect(TestBed.inject(DraftRecoveryService).read()).toBeNull();
  });

  it('never publishes if the prerequisite save fails', async () => {
    component.markDirty();
    admin.saveDraft.and.rejectWith(new Error('Draft save unavailable'));
    await component.publish();
    expect(admin.publish).not.toHaveBeenCalled();
    expect(component.dirty()).toBeTrue();
    expect(component.busy()).toBeFalse();
    expect(component.formError()).toBe('Draft save unavailable');
  });

  it('retains the editor when publication succeeds but its follow-up read fails', async () => {
    component.document.set({ draft: structuredClone(DEFAULT_PORTFOLIO), published: structuredClone(DEFAULT_PORTFOLIO), version: 1, updatedAt: 'old', publishedAt: null });
    component.draft()!.profile.name = 'Published before refresh failed'; component.markDirty();
    admin.publish.and.resolveTo(structuredClone(component.draft()!));
    admin.getDocument.and.rejectWith(new Error('Refresh offline'));
    await component.publish(); fixture.detectChanges();
    expect(component.draft()!.profile.name).toBe('Published before refresh failed');
    expect(component.formError()).toContain('Publication succeeded');
    expect(component.formError()).toContain('Refresh offline');
    expect(component.error()).toBeNull();
    expect(component.document()?.published.profile.name).toBe('Published before refresh failed');
    expect(component.dirty()).toBeFalse();
    expect(component.busy()).toBeFalse();
    expect(fixture.nativeElement.querySelector('.admin-editor-header')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('#editor-error')?.textContent).toContain('saved draft is still available');
  });

  it('clears a previous publication error after an explicit successful retry', async () => {
    admin.publish.and.rejectWith(new Error('Publish offline'));
    await component.publish();
    expect(component.formError()).toBe('Publish offline');
    const saved = structuredClone(component.draft()!);
    admin.publish.and.resolveTo(saved);
    admin.getDocument.and.resolveTo({ draft: saved, published: saved, version: 2, updatedAt: 'new', publishedAt: '2026-10-25T00:00:00Z' });
    await component.publish();
    expect(component.formError()).toBeNull();
    expect(component.message()).toBe('Published just now');
    expect(admin.saveDraft).not.toHaveBeenCalled();
    expect(admin.publish).toHaveBeenCalledTimes(2);
  });

});
