import { Component, OnInit } from '@angular/core';
import { LanguageService }   from '../../../core/services/language.service';
import { AuthService }       from '../../../core/services/auth.service';

@Component({
  standalone: false,
  selector:   'vp-public-navbar',
  templateUrl: './public-navbar.component.html',
  styleUrls:   ['./public-navbar.component.scss']
})
export class PublicNavbarComponent implements OnInit {
  currentLang = 'en';
  isLoggedIn  = false;

  constructor(
    public langSvc: LanguageService,
    private auth:   AuthService
  ) {}

  ngOnInit(): void {
    this.langSvc.currentLang.subscribe(l => this.currentLang = l);
    this.isLoggedIn = this.auth.isLoggedInSnapshot();
  }

  toggleLang(): void { this.langSvc.toggle(); }
}
