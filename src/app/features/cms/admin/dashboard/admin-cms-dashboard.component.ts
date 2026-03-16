import { Component, OnInit }  from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar }         from '@angular/material/snack-bar';
import {
  AdminComplaintService,
  PublicComplaintService,
} from '../../services/cms.services';
import {
  ComplaintSummaryResponse, ComplaintDetailResponse,
  ComplaintStatus, ComplaintPriority, ComplaintStatsResponse,
  CategoryResponse,
} from '../../models/cms.models';
import { PageEvent } from '@angular/material/paginator';

@Component({
  standalone: false,
  selector: 'vp-admin-cms-dashboard',
  templateUrl: './admin-cms-dashboard.component.html',
  styleUrls: ['./admin-cms-dashboard.component.scss']
})
export class AdminCmsDashboardComponent implements OnInit {

  complaints:   ComplaintSummaryResponse[] = [];
  selected?:    ComplaintDetailResponse;
  stats?:       ComplaintStatsResponse;
  categories:   CategoryResponse[]         = [];
  loading       = false;
  total         = 0;
  page          = 0;
  pageSize      = 10;
  submitting    = false;
  activeAction: string | null = null;

  filterForm: FormGroup;
  rejectForm: FormGroup;
  assignForm: FormGroup;

  verifyNote       = '';
  escalateLevel    = 1;
  escalateNote     = '';
  selectedPriority?: ComplaintPriority;

  readonly statuses: { value: ComplaintStatus | ''; label: string }[] = [
    { value: '',            label: 'All'         },
    { value: 'SUBMITTED',   label: 'Submitted'   },
    { value: 'VERIFIED',    label: 'Verified'    },
    { value: 'ASSIGNED',    label: 'Assigned'    },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED',    label: 'Resolved'    },
    { value: 'REJECTED',    label: 'Rejected'    },
    { value: 'CLOSED',      label: 'Closed'      },
  ];
  readonly priorities: ComplaintPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  constructor(
    private fb:     FormBuilder,
    private svc:    AdminComplaintService,
    private pubSvc: PublicComplaintService,
    private snack:  MatSnackBar,
  ) {
    this.filterForm = this.fb.group({
      status:       [''],
      priority:     [''],
      categoryId:   [''],
      escalatedOnly:[false],
    });
    this.rejectForm = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(10)]],
    });
    this.assignForm = this.fb.group({
      officerId: [null, Validators.required],
      dueDate:   [null],
    });
  }

  ngOnInit(): void {
    this.load();
    this.loadStats();
    this.pubSvc.getCategories().subscribe(r => this.categories = r.data);

    ['status', 'priority', 'categoryId', 'escalatedOnly'].forEach(f => {
      this.filterForm.get(f)!.valueChanges.subscribe(() => {
        this.page = 0;
        this.load();
      });
    });
  }

  load(): void {
    this.loading = true;
    const f = this.filterForm.value;
    this.svc.listAll({
      status:        f.status      || undefined,
      priority:      f.priority    || undefined,
      categoryId:    f.categoryId  ? +f.categoryId : undefined,
      escalatedOnly: f.escalatedOnly || false,
      page:          this.page,
      size:          this.pageSize,
    }).subscribe({
      next: res => {
        this.complaints = res.data.content;
        this.total      = res.data.totalElements;
        this.loading    = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadStats(): void {
    this.svc.getStats().subscribe(r => this.stats = r.data);
  }

  selectComplaint(c: ComplaintSummaryResponse): void {
    this.pubSvc.getDetail(c.complaintNumber).subscribe(res => {
      this.selected     = res.data;
      this.activeAction = null;
      this.rejectForm.reset();
      this.assignForm.reset();
      this.verifyNote = '';
    });
  }

  // ── Actions ───────────────────────────────────────────

  verify(): void {
    if (!this.selected) return;
    this.submitting = true;
    this.svc.verify(this.selected.id, this.verifyNote || undefined).subscribe({
      next: res => {
        this.selected     = res.data;
        this.submitting   = false;
        this.activeAction = null;
        this.load();
        this.loadStats();
        this.snack.open('Complaint verified.', 'OK', { duration: 3000 });
      },
      error: err => {
        this.submitting = false;
        this.snack.open(err.error?.message ?? 'Failed to verify.', 'Dismiss', { duration: 4000 });
      }
    });
  }

  reject(): void {
    if (!this.selected || this.rejectForm.invalid) {
      this.rejectForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.svc.reject(this.selected.id, this.rejectForm.value).subscribe({
      next: res => {
        this.selected     = res.data;
        this.submitting   = false;
        this.activeAction = null;
        this.load();
        this.loadStats();
        this.snack.open('Complaint rejected.', 'OK', { duration: 3000 });
      },
      error: err => {
        this.submitting = false;
        this.snack.open(err.error?.message ?? 'Failed to reject.', 'Dismiss', { duration: 4000 });
      }
    });
  }

  assign(): void {
    if (!this.selected || this.assignForm.invalid) {
      this.assignForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const v   = this.assignForm.value;
    const req = {
      officerId: +v.officerId,
      dueDate:   v.dueDate
        ? (v.dueDate instanceof Date
            ? v.dueDate.toISOString().split('T')[0]
            : v.dueDate)
        : undefined,
    };
    this.svc.assign(this.selected.id, req).subscribe({
      next: res => {
        this.selected     = res.data;
        this.submitting   = false;
        this.activeAction = null;
        this.load();
        this.loadStats();
        this.snack.open('Complaint assigned.', 'OK', { duration: 3000 });
      },
      error: err => {
        this.submitting = false;
        this.snack.open(err.error?.message ?? 'Failed to assign.', 'Dismiss', { duration: 4000 });
      }
    });
  }

  escalate(): void {
    if (!this.selected) return;
    this.submitting = true;
    this.svc.escalate(this.selected.id, this.escalateLevel, this.escalateNote || undefined)
      .subscribe({
        next: res => {
          this.selected     = res.data;
          this.submitting   = false;
          this.activeAction = null;
          this.snack.open('Complaint escalated.', 'OK', { duration: 3000 });
        },
        error: err => {
          this.submitting = false;
          this.snack.open(err.error?.message ?? 'Failed to escalate.', 'Dismiss', { duration: 4000 });
        }
      });
  }

  changePriority(): void {
    if (!this.selected || !this.selectedPriority) return;
    this.svc.changePriority(this.selected.id, this.selectedPriority).subscribe({
      next: res => {
        this.selected     = res.data;
        this.activeAction = null;
        this.snack.open('Priority updated.', 'OK', { duration: 3000 });
      },
      error: err => this.snack.open(err.error?.message ?? 'Failed.', 'Dismiss', { duration: 4000 })
    });
  }

  toggleVisibility(): void {
    if (!this.selected) return;
    this.svc.toggleVisibility(this.selected.id).subscribe({
      next: res => {
        this.selected = res.data;
        this.snack.open('Visibility toggled.', 'OK', { duration: 3000 });
      },
      error: err => this.snack.open(err.error?.message ?? 'Failed.', 'Dismiss', { duration: 4000 })
    });
  }

  onPage(e: PageEvent): void {
    this.page     = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  // ── Guards ─────────────────────────────────────────────
  canVerify():  boolean { return this.selected?.status === 'SUBMITTED'; }
  canReject():  boolean { return !!this.selected && this.selected.status !== 'CLOSED'; }
  canAssign():  boolean { return this.selected?.status === 'VERIFIED'; }

  isPublic(): boolean {
    return this.selected?.isPublic !== false;
  }
}
