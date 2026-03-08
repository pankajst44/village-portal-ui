import { Component, OnInit }  from '@angular/core';
import { LanguageService, AppLanguage } from '../../../core/services/language.service';

@Component({
  standalone: false,
  selector: 'vp-language-switcher',
  template: `
    <button mat-stroked-button class="lang-btn"
            (click)="toggle()"
            [matTooltip]="'language.switch' | translate">
      <span class="lang-label">
        <span class="lang-active">{{ currentLang === 'en' ? 'EN' : 'हि' }}</span>
        <mat-icon class="lang-icon">translate</mat-icon>
      </span>
    </button>
  `,
  styles: [`
    .lang-btn {
      color: #fff !important;
      border-color: rgba(255,255,255,0.4) !important;
      min-width: 56px;
      height: 34px;
      padding: 0 10px;
      margin-right: 8px;
      font-size: 0.8rem;
    }
    .lang-label {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .lang-active {
      font-weight: 700;
      letter-spacing: 0.04em;
    }
    .lang-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      opacity: 0.85;
    }
  `]
})
export class LanguageSwitcherComponent implements OnInit {

  currentLang: AppLanguage = 'en';

  constructor(private langSvc: LanguageService) {}

  ngOnInit(): void {
    this.langSvc.currentLang.subscribe(l => this.currentLang = l);
  }

  toggle(): void { this.langSvc.toggle(); }
}
