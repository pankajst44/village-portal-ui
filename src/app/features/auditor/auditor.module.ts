import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule }         from '../../shared/shared.module';
import { ReportsComponent }     from './reports/reports.component';
import { AuditReviewComponent } from './audit-review/audit-review.component';

const routes: Routes = [
  { path: 'reports',      component: ReportsComponent },
  { path: 'audit-review', component: AuditReviewComponent },
  { path: '',             redirectTo: 'reports', pathMatch: 'full' },
];

@NgModule({
  declarations: [ReportsComponent, AuditReviewComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class AuditorModule {}
