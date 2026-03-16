import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule }         from '../../shared/shared.module';
import { PublicPagesModule }    from './public-pages.module';
import { PublicLayoutModule }   from './layout/public-layout.module';
import { PublicLayoutComponent } from './layout/public-layout.component';

import { ProjectListComponent }   from './project-list/project-list.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { FundListComponent }      from './fund-list/fund-list.component';
import { SpendingComponent }      from './spending/spending.component';
import { DocumentsComponent }     from './documents/documents.component';
import { ContractorsComponent }   from './contractors/contractors.component';

// Guest (unauthenticated) — wraps all pages in PublicLayoutComponent.
const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('../dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      { path: 'projects',     component: ProjectListComponent },
      { path: 'projects/:id', component: ProjectDetailComponent },
      { path: 'funds',        component: FundListComponent },
      { path: 'spending',     component: SpendingComponent },
      { path: 'documents',    component: DocumentsComponent },
      { path: 'contractors',  component: ContractorsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [
    SharedModule,
    PublicLayoutModule,   // ← declares + exports PublicLayoutComponent & PublicNavbarComponent
    PublicPagesModule,
    RouterModule.forChild(routes)
  ]
})
export class PublicGuestModule {}
