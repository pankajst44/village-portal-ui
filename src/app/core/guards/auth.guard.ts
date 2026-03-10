import { Injectable }  from '@angular/core';
import {
  CanActivate, CanMatch, ActivatedRouteSnapshot,
  RouterStateSnapshot, Router, Route, UrlSegment
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

/**
 * ShellMatchGuard — canMatch guard on the authenticated shell route block.
 * The shell route (path:'') only activates when the user IS logged in.
 * This makes Angular pick the shell route over the public route for
 * authenticated users, so /dashboard renders inside the shell with
 * header + sidebar + logout.
 */
@Injectable({ providedIn: 'root' })
export class ShellMatchGuard implements CanMatch {

  constructor(private auth: AuthService) {}

  canMatch(route: Route, segments: UrlSegment[]): boolean {
    return this.auth.isLoggedInSnapshot();
  }
}

/**
 * GuestMatchGuard — canMatch guard on the bare public route block.
 * Prevents the shell-less PublicModule from being activated when the
 * user IS logged in — ensuring /projects, /dashboard etc. always render
 * inside the shell with header + sidebar when authenticated.
 */
@Injectable({ providedIn: 'root' })
export class GuestMatchGuard implements CanMatch {

  constructor(private auth: AuthService) {}

  canMatch(route: Route, segments: UrlSegment[]): boolean {
    return !this.auth.isLoggedInSnapshot();
  }
}