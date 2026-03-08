import { Component, OnInit } from '@angular/core';
import { LanguageService }   from './core/services/language.service';

@Component({
  standalone: false,
  selector: 'vp-root',
  template: `
    <vp-spinner></vp-spinner>
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {

  constructor(private langSvc: LanguageService) {}

  ngOnInit(): void {
    // Boot translation engine and apply saved language preference
    this.langSvc.init();
  }
}
