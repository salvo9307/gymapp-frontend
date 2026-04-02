import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (tokenService.getMustChangePassword()) {
    return router.createUrlTree(['/change-password']);
  }

  const expectedRoles = route.data['roles'] as string[];
  const currentRole = tokenService.getUserRole();

  if (currentRole && expectedRoles?.includes(currentRole)) {
    return true;
  }

  return router.createUrlTree(['/login']);
};