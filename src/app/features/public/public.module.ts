import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule }         from '../../shared/shared.module';

import { PublicLayoutComponent }  from './layout/public-layout.component';
import { PublicNavbarComponent }  from './layout/public-navbar.component';
import { ProjectListComponent }   from './project-list/project-list.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { FundListComponent }      from './fund-list/fund-list.component';
import { SpendingComponent }      from './spending/spending.component';
import { DocumentsComponent }     from './documents/documents.component';
import { ContractorsComponent }   from './contractors/contractors.component';

// These routes are loaded in TWO contexts:
//   1. Inside ShellComponent (authenticated) — shell already provides the header,
//      so we use flat routes with no layout wrapper.
//   2. Inside GuestMatchGuard block (unauthenticated) — wrapped with PublicLayoutComponent
//      so guests see the green navbar.
// The routing file handles which context to use.
const routes: Routes = [
  { path: 'projects',     component: ProjectListComponent },
  { path: 'projects/:id', component: ProjectDetailComponent },
  { path: 'funds',        component: FundListComponent },
  { path: 'spending',     component: SpendingComponent },
  { path: 'documents',    component: DocumentsComponent },
  { path: 'contractors',  component: ContractorsComponent },
];

@NgModule({
  declarations: [
    PublicLayoutComponent,
    PublicNavbarComponent,
    ProjectListComponent,
    ProjectDetailComponent,
    FundListComponent,
    SpendingComponent,
    DocumentsComponent,
    ContractorsComponent,
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class PublicModule {}