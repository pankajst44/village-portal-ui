import { Component, OnInit } from '@angular/core';
import { ContractorService } from '../../../core/services/api.services';
import { LanguageService }   from '../../../core/services/language.service';
import { Contractor, ContractorCategory } from '../../../core/models/models';

@Component({
  standalone: false,
  selector:    'vp-contractors',
  templateUrl: './contractors.component.html',
  styleUrls:   ['./contractors.component.scss']
})
export class ContractorsComponent implements OnInit {

  contractors:   Contractor[] = [];
  loading        = true;
  error          = false;
  currentLang    = 'en';

  page           = 0;
  pageSize       = 12;
  totalElements  = 0;
  totalPages     = 0;

  searchTerm         = '';
  selectedCategory:   ContractorCategory | '' = '';
  showBlacklisted     = false;

  readonly categories: ContractorCategory[] = [
    'CIVIL', 'ELECTRICAL', 'PLUMBING', 'CONSTRUCTION', 'SUPPLY', 'OTHER'
  ];

  constructor(
    private contractorSvc: ContractorService,
    private langSvc:       LanguageService
  ) {}

  ngOnInit(): void {
    this.langSvc.currentLang.subscribe(l => this.currentLang = l);
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error   = false;
    // Try public endpoint first, fall back to authenticated endpoint
    this.contractorSvc.getPublicContractors(this.page, this.pageSize).subscribe({
      next:  res => this.handleResponse(res),
      error: () => {
        this.contractorSvc.getAll(this.page, this.pageSize).subscribe({
          next:  res => this.handleResponse(res),
          error: ()  => { this.loading = false; this.error = true; }
        });
      }
    });
  }

  private handleResponse(res: any): void {
    this.contractors   = res.data?.content ?? [];
    this.totalElements = res.data?.totalElements ?? 0;
    this.totalPages    = res.data?.totalPages ?? 0;
    this.loading       = false;
  }

  resetFilters(): void {
    this.searchTerm       = '';
    this.selectedCategory = '';
    this.showBlacklisted  = false;
    this.page             = 0;
    this.load();
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages) return;
    this.page = p;
    this.load();
  }

  label(en?: string, hi?: string): string {
    return (this.currentLang === 'hi' && hi) ? hi : (en ?? '');
  }

  get filteredContractors(): Contractor[] {
    let result = this.contractors;

    if (!this.showBlacklisted) {
      result = result.filter(c => !c.isBlacklisted);
    }
    if (this.selectedCategory) {
      result = result.filter(c => c.category === this.selectedCategory);
    }
    if (this.searchTerm.trim()) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(c =>
        c.nameEn?.toLowerCase().includes(t) ||
        c.nameHi?.toLowerCase().includes(t) ||
        c.registrationNumber?.toLowerCase().includes(t) ||
        c.contactPerson?.toLowerCase().includes(t)
      );
    }
    return result;
  }

  get activeCount():      number { return this.contractors.filter(c => !c.isBlacklisted).length; }
  get blacklistedCount(): number { return this.contractors.filter(c =>  c.isBlacklisted).length; }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  getCategoryIcon(cat: ContractorCategory): string {
    const icons: Record<ContractorCategory, string> = {
      CIVIL:        'foundation',
      ELECTRICAL:   'electrical_services',
      PLUMBING:     'plumbing',
      CONSTRUCTION: 'construction',
      SUPPLY:       'local_shipping',
      OTHER:        'handyman'
    };
    return icons[cat] ?? 'engineering';
  }
}