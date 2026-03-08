import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule }         from '../../shared/shared.module';
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectDetailComponent}from './project-detail/project-detail.component';
import { FundListComponent }    from './fund-list/fund-list.component';
import { SpendingComponent }    from './spending/spending.component';
import { DocumentsComponent }   from './documents/documents.component';
import { ContractorsComponent } from './contractors/contractors.component';
import { LoginComponent } from '@features/auth/login/login.component';

const routes: Routes = [
  { path: 'projects',     component: ProjectListComponent },
  { path: 'projects/:id', component: ProjectDetailComponent },
  { path: 'funds',        component: FundListComponent },
  { path: 'spending',     component: SpendingComponent },
  { path: 'documents',    component: DocumentsComponent },
  { path: 'contractors',  component: ContractorsComponent },
   { path: '',  component: LoginComponent },
];

@NgModule({
  declarations: [
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