import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { ExpenditureService } from '../../../core/services/api.services';
import { ProjectService }     from '../../../core/services/project.service';
import { ContractorService }  from '../../../core/services/api.services';
import {
  Expenditure, PaymentMode, Project, Contractor, CreateExpenditureRequest
} from '../../../core/models/models';

@Component({
  standalone: false,
  selector:    'vp-spending-entry',
  templateUrl: './spending-entry.component.html',
  styleUrls:   ['./spending-entry.component.scss']
})
export class SpendingEntryComponent implements OnInit {

  expenditures: Expenditure[] = [];
  projects:     Project[]     = [];
  contractors:  Contractor[]  = [];

  loading       = true;
  saving        = false;
  error         = false;

  // Pagination
  page          = 0;
  pageSize      = 20;
  totalElements = 0;
  totalPages    = 0;

  // Filters
  selectedProjectId: number | '' = '';
  verifiedFilter:    'all' | 'pending' | 'verified' = 'all';

  // Panel
  panelOpen = false;

  form: FormGroup;

  readonly paymentModes: PaymentMode[] = ['BANK_TRANSFER','CHEQUE','CASH','UPI','OTHER'];

  readonly paymentModeIcons: Record<string, string> = {
    BANK_TRANSFER: 'account_balance', CHEQUE: 'description',
    CASH: 'payments', UPI: 'smartphone', OTHER: 'more_horiz'
  };

  readonly displayedColumns = ['voucher','project','contractor','amount','paymentDate','mode','status','actions'];

  constructor(
    private fb:             FormBuilder,
    private expenditureSvc: ExpenditureService,
    private projectSvc:     ProjectService,
    private contractorSvc:  ContractorService,
    private snackBar:       MatSnackBar
  ) {
    this.form = this.fb.group({
      projectId:        ['', Validators.required],
      contractorId:     [null],
      amount:           ['', [Validators.required, Validators.min(0.01)]],
      paymentDate:      ['', Validators.required],
      paymentMode:      ['', Validators.required],
      financialYear:    ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}$/)]],
      voucherNumber:    ['', Validators.maxLength(100)],
      paymentReference: ['', Validators.maxLength(100)],
      descriptionEn:    [''],
      descriptionHi:    [''],
    });
  }

  ngOnInit(): void {
    // Auto-fill current financial year
    const now = new Date();
    const yr  = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    const fy  = `${yr}-${String(yr + 1).slice(-2)}`;
    this.form.patchValue({ financialYear: fy });

    forkJoin({
      projects:    this.projectSvc.getAllProjects(0, 200),
      contractors: this.contractorSvc.getAll(0, 200),
    }).subscribe({
      next: ({ projects, contractors }) => {
        this.projects    = projects.data?.content ?? [];
        this.contractors = (contractors.data?.content ?? []).filter(c => !c.isBlacklisted);
        this.loadExpenditures();
      },
      error: () => this.loadExpenditures()
    });
  }

  loadExpenditures(): void {
    if (!this.selectedProjectId) {
      // Load from first project or show empty
      if (this.projects.length > 0) {
        this.selectedProjectId = this.projects[0].id;
      } else {
        this.loading = false;
        return;
      }
    }
    this.loading = true;
    this.error   = false;
    this.expenditureSvc.getByProject(+this.selectedProjectId, this.page, this.pageSize).subscribe({
      next: res => {
        this.expenditures  = res.data?.content ?? [];
        this.totalElements = res.data?.totalElements ?? 0;
        this.totalPages    = res.data?.totalPages ?? 0;
        this.loading       = false;
      },
      error: () => { this.loading = false; this.error = true; }
    });
  }

  onProjectChange(): void {
    this.page = 0;
    this.loadExpenditures();
  }

  openCreate(): void {
    const now = new Date();
    const yr  = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    const fy  = `${yr}-${String(yr + 1).slice(-2)}`;
    this.form.reset({
      projectId:     this.selectedProjectId || '',
      financialYear: fy,
      paymentDate:   new Date().toISOString().split('T')[0],
    });
    this.panelOpen = true;
  }

  closePanel(): void { this.panelOpen = false; }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const raw = this.form.value;
    const payload: CreateExpenditureRequest = {
      projectId:        +raw.projectId,
      amount:           +raw.amount,
      paymentDate:      raw.paymentDate,
      paymentMode:      raw.paymentMode,
      financialYear:    raw.financialYear,
      contractorId:     raw.contractorId ? +raw.contractorId : undefined,
      voucherNumber:    raw.voucherNumber    || undefined,
      paymentReference: raw.paymentReference || undefined,
      descriptionEn:    raw.descriptionEn    || undefined,
      descriptionHi:    raw.descriptionHi    || undefined,
    };
    this.expenditureSvc.create(payload).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Expenditure recorded successfully', 'Close',
          { duration: 3000, panelClass: 'snack-success' });
        this.selectedProjectId = payload.projectId;
        this.closePanel();
        this.loadExpenditures();
      },
      error: err => {
        this.saving = false;
        this.snackBar.open(err?.error?.message ?? 'Failed to record expenditure',
          'Close', { duration: 4000, panelClass: 'snack-error' });
      }
    });
  }

  get filtered(): Expenditure[] {
    return this.expenditures.filter(e => {
      if (this.verifiedFilter === 'pending')  return !e.isVerified;
      if (this.verifiedFilter === 'verified') return  e.isVerified;
      return true;
    });
  }

  get totalAmount(): number {
    return this.filtered.reduce((s, e) => s + (e.amount ?? 0), 0);
  }
  get verifiedCount():  number { return this.expenditures.filter(e =>  e.isVerified).length; }
  get pendingCount():   number { return this.expenditures.filter(e => !e.isVerified).length; }

  getProjectName(id: number): string {
    return this.projects.find(p => p.id === id)?.nameEn ?? '—';
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages) return;
    this.page = p;
    this.loadExpenditures();
  }

  fe(name: string)                    { return this.form.get(name); }
  hasError(name: string, err: string) { const c = this.fe(name); return c?.hasError(err) && c.touched; }
}