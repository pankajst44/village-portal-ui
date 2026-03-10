import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FundService } from '../../../core/services/api.services';
import { Fund, FundSource, FundStatus } from '../../../core/models/models';

@Component({
  standalone: false,
  selector:    'vp-fund-management',
  templateUrl: './fund-management.component.html',
  styleUrls:   ['./fund-management.component.scss']
})
export class FundManagementComponent implements OnInit {

  funds:         Fund[] = [];
  loading        = true;
  saving         = false;
  error          = false;

  // List state
  searchTerm     = '';
  statusFilter:  FundStatus | '' = '';
  page           = 0;
  pageSize       = 20;
  totalElements  = 0;
  totalPages     = 0;

  // Panel state
  panelOpen      = false;
  editingFund:   Fund | null = null;
  deleteTarget:  Fund | null = null;
  confirmDelete  = false;

  // Form
  form: FormGroup;

  readonly fundSources: FundSource[] = ['CENTRAL_GOVT', 'STATE_GOVT', 'PANCHAYAT', 'OTHER'];
  readonly fundStatuses: FundStatus[] = ['PENDING', 'ACTIVE', 'CLOSED'];

  readonly sourceLabels: Record<string, string> = {
    CENTRAL_GOVT: 'Central Govt', STATE_GOVT: 'State Govt',
    PANCHAYAT: 'Panchayat', OTHER: 'Other'
  };

  readonly displayedColumns = ['scheme', 'source', 'fy', 'totalAmount', 'amountReceived', 'status', 'actions'];

  constructor(
    private fb:       FormBuilder,
    private fundSvc:  FundService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      schemeNameEn:    ['', [Validators.required, Validators.maxLength(200)]],
      schemeNameHi:    ['', Validators.maxLength(200)],
      fundSource:      ['', Validators.required],
      totalAmount:     ['', [Validators.required, Validators.min(0.01)]],
      amountReceived:  [0,  [Validators.required, Validators.min(0)]],
      financialYear:   ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}$/)]],
      releaseDate:     [''],
      referenceNumber: ['', Validators.maxLength(100)],
      status:          ['PENDING', Validators.required],
      descriptionEn:   [''],
      descriptionHi:   [''],
    });
  }

  ngOnInit(): void { this.loadFunds(); }

  loadFunds(): void {
    this.loading = true;
    this.error   = false;
    this.fundSvc.getAllFunds(this.page, this.pageSize).subscribe({
      next: res => {
        this.funds         = res.data?.content ?? [];
        this.totalElements = res.data?.totalElements ?? 0;
        this.totalPages    = res.data?.totalPages ?? 0;
        this.loading       = false;
      },
      error: () => { this.loading = false; this.error = true; }
    });
  }

  // ── Panel ──────────────────────────────────────────────

  openCreate(): void {
    this.editingFund = null;
    this.form.reset({ amountReceived: 0, status: 'PENDING' });
    this.panelOpen = true;
  }

  openEdit(fund: Fund): void {
    this.editingFund = fund;
    this.form.patchValue({
      schemeNameEn:    fund.schemeNameEn,
      schemeNameHi:    fund.schemeNameHi ?? '',
      fundSource:      fund.fundSource,
      totalAmount:     fund.totalAmount,
      amountReceived:  fund.amountReceived,
      financialYear:   fund.financialYear,
      releaseDate:     fund.releaseDate ?? '',
      referenceNumber: fund.referenceNumber ?? '',
      status:          fund.status,
      descriptionEn:   fund.descriptionEn ?? '',
      descriptionHi:   fund.descriptionHi ?? '',
    });
    this.panelOpen = true;
  }

  closePanel(): void {
    this.panelOpen    = false;
    this.editingFund  = null;
  }

  // ── Save ───────────────────────────────────────────────

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;

    const raw = this.form.value;
    const payload = {
      ...raw,
      totalAmount:    +raw.totalAmount,
      amountReceived: +raw.amountReceived,
      releaseDate:    raw.releaseDate || null,
    };

    const req$ = this.editingFund
      ? this.fundSvc.updateFund(this.editingFund.id, payload)
      : this.fundSvc.createFund(payload);

    req$.subscribe({
      next: res => {
        this.saving = false;
        this.snackBar.open(
          this.editingFund ? 'Fund updated successfully' : 'Fund created successfully',
          'Close', { duration: 3000, panelClass: 'snack-success' }
        );
        this.closePanel();
        this.loadFunds();
      },
      error: err => {
        this.saving = false;
        const msg = err?.error?.message ?? 'Failed to save fund';
        this.snackBar.open(msg, 'Close', { duration: 4000, panelClass: 'snack-error' });
      }
    });
  }

  // ── Delete ─────────────────────────────────────────────

  promptDelete(fund: Fund): void {
    this.deleteTarget  = fund;
    this.confirmDelete = true;
  }

  cancelDelete(): void {
    this.deleteTarget  = null;
    this.confirmDelete = false;
  }

  confirmDeletion(): void {
    if (!this.deleteTarget) return;
    this.fundSvc.deleteFund(this.deleteTarget.id).subscribe({
      next: () => {
        this.snackBar.open('Fund deleted', 'Close', { duration: 3000, panelClass: 'snack-success' });
        this.cancelDelete();
        this.loadFunds();
      },
      error: err => {
        const msg = err?.error?.message ?? 'Failed to delete fund';
        this.snackBar.open(msg, 'Close', { duration: 4000, panelClass: 'snack-error' });
        this.cancelDelete();
      }
    });
  }

  // ── Helpers ────────────────────────────────────────────

  get filtered(): Fund[] {
    const t = this.searchTerm.toLowerCase();
    return this.funds.filter(f => {
      const matchSearch = !t
        || f.schemeNameEn?.toLowerCase().includes(t)
        || f.referenceNumber?.toLowerCase().includes(t)
        || f.financialYear?.includes(t);
      const matchStatus = !this.statusFilter || f.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  countByStatus(s: FundStatus): number { return this.funds.filter(f => f.status === s).length; }

  getStatusColor(s: FundStatus): string {
    return s === 'ACTIVE' ? '#2e7d32' : s === 'PENDING' ? '#f57f17' : '#546e7a';
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages) return;
    this.page = p;
    this.loadFunds();
  }

  // Form field helpers
  fe(name: string) { return this.form.get(name); }
  hasError(name: string, err: string) { const c = this.fe(name); return c?.hasError(err) && c.touched; }
}