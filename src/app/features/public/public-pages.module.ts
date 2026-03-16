import { NgModule }      from '@angular/core';
import { SharedModule }  from '../../shared/shared.module';

import { ProjectListComponent }   from './project-list/project-list.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { FundListComponent }      from './fund-list/fund-list.component';
import { SpendingComponent }      from './spending/spending.component';
import { DocumentsComponent }     from './documents/documents.component';
import { ContractorsComponent }   from './contractors/contractors.component';

// Single source of truth for all public page component declarations.
// Both PublicModule (authenticated) and PublicGuestModule (guest)
// import this module — no component is ever declared twice.
@NgModule({
  declarations: [
    ProjectListComponent,
    ProjectDetailComponent,
    FundListComponent,
    SpendingComponent,
    DocumentsComponent,
    ContractorsComponent,
  ],
  imports:  [ SharedModule ],
  exports:  [
    ProjectListComponent,
    ProjectDetailComponent,
    FundListComponent,
    SpendingComponent,
    DocumentsComponent,
    ContractorsComponent,
  ]
})
export class PublicPagesModule {}
