import { Injectable }        from '@angular/core';
import { TranslateService }  from '@ngx-translate/core';
import { BehaviorSubject }   from 'rxjs';

export type AppLanguage = 'en' | 'hi';

const LANG_KEY = 'vp_language';

@Injectable({ providedIn: 'root' })
export class LanguageService {

  private currentLang$ = new BehaviorSubject<AppLanguage>(this.getSavedLang());

  readonly currentLang = this.currentLang$.asObservable();

  constructor(private translate: TranslateService) {}

  /** Call once in AppComponent.ngOnInit() */
  init(): void {
    this.translate.addLangs(['en', 'hi']);
    this.translate.setDefaultLang('en');
    const saved = this.getSavedLang();
    this.translate.use(saved);
    this.currentLang$.next(saved);
    this.applyFontClass(saved);
  }

  toggle(): void {
    const next: AppLanguage = this.currentLang$.value === 'en' ? 'hi' : 'en';
    this.setLanguage(next);
  }

  setLanguage(lang: AppLanguage): void {
    this.translate.use(lang);
    localStorage.setItem(LANG_KEY, lang);
    this.currentLang$.next(lang);
    this.applyFontClass(lang);
  }

  getLang(): AppLanguage {
    return this.currentLang$.value;
  }

  isHindi(): boolean {
    return this.currentLang$.value === 'hi';
  }

  /** Swap body font class so Hindi text renders in Devanagari */
  private applyFontClass(lang: AppLanguage): void {
    const body = document.body;
    if (lang === 'hi') {
      body.classList.add('lang-hi');
      body.classList.remove('lang-en');
      document.documentElement.setAttribute('lang', 'hi');
    } else {
      body.classList.add('lang-en');
      body.classList.remove('lang-hi');
      document.documentElement.setAttribute('lang', 'en');
    }
  }

  private getSavedLang(): AppLanguage {
    return (localStorage.getItem(LANG_KEY) as AppLanguage) ?? 'en';
  }
}
