import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContractorService } from '../../../core/services/api.services';
import { Contractor, ContractorCategory } from '../../../core/models/models';

type PanelMode = 'create' | 'edit' | 'blacklist';

@Component({
  standalone: false,
  selector:    'vp-contractor-management',
  templateUrl: './contractor-management.component.html',
  styleUrls:   ['./contractor-management.component.scss']
})
export class ContractorManagementComponent implements OnInit {

  contractors:  Contractor[] = [];
  loading       = true;
  saving        = false;
  error         = false;

  // Pagination
  page          = 0;
  pageSize      = 20;
  totalElements = 0;
  totalPages    = 0;

  // Filters
  searchTerm       = '';
  categoryFilter:  ContractorCategory | '' = '';
  showBlacklisted  = true;

  // Panel
  panelOpen    = false;
  panelMode:   PanelMode = 'create';
  editingContractor: Contractor | null = null;
  deleteTarget:      Contractor | null = null;
  confirmDelete      = false;

  // Forms
  form:          FormGroup;
  blacklistForm: FormGroup;

  readonly categories: ContractorCategory[] = ['CIVIL','ELECTRICAL','PLUMBING','CONSTRUCTION','SUPPLY','OTHER'];

  readonly categoryIcons: Record<string, string> = {
    CIVIL:'foundation', ELECTRICAL:'bolt', PLUMBING:'plumbing',
    CONSTRUCTION:'construction', SUPPLY:'inventory_2', OTHER:'category'
  };

  readonly categoryColors: Record<string, string> = {
    CIVIL:'#1565c0', ELECTRICAL:'#f57f17', PLUMBING:'#00695c',
    CONSTRUCTION:'#4e342e', SUPPLY:'#6a1b9a', OTHER:'#546e7a'
  };

  readonly displayedColumns = ['contractor','category','contact','registration','status','actions'];

