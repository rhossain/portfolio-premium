import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioContent } from '../content';
import { PortfolioAdminService, PortfolioDocument } from '../services/portfolio-admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="admin-page">
      @if (loading()) {
        <div class="admin-loading">Loading portfolio content…</div>
      } @else if (error()) {
        <div class="admin-empty">
          <h1>Unable to load the dashboard.</h1>
          <p>{{ error() }}</p>
          <button class="admin-secondary" type="button" (click)="load()">Try again</button>
        </div>
      } @else if (document(); as doc) {
        <header class="admin-page-header">
          <div>
            <h1>Good morning, Sazzad</h1>
            <p>{{ isPublished(doc) ? 'Everything is published and up to date.' : 'You have unpublished draft changes.' }}</p>
          </div>
          <a routerLink="/admin/content/projects" class="admin-primary">Add project</a>
        </header>

        <section class="admin-stat-strip" aria-label="Portfolio summary">
          @for (stat of stats(doc.draft); track stat.label) {
            <div><strong>{{ stat.value }}</strong><span>{{ stat.label }}</span></div>
          }
        </section>

        <section class="admin-section">
          <div class="admin-section-heading">
            <h2>Content overview</h2>
            <a routerLink="/admin/content/profile" class="admin-secondary">View all content</a>
          </div>
          <div class="admin-table" role="table" aria-label="Editable content">
            <div class="admin-table-head" role="row">
              <span>Title</span><span>Section</span><span>Status</span><span>Updated</span><span></span>
            </div>
            @for (row of rows(doc); track row.path) {
              <div class="admin-table-row" role="row">
                <strong>{{ row.title }}</strong>
                <span>{{ row.section }}</span>
                <span class="admin-status"><i></i>{{ row.status }}</span>
                <time>{{ doc.updatedAt | date:'mediumDate' }}</time>
                <a [routerLink]="row.path" class="admin-row-action">Edit</a>
              </div>
            }
          </div>
        </section>
      }
    </main>
  `,
})
export class AdminDashboardComponent implements OnInit {
  readonly document = signal<PortfolioDocument | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  private readonly admin = inject(PortfolioAdminService);

  ngOnInit(): void { void this.load(); }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.document.set(await this.admin.getDocument());
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      this.loading.set(false);
    }
  }

  stats(content: PortfolioContent) {
    const mediaCount = 2 + content.projects.reduce((total, project) => total + project.images.length, 0);
    const skillCount = content.skillGroups.reduce((total, group) => total + group.items.length, 0);
    return [
      { value: content.projects.length, label: 'Projects' },
      { value: content.experience.length, label: 'Experience entries' },
      { value: skillCount, label: 'Skills' },
      { value: mediaCount, label: 'Media files' },
    ];
  }

  rows(doc: PortfolioDocument) {
    const published = this.isPublished(doc) ? 'Published' : 'Draft changes';
    return [
      { title: doc.draft.profile.name, section: 'Profile', status: published, path: '/admin/content/profile' },
      { title: `${doc.draft.projects.length} selected projects`, section: 'Projects', status: published, path: '/admin/content/projects' },
      { title: `${doc.draft.experience.length} career entries`, section: 'Experience', status: published, path: '/admin/content/experience' },
      { title: `${doc.draft.skillGroups.length} capability groups`, section: 'Skills', status: published, path: '/admin/content/skills' },
      { title: `${doc.draft.navLinks.length} navigation links`, section: 'Navigation', status: published, path: '/admin/content/navigation' },
    ];
  }

  isPublished(doc: PortfolioDocument): boolean {
    return JSON.stringify(doc.draft) === JSON.stringify(doc.published);
  }
}
