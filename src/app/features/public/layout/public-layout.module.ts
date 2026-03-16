import { NgModule }    from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { PublicLayoutComponent } from './public-layout.component';
import { PublicNavbarComponent } from './public-navbar.component';

/**
 * Declares and exports PublicLayoutComponent + PublicNavbarComponent.
 * Imported by PublicGuestModule AND PublicCmsModule so both can use the layout.
 */
@NgModule({
  declarations: [
    PublicLayoutComponent,
    PublicNavbarComponent,
  ],
  imports:  [SharedModule],
  exports:  [
    PublicLayoutComponent,
    PublicNavbarComponent,
  ],
})
export class PublicLayoutModule {}
