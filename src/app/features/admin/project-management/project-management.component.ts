import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { ProjectService } from '../../../core/services/project.service';
import { FundService, UserService } from '../../../core/services/api.services';
import {
  Project, ProjectStatus, ProjectType,
  CreateProjectRequest, Fund, User
} from '../../../core/models/models';

@Component({
  standalone: false,
  selector:    'vp-project-management',
  templateUrl: './project-management.component.html',
  styleUrls:   ['./project-management.component.scss']
})
export class ProjectManagementComponent implements OnInit {

  projects:     Project[] = [];
  funds:        Fund[]    = [];
  officers:     User[]    = [];
  loading       = true;
  saving        = false;
  error         = false;

  // Pagination
  page          = 0;
  pageSize      = 20;
  totalElements = 0;
  totalPages    = 0;

  // Filters
  searchTerm    = '';
  typeFilter:   ProjectType   | '' = '';
  statusFilter: ProjectStatus | '' = '';

  // Panel
  panelOpen     = false;
  editingProject: Project | null = null;
  deleteTarget:   Project | null = null;
  confirmDelete   = false;

  form: FormGroup;

  readonly projectTypes:    ProjectType[]   = ['ROAD','WATER','SANITATION','SCHOOL','ELECTRICITY','HEALTH','OTHER'];
  readonly projectStatuses: ProjectStatus[] = ['PLANNED','ONGOING','COMPLETED','ON_HOLD','CANCELLED'];

  readonly typeIcons: Record<string, string> = {
    ROAD:'add_road', WATER:'water_drop', SANITATION:'plumbing',
    SCHOOL:'school', ELECTRICITY:'bolt', HEALTH:'local_hospital', OTHER:'construction'
  };

  readonly statusColors: Record<string, string> = {
    PLANNED:'#1565c0', ONGOING:'#2e7d32', COMPLETED:'#4caf50',
    ON_HOLD:'#f57f17', CANCELLED:'#c62828'
  };

  readonly displayedColumns = ['project','type','fund','budget','progress','status','officer','actions'];

  constructor(
    private fb:         FormBuilder,
    private projectSvc: ProjectService,
    private fundSvc:    FundService,
    private userSvc:    UserService,
    private snackBar:   MatSnackBar
  ) {
    this.form = this.fb.group({
      projectCode:       ['', [Validators.required, Validators.maxLength(30),
                               Validators.pattern(/^[A-Z0-9-]+$/)]],
      nameEn:            ['', [Validators.required, Validators.maxLength(300)]],
      nameHi:            ['', Validators.maxLength(300)],
      descriptionEn:     [''],
      descriptionHi:     [''],
      locationEn:        ['', Validators.maxLength(200)],
      locationHi:        ['', Validators.maxLength(200)],
      projectType:       ['', Validators.required],
      status:            ['PLANNED', Validators.required],
      allocatedBudget:   ['', [Validators.required, Validators.min(0)]],
      progressPercent:   [0,  [Validators.min(0), Validators.max(100)]],
      fundId:            [null],
      assignedOfficerId: [null],
      startDate:         [''],
      expectedEndDate:   [''],
      isPublicVisible:   [true],
    });
  }

  ngOnInit(): void {
    forkJoin({
      funds:    this.fundSvc.getAllFunds(0, 100),
      officers: this.userSvc.getAll()
    }).subscribe({
      next: ({ funds, officers }) => {
        this.funds    = funds.data?.content ?? [];
        this.officers = (officers.data as unknown as User[])
          ?.filter(u => u.role === 'OFFICER') ?? [];
        this.loadProjects();
      },
      error: () => this.loadProjects()
    });
  }

  loadProjects(): void {
    this.loading = true;
    this.error   = false;
    this.projectSvc.getAllProjects(this.page, this.pageSize).subscribe({
      next: res => {
        this.projects      = res.data?.content ?? [];
        this.totalElements = res.data?.totalElements ?? 0;
        this.totalPages    = res.data?.totalPages ?? 0;
        this.loading       = false;
      },
      error: () => { this.loading = false; this.error = true; }
    });
  }

  // ── Panel ──────────────────────────────────────────────

  openCreate(): void {
    this.editingProject = null;
    this.form.reset({ status: 'PLANNED', progressPercent: 0, isPublicVisible: true });
    this.panelOpen = true;
  }

