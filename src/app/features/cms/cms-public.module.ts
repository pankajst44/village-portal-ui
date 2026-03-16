import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule }         from '../../shared/shared.module';
import { CmsSharedModule }      from './cms-shared.module';
import { PublicLayoutModule }   from '../public/layout/public-layout.module';
import { PublicLayoutComponent } from '../public/layout/public-layout.component';
import { AuthGuard }            from '../../core/guards/auth.guard';
import { PhoneVerifiedGuard }   from './guards/cms.guards';

import { ComplaintListComponent }   from './complaints/list/complaint-list.component';
import { ComplaintDetailComponent } from './complaints/detail/complaint-detail.component';
import { SubmitComplaintComponent } from './complaints/submit/submit-complaint.component';

/**
 * Loaded at /complaints — public access, no auth required to browse.
 * Uses PublicLayoutComponent (green navbar, no sidebar).
 * /submit child still requires auth + phone verification.
 */
const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: ComplaintListComponent },
      {
        path: 'submit',
        component: SubmitComplaintComponent,
        canActivate: [AuthGuard, PhoneVerifiedGuard],
      },
      { path: ':complaintNumber', component: ComplaintDetailComponent },
    ],
  },
];

@NgModule({
  imports: [
    SharedModule,
    CmsSharedModule,
    PublicLayoutModule,
    RouterModule.forChild(routes),
  ],
})
export class PublicCmsModule {}
