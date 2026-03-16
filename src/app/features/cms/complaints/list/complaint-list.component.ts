import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup }       from '@angular/forms';
import { PageEvent }                    from '@angular/material/paginator';
import { Subject }                      from 'rxjs';
import { debounceTime, takeUntil }      from 'rxjs/operators';
import { PublicComplaintService }       from '../../services/cms.services';
import {
  ComplaintSummaryResponse, CategoryResponse,
  ComplaintStatus, ComplaintPriority
} from '../../models/cms.models';
import { PageResponse } from '../../../../core/models/models';

@Component({
  standalone: false,
  selector: 'vp-complaint-list',
  templateUrl: './complaint-list.component.html',
  styleUrls: ['./complaint-list.component.scss']
})
export class ComplaintListComponent implements OnInit, OnDestroy {

  complaints: ComplaintSummaryResponse[] = [];
  categories: CategoryResponse[]         = [];
  loading   = false;
  total     = 0;
  page      = 0;
  pageSize  = 10;

  filterForm: FormGroup;

  readonly statuses: { value: ComplaintStatus | ''; label: string }[] = [
    { value: '',            label: 'All Statuses' },
    { value: 'SUBMITTED',   label: 'Submitted' },
    { value: 'VERIFIED',    label: 'Verified' },
    { value: 'ASSIGNED',    label: 'Assigned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED',    label: 'Resolved' },
    { value: 'CLOSED',      label: 'Closed' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb:      FormBuilder,
    private service: PublicComplaintService
  ) {
    this.filterForm = this.fb.group({
      search:     [''],
      status:     [''],
      categoryId: [''],
      wardNumber: [''],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadComplaints();

    // Re-fetch on filter changes with debounce for search
    this.filterForm.get('search')!.valueChanges.pipe(
      debounceTime(400), takeUntil(this.destroy$)
    ).subscribe(() => { this.page = 0; this.loadComplaints(); });

    ['status', 'categoryId', 'wardNumber'].forEach(field => {
      this.filterForm.get(field)!.valueChanges.pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => { this.page = 0; this.loadComplaints(); });
    });
  }

  loadComplaints(): void {
    this.loading = true;
    const f = this.filterForm.value;
    this.service.list({
      search:     f.search    || undefined,
      status:     f.status    || undefined,
      categoryId: f.categoryId ? +f.categoryId : undefined,
      wardNumber: f.wardNumber ? +f.wardNumber : undefined,
      page:       this.page,
      size:       this.pageSize,
    }).subscribe({
      next: res => {
        const data = res.data as PageResponse<ComplaintSummaryResponse>;
        this.complaints = data.content;
        this.total      = data.totalElements;
        this.loading    = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadCategories(): void {
    this.service.getCategories().subscribe(res => this.categories = res.data);
  }

  onPage(e: PageEvent): void {
    this.page     = e.pageIndex;
    this.pageSize = e.pageSize;
    this.loadComplaints();
  }

  clearFilters(): void {
    this.filterForm.reset({ search: '', status: '', categoryId: '', wardNumber: '' });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
