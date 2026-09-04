import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ExperienceItem, MediaAsset, PortfolioContent, Project } from '../content';
import { PortfolioAdminService, PortfolioDocument } from '../services/portfolio-admin.service';

type Section = 'profile' | 'experience' | 'projects' | 'skills' | 'navigation' | 'settings';

@Component({
  selector: 'app-admin-content',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="admin-page admin-editor-page">
      @if (loading()) {
        <div class="admin-loading">Loading editor…</div>
      } @else if (error()) {
        <div class="admin-empty">
          <h1>Unable to open the editor.</h1>
          <p>{{ error() }}</p>
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
            <span class="admin-save-state" [class.has-changes]="dirty()">
              {{ message() || (dirty() ? 'Unsaved changes' : 'All changes saved') }}
            </span>
            <button class="admin-secondary" type="button" (click)="save()" [disabled]="busy() || !dirty()">{{ saving() ? 'Saving…' : 'Save draft' }}</button>
            <button class="admin-primary" type="button" (click)="publish()" [disabled]="busy()">{{ publishing() ? 'Publishing…' : 'Publish changes' }}</button>
          </div>
        </header>

        @if (formError()) { <p class="admin-error mb-6" role="alert">{{ formError() }}</p> }

        @switch (section()) {
          @case ('profile') {
            <div class="admin-form-grid">
              <section class="admin-form-section">
                <h2>Profile details</h2>
                <div class="admin-grid-2">
                  <label class="admin-field"><span>Full name</span><input [(ngModel)]="content.profile.name" (ngModelChange)="markDirty()" /></label>
                  <label class="admin-field"><span>Initials</span><input [(ngModel)]="content.profile.initials" (ngModelChange)="markDirty()" maxlength="4" /></label>
                  <label class="admin-field"><span>First name</span><input [(ngModel)]="content.profile.firstName" (ngModelChange)="markDirty()" /></label>
                  <label class="admin-field"><span>Last name</span><input [(ngModel)]="content.profile.lastName" (ngModelChange)="markDirty()" /></label>
                  <label class="admin-field"><span>Role</span><input [(ngModel)]="content.profile.role" (ngModelChange)="markDirty()" /></label>
                  <label class="admin-field"><span>Years of experience</span><input [(ngModel)]="content.profile.years" (ngModelChange)="markDirty()" /></label>
                  <label class="admin-field"><span>Location</span><input [(ngModel)]="content.profile.location" (ngModelChange)="markDirty()" /></label>
                  <label class="admin-field"><span>Availability</span><input [(ngModel)]="content.profile.availability" (ngModelChange)="markDirty()" /></label>
                  <label class="admin-field"><span>Email</span><input type="email" [(ngModel)]="content.profile.email" (ngModelChange)="markDirty()" /></label>
                  <label class="admin-field"><span>Phone</span><input [(ngModel)]="content.profile.phone" (ngModelChange)="markDirty()" /></label>
                </div>
                <label class="admin-field"><span>Tagline</span><textarea rows="3" [(ngModel)]="content.profile.tagline" (ngModelChange)="markDirty()"></textarea></label>
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
                <p class="admin-help">Uploads are converted to WebP, limited to 2400px and stored with immutable filenames.</p>
              </aside>
            </div>

            <section class="admin-form-section mt-10">
              <h2>About</h2>
              <label class="admin-field"><span>Statement</span><textarea rows="4" [(ngModel)]="content.about.statement" (ngModelChange)="markDirty()"></textarea></label>
              <div class="admin-grid-2">
                @for (paragraph of content.about.paragraphs; track $index; let i = $index) {
                  <label class="admin-field"><span>Paragraph {{ i + 1 }}</span><textarea rows="7" [(ngModel)]="content.about.paragraphs[i]" (ngModelChange)="markDirty()"></textarea></label>
                }
              </div>
              <label class="admin-field"><span>Rotating descriptors <small>one per line</small></span><textarea rows="5" [ngModel]="content.about.descriptors.join('\n')" (ngModelChange)="content.about.descriptors = splitLines($event); markDirty()"></textarea></label>
              <label class="admin-field"><span>Languages <small>one per line</small></span><textarea rows="3" [ngModel]="content.about.languages.join('\n')" (ngModelChange)="content.about.languages = splitLines($event); markDirty()"></textarea></label>
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
                <div class="admin-record-list-title"><h2>Career entries</h2><button type="button" (click)="addExperience()">+</button></div>
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
                  <label class="admin-field"><span>Description</span><textarea rows="8" [(ngModel)]="item.note" (ngModelChange)="markDirty()"></textarea></label>
                  <label class="admin-field"><span>Tags <small>comma separated</small></span><input [ngModel]="item.tags.join(', ')" (ngModelChange)="item.tags = splitComma($event); markDirty()" /></label>
                  <div class="admin-order-actions"><button type="button" (click)="move(content.experience, selectedExperience(), -1)">Move up</button><button type="button" (click)="move(content.experience, selectedExperience(), 1)">Move down</button></div>
                </section>
              }
            </div>
          }

          @case ('projects') {
            <div class="admin-split-editor projects">
              <aside class="admin-record-list">
                <div class="admin-record-list-title"><h2>Projects</h2><button type="button" (click)="addProject()">+</button></div>
                @for (project of content.projects; track $index; let i = $index) {
                  <button type="button" class="admin-record" [class.is-selected]="selectedProject() === i" (click)="selectedProject.set(i)">
                    <strong>{{ project.index }} · {{ project.title || 'Untitled project' }}</strong><span>{{ project.category || 'Category' }} · {{ project.year || 'Year' }}</span>
                  </button>
                }
              </aside>
              @if (currentProject(content); as project) {
                <div class="admin-project-editor">
                  <section class="admin-form-section">
                    <div class="admin-section-heading"><h2>Project details</h2><button class="admin-remove" type="button" (click)="deleteProject()">Delete project</button></div>
                    <div class="admin-grid-3">
                      <label class="admin-field"><span>Index</span><input [(ngModel)]="project.index" (ngModelChange)="markDirty()" /></label>
                      <label class="admin-field"><span>Category</span><input [(ngModel)]="project.category" (ngModelChange)="markDirty()" /></label>
                      <label class="admin-field"><span>Year</span><input [(ngModel)]="project.year" (ngModelChange)="markDirty()" /></label>
                    </div>
                    <label class="admin-field"><span>Title</span><input [(ngModel)]="project.title" (ngModelChange)="markDirty()" /></label>
                    <label class="admin-field"><span>Live URL</span><input type="url" [(ngModel)]="project.url" (ngModelChange)="markDirty()" /></label>
                    <label class="admin-field"><span>Description</span><textarea rows="5" [(ngModel)]="project.description" (ngModelChange)="markDirty()"></textarea></label>
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
                    <label class="admin-field"><span>Role</span><input [(ngModel)]="project.caseStudy.role" (ngModelChange)="markDirty()" /></label>
                    <label class="admin-field"><span>Overview</span><textarea rows="6" [(ngModel)]="project.caseStudy.overview" (ngModelChange)="markDirty()"></textarea></label>
                    <label class="admin-field"><span>Highlights <small>one per line</small></span><textarea rows="7" [ngModel]="project.caseStudy.highlights.join('\n')" (ngModelChange)="project.caseStudy.highlights = splitLines($event); markDirty()"></textarea></label>
                  </section>
                  <section class="admin-form-section">
                    <div class="admin-section-heading"><div><h2>Media</h2><p>{{ project.images.length }} images</p></div><label class="admin-secondary admin-file-button">Add images<input type="file" multiple accept="image/jpeg,image/png,image/webp" (change)="uploadProjectImages($event, project)" /></label></div>
                    <div class="admin-media-list">
                      @for (image of project.images; track image.src; let i = $index) {
                        <div class="admin-media-row">
                          <span class="admin-drag" aria-hidden="true">⠿</span>
                          <img [src]="image.src" [alt]="image.alt" />
                          <label class="admin-field"><span>{{ i === 0 ? 'Cover image alt text' : 'Image alt text' }}</span><input [(ngModel)]="image.alt" (ngModelChange)="markDirty()" /></label>
                          <div class="admin-media-actions"><button type="button" (click)="move(project.images, i, -1)">↑</button><button type="button" (click)="move(project.images, i, 1)">↓</button><button type="button" class="admin-remove" (click)="deleteImage(project, image, i)">Remove</button></div>
                        </div>
                      }
                    </div>
                    <div class="admin-order-actions"><button type="button" (click)="move(content.projects, selectedProject(), -1)">Move project up</button><button type="button" (click)="move(content.projects, selectedProject(), 1)">Move project down</button></div>
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
                  <label class="admin-field"><span>Skills</span><textarea rows="7" [ngModel]="group.items.join('\n')" (ngModelChange)="group.items = splitLines($event); markDirty()"></textarea></label>
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
              <label class="admin-field"><span>Items <small>one per line</small></span><textarea rows="12" [ngModel]="content.marqueeItems.join('\n')" (ngModelChange)="content.marqueeItems = splitLines($event); markDirty()"></textarea></label>
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
  readonly admin = inject(PortfolioAdminService);
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

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const document = await this.admin.getDocument();
      this.document.set(document);
      this.draft.set(structuredClone(document.draft));
      this.dirty.set(false);
    } catch (error) {
      this.error.set(this.errorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  sectionTitle(): string {
    return { profile: 'Profile & about', experience: 'Experience', projects: 'Projects', skills: 'Skills', navigation: 'Navigation & links', settings: 'Settings' }[this.section()];
  }

  sectionDescription(): string {
    return { profile: 'Manage your identity, introduction and portraits.', experience: 'Add, reorder or update your career history.', projects: 'Build case studies and manage their media.', skills: 'Keep capability groups concise and current.', navigation: 'Manage navigation, marquee and social destinations.', settings: 'Export, import and review document status.' }[this.section()];
  }

  markDirty(): void { this.dirty.set(true); this.message.set(null); this.formError.set(null); }

  async save(): Promise<boolean> {
    const content = this.draft();
    if (!content || this.saving()) return false;
    const validation = this.validate(content);
    if (validation) { this.formError.set(validation); return false; }
    this.saving.set(true);
    this.formError.set(null);
    try {
      await this.admin.saveDraft(content);
      this.dirty.set(false);
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
    if (this.publishing()) return;
    this.publishing.set(true);
    const saved = !this.dirty() || (await this.save());
    if (!saved) { this.publishing.set(false); return; }
    try {
      await this.admin.publish();
      this.message.set('Published just now');
      await this.load();
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

  deleteExperience(): void {
    const content = this.draft(); if (!content || !confirm('Delete this experience entry from the draft?')) return;
    content.experience.splice(this.selectedExperience(), 1);
    this.selectedExperience.set(Math.max(0, this.selectedExperience() - 1)); this.touch();
  }

  addProject(): void {
    const content = this.draft(); if (!content) return;
    const next = content.projects.length + 1;
    content.projects.push({ index: String(next).padStart(2, '0'), title: 'Untitled project', category: '', year: String(new Date().getFullYear()), description: '', stack: [], images: [], palette: { base: '#141210', orb: '#b0704f', orb2: '#788c8c' }, wide: false, caseStudy: { role: '', overview: '', highlights: [] } });
    this.selectedProject.set(content.projects.length - 1); this.touch();
  }

  deleteProject(): void {
    const content = this.draft(); if (!content || !confirm('Delete this project from the draft? Its uploaded images will remain until removed separately.')) return;
    content.projects.splice(this.selectedProject(), 1);
    this.selectedProject.set(Math.max(0, this.selectedProject() - 1)); this.touch();
  }

  addStat(): void { const content = this.draft(); if (!content) return; content.about.stats.push({ value: '', label: '' }); this.touch(); }
  addSkillGroup(): void { const content = this.draft(); if (!content) return; content.skillGroups.push({ title: 'New group', items: [] }); this.touch(); }
  addNavLink(): void { const content = this.draft(); if (!content) return; content.navLinks.push({ label: 'New link', target: '#' }); this.touch(); }
  addSocial(): void { const content = this.draft(); if (!content) return; content.socials.push({ label: 'New platform', url: 'https://' }); this.touch(); }

  removeAt<T>(items: T[], index: number): void { items.splice(index, 1); this.touch(); }

  move<T>(items: T[], index: number, direction: number): void {
    const target = index + direction;
    if (index < 0 || target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    if (items === this.draft()?.projects) this.selectedProject.set(target);
    if (items === this.draft()?.experience) this.selectedExperience.set(target);
    this.touch();
  }

  splitLines(value: string): string[] { return value.split('\n').map((item) => item.trim()).filter(Boolean); }
  splitComma(value: string): string[] { return value.split(',').map((item) => item.trim()).filter(Boolean); }

  async uploadPortrait(event: Event, kind: 'hero' | 'about'): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0]; const content = this.draft();
    if (!file || !content) return;
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
    if (!files.length) return;
    this.uploading.set(true); this.formError.set(null);
    try {
      for (const file of files) {
        project.images.push(await this.admin.uploadImage(file, `projects/${this.slug(project.title)}`, `${project.title} — screen ${project.images.length + 1}`));
      }
      this.touch();
    } catch (error) { this.formError.set(this.errorMessage(error)); }
    finally { this.uploading.set(false); input.value = ''; }
  }

  async deleteImage(project: Project, image: MediaAsset, index: number): Promise<void> {
    if (!confirm('Remove this image? Uploaded Storage files are deleted immediately.')) return;
    try { await this.admin.removeImage(image); project.images.splice(index, 1); this.touch(); }
    catch (error) { this.formError.set(this.errorMessage(error)); }
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

  private touch(): void { const content = this.draft(); if (content) this.draft.set(structuredClone(content)); this.markDirty(); }
  private slug(value: string): string { return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project'; }
  private errorMessage(error: unknown): string { return error instanceof Error ? error.message : String(error); }

  private validate(content: PortfolioContent): string | null {
    if (!content?.profile?.name || !content.profile.email) return 'Name and email are required.';
    if (!Array.isArray(content.projects) || !Array.isArray(content.experience) || !Array.isArray(content.skillGroups)) return 'The content file has an invalid structure.';
    const untitled = content.projects.find((project) => !project.title.trim()); if (untitled) return 'Every project needs a title.';
    const missingAlt = content.projects.flatMap((project) => project.images).find((image) => !image.alt.trim()); if (missingAlt) return 'Every project image needs alt text.';
    return null;
  }
}
