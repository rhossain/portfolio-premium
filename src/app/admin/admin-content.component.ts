import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConfirmationService } from '../shared/confirmation.service';
import { DialogDirective } from '../shared/dialog.directive';
import { DraftRecoveryService, RecoveredDraft } from '../services/draft-recovery.service';
import { PortfolioPageComponent } from '../pages/portfolio-page.component';
import { Subscription } from 'rxjs';
import { ExperienceItem, MediaAsset, PortfolioContent, Project } from '../content';
import { PortfolioAdminService, PortfolioDocument } from '../services/portfolio-admin.service';

type Section = 'profile' | 'experience' | 'projects' | 'skills' | 'navigation' | 'settings';

@Component({
  selector: 'app-admin-content',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe, DialogDirective, PortfolioPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="admin-page admin-editor-page">
      @if (loading()) {
        <div class="admin-loading" role="status">Loading editor…</div>
      } @else if (error()) {
        <div class="admin-empty">
          <h1>Unable to open the editor.</h1>
          <p role="alert">{{ error() }}</p>
          <button class="admin-secondary" type="button" (click)="load()">Try again</button>
        </div>
      } @else if (draft(); as content) {
        <header class="admin-page-header admin-editor-header">
          <div>
            <a routerLink="/admin" class="admin-back-link static">← Back to overview</a>
            <h1>{{ sectionTitle() }}</h1>
            <p>{{ sectionDescription() }}</p>
          </div>
          <div class="admin-editor-actions">
            <span role="status" class="admin-save-state" [class.has-changes]="dirty()">
              {{ uploading() ? 'Uploading images…' : (message() || (dirty() ? 'Unsaved changes' : 'All changes saved')) }}
            </span>
            <button class="admin-secondary" type="button" (click)="save()" [disabled]="busy() || !dirty()">{{ saving() ? 'Saving…' : 'Save draft' }}</button>
            <button class="admin-secondary" type="button" (click)="previewOpen.set(true)" [disabled]="busy()">Preview draft</button>
            <button class="admin-primary" type="button" (click)="reviewPublication()" [disabled]="busy()">{{ publishing() ? 'Publishing…' : 'Publish changes' }}</button>
          </div>
        </header>

        @if (formError()) { <p id="editor-error" class="admin-error mb-6" role="alert">{{ formError() }}</p> }

        @if (recovered(); as saved) {
          <div class="admin-notice recovery-banner" role="status">
            <p>An unsaved draft from this tab is available ({{ saved.savedAt | date:'short' }}).
              {{ saved.baseUpdatedAt !== document()?.updatedAt ? 'The server draft has changed since this recovery copy was made. Review carefully before saving.' : '' }}</p>
            <button type="button" class="admin-secondary" (click)="restoreDraft()">Restore edits</button>
            <button type="button" class="admin-secondary" (click)="discardRecovery()">Discard recovery copy</button>
          </div>
        }
        @if (undoDraft()) { <div class="admin-notice recovery-banner" role="status">Item removed from draft. Stored files are retained.<button class="admin-secondary undo-removal-button" type="button" (click)="undoRemoval()">Undo removal</button></div> }
        <fieldset class="editor-fields" [disabled]="busy()" [attr.aria-busy]="busy()">
        @switch (section()) {
          @case ('profile') {
            <div class="admin-form-grid">
              <section class="admin-form-section">
                <h2>Profile details</h2>
                <div class="admin-grid-2">
                  <label class="admin-field"><span>Full name</span><input [(ngModel)]="content.profile.name" id="profile-name" [attr.aria-invalid]="invalidField() === 'profile-name'" [attr.aria-describedby]="invalidField() === 'profile-name' ? 'editor-error' : null" (ngModelChange)="markDirty()" /></label>
                  <label class="admin-field"><span>Initials</span><input [(ngModel)]="content.profile.initials" (ngModelChange)="markDirty()" maxlength="4" /></label>
                  <label class="admin-field"><span>First name</span><input [(ngModel)]="content.profile.firstName" (ngModelChange)="markDirty()" /></label>
                  <label class="admin-field"><span>Last name</span><input [(ngModel)]="content.profile.lastName" (ngModelChange)="markDirty()" /></label>
                  <label class="admin-field"><span>Role</span><input [(ngModel)]="content.profile.role" (ngModelChange)="markDirty()" /></label>
                  <label class="admin-field"><span>Years of experience</span><input [(ngModel)]="content.profile.years" (ngModelChange)="markDirty()" /></label>
                  <label class="admin-field"><span>Location</span><input [(ngModel)]="content.profile.location" (ngModelChange)="markDirty()" /></label>
                  <label class="admin-field"><span>Availability</span><input [(ngModel)]="content.profile.availability" (ngModelChange)="markDirty()" /></label>
                  <label class="admin-field"><span>Email</span><input type="email" [(ngModel)]="content.profile.email" id="profile-email" [attr.aria-invalid]="invalidField() === 'profile-email'" [attr.aria-describedby]="invalidField() === 'profile-email' ? 'editor-error' : null" (ngModelChange)="markDirty()" /></label>
                  <label class="admin-field"><span>Phone</span><input [(ngModel)]="content.profile.phone" (ngModelChange)="markDirty()" /></label>
                </div>
                <label class="admin-field"><span>Tagline</span><textarea class="resize-none" rows="3" [(ngModel)]="content.profile.tagline" (ngModelChange)="markDirty()"></textarea></label>
              </section>

              <aside class="admin-form-aside">
                <h2>Portraits</h2>
                @for (portrait of portraitItems(content); track portrait.kind) {
                  <div class="admin-media-feature">
                    <img [src]="portrait.asset.src" [alt]="portrait.asset.alt" />
                    <div><strong>{{ portrait.label }}</strong><span>{{ portrait.asset.alt }}</span></div>
                    <label class="admin-secondary admin-file-button">Replace<input type="file" accept="image/jpeg,image/png,image/webp" (change)="uploadPortrait($event, portrait.kind)" /></label>
                  </div>
                }
                <p class="admin-help">Choose a JPEG, PNG or WebP up to 5 MB. Images are optimized automatically.</p>
              </aside>
            </div>

            <section class="admin-form-section mt-10">
              <h2>About</h2>
              <label class="admin-field"><span>Statement</span><textarea class="resize-none" rows="4" [(ngModel)]="content.about.statement" (ngModelChange)="markDirty()"></textarea></label>
              <div class="admin-grid-2">
                @for (paragraph of content.about.paragraphs; track $index; let i = $index) {
                  <label class="admin-field"><span>Paragraph {{ i + 1 }}</span><textarea class="resize-none" rows="7" [(ngModel)]="content.about.paragraphs[i]" (ngModelChange)="markDirty()"></textarea></label>
                }
              </div>
              <label class="admin-field"><span>Rotating descriptors <small>one per line</small></span><textarea class="resize-none" rows="5" [ngModel]="content.about.descriptors.join('\n')" (ngModelChange)="content.about.descriptors = splitLines($event); markDirty()"></textarea></label>
              <label class="admin-field"><span>Languages <small>one per line</small></span><textarea class="resize-none" rows="3" [ngModel]="content.about.languages.join('\n')" (ngModelChange)="content.about.languages = splitLines($event); markDirty()"></textarea></label>
              <div class="admin-repeat-list">
                @for (stat of content.about.stats; track $index; let i = $index) {
                  <div class="admin-repeat-row two">
                    <input aria-label="Statistic value" [(ngModel)]="stat.value" (ngModelChange)="markDirty()" />
                    <input aria-label="Statistic label" [(ngModel)]="stat.label" (ngModelChange)="markDirty()" />
                    <button type="button" class="admin-remove" (click)="removeAt(content.about.stats, i)">Remove</button>
                  </div>
                }
                <button type="button" class="admin-text-button" (click)="addStat()">+ Add statistic</button>
              </div>
            </section>
          }

          @case ('experience') {
            <div class="admin-split-editor">
              <aside class="admin-record-list">
                <div class="admin-record-list-title"><h2>Career entries</h2><button type="button" aria-label="Add experience" (click)="addExperience()">+</button></div>
                @for (item of content.experience; track $index; let i = $index) {
                  <button type="button" class="admin-record" [class.is-selected]="selectedExperience() === i" (click)="selectedExperience.set(i)">
                    <strong>{{ item.role || 'Untitled role' }}</strong><span>{{ item.company || 'Company' }} · {{ item.period || 'Period' }}</span>
                  </button>
                }
              </aside>
              @if (currentExperience(content); as item) {
                <section class="admin-form-section">
                  <div class="admin-section-heading"><h2>Edit experience</h2><button class="admin-remove" type="button" (click)="deleteExperience()">Delete entry</button></div>
                  <div class="admin-grid-2">
                    <label class="admin-field"><span>Role</span><input [(ngModel)]="item.role" (ngModelChange)="markDirty()" /></label>
                    <label class="admin-field"><span>Company</span><input [(ngModel)]="item.company" (ngModelChange)="markDirty()" /></label>
                    <label class="admin-field"><span>Period</span><input [(ngModel)]="item.period" (ngModelChange)="markDirty()" /></label>
                    <label class="admin-field"><span>Era</span><select [(ngModel)]="item.era" (ngModelChange)="markDirty()"><option value="Now">Now</option><option value="Then">Then</option></select></label>
                  </div>
                  <label class="admin-field"><span>Description</span><textarea class="resize-none" rows="8" [(ngModel)]="item.note" (ngModelChange)="markDirty()"></textarea></label>
                  <label class="admin-field"><span>Tags <small>comma separated</small></span><input [ngModel]="item.tags.join(', ')" (ngModelChange)="item.tags = splitComma($event); markDirty()" /></label>
                  <div class="admin-order-actions"><button type="button" (click)="move(content.experience, selectedExperience(), -1)">Move up</button><button type="button" (click)="move(content.experience, selectedExperience(), 1)">Move down</button></div>
                </section>
              }
            </div>
          }

          @case ('projects') {
            <div class="admin-split-editor projects">
              <aside class="admin-record-list" aria-labelledby="project-list-title">
                <div class="admin-record-list-title">
                  <h2 id="project-list-title">Projects</h2>
                  <button type="button" aria-label="Add project" title="Add project" (click)="addProject()">+</button>
                </div>
                <p class="admin-reorder-help" id="project-order-help">This is the portfolio order. Use the arrows to move a project, then save the draft.</p>
                <div class="admin-project-records" role="list" aria-describedby="project-order-help">
                  @for (project of content.projects; track project; let i = $index) {
                    <div class="admin-record-row" role="listitem" [class.is-selected]="selectedProject() === i">
                      <button
                        type="button"
                        class="admin-record admin-project-record-select"
                        [class.is-selected]="selectedProject() === i"
                        [attr.aria-pressed]="selectedProject() === i"
                        (click)="selectedProject.set(i)"
                      >
                        <strong>{{ project.index }} · {{ project.title || 'Untitled project' }}</strong>
                        <span>{{ project.category || 'Category' }} · {{ project.year || 'Year' }}</span>
                      </button>
                      <div class="admin-record-order" role="group" [attr.aria-label]="'Change position for ' + (project.title || 'Untitled project') + ', currently ' + (i + 1) + ' of ' + content.projects.length">
                        <button
                          type="button"
                          class="admin-order-button"
                          [disabled]="i === 0 || busy()"
                          [attr.aria-label]="'Move ' + (project.title || 'Untitled project') + ' at position ' + (i + 1) + ' up'"
                          title="Move up"
                          (click)="moveProject(i, -1)"
                        >
                          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 10.5 8 5l5 5.5" /></svg>
                        </button>
                        <button
                          type="button"
                          class="admin-order-button"
                          [disabled]="i === content.projects.length - 1 || busy()"
                          [attr.aria-label]="'Move ' + (project.title || 'Untitled project') + ' at position ' + (i + 1) + ' down'"
                          title="Move down"
                          (click)="moveProject(i, 1)"
                        >
                          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 5.5 5 5.5 5-5.5" /></svg>
                        </button>
                      </div>
                    </div>
                  }
                </div>
                <p class="admin-reorder-status" role="status" aria-live="polite">{{ reorderMessage() }}</p>
              </aside>
              @if (currentProject(content); as project) {
                <div class="admin-project-editor">
                  <section class="admin-form-section">
                    <div class="admin-section-heading"><h2>Project details</h2><button class="admin-remove" type="button" (click)="deleteProject()">Delete project</button></div>
                    <div class="admin-grid-3">
                      <label class="admin-field"><span>Position <small>managed by order</small></span><input [value]="project.index" readonly /></label>
                      <label class="admin-field"><span>Category</span><input [(ngModel)]="project.category" (ngModelChange)="markDirty()" /></label>
                      <label class="admin-field"><span>Year</span><input [(ngModel)]="project.year" (ngModelChange)="markDirty()" /></label>
                    </div>
                    <label class="admin-field"><span>Title</span><input [(ngModel)]="project.title" id="project-title" [attr.aria-invalid]="invalidField() === 'project-title'" [attr.aria-describedby]="invalidField() === 'project-title' ? 'editor-error' : null" (ngModelChange)="markDirty()" /></label>
                    <label class="admin-field"><span>Case-study link name <small>keep stable once shared; lowercase letters, numbers and hyphens</small></span><input [(ngModel)]="project.slug" (ngModelChange)="markDirty()" /></label>
                    <label class="admin-field"><span>Live URL</span><input type="url" [(ngModel)]="project.url" (ngModelChange)="markDirty()" /></label>
                    <label class="admin-field"><span>Description</span><textarea class="resize-none" rows="5" [(ngModel)]="project.description" (ngModelChange)="markDirty()"></textarea></label>
                    <label class="admin-field"><span>Technology stack <small>comma separated</small></span><input [ngModel]="project.stack.join(', ')" (ngModelChange)="project.stack = splitComma($event); markDirty()" /></label>
                    <label class="admin-check"><input type="checkbox" [(ngModel)]="project.wide" (ngModelChange)="markDirty()" /><span>Use wide project layout</span></label>
                    <div class="admin-grid-3">
                      <label class="admin-field"><span>Base color</span><input type="color" [(ngModel)]="project.palette.base" (ngModelChange)="markDirty()" /></label>
                      <label class="admin-field"><span>Primary orb</span><input type="color" [(ngModel)]="project.palette.orb" (ngModelChange)="markDirty()" /></label>
                      <label class="admin-field"><span>Secondary orb</span><input type="color" [(ngModel)]="project.palette.orb2" (ngModelChange)="markDirty()" /></label>
                    </div>
                  </section>
                  <section class="admin-form-section">
                    <h2>Case study</h2>
                    <p class="admin-help">Explain the problem, your decisions and the result. Leave outcomes blank until they can be supported by evidence.</p>
                    <label class="admin-field"><span>Problem</span><textarea class="resize-none" rows="3" [(ngModel)]="project.caseStudy.problem" (ngModelChange)="markDirty()"></textarea></label>
                    <label class="admin-field"><span>Key decisions <small>one per line</small></span><textarea class="resize-none" rows="4" [ngModel]="(project.caseStudy.decisions || []).join('\n')" (ngModelChange)="project.caseStudy.decisions = splitLines($event); markDirty()"></textarea></label>
                    <label class="admin-field"><span>Result <small>verified outcomes only</small></span><textarea class="resize-none" rows="3" [(ngModel)]="project.caseStudy.result" (ngModelChange)="markDirty()"></textarea></label>
                    <label class="admin-field"><span>Role</span><input [(ngModel)]="project.caseStudy.role" (ngModelChange)="markDirty()" /></label>
                    <label class="admin-field"><span>Overview</span><textarea class="resize-none" rows="6" [(ngModel)]="project.caseStudy.overview" (ngModelChange)="markDirty()"></textarea></label>
                    <label class="admin-field"><span>Highlights <small>one per line</small></span><textarea class="resize-none" rows="7" [ngModel]="project.caseStudy.highlights.join('\n')" (ngModelChange)="project.caseStudy.highlights = splitLines($event); markDirty()"></textarea></label>
                  </section>
                  <section class="admin-form-section">
                    <div class="admin-section-heading"><div><h2>Media</h2><p>{{ project.images.length }} images</p></div><label class="admin-secondary admin-file-button">Add images<input type="file" multiple accept="image/jpeg,image/png,image/webp" (change)="uploadProjectImages($event, project)" /></label></div>
                    <div class="admin-media-list">
                      @for (image of project.images; track image.src; let i = $index) {
                        <div class="admin-media-row">
                          <span class="admin-drag" aria-hidden="true">⠿</span>
                          <img [src]="image.src" [alt]="image.alt" />
                          <label class="admin-field"><span>{{ i === 0 ? 'Cover image alt text' : 'Image alt text' }}</span><input [(ngModel)]="image.alt" [id]="'image-alt-' + i" [attr.aria-invalid]="invalidField() === 'image-alt-' + i" [attr.aria-describedby]="invalidField() === 'image-alt-' + i ? 'editor-error' : null" (ngModelChange)="markDirty()" /></label>
                          <div class="admin-media-actions"><button type="button" [disabled]="i === 0" [attr.aria-label]="'Move image ' + (i + 1) + ' up'" (click)="move(project.images, i, -1)">↑</button><button type="button" [disabled]="i === project.images.length - 1" [attr.aria-label]="'Move image ' + (i + 1) + ' down'" (click)="move(project.images, i, 1)">↓</button><button type="button" class="admin-remove" (click)="deleteImage(project, image, i)">Remove</button></div>
                        </div>
                      }
                    </div>
                  </section>
                </div>
              }
            </div>
          }

          @case ('skills') {
            <section class="admin-form-section admin-narrow">
              <div class="admin-section-heading"><div><h2>Capability groups</h2><p>One skill per line. Order is preserved.</p></div><button class="admin-secondary" type="button" (click)="addSkillGroup()">Add group</button></div>
              @for (group of content.skillGroups; track $index; let i = $index) {
                <div class="admin-group-editor">
                  <label class="admin-field"><span>Group title</span><input [(ngModel)]="group.title" (ngModelChange)="markDirty()" /></label>
                  <label class="admin-field"><span>Skills</span><textarea class="resize-none" rows="7" [ngModel]="group.items.join('\n')" (ngModelChange)="group.items = splitLines($event); markDirty()"></textarea></label>
                  <div class="admin-order-actions"><button type="button" (click)="move(content.skillGroups, i, -1)">Move up</button><button type="button" (click)="move(content.skillGroups, i, 1)">Move down</button><button type="button" class="admin-remove" (click)="removeAt(content.skillGroups, i)">Delete group</button></div>
                </div>
              }
            </section>
          }

          @case ('navigation') {
            <div class="admin-grid-2 align-start">
              <section class="admin-form-section">
                <div class="admin-section-heading"><h2>Navigation links</h2><button class="admin-secondary" type="button" (click)="addNavLink()">Add link</button></div>
                @for (link of content.navLinks; track $index; let i = $index) {
                  <div class="admin-repeat-row two"><input aria-label="Link label" [(ngModel)]="link.label" (ngModelChange)="markDirty()" /><input aria-label="Link target" [(ngModel)]="link.target" (ngModelChange)="markDirty()" /><button type="button" class="admin-remove" (click)="removeAt(content.navLinks, i)">Remove</button></div>
                }
              </section>
              <section class="admin-form-section">
                <div class="admin-section-heading"><h2>Social links</h2><button class="admin-secondary" type="button" (click)="addSocial()">Add link</button></div>
                @for (social of content.socials; track $index; let i = $index) {
                  <div class="admin-repeat-row two"><input aria-label="Social platform" [(ngModel)]="social.label" (ngModelChange)="markDirty()" /><input aria-label="Social URL" [(ngModel)]="social.url" (ngModelChange)="markDirty()" /><button type="button" class="admin-remove" (click)="removeAt(content.socials, i)">Remove</button></div>
                }
              </section>
            </div>
            <section class="admin-form-section mt-10 admin-narrow">
              <h2>Marquee items</h2>
              <label class="admin-field"><span>Items <small>one per line</small></span><textarea class="resize-none" rows="12" [ngModel]="content.marqueeItems.join('\n')" (ngModelChange)="content.marqueeItems = splitLines($event); markDirty()"></textarea></label>
            </section>
          }

          @case ('settings') {
            <div class="admin-grid-2 align-start">
              <section class="admin-form-section">
                <h2>Content backup</h2>
                <p class="admin-prose">Download the complete draft as a portable JSON file. Images remain in Supabase Storage and are referenced by their public URLs.</p>
                <button class="admin-secondary" type="button" (click)="admin.exportJson(content)">Export JSON backup</button>
              </section>
              <section class="admin-form-section">
                <h2>Import content</h2>
                <p class="admin-prose">Import replaces the current draft only. Review it, save, and publish when ready.</p>
                <label class="admin-secondary admin-file-button">Choose JSON file<input type="file" accept="application/json" (change)="importJson($event)" /></label>
              </section>
              <section class="admin-form-section">
                <h2>Document status</h2>
                <dl class="admin-definition-list"><div><dt>Version</dt><dd>{{ document()?.version }}</dd></div><div><dt>Last saved</dt><dd>{{ document()?.updatedAt | date:'medium' }}</dd></div><div><dt>Last published</dt><dd>{{ document()?.publishedAt | date:'medium' }}</dd></div></dl>
              </section>
            </div>
          }
        }
        </fieldset>
        @if (previewOpen()) {
          <dialog appDialog class="draft-preview" aria-label="Private draft preview" (dismissed)="previewOpen.set(false)">
            <div class="preview-toolbar"><strong>Private draft preview · not published</strong><button autofocus class="admin-secondary" type="button" (click)="previewOpen.set(false)">Close preview</button></div>
            <app-portfolio-page [previewContent]="content" />
          </dialog>
        }
      }
    </main>
  `,
})
export class AdminContentComponent implements OnInit, OnDestroy {
  readonly section = signal<Section>('profile');
  readonly draft = signal<PortfolioContent | null>(null);
  readonly document = signal<PortfolioDocument | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly publishing = signal(false);
  readonly uploading = signal(false);
  readonly dirty = signal(false);
  readonly error = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly selectedExperience = signal(0);
  readonly selectedProject = signal(0);
  readonly reorderMessage = signal('');
  readonly admin = inject(PortfolioAdminService);
  readonly previewOpen = signal(false);
  readonly recovered = signal<RecoveredDraft | null>(null);
  readonly undoDraft = signal<PortfolioContent | null>(null);
  readonly invalidField = signal<string | null>(null);
  private readonly confirmation = inject(ConfirmationService);
  private readonly recovery = inject(DraftRecoveryService);
  private allowLeave = false;
  private removalSnapshot: PortfolioContent | null = null;
  private readonly router = inject(Router, { optional: true });
  private readonly route = inject(ActivatedRoute);
  private routeSubscription?: Subscription;

  busy(): boolean {
    return this.saving() || this.publishing() || this.uploading();
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const value = params.get('section') as Section | null;
      if (value && ['profile', 'experience', 'projects', 'skills', 'navigation', 'settings'].includes(value)) this.section.set(value);
      if (!this.draft()) void this.load();
    });
  }

  ngOnDestroy(): void { this.routeSubscription?.unsubscribe(); }

  async load(keepEditorOnError = false): Promise<void> {
    if (!keepEditorOnError) this.loading.set(true);
    this.error.set(null);
    try {
      const document = await this.admin.getDocument();
      this.document.set(document);
      this.draft.set(structuredClone(document.draft));
      this.dirty.set(false);
      this.reorderMessage.set('');
      const recovered = this.recovery.read();
      this.recovered.set(recovered && JSON.stringify(recovered.content) !== JSON.stringify(document.draft) ? recovered : null);
    } catch (error) {
      if (keepEditorOnError) {
        this.formError.set(`Publication succeeded, but the editor could not refresh: ${this.errorMessage(error)} Your saved draft is still available. Reload the editor when the connection returns.`);
      } else {
        this.error.set(this.errorMessage(error));
      }
    } finally {
      this.loading.set(false);
    }
  }

  sectionTitle(): string {
    return { profile: 'Profile & about', experience: 'Experience', projects: 'Projects', skills: 'Skills', navigation: 'Navigation & links', settings: 'Settings' }[this.section()];
  }

  sectionDescription(): string {
    return { profile: 'Manage your identity, introduction and portraits.', experience: 'Add, reorder or update your career history.', projects: 'Build, reorder and publish case studies and their media.', skills: 'Keep capability groups concise and current.', navigation: 'Manage navigation, marquee and social destinations.', settings: 'Export, import and review document status.' }[this.section()];
  }

  markDirty(): void {
    this.undoDraft.set(null);
    this.dirty.set(true); this.message.set(null); this.formError.set(null); this.invalidField.set(null);
    const draft = this.draft();
    if (draft && !this.recovery.write(draft, this.document()?.updatedAt || '')) this.message.set('Unsaved changes · browser recovery unavailable. Save or export your draft.');
  }

  @HostListener('window:beforeunload', ['$event']) beforeUnload(event: BeforeUnloadEvent): void {
    if (this.dirty() || this.busy()) { event.preventDefault(); event.returnValue = ''; }
  }

  async canLeave(): Promise<boolean> {
    if (this.allowLeave || (!this.dirty() && !this.busy())) return true;
    if (this.busy()) {
      this.formError.set('Wait for the current operation to finish before leaving.');
      return false;
    }
    const accepted = await this.confirmation.ask({ title: 'Leave unsaved edits?', description: 'These edits have not been saved to the server. A recovery copy stays in this browser tab for up to 24 hours when browser storage is available. Save or export important changes before leaving.', action: 'Leave editor', cancel: 'Keep editing' });
    this.allowLeave = accepted;
    return accepted;
  }

  restoreDraft(): void {
    const saved = this.recovered(); if (!saved) return;
    try {
      const error = this.validate(saved.content); if (error) { this.formError.set('Recovery copy cannot be restored: ' + error); return; }
    } catch { this.formError.set('The recovery copy is invalid. Export or discard it before continuing.'); return; }
    this.draft.set(structuredClone(saved.content)); this.recovered.set(null); this.markDirty(); this.message.set('Recovered edits · review and save the draft.');
  }
  discardRecovery(): void { this.recovery.clear(); this.recovered.set(null); }
  undoRemoval(): void {
    const previous = this.undoDraft(); if (!previous) return;
    this.draft.set(previous); this.selectedProject.set(0); this.selectedExperience.set(0); this.undoDraft.set(null); this.markDirty();
  }
  private rememberRemoval(): void { const draft = this.draft(); if (draft) this.removalSnapshot = structuredClone(draft); }

  async reviewPublication(): Promise<void> {
    if (this.busy() || !this.draft()) return;
    const published = this.document()?.published;
    const draft = this.draft()!;
    const changes = (Object.keys(draft) as (keyof PortfolioContent)[]).filter(key => JSON.stringify(draft[key]) !== JSON.stringify(published?.[key]));
    if (!changes.length) { this.message.set('No changes to publish.'); return; }
    const labels: Record<keyof PortfolioContent, string> = { profile: 'Profile', about: 'About', projects: 'Projects', experience: 'Experience', skillGroups: 'Capabilities', navLinks: 'Navigation', socials: 'Social links', marqueeItems: 'Marquee' };
    if (await this.confirmation.ask({ title: 'Publish portfolio changes?', description: 'This updates the public portfolio across all edited sections: ' + changes.map(key => labels[key]).join(', ') + '. Use Preview draft to review the page first.', action: 'Publish portfolio', cancel: 'Keep editing' })) await this.publish();
  }

  async save(): Promise<boolean> {
    if (this.busy()) return false;
    return this.persistDraft();
  }

  private async persistDraft(): Promise<boolean> {
    const content = this.draft();
    if (!content) return false;
    const validation = this.validate(content, true);
    if (validation) { this.formError.set(validation); return false; }
    this.saving.set(true);
    this.formError.set(null);
    try {
      await this.admin.saveDraft(content);
      this.dirty.set(false);
      const doc = this.document();
      if (doc && this.admin.lastSavedAt) this.document.set({ ...doc, draft: structuredClone(content), updatedAt: this.admin.lastSavedAt });
      this.recovery.clear(); this.recovered.set(null); this.undoDraft.set(null);
      this.message.set('Draft saved just now');
      return true;
    } catch (error) {
      this.formError.set(this.errorMessage(error));
      return false;
    } finally {
      this.saving.set(false);
    }
  }

  async publish(): Promise<void> {
    if (this.busy()) return;
    this.publishing.set(true);
    this.formError.set(null); this.message.set(null);
    const saved = !this.dirty() || (await this.persistDraft());
    if (!saved) { this.publishing.set(false); return; }
    try {
      const published = await this.admin.publish();
      // The RPC response is authoritative even if the metadata refresh fails.
      this.document.update(document => document ? { ...document, published: structuredClone(published) } : document);
      await this.load(true);
      this.message.set('Published just now');
    } catch (error) {
      this.formError.set(this.errorMessage(error));
    } finally {
      this.publishing.set(false);
    }
  }

  portraitItems(content: PortfolioContent) {
    return [
      { kind: 'hero' as const, label: 'Hero portrait', asset: content.profile.heroImage },
      { kind: 'about' as const, label: 'About portrait', asset: content.profile.aboutImage },
    ];
  }

  currentExperience(content: PortfolioContent): ExperienceItem | null { return content.experience[this.selectedExperience()] ?? null; }
  currentProject(content: PortfolioContent): Project | null { return content.projects[this.selectedProject()] ?? null; }

  addExperience(): void {
    const content = this.draft(); if (!content) return;
    content.experience.push({ era: 'Now', period: '', role: '', company: '', note: '', tags: [] });
    this.selectedExperience.set(content.experience.length - 1); this.touch();
  }

  async deleteExperience(): Promise<void> {
    const content = this.draft(); if (!content || !await this.confirmation.ask({ title: 'Remove experience entry?', description: 'Remove ' + (this.currentExperience(content)?.company || 'this entry') + ' from the draft? The public portfolio changes only after publishing.', action: 'Remove entry', danger: true })) return;
    this.rememberRemoval();
    content.experience.splice(this.selectedExperience(), 1);
    this.selectedExperience.set(Math.max(0, this.selectedExperience() - 1)); this.touch();
  }

  addProject(): void {
    const content = this.draft(); if (!content) return;
    const next = content.projects.length + 1;
    content.projects.push({ index: String(next).padStart(2, '0'), title: 'Untitled project', category: '', year: String(new Date().getFullYear()), description: '', stack: [], images: [], palette: { base: '#141210', orb: '#b0704f', orb2: '#788c8c' }, wide: false, caseStudy: { role: '', overview: '', highlights: [] } });
    this.renumberProjects(content.projects);
    this.selectedProject.set(content.projects.length - 1);
    this.reorderMessage.set(`Project added at position ${content.projects.length}.`);
    this.touchProjectOrder(content);
  }

  async deleteProject(): Promise<void> {
    const content = this.draft(); if (!content || !await this.confirmation.ask({ title: 'Remove project?', description: 'Remove ' + (this.currentProject(content)?.title || 'this project') + ' from the draft? Stored images and the published portfolio are retained.', action: 'Remove project', danger: true })) return;
    this.rememberRemoval();
    content.projects.splice(this.selectedProject(), 1);
    this.renumberProjects(content.projects);
    this.selectedProject.set(Math.max(0, this.selectedProject() - 1));
    this.reorderMessage.set('Project removed. Remaining project positions were updated.');
    this.touchProjectOrder(content);
  }

  moveProject(index: number, direction: -1 | 1): void {
    const content = this.draft();
    if (!content) return;
    const target = index + direction;
    if (index < 0 || target < 0 || target >= content.projects.length) return;

    const [project] = content.projects.splice(index, 1);
    content.projects.splice(target, 0, project);
    this.renumberProjects(content.projects);
    this.selectedProject.set(target);
    this.reorderMessage.set(`${project.title || 'Untitled project'} moved to position ${target + 1} of ${content.projects.length}.`);
    this.touchProjectOrder(content);
  }

  addStat(): void { const content = this.draft(); if (!content) return; content.about.stats.push({ value: '', label: '' }); this.touch(); }
  addSkillGroup(): void { const content = this.draft(); if (!content) return; content.skillGroups.push({ title: 'New group', items: [] }); this.touch(); }
  addNavLink(): void { const content = this.draft(); if (!content) return; content.navLinks.push({ label: 'New link', target: '#' }); this.touch(); }
  addSocial(): void { const content = this.draft(); if (!content) return; content.socials.push({ label: 'New platform', url: 'https://' }); this.touch(); }

  removeAt<T>(items: T[], index: number): void { this.rememberRemoval(); items.splice(index, 1); this.touch(); }

  move<T>(items: T[], index: number, direction: number): void {
    const target = index + direction;
    if (index < 0 || target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    if (items === this.draft()?.experience) this.selectedExperience.set(target);
    this.touch();
  }

  splitLines(value: string): string[] { return value.split('\n').map((item) => item.trim()).filter(Boolean); }
  splitComma(value: string): string[] { return value.split(',').map((item) => item.trim()).filter(Boolean); }

  async uploadPortrait(event: Event, kind: 'hero' | 'about'): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0]; const content = this.draft();
    if (!file || !content || this.busy()) return;
    this.uploading.set(true); this.formError.set(null);
    try {
      const asset = await this.admin.uploadImage(file, 'profile', kind === 'hero' ? content.profile.name : `${content.profile.name} at work`);
      if (kind === 'hero') content.profile.heroImage = asset; else content.profile.aboutImage = asset;
      this.touch();
    } catch (error) { this.formError.set(this.errorMessage(error)); }
    finally { this.uploading.set(false); input.value = ''; }
  }

  async uploadProjectImages(event: Event, project: Project): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length || this.busy()) return;
    this.uploading.set(true); this.formError.set(null); this.message.set(null);
    let added = 0;
    let failure: string | null = null;
    try {
      for (const file of files) {
        try {
          const asset = await this.admin.uploadImage(file, `projects/${this.slug(project.title)}`, `${project.title} — screen ${project.images.length + 1}`);
          project.images.push(asset);
          added++;
        } catch (error) {
          failure = `${file.name}: ${this.errorMessage(error)} — ${added} of ${files.length} images added. Retry by selecting this file and any remaining files; images already added are retained.`;
          break;
        }
      }
    } finally {
      if (added) {
        this.touch();
        this.message.set(`${added} ${added === 1 ? 'image added' : 'images added'} to draft. Save draft to keep these changes.`);
      }
      if (failure) this.formError.set(failure);
      this.uploading.set(false); input.value = '';
    }
  }

  async deleteImage(project: Project, image: MediaAsset, index: number): Promise<void> {
    if (!await this.confirmation.ask({ title: 'Remove image from draft?', description: 'Remove “' + image.alt + '” from this project? The stored file is retained so published content and previous revisions remain safe.', action: 'Remove image', danger: true })) return;
    this.rememberRemoval(); project.images.splice(index, 1); this.touch();
  }

  async importJson(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return;
    try {
      const imported = JSON.parse(await file.text()) as PortfolioContent;
      const validation = this.validate(imported); if (validation) throw new Error(validation);
      this.draft.set(imported); this.markDirty(); this.message.set('JSON loaded into draft');
    } catch (error) { this.formError.set(`Import failed: ${this.errorMessage(error)}`); }
    finally { input.value = ''; }
  }

  private touch(): void { const content = this.draft(); if (content) this.draft.set(structuredClone(content)); this.markDirty(); if (this.removalSnapshot) { this.undoDraft.set(this.removalSnapshot); this.removalSnapshot = null; requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.undo-removal-button')?.focus()); } }
  private touchProjectOrder(content: PortfolioContent): void { this.draft.set({ ...content, projects: [...content.projects] }); this.markDirty(); if (this.removalSnapshot) { this.undoDraft.set(this.removalSnapshot); this.removalSnapshot = null; requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.undo-removal-button')?.focus()); } }
  private renumberProjects(projects: Project[]): void { projects.forEach((project, index) => { project.index = String(index + 1).padStart(2, '0'); }); }
  private slug(value: string): string { return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project'; }
  private errorMessage(error: unknown): string {
    const details = error && typeof error === 'object' ? error as Record<string, unknown> : null;
    const message = details && 'message' in details ? String(details['message']) : String(error);
    if (details && (Number(details['status'] ?? details['statusCode']) === 401 || details['code'] === 'PGRST301' || details['code'] === 'PGRST303') || /jwt.*expired|session.*expired|refresh token.*(invalid|not found)/i.test(message)) {
      return 'Your session has expired. Your edits are still in this tab. Sign in again at /admin/login in another tab, then retry. You can also export your draft from Settings before leaving.';
    }
    return message;
  }

  private validate(content: PortfolioContent, focus = false): string | null {
    const fail = (message: string, id?: string, section?: Section, projectIndex?: number): string => {
      if (focus && id) {
        if (section) { this.section.set(section); void this.router?.navigate(['/admin/content', section]); }
        if (projectIndex !== undefined) this.selectedProject.set(projectIndex);
        this.invalidField.set(id);
        setTimeout(() => document.getElementById(id)?.focus(), 0);
      }
      return message;
    };
    if (!content?.profile?.name?.trim()) return fail('Enter your full name.', 'profile-name', 'profile');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.profile.email || '')) return fail('Enter a valid email address.', 'profile-email', 'profile');
    if (!Array.isArray(content.projects) || !Array.isArray(content.experience) || !Array.isArray(content.skillGroups)) return 'The content file has an invalid structure.';
    if (!content.about || !Array.isArray(content.about.paragraphs) || !Array.isArray(content.about.stats) || !Array.isArray(content.about.descriptors) || !Array.isArray(content.about.languages) || !Array.isArray(content.socials) || !Array.isArray(content.navLinks) || !Array.isArray(content.marqueeItems)) return 'The content file is missing portfolio sections.';
    const slugs = new Set<string>();
    for (const project of content.projects) {
      if (!project.caseStudy || !Array.isArray(project.images) || !Array.isArray(project.stack)) return 'Every project needs a case study, technology stack and image list.';
      if (project.slug && (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug) || slugs.has(project.slug))) return 'Use a unique case-study link name with lowercase letters, numbers and hyphens.';
      const resolvedSlug = project.slug || project.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project-' + project.index;
      if (slugs.has(resolvedSlug)) return 'Every project needs a unique case-study link name.';
      slugs.add(resolvedSlug);
    }
    const untitled = content.projects.findIndex(project => !project.title?.trim()); if (untitled >= 0) return fail('Enter a title for this project.', 'project-title', 'projects', untitled);
    for (let pi = 0; pi < content.projects.length; pi++) {
      const index = content.projects[pi].images?.findIndex(image => !image.alt?.trim());
      if (index >= 0) return fail('Describe this image for visitors who cannot see it.', 'image-alt-' + index, 'projects', pi);
    }
    return null;
  }
}
