import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', title: 'Sazzad Hossain — Lead UI Engineer', loadComponent: () => import('./pages/portfolio-page.component').then((m) => m.PortfolioPageComponent) },
  { path: 'admin/login', title: 'Portfolio Admin — Sign in', loadComponent: () => import('./admin/admin-login.component').then((m) => m.AdminLoginComponent) },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./admin/admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      { path: '', title: 'Portfolio Admin — Overview', loadComponent: () => import('./admin/admin-dashboard.component').then((m) => m.AdminDashboardComponent) },
      { path: 'content/:section', title: 'Portfolio Admin — Edit content', loadComponent: () => import('./admin/admin-content.component').then((m) => m.AdminContentComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
