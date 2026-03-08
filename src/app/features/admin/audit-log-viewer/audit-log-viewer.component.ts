import { Component, OnInit } from '@angular/core';
import { AuditService, UserService } from '../../../core/services/api.services';
import { AuditLog, AuditAction, User } from '../../../core/models/models';

type FilterMode = 'action' | 'dateRange' | 'record';

@Component({
  standalone: false,
  selector:    'vp-audit-log-viewer',
  templateUrl: './audit-log-viewer.component.html',
  styleUrls:   ['./audit-log-viewer.component.scss']
})
export class AuditLogViewerComponent implements OnInit {

  // Data
  logs:         AuditLog[] = [];
  users:        User[]     = [];
  loading       = false;
  error         = false;
  hasSearched   = false;

  // Pagination (for action / date-range modes)
  page          = 0;
  pageSize      = 20;
  totalElements = 0;
  totalPages    = 0;

  // Filter mode
  filterMode: FilterMode = 'action';

  // Action filter
  selectedAction: AuditAction | '' = '';

  // Date range filter
  dateFrom = '';
  dateTo   = '';

  // Record history filter
  tableName  = '';
  recordId: number | null = null;

  // Client-side search on loaded results
  searchTerm = '';

  // Detail drawer
  selectedLog: AuditLog | null = null;

  readonly actions: AuditAction[] = [
    'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT',
    'LOGIN_FAILED', 'FILE_UPLOAD', 'FILE_DELETE', 'VERIFY', 'EXPORT'
  ];

  readonly tableNames = [
    'projects', 'funds', 'expenditures', 'contractors', 'documents', 'users'
  ];

  constructor(
    private auditSvc: AuditService,
    private userSvc:  UserService
  ) {}

  ngOnInit(): void {
    this.userSvc.getAll().subscribe({
      next: res => this.users = res.data ?? []
    });
  }

  // ── Search ─────────────────────────────────────────────

  search(): void {
    this.page = 0;
    this.selectedLog = null;
    this.doLoad();
  }

  private doLoad(): void {
    this.loading     = true;
    this.error       = false;
    this.hasSearched = true;

    if (this.filterMode === 'action' && this.selectedAction) {
      this.auditSvc.getByAction(this.selectedAction, this.page, this.pageSize).subscribe({
        next:  res => this.handlePage(res),
        error: ()  => { this.loading = false; this.error = true; }
      });

    } else if (this.filterMode === 'dateRange' && this.dateFrom && this.dateTo) {
      // Backend expects ISO datetime — append time if only date given
      const from = this.dateFrom.includes('T') ? this.dateFrom : `${this.dateFrom}T00:00:00`;
      const to   = this.dateTo.includes('T')   ? this.dateTo   : `${this.dateTo}T23:59:59`;
      this.auditSvc.getByDateRange(from, to, this.page, this.pageSize).subscribe({
        next:  res => this.handlePage(res),
        error: ()  => { this.loading = false; this.error = true; }
      });

    } else if (this.filterMode === 'record' && this.tableName && this.recordId) {
      this.auditSvc.getRecordHistory(this.tableName, this.recordId).subscribe({
        next:  res => {
          this.logs          = (res.data as unknown as AuditLog[]) ?? [];
          this.totalElements = this.logs.length;
          this.totalPages    = 1;
          this.loading       = false;
        },
        error: ()  => { this.loading = false; this.error = true; }
      });

    } else {
      this.loading = false;
    }
  }

  private handlePage(res: any): void {
    this.logs          = res.data?.content ?? [];
    this.totalElements = res.data?.totalElements ?? 0;
    this.totalPages    = res.data?.totalPages ?? 0;
    this.loading       = false;
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages) return;
    this.page = p;
    this.selectedLog = null;
    this.doLoad();
  }

  // ── Reset ──────────────────────────────────────────────

  reset(): void {
    this.selectedAction = '';
    this.dateFrom       = '';
    this.dateTo         = '';
    this.tableName      = '';
    this.recordId       = null;
    this.searchTerm     = '';
    this.logs           = [];
    this.hasSearched    = false;
    this.selectedLog    = null;
    this.page           = 0;
    this.totalElements  = 0;
    this.totalPages     = 0;
  }

  // ── Detail drawer ──────────────────────────────────────

  openDetail(log: AuditLog): void {
    this.selectedLog = this.selectedLog?.id === log.id ? null : log;
  }

  closeDetail(): void { this.selectedLog = null; }

  // ── Helpers ────────────────────────────────────────────

  get canSearch(): boolean {
    if (this.filterMode === 'action')    return !!this.selectedAction;
    if (this.filterMode === 'dateRange') return !!(this.dateFrom && this.dateTo);
    if (this.filterMode === 'record')    return !!(this.tableName && this.recordId);
    return false;
  }

  get filtered(): AuditLog[] {
    if (!this.searchTerm.trim()) return this.logs;
    const t = this.searchTerm.toLowerCase();
    return this.logs.filter(l =>
      l.tableName?.toLowerCase().includes(t) ||
      l.changedByUsername?.toLowerCase().includes(t) ||
      l.changeSummary?.toLowerCase().includes(t) ||
      l.ipAddress?.includes(t)
    );
  }

  getActionColor(action: AuditAction): string {
    const map: Partial<Record<AuditAction, string>> = {
      CREATE: '#2e7d32', UPDATE: '#1565c0', DELETE: '#c62828',
      LOGIN: '#00695c', LOGOUT: '#546e7a', LOGIN_FAILED: '#e65100',
      FILE_UPLOAD: '#6a1b9a', FILE_DELETE: '#ad1457',
      VERIFY: '#0277bd', EXPORT: '#4527a0',
    };
    return map[action] ?? '#546e7a';
  }

  getActionIcon(action: AuditAction): string {
    const map: Partial<Record<AuditAction, string>> = {
      CREATE: 'add_circle', UPDATE: 'edit', DELETE: 'delete',
      LOGIN: 'login', LOGOUT: 'logout', LOGIN_FAILED: 'no_accounts',
      FILE_UPLOAD: 'upload_file', FILE_DELETE: 'delete_forever',
      VERIFY: 'verified', EXPORT: 'download',
    };
    return map[action] ?? 'history';
  }

  formatJson(raw?: string): string {
    if (!raw) return '—';
    try { return JSON.stringify(JSON.parse(raw), null, 2); }
    catch { return raw; }
  }

  get pages(): number[] {
    const total = Math.min(this.totalPages, 10);
    const half  = Math.floor(total / 2);
    let start   = Math.max(0, this.page - half);
    const end   = Math.min(this.totalPages, start + total);
    start       = Math.max(0, end - total);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }
}