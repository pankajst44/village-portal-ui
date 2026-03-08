import { Component, OnInit } from '@angular/core';
import { forkJoin }          from 'rxjs';
import { ProjectService }    from '../../../core/services/project.service';
import { FundService }       from '../../../core/services/api.services';
import { AuthService }       from '../../../core/services/auth.service';
import { LanguageService }   from '../../../core/services/language.service';
import { Project, Fund, DashboardStats, ProjectStatus } from '../../../core/models/models';

@Component({
  standalone: false,
  selector:    'vp-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls:   ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  stats: DashboardStats = {
    totalFundsReceived:   0,
    totalProjects:        0,
    ongoingProjects:      0,
    completedProjects:    0,
    plannedProjects:      0,
    totalAllocatedBudget: 0,
    totalSpent:           0,
    budgetUtilizationPct: 0,
  };

  recentProjects: Project[]  = [];
  activeFunds:    Fund[]     = [];
  userName        = '';
  currentLang     = 'en';
  loading         = true;

  // Project type breakdown for display
  projectStatusCounts: { status: ProjectStatus; count: number; color: string }[] = [];

  private statusColors: Record<string, string> = {
    ONGOING:   '#2e7d32',
    COMPLETED: '#4a148c',
    PLANNED:   '#1565c0',
    ON_HOLD:   '#e65100',
    CANCELLED: '#b71c1c',
  };

  constructor(
    private projectSvc: ProjectService,
    private fundSvc:    FundService,
    private auth:       AuthService,
    private langSvc:    LanguageService
  ) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    this.userName = user?.fullName ?? user?.username ?? '';
    this.langSvc.currentLang.subscribe(l => this.currentLang = l);

    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading = true;

    forkJoin({
      projects: this.projectSvc.getPublicProjects(0, 100),
      funds:    this.fundSvc.getFundsByStatus('ACTIVE'),
    }).subscribe({
      next: ({ projects, funds }) => {
        const allProjects = projects.data?.content ?? [];
        this.recentProjects = allProjects.slice(0, 6);
        this.activeFunds    = funds.data ?? [];

        // Compute stats
        this.stats.totalProjects    = allProjects.length;
        this.stats.ongoingProjects  = allProjects.filter(p => p.status === 'ONGOING').length;
        this.stats.completedProjects= allProjects.filter(p => p.status === 'COMPLETED').length;
        this.stats.plannedProjects  = allProjects.filter(p => p.status === 'PLANNED').length;
        this.stats.totalAllocatedBudget = allProjects.reduce((s, p) => s + p.allocatedBudget, 0);
        this.stats.totalSpent           = allProjects.reduce((s, p) => s + p.totalSpent, 0);
        this.stats.totalFundsReceived   = this.activeFunds.reduce((s, f) => s + f.amountReceived, 0);
        this.stats.budgetUtilizationPct = this.stats.totalAllocatedBudget > 0
          ? (this.stats.totalSpent / this.stats.totalAllocatedBudget) * 100 : 0;

        // Status breakdown
        const statusList: ProjectStatus[] = ['ONGOING', 'COMPLETED', 'PLANNED', 'ON_HOLD', 'CANCELLED'];
        this.projectStatusCounts = statusList
          .map(s => ({
            status: s,
            count:  allProjects.filter(p => p.status === s).length,
            color:  this.statusColors[s]
          }))
          .filter(s => s.count > 0);

        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getProgressClass(pct: number): string {
    if (pct >= 75) return 'high';
    if (pct >= 40) return 'medium';
    return 'low';
  }

  /** Returns bilingual field based on current language */
  label(en: string | undefined, hi: string | undefined): string {
    return (this.currentLang === 'hi' && hi) ? hi : (en ?? '');
  }
}
