import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard }            from '../../core/guards/auth.guard';
import { RoleGuard }            from '../../core/guards/auth.guard';
import { PhoneVerifiedGuard }   from './guards/cms.guards';

import { OtpVerifyComponent }           from './auth/otp-verify/otp-verify.component';
import { ComplaintListComponent }       from './complaints/list/complaint-list.component';
import { ComplaintDetailComponent }     from './complaints/detail/complaint-detail.component';
import { SubmitComplaintComponent }     from './complaints/submit/submit-complaint.component';
import { MyComplaintsComponent }        from './complaints/my-complaints/my-complaints.component';
import { CmsNotificationsComponent }    from './notifications/notifications.component';
import { OfficerCmsDashboardComponent } from './officer/dashboard/officer-cms-dashboard.component';
import { AdminCmsDashboardComponent }   from './admin/dashboard/admin-cms-dashboard.component';

const routes: Routes = [

  // ── Public complaint browsing (no auth) ───────────────
  {
    path: 'complaints',
    children: [
      { path: '',       component: ComplaintListComponent },
      // 'submit' MUST be before ':complaintNumber' — static before dynamic
      {
        path: 'submit',
        component: SubmitComplaintComponent,
        canActivate: [AuthGuard, PhoneVerifiedGuard],
      },
      {
        path: ':complaintNumber',
        component: ComplaintDetailComponent,
      },
    ]
  },

  // ── Phone OTP verification ────────────────────────────
  {
    path: 'verify-phone',
    component: OtpVerifyComponent,
    canActivate: [AuthGuard],
  },

  // ── Resident ──────────────────────────────────────────
  {
    path: 'my-complaints',
    component: MyComplaintsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'notifications',
    component: CmsNotificationsComponent,
    canActivate: [AuthGuard],
  },

  // ── Officer ───────────────────────────────────────────
  {
    path: 'officer',
    component: OfficerCmsDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['OFFICER', 'ADMIN'] },
  },

  // ── Admin / Auditor ───────────────────────────────────
  {
    path: 'admin',
    component: AdminCmsDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'AUDITOR'] },
  },

  { path: '', redirectTo: 'complaints', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CmsRoutingModule {}
