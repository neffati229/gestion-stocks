import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const requiredRoles: string[] = route.data['roles'] ?? [];

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const userRole = auth.userRole();
  if (requiredRoles.length === 0 || requiredRoles.includes(userRole!)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
