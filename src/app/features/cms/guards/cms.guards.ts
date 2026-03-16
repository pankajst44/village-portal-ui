import { Injectable }        from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { ResidentAuthService } from '../services/cms.services';
import { AuthService }         from '../../../core/services/auth.service';

/**
 * PhoneVerifiedGuard — blocks residents from accessing complaint submission
 * until they have completed OTP verification.
 * Redirects to /cms/verify-phone if not verified.
 */
@Injectable({ providedIn: 'root' })
export class PhoneVerifiedGuard implements CanActivate {

  constructor(
    private residentAuth: ResidentAuthService,
    private auth:  AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> | boolean {
    // Non-residents (ADMIN etc.) bypass the check
    if (this.auth.hasAnyRole('ADMIN')) return true;

    return this.residentAuth.getOtpStatus().pipe(
      map(res => {
        if (res.data === true) return true;
        this.router.navigate(['/cms/verify-phone']);
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/cms/verify-phone']);
        return of(false);
      })
    );
  }
}
