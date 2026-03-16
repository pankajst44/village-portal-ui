import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription }  from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { AuthService }     from '../../../core/services/auth.service';

@Component({
  standalone: false,
  selector:   'vp-public-navbar',
  templateUrl: './public-navbar.component.html',
  styleUrls:   ['./public-navbar.component.scss']
})
export class PublicNavbarComponent implements OnInit, OnDestroy {

  currentLang  = 'en';
  isLoggedIn   = false;
  userName     = '';
  userRole     = '';

  private subs = new Subscription();

  constructor(
    public langSvc: LanguageService,
    private auth:   AuthService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.langSvc.currentLang.subscribe(l => this.currentLang = l)
    );
    // Subscribe to live auth state — updates when user logs in or out
    this.subs.add(
      this.auth.isLoggedIn().subscribe(loggedIn => {
        this.isLoggedIn = loggedIn;
        if (loggedIn) {
          const user    = this.auth.getUser();
          this.userName = user?.fullName ?? user?.username ?? '';
          this.userRole = user?.role ?? '';
        } else {
          this.userName = '';
          this.userRole = '';
        }
      })
    );
  }

  toggleLang(): void { this.langSvc.toggle(); }

  logout(): void { this.auth.logout(); }

  ngOnDestroy(): void { this.subs.unsubscribe(); }
}
