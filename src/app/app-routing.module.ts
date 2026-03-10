import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard }         from './core/guards/auth.guard';
import { RoleGuard }         from './core/guards/auth.guard';
import { GuestGuard }        from './core/guards/auth.guard';
import { ShellMatchGuard }   from './core/guards/auth.guard';
import { GuestMatchGuard }   from './core/guards/auth.guard';
import { ShellComponent }    from './layout/shell/shell.component';

const routes: Routes = [

  // ── Guest-only: /login ────────────────────────────────────
  {
    path: 'login',
    canActivate: [GuestGuard],
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  // ── Authenticated shell — only when logged in ─────────────
  {
    path: '',
    component: ShellComponent,
    canMatch:    [ShellMatchGuard],
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: '',
        loadChildren: () =>
          import('./features/public/public.module').then(m => m.PublicModule)
      },
      {
        path: 'officer',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'OFFICER', 'AUDITOR'] },
        loadChildren: () =>
          import('./features/officer/officer.module').then(m => m.OfficerModule)
      },
      {
        path: 'admin',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () =>
          import('./features/admin/admin.module').then(m => m.AdminModule)
      },
      {
        path: 'auditor',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'AUDITOR'] },
        loadChildren: () =>
          import('./features/auditor/auditor.module').then(m => m.AuditorModule)
      },
    ]
  },

  // ── Guest public pages — only when NOT logged in ──────────
  {
    path: '',
    canMatch: [GuestMatchGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: '',
        loadChildren: () =>
          import('./features/public/public.module').then(m => m.PublicModule)
      },
    ]
  },

  // ── Fallback ──────────────────────────────────────────────
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top',
    preloadingStrategy: import('@angular/router').then(r => r.PreloadAllModules) as any
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}