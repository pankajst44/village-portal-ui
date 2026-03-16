import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router }       from '@angular/router';
import { MatSnackBar }  from '@angular/material/snack-bar';
import { ResidentAuthService } from '../../services/cms.services';
import { AuthService }         from '../../../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'vp-cms-otp-verify',
  templateUrl: './otp-verify.component.html',
  styleUrls: ['./otp-verify.component.scss']
})
export class OtpVerifyComponent implements OnInit, OnDestroy {

  sendForm:   FormGroup;
  verifyForm: FormGroup;
  step:       'send' | 'verify' = 'send';
  loading     = false;
  resendCooldown = 0;
  private cooldownInterval?: ReturnType<typeof setInterval>;

  constructor(
    private fb:           FormBuilder,
    private residentAuth: ResidentAuthService,
    private auth:         AuthService,
    private router:       Router,
    private snack:        MatSnackBar
  ) {
    this.sendForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]]
    });
    this.verifyForm = this.fb.group({
      phone: [{ value: '', disabled: true }],
      otp:   ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  get sf(): { [k: string]: AbstractControl } { return this.sendForm.controls; }
  get vf(): { [k: string]: AbstractControl } { return this.verifyForm.controls; }

  ngOnInit(): void {
    // Check if already verified
    this.residentAuth.getOtpStatus().subscribe(res => {
      if (res.data === true) this.router.navigate(['/complaints']);
    });
  }

  sendOtp(): void {
    if (this.sendForm.invalid) { this.sendForm.markAllAsTouched(); return; }
    this.loading = true;
    const phone = this.sf['phone'].value;

    this.residentAuth.sendOtp(phone).subscribe({
      next: () => {
        this.loading = false;
        this.step = 'verify';
        this.verifyForm.patchValue({ phone });
        this.startCooldown();
        this.snack.open(`OTP sent to +91${phone}`, 'OK', { duration: 4000 });
      },
      error: err => {
        this.loading = false;
        this.snack.open(err.error?.message ?? 'Failed to send OTP. Try again.', 'Dismiss', { duration: 5000 });
      }
    });
  }

  verifyOtp(): void {
    if (this.verifyForm.invalid) { this.verifyForm.markAllAsTouched(); return; }
    this.loading = true;
    this.residentAuth.verifyOtp({
      phone: this.sf['phone'].value || this.verifyForm.get('phone')?.value,
      otp:   this.vf['otp'].value
    }).subscribe({
      next: () => {
        this.loading = false;
        this.snack.open('Phone verified successfully! You can now submit complaints.', 'OK', { duration: 5000 });
        this.router.navigate(['/complaints']);
      },
      error: err => {
        this.loading = false;
        this.snack.open(err.error?.message ?? 'Invalid OTP. Please try again.', 'Dismiss', { duration: 5000 });
      }
    });
  }

  resendOtp(): void {
    if (this.resendCooldown > 0) return;
    this.step = 'send';
  }

  private startCooldown(): void {
    this.resendCooldown = 60;
    this.cooldownInterval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) clearInterval(this.cooldownInterval);
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.cooldownInterval) clearInterval(this.cooldownInterval);
  }
}
