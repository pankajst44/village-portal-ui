import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService }     from '../../../core/services/api.services';
import { LanguageService } from '../../../core/services/language.service';
import { User, Role, CreateUserRequest } from '../../../core/models/models';

@Component({
  standalone: false,
  selector:    'vp-user-management',
  templateUrl: './user-management.component.html',
  styleUrls:   ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  users:         User[]  = [];
  loading        = true;
  error          = false;
  currentLang    = 'en';

  // Filters
  searchTerm         = '';
  selectedRole: Role | '' = '';
  showInactive        = false;

  // Form panel state
  showForm     = false;
  formMode:    'create' | 'resetPwd' = 'create';
  editingUser: User | null = null;
  formSaving   = false;

  // Forms
  userForm:    FormGroup;
  pwdForm:     FormGroup;
  showPassword = false;
  showConfirm  = false;

  readonly roles: Role[] = ['ADMIN', 'OFFICER', 'AUDITOR'];

  constructor(
    private userSvc:  UserService,
    private langSvc:  LanguageService,
    private fb:       FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-z0-9_]+$/)]],
      email:    ['', [Validators.required, Validators.email]],
      phone:    [''],
      role:     ['OFFICER', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm:  ['', Validators.required],
    }, { validators: this.passwordMatch });

    this.pwdForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirm:     ['', Validators.required],
    }, { validators: this.passwordMatch });
  }

  private passwordMatch(g: FormGroup) {
    const pwd = g.get('password') ?? g.get('newPassword');
    const cfm = g.get('confirm');
    if (pwd && cfm && pwd.value !== cfm.value) {
      cfm.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    cfm?.setErrors(null);
    return null;
  }

  ngOnInit(): void {
    this.langSvc.currentLang.subscribe(l => this.currentLang = l);
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error   = false;
    this.userSvc.getAll().subscribe({
      next:  res => { this.users = res.data ?? []; this.loading = false; },
      error: ()  => { this.loading = false; this.error = true; }
    });
  }

  // ── Filters ───────────────────────────────────────────

  get filtered(): User[] {
    let result = this.users;
    if (!this.showInactive)    result = result.filter(u => u.isActive);
    if (this.selectedRole)     result = result.filter(u => u.role === this.selectedRole);
    if (this.searchTerm.trim()) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(u =>
        u.fullName.toLowerCase().includes(t) ||
        u.username.toLowerCase().includes(t) ||
        u.email.toLowerCase().includes(t)
      );
    }
    return result;
  }

  resetFilters(): void {
    this.searchTerm  = '';
    this.selectedRole = '';
    this.showInactive = false;
  }

  // ── Summary counts ────────────────────────────────────

  countByRole(role: Role):  number { return this.users.filter(u => u.role === role).length; }
  get activeCount():        number { return this.users.filter(u => u.isActive).length; }
  get inactiveCount():      number { return this.users.filter(u => !u.isActive).length; }

  // ── Form panel ────────────────────────────────────────

  openCreate(): void {
    this.formMode    = 'create';
    this.editingUser = null;
    this.userForm.reset({ role: 'OFFICER' });
    this.showForm    = true;
  }

  openResetPwd(user: User): void {
    this.formMode    = 'resetPwd';
    this.editingUser = user;
    this.pwdForm.reset();
    this.showForm    = true;
  }

  closeForm(): void {
    this.showForm    = false;
    this.editingUser = null;
  }

  submitCreate(): void {
    if (this.userForm.invalid) { this.userForm.markAllAsTouched(); return; }
    this.formSaving = true;
    const req: CreateUserRequest = {
      fullName: this.userForm.value.fullName,
      username: this.userForm.value.username,
      email:    this.userForm.value.email,
      phone:    this.userForm.value.phone || undefined,
      role:     this.userForm.value.role,
      password: this.userForm.value.password,
    };
    this.userSvc.create(req).subscribe({
      next: res => {
        if (res.data) this.users = [res.data, ...this.users];
        this.formSaving = false;
        this.closeForm();
        this.snack('User created successfully', 'success');
      },
      error: () => { this.formSaving = false; this.snack('Failed to create user', 'error'); }
    });
  }

  submitResetPwd(): void {
    if (this.pwdForm.invalid || !this.editingUser) { this.pwdForm.markAllAsTouched(); return; }
    this.formSaving = true;
    this.userSvc.resetPassword(this.editingUser.id, this.pwdForm.value.newPassword).subscribe({
      next: () => {
        this.formSaving = false;
        this.closeForm();
        this.snack('Password reset successfully', 'success');
      },
      error: () => { this.formSaving = false; this.snack('Failed to reset password', 'error'); }
    });
  }

  // ── Activate / Deactivate ─────────────────────────────

  toggleActive(user: User): void {
    const obs = user.isActive
      ? this.userSvc.deactivate(user.id)
      : this.userSvc.activate(user.id);

    obs.subscribe({
      next: res => {
        if (res.data) {
          const idx = this.users.findIndex(u => u.id === user.id);
          if (idx >= 0) this.users[idx] = res.data;
          this.users = [...this.users];
        }
        this.snack(user.isActive ? 'User deactivated' : 'User activated', 'success');
      },
      error: () => this.snack('Action failed', 'error')
    });
  }

  // ── Helpers ───────────────────────────────────────────

  getRoleIcon(role: Role): string {
    return { ADMIN: 'admin_panel_settings', OFFICER: 'badge', AUDITOR: 'manage_search' }[role] ?? 'person';
  }

  getRoleColor(role: Role): string {
    return { ADMIN: '#c62828', OFFICER: '#1565c0', AUDITOR: '#6a1b9a' }[role] ?? '#546e7a';
  }

  fieldError(form: FormGroup, field: string): string {
    const c = form.get(field);
    if (!c || !c.touched || !c.errors) return '';
    if (c.errors['required'])  return 'Required';
    if (c.errors['email'])     return 'Invalid email';
    if (c.errors['minlength']) return `Min ${c.errors['minlength'].requiredLength} characters`;
    if (c.errors['pattern'])   return 'Lowercase letters, numbers and _ only';
    if (c.errors['mismatch'])  return 'Passwords do not match';
    return 'Invalid';
  }

  private snack(msg: string, type: 'success' | 'error'): void {
    this.snackBar.open(msg, '✕', {
      duration:   3500,
      panelClass: type === 'success' ? 'snack-success' : 'snack-error'
    });
  }
}