import { NgModule }               from '@angular/core';
import { MatToolbarModule }       from '@angular/material/toolbar';
import { MatSidenavModule }       from '@angular/material/sidenav';
import { MatListModule }          from '@angular/material/list';
import { MatIconModule }          from '@angular/material/icon';
import { MatButtonModule }        from '@angular/material/button';
import { MatCardModule }          from '@angular/material/card';
import { MatTableModule }         from '@angular/material/table';
import { MatPaginatorModule }     from '@angular/material/paginator';
import { MatSortModule }          from '@angular/material/sort';
import { MatFormFieldModule }     from '@angular/material/form-field';
import { MatInputModule }         from '@angular/material/input';
import { MatSelectModule }        from '@angular/material/select';
import { MatDatepickerModule }    from '@angular/material/datepicker';
import { MatNativeDateModule }    from '@angular/material/core';
import { MatProgressBarModule }   from '@angular/material/progress-bar';
import { MatProgressSpinnerModule}from '@angular/material/progress-spinner';
import { MatChipsModule }         from '@angular/material/chips';
import { MatBadgeModule }         from '@angular/material/badge';
import { MatTooltipModule }       from '@angular/material/tooltip';
import { MatMenuModule }          from '@angular/material/menu';
import { MatDialogModule }        from '@angular/material/dialog';
import { MatSnackBarModule }      from '@angular/material/snack-bar';
import { MatTabsModule }          from '@angular/material/tabs';
import { MatDividerModule }       from '@angular/material/divider';
import { MatCheckboxModule }      from '@angular/material/checkbox';
import { MatRadioModule }         from '@angular/material/radio';
import { MatAutocompleteModule }  from '@angular/material/autocomplete';
import { MatExpansionModule }     from '@angular/material/expansion';
import { MatButtonToggleModule }  from '@angular/material/button-toggle';
import { MatSlideToggleModule }   from '@angular/material/slide-toggle';

const MATERIAL_MODULES = [
  MatToolbarModule, MatSidenavModule, MatListModule,
  MatIconModule, MatButtonModule, MatCardModule,
  MatTableModule, MatPaginatorModule, MatSortModule,
  MatFormFieldModule, MatInputModule, MatSelectModule,
  MatDatepickerModule, MatNativeDateModule,
  MatProgressBarModule, MatProgressSpinnerModule,
  MatChipsModule, MatBadgeModule, MatTooltipModule,
  MatMenuModule, MatDialogModule, MatSnackBarModule,
  MatTabsModule, MatDividerModule, MatCheckboxModule,
  MatRadioModule, MatAutocompleteModule, MatExpansionModule,
  MatButtonToggleModule, MatSlideToggleModule,
];

@NgModule({
  imports:  MATERIAL_MODULES,
  exports:  MATERIAL_MODULES,
})
export class MaterialModule {}