import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ProjectService }    from '../../../core/services/project.service';
import { ExpenditureService, FundService } from '../../../core/services/api.services';
import { LanguageService }   from '../../../core/services/language.service';
import { Project, ProjectStatus, ProjectType, Expenditure, Fund } from '../../../core/models/models';

export interface BarItem  { label: string; value: number; max: number; color: string; value2?: number; color2?: string; }
export interface DonutSlice { label: string; value: number; color: string; pct: number; offset: number; }

@Component({
  standalone: false,
  selector:    'vp-reports',
  templateUrl: './reports.component.html',
  styleUrls:   ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  loading   = true;
  error     = false;
  currentLang = 'en';

  allProjects: Project[]     = [];
  allFunds:    Fund[]        = [];
  pendingExp:  Expenditure[] = [];

  // Filter
  selectedType:   ProjectType   | '' = '';
  selectedStatus: ProjectStatus | '' = '';

  readonly projectTypes:    ProjectType[]   = ['ROAD','WATER','SANITATION','SCHOOL','ELECTRICITY','HEALTH','OTHER'];
  readonly projectStatuses: ProjectStatus[] = ['PLANNED','ONGOING','COMPLETED','ON_HOLD','CANCELLED'];

  // Chart data
  typeBars:    BarItem[]    = [];
  statusSlices: DonutSlice[] = [];
  verifyBars:  BarItem[]    = [];
  fundBars:    BarItem[]    = [];

  constructor(
    private projectSvc:     ProjectService,
    private expenditureSvc: ExpenditureService,
    private fundSvc:        FundService,
    private langSvc:        LanguageService
  ) {}

  ngOnInit(): void {
    this.langSvc.currentLang.subscribe(l => this.currentLang = l);
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.error   = false;
    forkJoin({
      projects: this.projectSvc.getAllProjects(0, 200),
      funds:    this.fundSvc.getAllFunds(0, 100),
      pending:  this.expenditureSvc.getPendingVerifications()
    }).subscribe({
      next: ({ projects, funds, pending }) => {
        this.allProjects = projects.data?.content ?? [];
        this.allFunds    = funds.data?.content ?? [];
        this.pendingExp  = (pending.data as unknown as Expenditure[]) ?? [];
        this.buildCharts();
        this.loading = false;
      },
      error: () => { this.loading = false; this.error = true; }
    });
  }

  private buildCharts(): void {
    // 1. Budget by project type (grouped bar: allocated vs spent)
    const typeMap: Record<string, { alloc: number; spent: number }> = {};
    for (const p of this.allProjects) {
      if (!typeMap[p.projectType]) typeMap[p.projectType] = { alloc: 0, spent: 0 };
      typeMap[p.projectType].alloc += p.allocatedBudget;
      typeMap[p.projectType].spent += p.totalSpent;
    }
    const maxAlloc = Math.max(...Object.values(typeMap).map(v => v.alloc), 1);
    this.typeBars = Object.entries(typeMap).map(([t, v]) => ({
      label: t, value: v.alloc, value2: v.spent, max: maxAlloc,
      color: '#90caf9', color2: '#ef9a9a'
    }));

    // 2. Status donut
    const statusColors: Partial<Record<ProjectStatus, string>> = {
      PLANNED:'#90caf9', ONGOING:'#81c784', COMPLETED:'#4caf50',
      ON_HOLD:'#ffe082', CANCELLED:'#ef9a9a'
    };
    const counts: Partial<Record<ProjectStatus, number>> = {};
    for (const p of this.allProjects) counts[p.status] = (counts[p.status] ?? 0) + 1;
    const total = this.allProjects.length || 1;
    let offset = 0;
    this.statusSlices = (Object.entries(counts) as [ProjectStatus, number][]).map(([s, n]) => {
      const pct = (n / total) * 100;
      const slice: DonutSlice = { label: s, value: n, color: statusColors[s] ?? '#ccc', pct, offset };
      offset += pct;
      return slice;
    });

    // 3. Verify bars: top 10 projects by spend
    const pendingByProject: Record<number, number> = {};
    for (const e of this.pendingExp) {
      pendingByProject[e.projectId] = (pendingByProject[e.projectId] ?? 0) + e.amount;
    }
    const top10 = [...this.allProjects].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10);
    const maxSpent = Math.max(...top10.map(p => p.totalSpent), 1);
    this.verifyBars = top10.map(p => {
      const unverified = pendingByProject[p.id] ?? 0;
      return { label: p.projectCode, value: p.totalSpent - unverified, value2: unverified,
               max: maxSpent, color: '#81c784', color2: '#ffb74d' };
    });

    // 4. Fund bars: allocated vs received
    const top8 = this.allFunds.slice(0, 8);
    const maxFund = Math.max(...top8.map(f => f.totalAmount), 1);
    this.fundBars = top8.map(f => ({
      label: (f.schemeNameEn ?? `Fund ${f.id}`).substring(0, 18),
      value: f.totalAmount, value2: f.amountReceived,
      max: maxFund, color: '#90caf9', color2: '#a5d6a7'
    }));
  }

  // ── Computed SVG donut ────────────────────────────────
  getDonutPath(slice: DonutSlice): string {
    const r = 70, cx = 80, cy = 80, circumference = 2 * Math.PI * r;
    const dashArray  = `${(slice.pct / 100) * circumference} ${circumference}`;
    const dashOffset = -((slice.offset / 100) * circumference);
    return `stroke-dasharray:${dashArray};stroke-dashoffset:${dashOffset}`;
  }

  // ── Aggregates ────────────────────────────────────────
  get totalAllocated():  number { return this.allProjects.reduce((s, p) => s + p.allocatedBudget, 0); }
  get totalSpent():      number { return this.allProjects.reduce((s, p) => s + p.totalSpent, 0); }
  get totalRemaining():  number { return this.allProjects.reduce((s, p) => s + p.remainingBudget, 0); }
  get overallUtil():     number {
    return this.totalAllocated > 0 ? Math.round((this.totalSpent / this.totalAllocated) * 100) : 0;
  }
  get completedCount():  number { return this.allProjects.filter(p => p.status === 'COMPLETED').length; }
  get ongoingCount():    number { return this.allProjects.filter(p => p.status === 'ONGOING').length; }
  get pendingCount():    number { return this.pendingExp.length; }
  get pendingAmount():   number { return this.pendingExp.reduce((s, e) => s + e.amount, 0); }

  get filteredProjects(): Project[] {
    return this.allProjects.filter(p => {
      if (this.selectedType   && p.projectType !== this.selectedType)   return false;
      if (this.selectedStatus && p.status      !== this.selectedStatus) return false;
      return true;
    });
  }

  label(en?: string, hi?: string): string {
    return (this.currentLang === 'hi' && hi) ? hi : (en ?? '');
  }

  formatLakh(n: number): string {
    if (n >= 10_000_000) return '₹' + (n / 10_000_000).toFixed(1) + 'Cr';
    if (n >= 100_000)    return '₹' + (n / 100_000).toFixed(1) + 'L';
    if (n >= 1_000)      return '₹' + (n / 1_000).toFixed(1) + 'K';
    return '₹' + n;
  }

  getUtilClass(pct: number): string {
    if (pct >= 90) return 'high';
    if (pct >= 50) return 'medium';
    return 'low';
  }

  getStatusColor(status: ProjectStatus): string {
    const m: Partial<Record<ProjectStatus,string>> = {
      PLANNED:'#1565c0', ONGOING:'#2e7d32', COMPLETED:'#4caf50',
      ON_HOLD:'#f57f17', CANCELLED:'#c62828'
    };
    return m[status] ?? '#546e7a';
  }
}