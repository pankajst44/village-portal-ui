import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule }         from '../../../../shared/shared.module';
import { PublicLayoutModule }   from '../../../public/layout/public-layout.module';
import { PublicLayoutComponent } from '../../../public/layout/public-layout.component';
import { RegisterComponent }    from './register.component';

const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,  // ← wraps register in green navbar
    children: [
      { path: '', component: RegisterComponent }
    ]
  }
];

@NgModule({
  declarations: [RegisterComponent],
  imports: [
    SharedModule,
    PublicLayoutModule,   // ← provides PublicLayoutComponent + PublicNavbarComponent
    RouterModule.forChild(routes)
  ],
})
export class RegisterModule {}
