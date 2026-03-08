import { NgModule, LOCALE_ID }  from '@angular/core';
import { BrowserModule }         from '@angular/platform-browser';
import { provideAnimations }     from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData }    from '@angular/common';
import localeHi from '@angular/common/locales/hi';

import { AppRoutingModule }   from './app-routing.module';
import { CoreModule }         from './core/core.module';
import { SharedModule }       from './shared/shared.module';
import { AppComponent }       from './app.component';
import { ShellComponent }     from './layout/shell/shell.component';
import { jwtInterceptor }     from './core/interceptors/jwt.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

registerLocaleData(localeHi, 'hi');

@NgModule({
  declarations: [
    AppComponent,
    ShellComponent,
  ],
  imports: [
    BrowserModule,
    CoreModule,
    SharedModule,
    AppRoutingModule,
  ],
  providers: [
    provideAnimations(),
    provideHttpClient(
      withInterceptors([jwtInterceptor, loadingInterceptor])
    ),
    { provide: LOCALE_ID, useValue: 'en-IN' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}