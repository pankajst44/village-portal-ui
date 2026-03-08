import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { RouterModule }       from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule }    from '@ngx-translate/core';
import { MaterialModule }     from './material/material.module';

import { HeaderComponent }            from './components/header/header.component';
import { SidebarComponent }           from './components/sidebar/sidebar.component';
import { LanguageSwitcherComponent }  from './components/language-switcher/language-switcher.component';
import {
  StatCardComponent,
  StatusBadgeComponent,
  BudgetBarComponent
} from './components/shared-components';
import { SpinnerComponent }           from './components/spinner/spinner.component';
import { InrPipe }                    from './pipes/inr.pipe';

@NgModule({
  declarations: [
    HeaderComponent,
    SidebarComponent,
    LanguageSwitcherComponent,
    StatCardComponent,
    StatusBadgeComponent,
    BudgetBarComponent,
    SpinnerComponent,
    InrPipe,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
  ],
  exports: [
    // Re-export for feature modules
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    // Components
    HeaderComponent,
    SidebarComponent,
    LanguageSwitcherComponent,
    StatCardComponent,
    StatusBadgeComponent,
    BudgetBarComponent,
    SpinnerComponent,
    InrPipe,
  ]
})
export class SharedModule {}