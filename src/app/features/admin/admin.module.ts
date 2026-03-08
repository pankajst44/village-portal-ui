import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule }         from '../../shared/shared.module';
import { FundManagementComponent }       from './fund-management/fund-management.component';
import { ProjectManagementComponent }    from './project-management/project-management.component';
import { ContractorManagementComponent } from './contractor-management/contractor-management.component';
import { UserManagementComponent }       from './user-management/user-management.component';
import { AuditLogViewerComponent }       from './audit-log-viewer/audit-log-viewer.component';

const routes: Routes = [
  { path: 'funds',        component: FundManagementComponent },
  { path: 'projects',     component: ProjectManagementComponent },
  { path: 'contractors',  component: ContractorManagementComponent },
  { path: 'users',        component: UserManagementComponent },
  { path: 'audit-logs',   component: AuditLogViewerComponent },
  { path: '',             redirectTo: 'users', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    FundManagementComponent,
    ProjectManagementComponent,
    ContractorManagementComponent,
    UserManagementComponent,
    AuditLogViewerComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class AdminModule {}
