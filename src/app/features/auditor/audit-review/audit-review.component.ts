import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExpenditureService } from '../../../core/services/api.services';
import { ProjectService }     from '../../../core/services/project.service';
import { Expenditure, Project } from '../../../core/models/models';

@Component({
  standalone: false,
  selector:    'vp-audit-review',
  templateUrl: './audit-review.component.html',
  styleUrls:   ['./audit-review.component.scss']
})
export class AuditReviewComponent implements OnInit {

  pendingExpenditures: Expenditure[] = [];
  allExpenditures:     Expenditure[] = [];
  projects:            Project[]     = [];

  loading       = true;
  error         = false;
  verifyingId:  number | null = null;

  // Pagination for project history
  page          = 0;
  pageSize      = 20;
  totalElements = 0;
  totalPages    = 0;

  // Filters / mode
  activeTab: 'pending' | 'history' = 'pending';
  selectedProjectId: number | '' = '';

  // Detail drawer
  selectedExp: Expenditure | null = null;

  readonly paymentModeIcons: Record<string, string> = {
    BANK_TRANSFER: 'account_balance', CHEQUE: 'description',
    CASH: 'payments', UPI: 'smartphone', OTHER: 'more_horiz'
  };

  readonly pendingColumns  = ['voucher','project','contractor','amount','paymentDate','mode','recordedBy','actions'];
  readonly historyColumns  = ['voucher','project','contractor','amount','paymentDate','mode','status','verifiedBy'];

  constructor(
    private expenditureSvc: ExpenditureService,
    private projectSvc:     ProjectService,
    private snackBar:       MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPending();
    this.projectSvc.getAllProjects(0, 200).subscribe({
      next: res => this.projects = res.data?.content ?? []
    });
  }

  loadPending(): void {
    this.loading = true;
    this.error   = false;
    this.expenditureSvc.getPendingVerifications().subscribe({
      next: res => {
        this.pendingExpenditures = res.data ?? [];
        this.loading = false;
      },
      error: () => { this.loading = false; this.error = true; }
    });
  }

  loadProjectHistory(): void {
    if (!this.selectedProjectId) return;
    this.loading = true;
    this.error   = false;
    this.expenditureSvc.getByProject(+this.selectedProjectId, this.page, this.pageSize).subscribe({
      next: res => {
        this.allExpenditures = res.data?.content ?? [];
        this.totalElements   = res.data?.totalElements ?? 0;
        this.totalPages      = res.data?.totalPages ?? 0;
        this.loading         = false;
      },
      error: () => { this.loading = false; this.error = true; }
    });
  }

  onTabChange(tab: 'pending' | 'history'): void {
    this.activeTab    = tab;
    this.selectedExp  = null;
    if (tab === 'pending') { this.loadPending(); }
    else if (this.selectedProjectId) { this.loadProjectHistory(); }
    else { this.allExpenditures = []; this.loading = false; }
  }

  onProjectChange(): void {
    this.page = 0;
    this.loadProjectHistory();
  }

  verify(exp: Expenditure): void {
    this.verifyingId = exp.id;
    this.expenditureSvc.verify(exp.id).subscribe({
      next: res => {
        this.verifyingId = null;
        this.snackBar.open('Expenditure verified successfully', 'Close',
          { duration: 3000, panelClass: 'snack-success' });
        // Update in-place
        const updated = res.data!;
        this.pendingExpenditures = this.pendingExpenditures.filter(e => e.id !== exp.id);
        if (this.selectedExp?.id === exp.id) this.selectedExp = updated;
        if (this.activeTab === 'history') this.loadProjectHistory();
      },
      error: err => {
        this.verifyingId = null;
        this.snackBar.open(err?.error?.message ?? 'Verification failed',
          'Close', { duration: 4000, panelClass: 'snack-error' });
      }
    });
  }

  selectExp(exp: Expenditure): void {
    this.selectedExp = this.selectedExp?.id === exp.id ? null : exp;
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages) return;
    this.page = p;
    this.loadProjectHistory();
  }

  get totalPendingAmount(): number {
    return this.pendingExpenditures.reduce((s, e) => s + (e.amount ?? 0), 0);
  }
}