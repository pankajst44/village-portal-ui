import { inject }            from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError }        from 'rxjs/operators';
import { throwError }        from 'rxjs';
import { Router }            from '@angular/router';
import { MatSnackBar }       from '@angular/material/snack-bar';
import { TranslateService }  from '@ngx-translate/core';

const TOKEN_KEY = 'vp_access_token';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const isAuthEndpoint = req.url.includes('/auth/login') ||
                         req.url.includes('/auth/refresh');
  const isAssetRequest = req.url.includes('/assets/i18n/');

  const token = localStorage.getItem(TOKEN_KEY);

  if (token && !isAuthEndpoint && !isAssetRequest) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Lazy-inject inside callback to avoid circular dependency during bootstrap
      const router    = inject(Router);
      const snackBar  = inject(MatSnackBar);
      const translate = inject(TranslateService);

      if (error.status === 401 && !isAuthEndpoint) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('vp_refresh_token');
        localStorage.removeItem('vp_user');
        snackBar.open(
          translate.instant('auth.sessionExpired'),
          translate.instant('common.cancel'),
          { duration: 4000, panelClass: 'snack-error' }
        );
        router.navigate(['/login']);
      }
      if (error.status === 403) {
        snackBar.open(
          translate.instant('errors.unauthorized'),
          translate.instant('common.cancel'),
          { duration: 4000, panelClass: 'snack-error' }
        );
      }
      return throwError(() => error);
    })
  );
};