import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard }  from './core/guards/auth.guard';
import { RoleGuard }  from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/auth.guard';
import { ShellComponent } from './layout/shell/shell.component';

const routes: Routes = [

  // ── Guest-only ────────────────────────────────────────────
  {
    path: 'login',
    canActivate: [GuestGuard],
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  // ── Public routes (no auth, no shell) ────────────────────
  {
    path: '',
    loadChildren: () =>
      import('./features/public/public.module').then(m => m.PublicModule)
  },

  // ── Authenticated shell (header + sidebar + logout) ───────
  {
    path: '',
    component: ShellComponent,
    canActivate: [AuthGuard],
    children: [

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Dashboard — own module, NOT shared with public routes
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },

      // Officer area
      {
        path: 'officer',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'OFFICER'] },
        loadChildren: () =>
          import('./features/officer/officer.module').then(m => m.OfficerModule)
      },

      // Admin area
      {
        path: 'admin',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () =>
          import('./features/admin/admin.module').then(m => m.AdminModule)
      },

      // Auditor area
      {
        path: 'auditor',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'AUDITOR'] },
        loadChildren: () =>
          import('./features/auditor/auditor.module').then(m => m.AuditorModule)
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