  constructor(
    private fb:             FormBuilder,
    private contractorSvc:  ContractorService,
    private snackBar:       MatSnackBar
  ) {
    this.form = this.fb.group({
      nameEn:             ['', [Validators.required, Validators.maxLength(200)]],
      nameHi:             ['', Validators.maxLength(200)],
      registrationNumber: ['', [Validators.required, Validators.maxLength(100)]],
      category:           ['', Validators.required],
      contactPerson:      ['', Validators.maxLength(100)],
      phone:              ['', Validators.pattern(/^[6-9]\d{9}$/)],
      email:              ['', [Validators.email, Validators.maxLength(100)]],
      panNumber:          ['', Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)],
      gstNumber:          ['', Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)],
      addressEn:          [''],
      addressHi:          [''],
    });

    this.blacklistForm = this.fb.group({
      reason: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void { this.loadContractors(); }

  loadContractors(): void {
    this.loading = true;
    this.error   = false;
    this.contractorSvc.getAll(this.page, this.pageSize).subscribe({
      next: res => {
        this.contractors   = res.data?.content ?? [];
        this.totalElements = res.data?.totalElements ?? 0;
        this.totalPages    = res.data?.totalPages ?? 0;
        this.loading       = false;
      },
      error: () => { this.loading = false; this.error = true; }
    });
  }

  // ── Panel open ─────────────────────────────────────────

  openCreate(): void {
    this.editingContractor = null;
    this.panelMode         = 'create';
    this.form.reset();
    this.panelOpen = true;
  }

  openEdit(c: Contractor): void {
    this.editingContractor = c;
    this.panelMode         = 'edit';
    this.form.patchValue({
      nameEn:             c.nameEn,
      nameHi:             c.nameHi             ?? '',
      registrationNumber: c.registrationNumber,
      category:           c.category,
      contactPerson:      c.contactPerson       ?? '',
      phone:              c.phone              ?? '',
      email:              c.email              ?? '',
      panNumber:          c.panNumber          ?? '',
      gstNumber:          c.gstNumber          ?? '',
      addressEn:          c.addressEn          ?? '',
      addressHi:          c.addressHi          ?? '',
    });
    this.panelOpen = true;
  }

  openBlacklist(c: Contractor): void {
    this.editingContractor = c;
    this.panelMode         = 'blacklist';
    this.blacklistForm.reset();
    this.panelOpen = true;
  }

  closePanel(): void {
    this.panelOpen         = false;
    this.editingContractor = null;
  }

  // ── Save create / edit ────────────────────────────────

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;

    const payload = { ...this.form.value };
    // Remove empty optional strings
    ['nameHi','panNumber','gstNumber','phone','email','contactPerson','addressEn','addressHi']
      .forEach(k => { if (!payload[k]) delete payload[k]; });

    const req$ = this.editingContractor
      ? this.contractorSvc.update(this.editingContractor.id, payload)
      : this.contractorSvc.create(payload);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open(
          this.editingContractor ? 'Contractor updated' : 'Contractor registered',
          'Close', { duration: 3000, panelClass: 'snack-success' }
        );
        this.closePanel();
        this.loadContractors();
      },
      error: err => {
        this.saving = false;
        this.snackBar.open(err?.error?.message ?? 'Failed to save contractor',
          'Close', { duration: 4000, panelClass: 'snack-error' });
      }
    });
  }

  // ── Blacklist ─────────────────────────────────────────

  submitBlacklist(): void {
    if (this.blacklistForm.invalid || !this.editingContractor) {
      this.blacklistForm.markAllAsTouched(); return;
    }
    this.saving = true;
    this.contractorSvc.blacklist(this.editingContractor.id, this.blacklistForm.value.reason)
      .subscribe({
        next: () => {
          this.saving = false;
          this.snackBar.open('Contractor blacklisted', 'Close',
            { duration: 3000, panelClass: 'snack-success' });
          this.closePanel();
          this.loadContractors();
        },
        error: err => {
          this.saving = false;
          this.snackBar.open(err?.error?.message ?? 'Failed to blacklist',
            'Close', { duration: 4000, panelClass: 'snack-error' });
        }
      });
  }

  removeBlacklist(c: Contractor): void {
    this.contractorSvc.removeFromBlacklist(c.id).subscribe({
      next: () => {
        this.snackBar.open('Contractor removed from blacklist', 'Close',
          { duration: 3000, panelClass: 'snack-success' });
        this.loadContractors();
      },
      error: err => this.snackBar.open(err?.error?.message ?? 'Failed',
        'Close', { duration: 4000, panelClass: 'snack-error' })
    });
  }

  // ── Delete ────────────────────────────────────────────

  promptDelete(c: Contractor): void {
    this.deleteTarget  = c;
    this.confirmDelete = true;
  }

  cancelDelete(): void {
    this.deleteTarget  = null;
    this.confirmDelete = false;
  }

  confirmDeletion(): void {
    if (!this.deleteTarget) return;
    this.contractorSvc.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.snackBar.open('Contractor deleted', 'Close',
          { duration: 3000, panelClass: 'snack-success' });
        this.cancelDelete();
        this.loadContractors();
      },
      error: err => {
        this.snackBar.open(err?.error?.message ?? 'Failed to delete',
          'Close', { duration: 4000, panelClass: 'snack-error' });
        this.cancelDelete();
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────

  get filtered(): Contractor[] {
    const t = this.searchTerm.toLowerCase();
    return this.contractors.filter(c => {
      const matchSearch = !t
        || c.nameEn?.toLowerCase().includes(t)
        || c.registrationNumber?.toLowerCase().includes(t)
        || c.contactPerson?.toLowerCase().includes(t)
        || c.phone?.includes(t)
        || c.email?.toLowerCase().includes(t);
      const matchCat  = !this.categoryFilter || c.category === this.categoryFilter;
      const matchBl   = this.showBlacklisted  || !c.isBlacklisted;
      return matchSearch && matchCat && matchBl;
    });
  }

  countByCategory(cat: ContractorCategory): number {
    return this.contractors.filter(c => c.category === cat).length;
  }
  get activeCount():      number { return this.contractors.filter(c => !c.isBlacklisted).length; }
  get blacklistedCount(): number { return this.contractors.filter(c =>  c.isBlacklisted).length; }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages) return;
    this.page = p;
    this.loadContractors();
  }

  fe(f: FormGroup, name: string)                    { return f.get(name); }
  hasError(f: FormGroup, name: string, err: string) {
    const c = f.get(name); return c?.hasError(err) && c.touched;
  }
}