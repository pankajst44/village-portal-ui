import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard }         from './core/guards/auth.guard';
import { RoleGuard }         from './core/guards/auth.guard';
import { GuestGuard }        from './core/guards/auth.guard';
import { ShellMatchGuard }   from './core/guards/auth.guard';
import { GuestMatchGuard }   from './core/guards/auth.guard';
import { ShellComponent }    from './layout/shell/shell.component';

const routes: Routes = [

  // ── Guest-only: /login ────────────────────────────────
  {
    path: 'login',
    canActivate: [GuestGuard],
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  // ── Resident self-registration (public — no auth) ─────
  {
    path: 'register',
    loadChildren: () =>
      import('./features/cms/auth/register/register.module')
        .then(m => m.RegisterModule)
  },

  // ── Public complaints (accessible WITHOUT login) ──────
  // Uses PublicLayoutComponent (green navbar, no sidebar).
  // The /submit child requires auth — handled inside PublicCmsModule.
  {
    path: 'complaints',
    loadChildren: () =>
      import('./features/cms/cms-public.module').then(m => m.PublicCmsModule)
  },

  // ── Authenticated shell ───────────────────────────────
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
      // ── CMS inside authenticated shell ─────────────────
      // /cms/* resolves here when logged in
      // But navigating to /complaints also works (public route above)
      {
        path: 'cms',
        loadChildren: () =>
          import('./features/cms/cms.module').then(m => m.CmsModule)
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

  // ── Guest public pages ────────────────────────────────
  {
    path: '',
    canMatch: [GuestMatchGuard],
    loadChildren: () =>
      import('./features/public/public-guest.module').then(m => m.PublicGuestModule)
  },

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
