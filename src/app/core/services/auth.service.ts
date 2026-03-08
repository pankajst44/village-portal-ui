import { Injectable }    from '@angular/core';
import { HttpClient }    from '@angular/common/http';
import { Router }        from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment }   from '../../../environments/environment';
import { ApiResponse, AuthResponse, LoginRequest } from '../models/models';

const TOKEN_KEY    = 'vp_access_token';
const REFRESH_KEY  = 'vp_refresh_token';
const USER_KEY     = 'vp_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private loggedIn$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient, private router: Router) {}

  // ── Login ──────────────────────────────────────────────
  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.apiUrl}/login`, credentials
    ).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.storeTokens(res.data);
          this.loggedIn$.next(true);
        }
      })
    );
  }

  // ── Logout ─────────────────────────────────────────────
  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      complete: () => this.clearAndRedirect(),
      error:    () => this.clearAndRedirect()
    });
  }

  private clearAndRedirect(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this.loggedIn$.next(false);
    this.router.navigate(['/login']);
  }

  // ── Token helpers ──────────────────────────────────────
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  isLoggedInSnapshot(): boolean {
    return this.hasToken();
  }

  // ── Role helpers ───────────────────────────────────────
  getUser(): AuthResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  getRole(): string {
    return this.getUser()?.role ?? '';
  }

  isAdmin():   boolean { return this.getRole() === 'ADMIN'; }
  isOfficer(): boolean { return this.getRole() === 'OFFICER'; }
  isAuditor(): boolean { return this.getRole() === 'AUDITOR'; }

  hasAnyRole(...roles: string[]): boolean {
    return roles.includes(this.getRole());
  }

  // ── Private helpers ────────────────────────────────────
  private storeTokens(data: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY,   data.accessToken);
    localStorage.setItem(REFRESH_KEY, data.refreshToken);
    localStorage.setItem(USER_KEY,    JSON.stringify(data));
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }
}
