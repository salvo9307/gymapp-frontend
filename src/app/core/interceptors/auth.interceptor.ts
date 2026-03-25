import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  // Non aggiungere il token alle chiamate pubbliche di autenticazione
  if (req.url.includes('/api/auth/')) {
    return next(req);
  }

  const token = tokenService.getToken();

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const backendMessage = error?.error?.message ?? '';

      const isUnauthorized = error.status === 401;
      const isForbiddenForDisabledAccount =
        error.status === 403 &&
        typeof backendMessage === 'string' &&
        backendMessage.toLowerCase().includes('account o palestra disattivata');

      if (isUnauthorized || isForbiddenForDisabledAccount) {
        tokenService.logout();
        router.navigate(['/login'], {
          queryParams: {
            reason: isForbiddenForDisabledAccount ? 'disabled' : 'expired'
          }
        });
      }

      return throwError(() => error);
    })
  );
};