import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader }              from '@ngx-translate/http-loader';
import { HttpClient }                       from '@angular/common/http';

export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    CommonModule,
    TranslateModule.forRoot({
      loader: {
        provide:    TranslateLoader,
        useFactory: createTranslateLoader,
        deps:       [HttpClient]
      },
      defaultLanguage: 'en'
    }),
  ],
  exports: [TranslateModule],
  // Interceptors moved to AppModule providers alongside provideHttpClient()
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parent: CoreModule) {
    if (parent) {
      throw new Error('CoreModule is already loaded. Import only in AppModule.');
    }
  }
}