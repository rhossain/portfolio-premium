import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DEFAULT_PORTFOLIO } from '../content';
import { PortfolioAdminService, PortfolioDocument } from '../services/portfolio-admin.service';
import { AdminDashboardComponent } from './admin-dashboard.component';

describe('Dashboard load recovery', () => {
  let admin: jasmine.SpyObj<PortfolioAdminService>;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  const document = (): PortfolioDocument => ({ draft: structuredClone(DEFAULT_PORTFOLIO), published: structuredClone(DEFAULT_PORTFOLIO), version: 1, updatedAt: '2026-10-25T00:00:00Z', publishedAt: null });
  beforeEach(async () => {
    admin = jasmine.createSpyObj('admin', ['getDocument']);
    await TestBed.configureTestingModule({ imports: [AdminDashboardComponent], providers: [provideRouter([]), { provide: PortfolioAdminService, useValue: admin }] }).compileComponents();
    fixture = TestBed.createComponent(AdminDashboardComponent);
  });
  afterEach(() => fixture.destroy());

  it('announces the backend failure and restores content after an explicit retry', async () => {
    admin.getDocument.and.rejectWith({ message: 'Content service is temporarily unavailable' });
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Content service is temporarily unavailable');
    admin.getDocument.and.resolveTo(document());
    host.querySelector<HTMLButtonElement>('button')!.click();
    await fixture.whenStable(); fixture.detectChanges();
    expect(admin.getDocument).toHaveBeenCalledTimes(2);
    expect(host.querySelector('[role="alert"]')).toBeNull();
    expect(host.querySelector('h1')?.textContent).toContain('Welcome back');
    expect(host.querySelector('a[aria-label="Edit Projects"]')).not.toBeNull();
  });

  it('exposes a loading announcement until the document arrives', async () => {
    let finish!: (document: PortfolioDocument) => void;
    admin.getDocument.and.returnValue(new Promise(resolve => finish = resolve));
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('[role="status"]')?.textContent).toContain('Loading portfolio content');
    finish(document()); await fixture.whenStable(); fixture.detectChanges();
    expect(host.querySelector('[role="status"]')).toBeNull();
    expect(host.querySelector('[role="table"]')).not.toBeNull();
  });
});
