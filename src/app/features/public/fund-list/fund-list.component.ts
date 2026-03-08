import { Component, OnInit } from '@angular/core';
import { FundService }       from '../../../core/services/api.services';
import { LanguageService }   from '../../../core/services/language.service';
import { Fund, FundStatus, FundSource } from '../../../core/models/models';

@Component({
  standalone: false,
  selector:    'vp-fund-list',
  templateUrl: './fund-list.component.html',
  styleUrls:   ['./fund-list.component.scss']
})
export class FundListComponent implements OnInit {

  funds:         Fund[] = [];
  loading        = true;
  error          = false;
  currentLang    = 'en';

  page           = 0;
  pageSize       = 10;
  totalElements  = 0;
  totalPages     = 0;

  selectedStatus: FundStatus | '' = '';
  searchTerm      = '';

  readonly statuses: FundStatus[]  = ['PENDING', 'ACTIVE', 'CLOSED'];
  readonly sources:  FundSource[]  = ['CENTRAL_GOVT', 'STATE_GOVT', 'PANCHAYAT', 'OTHER'];

  // Summary totals computed from current page
  get totalAllocated(): number { return this.funds.reduce((s, f) => s + f.totalAmount,    0); }
  get totalReceived():  number { return this.funds.reduce((s, f) => s + f.amountReceived, 0); }
  get utilizationPct(): number {
    return this.totalAllocated > 0
      ? Math.round((this.totalReceived / this.totalAllocated) * 100) : 0;
  }

  constructor(
    private fundSvc: FundService,
    private langSvc: LanguageService
  ) {}

  ngOnInit(): void {
    this.langSvc.currentLang.subscribe(l => this.currentLang = l);
    this.load();
  }

  load(): void {
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

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages) return;
    this.page = p;
    this.load();
  }

  resetFilters(): void {
    this.selectedStatus = '';
    this.searchTerm     = '';
    this.page           = 0;
    this.load();
  }

  label(en?: string, hi?: string): string {
    return (this.currentLang === 'hi' && hi) ? hi : (en ?? '');
  }

  get filteredFunds(): Fund[] {
    let result = this.funds;
    if (this.selectedStatus) {
      result = result.filter(f => f.status === this.selectedStatus);
    }
    if (this.searchTerm.trim()) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(f =>
        f.schemeNameEn?.toLowerCase().includes(t) ||
        f.schemeNameHi?.toLowerCase().includes(t) ||
        f.referenceNumber?.toLowerCase().includes(t) ||
        f.financialYear?.toLowerCase().includes(t)
      );
    }
    return result;
  }

  utilizationForFund(f: Fund): number {
    return f.totalAmount > 0
      ? Math.round((f.amountReceived / f.totalAmount) * 100) : 0;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}