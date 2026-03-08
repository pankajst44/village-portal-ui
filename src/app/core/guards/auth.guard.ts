import { Injectable }  from '@angular/core';
import {
  CanActivate, ActivatedRouteSnapshot,
  RouterStateSnapshot, Router
} from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * AuthGuard — redirects unauthenticated users to /login
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.auth.isLoggedInSnapshot()) {
      return true;
    }
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}

/**
 * RoleGuard — restricts access by role.
 * Usage in route: data: { roles: ['ADMIN', 'OFFICER'] }
 */
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.auth.isLoggedInSnapshot()) {
      this.router.navigate(['/login']);
      return false;
    }

    const allowedRoles: string[] = route.data['roles'] ?? [];

    if (allowedRoles.length === 0 || this.auth.hasAnyRole(...allowedRoles)) {
      return true;
    }

    // Authenticated but wrong role — go to their own dashboard
    this.router.navigate(['/dashboard']);
    return false;
  }
}

/**
 * GuestGuard — prevents authenticated users from accessing /login
 */
@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (!this.auth.isLoggedInSnapshot()) {
      return true;
    }
    this.router.navigate(['/dashboard']);
    return false;
  }
}
