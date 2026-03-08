import { Component, OnInit } from '@angular/core';
import { ExpenditureService } from '../../../core/services/api.services';
import { ProjectService }     from '../../../core/services/project.service';
import { LanguageService }    from '../../../core/services/language.service';
import { Expenditure, Project, PaymentMode } from '../../../core/models/models';

@Component({
  standalone: false,
  selector:    'vp-spending',
  templateUrl: './spending.component.html',
  styleUrls:   ['./spending.component.scss']
})
export class SpendingComponent implements OnInit {

  // Projects list for selection
  projects:      Project[]     = [];
  projectsLoading = true;

  // Selected project
  selectedProject: Project | null = null;

  // Expenditures for selected project
  expenditures:  Expenditure[] = [];
  loading        = false;
  error          = false;
  currentLang    = 'en';

  page           = 0;
  pageSize       = 15;
  totalElements  = 0;
  totalPages     = 0;

  searchTerm        = '';
  selectedMode: PaymentMode | '' = '';

  readonly paymentModes: PaymentMode[] = ['BANK_TRANSFER', 'CHEQUE', 'CASH', 'UPI', 'OTHER'];

  get totalAmount():  number { return this.expenditures.reduce((s, e) => s + e.amount, 0); }
  get verifiedCount():number { return this.expenditures.filter(e =>  e.isVerified).length; }
  get pendingCount(): number { return this.expenditures.filter(e => !e.isVerified).length; }

  constructor(
    private expenditureSvc: ExpenditureService,
    private projectSvc:     ProjectService,
    private langSvc:        LanguageService
  ) {}

  ngOnInit(): void {
    this.langSvc.currentLang.subscribe(l => this.currentLang = l);
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectsLoading = true;
    this.projectSvc.getPublicProjects(0, 100).subscribe({
      next: res => {
        this.projects        = res.data?.content ?? [];
        this.projectsLoading = false;
      },
      error: () => { this.projectsLoading = false; }
    });
  }

  selectProject(project: Project): void {
    this.selectedProject = project;
    this.page            = 0;
    this.searchTerm      = '';
    this.selectedMode    = '';
    this.loadExpenditures();
  }

  loadExpenditures(): void {
    if (!this.selectedProject) return;
    this.loading = true;
    this.error   = false;
    this.expenditureSvc.getByProject(this.selectedProject.id, this.page, this.pageSize).subscribe({
      next: res => {
        this.expenditures  = res.data?.content ?? [];
        this.totalElements = res.data?.totalElements ?? 0;
        this.totalPages    = res.data?.totalPages ?? 0;
        this.loading       = false;
      },
      error: () => { this.loading = false; this.error = true; }
    });
  }

  clearProject(): void {
    this.selectedProject = null;
    this.expenditures    = [];
    this.totalElements   = 0;
    this.totalPages      = 0;
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages) return;
    this.page = p;
    this.loadExpenditures();
  }

  label(en?: string, hi?: string): string {
    return (this.currentLang === 'hi' && hi) ? hi : (en ?? '');
  }

  get filteredExpenditures(): Expenditure[] {
    let result = this.expenditures;
    if (this.selectedMode) {
      result = result.filter(e => e.paymentMode === this.selectedMode);
    }
    if (this.searchTerm.trim()) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(e =>
        e.voucherNumber?.toLowerCase().includes(t) ||
        e.contractorNameEn?.toLowerCase().includes(t) ||
        e.descriptionEn?.toLowerCase().includes(t)
      );
    }
    return result;
  }

  getModeIcon(mode: PaymentMode): string {
    const icons: Record<PaymentMode, string> = {
      BANK_TRANSFER: 'account_balance',
      CHEQUE:        'receipt_long',
      CASH:          'payments',
      UPI:           'smartphone',
      OTHER:         'credit_card'
    };
    return icons[mode] ?? 'payments';
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}