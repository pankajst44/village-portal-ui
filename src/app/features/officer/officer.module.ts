import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule }         from '../../shared/shared.module';
import { ProjectUpdateComponent } from './project-update/project-update.component';
import { SpendingEntryComponent } from './spending-entry/spending-entry.component';
import { DocumentUploadComponent}from './document-upload/document-upload.component';

const routes: Routes = [
  { path: 'projects',         component: ProjectUpdateComponent },
  { path: 'spending/new',     component: SpendingEntryComponent },
  { path: 'documents/upload', component: DocumentUploadComponent },
  { path: '',                 redirectTo: 'projects', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    ProjectUpdateComponent,
    SpendingEntryComponent,
    DocumentUploadComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class OfficerModule {}
