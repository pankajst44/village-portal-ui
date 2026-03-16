import { inject }                from '@angular/core';
import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn
} from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  throwError,
  filter,
  take,
  switchMap,
  catchError
} from 'rxjs';
import { MatSnackBar }      from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { AuthService }      from '../services/auth.service';

const TOKEN_KEY = 'vp_access_token';

// Module-level refresh state — shared across all interceptor calls
let isRefreshing = false;
const refreshToken$ = new BehaviorSubject<string | null>(null);

// ── Decode JWT payload without a library ────────────────────────
function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

// Returns true if token is expired or will expire within 30 seconds
function isTokenExpired(token: string): boolean {
  const exp = getTokenExpiry(token);
  if (exp === null) return true;
  // 30-second buffer: refresh slightly before actual expiry
  return (exp - 30) < Math.floor(Date.now() / 1000);
}

// ── Attach Bearer token to request ──────────────────────────────
function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

// ── Shared refresh + queue logic ─────────────────────────────────
function doRefresh(
  req:         HttpRequest<unknown>,
  next:        HttpHandlerFn,
  authService: AuthService,
  snackBar:    MatSnackBar,
  translate:   TranslateService
): Observable<any> {

  if (!authService.getRefreshToken()) {
    authService.forceLogout();
    return throwError(() => new Error('No refresh token'));
  }

  if (!isRefreshing) {
    isRefreshing = true;
    refreshToken$.next(null); // signal: refresh in progress

    return authService.refreshToken().pipe(
      switchMap(res => {
        isRefreshing = false;
        const newToken = res.data?.accessToken ?? '';
        refreshToken$.next(newToken); // unblock all queued requests
        return next(addToken(req, newToken));
      }),
      catchError(err => {
        isRefreshing = false;
        refreshToken$.next(null);
        authService.forceLogout();
        snackBar.open(
          translate.instant('auth.sessionExpired'),
          translate.instant('common.close'),
          { duration: 4000, panelClass: 'snack-error' }
        );
        return throwError(() => err);
      })
    );

  } else {
    // A refresh is already in progress — queue this request until token arrives
    return refreshToken$.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next(addToken(req, token!)))
    );
  }
}

// ── Main interceptor ─────────────────────────────────────────────
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const isAuthEndpoint = req.url.includes('/auth/login') ||
                         req.url.includes('/auth/refresh');
  const isAsset        = req.url.includes('/assets/i18n/');

  if (isAuthEndpoint || isAsset) {
    return next(req);
  }

  const authService = inject(AuthService);
  const snackBar    = inject(MatSnackBar);
  const translate   = inject(TranslateService);

  const token = localStorage.getItem(TOKEN_KEY);

  // ── Proactive check: token is already expired before sending ──
  // This handles the case where the user has been idle and comes back
  // to a page — the stored token is stale but no 401 has been seen yet.
  if (token && isTokenExpired(token)) {
    return doRefresh(req, next, authService, snackBar, translate);
  }

  // Token is valid — attach and send
  const authReq = token ? addToken(req, token) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // 401 = backend confirmed token is expired/invalid → refresh
      if (error.status === 401) {
        return doRefresh(req, next, authService, snackBar, translate);
      }

      // 403 = valid token but wrong role — do NOT logout, just warn
      if (error.status === 403) {
        snackBar.open(
          translate.instant('errors.unauthorized'),
          translate.instant('common.close'),
          { duration: 4000, panelClass: 'snack-error' }
        );
      }

      return throwError(() => error);
    })
  );
};