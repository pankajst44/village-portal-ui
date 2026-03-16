import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicPagesModule }    from './public-pages.module';

import { ProjectListComponent }   from './project-list/project-list.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { FundListComponent }      from './fund-list/fund-list.component';
import { SpendingComponent }      from './spending/spending.component';
import { DocumentsComponent }     from './documents/documents.component';
import { ContractorsComponent }   from './contractors/contractors.component';

// Authenticated shell — ShellComponent already provides header + sidebar.
const routes: Routes = [
  { path: 'projects',     component: ProjectListComponent },
  { path: 'projects/:id', component: ProjectDetailComponent },
  { path: 'funds',        component: FundListComponent },
  { path: 'spending',     component: SpendingComponent },
  { path: 'documents',    component: DocumentsComponent },
  { path: 'contractors',  component: ContractorsComponent },
];

@NgModule({
  declarations: [],   // ← nothing declared here; PublicPagesModule owns them
  imports: [
    PublicPagesModule,
    RouterModule.forChild(routes)
  ]
})
export class PublicModule {}