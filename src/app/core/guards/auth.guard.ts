import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';

export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (!tokenService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const mustChangePassword = tokenService.getMustChangePassword();
  const isChangePasswordPage = state.url === '/change-password';

  if (mustChangePassword && !isChangePasswordPage) {
    return router.createUrlTree(['/change-password']);
  }

  return true;
};