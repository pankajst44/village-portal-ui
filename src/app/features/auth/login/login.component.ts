import { Component, OnInit }  from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute }             from '@angular/router';
import { MatSnackBar }    from '@angular/material/snack-bar';
import { TranslateService}from '@ngx-translate/core';
import { AuthService }    from '../../../core/services/auth.service';
import { LanguageService }from '../../../core/services/language.service';

@Component({
  standalone: false,
  selector:    'vp-login',
  templateUrl: './login.component.html',
  styleUrls:   ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form!: FormGroup;
  loading       = false;
  hidePassword  = true;
  returnUrl     = '/dashboard';
  currentLang   = 'en';

  constructor(
    private fb:        FormBuilder,
    private auth:      AuthService,
    private router:    Router,
    private route:     ActivatedRoute,
    private snack:     MatSnackBar,
    private translate: TranslateService,
    private langSvc:   LanguageService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '/dashboard';
    this.langSvc.currentLang.subscribe(l => this.currentLang = l);
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    this.auth.login(this.form.value).subscribe({
      next: () => {
        this.router.navigateByUrl(this.returnUrl);
      },
      error: () => {
        this.loading = false;
        this.snack.open(
          this.translate.instant('auth.loginFailed'),
          this.translate.instant('common.cancel'),
          { duration: 4000, panelClass: 'snack-error' }
        );
      }
    });
  }

  toggleLang(): void { this.langSvc.toggle(); }

  get username() { return this.form.get('username'); }
  get password() { return this.form.get('password'); }
}