  openEdit(p: Project): void {
    this.editingProject = p;
    this.form.patchValue({
      projectCode:       p.projectCode,
      nameEn:            p.nameEn,
      nameHi:            p.nameHi ?? '',
      descriptionEn:     p.descriptionEn ?? '',
      descriptionHi:     p.descriptionHi ?? '',
      locationEn:        p.locationEn ?? '',
      locationHi:        p.locationHi ?? '',
      projectType:       p.projectType,
      status:            p.status,
      allocatedBudget:   p.allocatedBudget,
      progressPercent:   p.progressPercent ?? 0,
      fundId:            p.fundId ?? null,
      assignedOfficerId: p.assignedOfficerId ?? null,
      startDate:         p.startDate ?? '',
      expectedEndDate:   p.expectedEndDate ?? '',
      isPublicVisible:   p.isPublicVisible ?? true,
    });
    // Lock projectCode in edit mode
    this.form.get('projectCode')?.disable();
    this.panelOpen = true;
  }

  closePanel(): void {
    this.panelOpen      = false;
    this.editingProject = null;
    this.form.get('projectCode')?.enable();
  }

  // ── Save ───────────────────────────────────────────────

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;

    const raw = this.form.getRawValue();
    const payload: CreateProjectRequest = {
      ...raw,
      allocatedBudget:   +raw.allocatedBudget,
      progressPercent:   +raw.progressPercent,
      fundId:            raw.fundId   ? +raw.fundId   : undefined,
      assignedOfficerId: raw.assignedOfficerId ? +raw.assignedOfficerId : undefined,
      startDate:         raw.startDate       || undefined,
      expectedEndDate:   raw.expectedEndDate || undefined,
    };

    const req$ = this.editingProject
      ? this.projectSvc.updateProject(this.editingProject.id, payload)
      : this.projectSvc.createProject(payload);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open(
          this.editingProject ? 'Project updated successfully' : 'Project created successfully',
          'Close', { duration: 3000, panelClass: 'snack-success' }
        );
        this.closePanel();
        this.loadProjects();
      },
      error: err => {
        this.saving = false;
        const msg = err?.error?.message ?? 'Failed to save project';
        this.snackBar.open(msg, 'Close', { duration: 4000, panelClass: 'snack-error' });
      }
    });
  }

  // ── Delete ─────────────────────────────────────────────

  promptDelete(p: Project): void {
    this.deleteTarget  = p;
    this.confirmDelete = true;
  }

  cancelDelete(): void {
    this.deleteTarget  = null;
    this.confirmDelete = false;
  }

  confirmDeletion(): void {
    if (!this.deleteTarget) return;
    this.projectSvc.deleteProject(this.deleteTarget.id).subscribe({
      next: () => {
        this.snackBar.open('Project deleted', 'Close', { duration: 3000, panelClass: 'snack-success' });
        this.cancelDelete();
        this.loadProjects();
      },
      error: err => {
        const msg = err?.error?.message ?? 'Failed to delete project';
        this.snackBar.open(msg, 'Close', { duration: 4000, panelClass: 'snack-error' });
        this.cancelDelete();
      }
    });
  }

  // ── Helpers ────────────────────────────────────────────

  get filtered(): Project[] {
    const t = this.searchTerm.toLowerCase();
    return this.projects.filter(p => {
      const matchSearch = !t
        || p.nameEn?.toLowerCase().includes(t)
        || p.projectCode?.toLowerCase().includes(t)
        || p.locationEn?.toLowerCase().includes(t);
      const matchType   = !this.typeFilter   || p.projectType === this.typeFilter;
      const matchStatus = !this.statusFilter || p.status      === this.statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }

  countByStatus(s: ProjectStatus): number { return this.projects.filter(p => p.status === s).length; }
  countByType(t: ProjectType):     number { return this.projects.filter(p => p.projectType === t).length; }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages) return;
    this.page = p;
    this.loadProjects();
  }

  getFundName(id?: number): string {
    if (!id) return '—';
    const f = this.funds.find(f => f.id === id);
    return f ? f.schemeNameEn.substring(0, 22) + (f.schemeNameEn.length > 22 ? '…' : '') : '—';
  }

  getOfficerName(id?: number): string {
    if (!id) return '—';
    const u = this.officers.find(u => u.id === id);
    return u ? u.fullName : '—';
  }

  fe(name: string)                   { return this.form.get(name); }
  hasError(name: string, err: string){ const c = this.fe(name); return c?.hasError(err) && c.touched; }
}