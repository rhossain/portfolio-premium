import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);

  if (!auth.ready()) {
    await new Promise<void>((resolve) => {
      const timer = window.setInterval(() => {
        if (auth.ready()) {
          window.clearInterval(timer);
          resolve();
        }
      }, 20);
    });
  }

  const allowed = auth.isAdmin() || (await auth.refreshAdminStatus());
  return allowed ? true : router.createUrlTree(['/admin/login']);
};
