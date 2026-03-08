import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { AuthService }     from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { Router }          from '@angular/router';

@Component({
  standalone: false,
  selector: 'vp-header',
  templateUrl: './header.component.html',
  styleUrls:   ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Output() menuToggle = new EventEmitter<void>();

  userName    = '';
  userRole    = '';
  currentLang = 'en';

  constructor(
    private auth:     AuthService,
    private langSvc:  LanguageService,
    private router:   Router
  ) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    this.userName  = user?.fullName  ?? user?.username ?? '';
    this.userRole  = user?.role      ?? '';
    this.currentLang = this.langSvc.getLang();
    this.langSvc.currentLang.subscribe(l => this.currentLang = l);
  }

  toggleMenu(): void   { this.menuToggle.emit(); }
  toggleLang(): void   { this.langSvc.toggle(); }
  logout(): void       { this.auth.logout(); }
  goToDashboard(): void{ this.router.navigate(['/dashboard']); }
}
