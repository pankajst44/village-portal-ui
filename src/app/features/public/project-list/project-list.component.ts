import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
import { ProjectService }    from '../../../core/services/project.service';
import { LanguageService }   from '../../../core/services/language.service';
import { Project, ProjectStatus, ProjectType } from '../../../core/models/models';

@Component({
  standalone: false,
  selector:    'vp-project-list',
  templateUrl: './project-list.component.html',
  styleUrls:   ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {

  projects:      Project[] = [];
  loading        = true;
  error          = false;
  currentLang    = 'en';

  page           = 0;
  pageSize       = 10;
  totalElements  = 0;
  totalPages     = 0;

  selectedStatus: ProjectStatus | '' = '';
  selectedType:   ProjectType   | '' = '';
  searchTerm      = '';

  readonly statuses: ProjectStatus[] = ['PLANNED','ONGOING','COMPLETED','ON_HOLD','CANCELLED'];
  readonly types:    ProjectType[]   = ['ROAD','WATER','SANITATION','SCHOOL','ELECTRICITY','HEALTH','OTHER'];

  constructor(
    private projectSvc: ProjectService,
    private langSvc:    LanguageService,
    private router:     Router
  ) {}

  ngOnInit(): void {
    this.langSvc.currentLang.subscribe(l => this.currentLang = l);
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error   = false;
    this.projectSvc.getPublicProjects(
      this.page, this.pageSize,
      this.selectedStatus || undefined,
      this.selectedType   || undefined
    ).subscribe({
      next: res => {
        this.projects      = res.data?.content ?? [];
        this.totalElements = res.data?.totalElements ?? 0;
        this.totalPages    = res.data?.totalPages ?? 0;
        this.loading       = false;
      },
      error: () => { this.loading = false; this.error = true; }
    });
  }

  applyFilters(): void { this.page = 0; this.load(); }

  resetFilters(): void {
    this.selectedStatus = '';
    this.selectedType   = '';
    this.searchTerm     = '';
    this.page           = 0;
    this.load();
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages) return;
    this.page = p;
    this.load();
  }

  openDetail(id: number): void { this.router.navigate(['/projects', id]); }

  label(en?: string, hi?: string): string {
    return (this.currentLang === 'hi' && hi) ? hi : (en ?? '');
  }

  get filteredProjects(): Project[] {
    if (!this.searchTerm.trim()) return this.projects;
    const t = this.searchTerm.toLowerCase();
    return this.projects.filter(p =>
      p.nameEn?.toLowerCase().includes(t) ||
      p.nameHi?.toLowerCase().includes(t) ||
      p.projectCode?.toLowerCase().includes(t) ||
      p.locationEn?.toLowerCase().includes(t)
    );
  }

  getProgressClass(pct: number): string {
    if (pct >= 75) return 'high';
    if (pct >= 40) return 'medium';
    return 'low';
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}