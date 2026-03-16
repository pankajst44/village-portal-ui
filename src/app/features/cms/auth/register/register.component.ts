import { Component }   from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router }       from '@angular/router';
import { MatSnackBar }  from '@angular/material/snack-bar';
import { ResidentAuthService } from '../../services/cms.services';
import { AuthService }         from '../../../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'vp-cms-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  form: FormGroup;
  loading      = false;
  hidePassword = true;

  constructor(
    private fb:           FormBuilder,
    private residentAuth: ResidentAuthService,
    private authService:  AuthService,
    private router:       Router,
    private snack:        MatSnackBar
  ) {
    this.form = this.fb.group({
      fullName:   ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      username:   ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50),
                        Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      password:   ['', [Validators.required, Validators.minLength(8),
                        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)]],
      phone:      ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      wardNumber: [null, [Validators.required, Validators.min(1), Validators.max(20)]],
    });
  }

  get f(): { [key: string]: AbstractControl } { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;

    this.residentAuth.register(this.form.value).subscribe({
      next: res => {
        // AuthService stores the JWT — resident is now logged in
        this.authService.storeSession(res.data);
        this.snack.open('Registration successful! Please verify your phone.', 'OK', { duration: 4000 });
        this.router.navigate(['/cms/verify-phone']);
      },
      error: err => {
        this.loading = false;
        const msg = err.error?.message ?? 'Registration failed. Please try again.';
        this.snack.open(msg, 'Dismiss', { duration: 5000 });
      }
    });
  }
}
