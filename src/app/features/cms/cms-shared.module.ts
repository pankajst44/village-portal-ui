import { NgModule }    from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { ComplaintListComponent }   from './complaints/list/complaint-list.component';
import { ComplaintDetailComponent } from './complaints/detail/complaint-detail.component';
import { SubmitComplaintComponent } from './complaints/submit/submit-complaint.component';
import { MyComplaintsComponent }    from './complaints/my-complaints/my-complaints.component';
import { CmsNotificationsComponent } from './notifications/notifications.component';
import {
  ComplaintStatusBadgeComponent,
  PriorityBadgeComponent,
} from './shared/complaint-status-badge.component';

/**
 * Declares all CMS components that are shared between
 * PublicCmsModule (unauthenticated) and CmsModule (authenticated shell).
 */
@NgModule({
  declarations: [
    ComplaintListComponent,
    ComplaintDetailComponent,
    SubmitComplaintComponent,
    MyComplaintsComponent,
    CmsNotificationsComponent,
    ComplaintStatusBadgeComponent,
    PriorityBadgeComponent,
  ],
  imports:  [SharedModule],
  exports:  [
    ComplaintListComponent,
    ComplaintDetailComponent,
    SubmitComplaintComponent,
    MyComplaintsComponent,
    CmsNotificationsComponent,
    ComplaintStatusBadgeComponent,
    PriorityBadgeComponent,
  ],
})
export class CmsSharedModule {}
