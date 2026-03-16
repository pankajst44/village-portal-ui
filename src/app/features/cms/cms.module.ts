import { NgModule }          from '@angular/core';
import { SharedModule }      from '../../shared/shared.module';
import { CmsSharedModule }   from './cms-shared.module';
import { CmsRoutingModule }  from './cms-routing.module';
import { RegisterModule }    from './auth/register/register.module';

import { OtpVerifyComponent }           from './auth/otp-verify/otp-verify.component';
import { OfficerCmsDashboardComponent } from './officer/dashboard/officer-cms-dashboard.component';
import { AdminCmsDashboardComponent }   from './admin/dashboard/admin-cms-dashboard.component';

/**
 * Loaded at /cms inside the authenticated shell.
 * Shared complaint components come from CmsSharedModule.
 * Officer/Admin dashboards are authenticated-only and declared here.
 */
@NgModule({
  declarations: [
    OtpVerifyComponent,
    OfficerCmsDashboardComponent,
    AdminCmsDashboardComponent,
  ],
  imports: [
    SharedModule,
    CmsSharedModule,   // ← provides ComplaintList/Detail/Submit/Notifications + badges
    RegisterModule,
    CmsRoutingModule,
  ],
})
export class CmsModule {}
