import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService }  from '../../../core/services/auth.service';
import { CmsNotificationService } from '../../../features/cms/services/cms.services';

interface NavItem {
  label:    string;
  icon:     string;
  route:    string;
  roles?:   string[];
  divider?: boolean;
  badgeKey?: string;  // 'cmsUnread' — dynamic badge
}

@Component({
  standalone: false,
  selector:    'vp-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls:   ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {

  navItems: NavItem[] = [];
  role = '';
  cmsUnreadCount = 0;
  private sub?: Subscription;
  private notifInterval?: ReturnType<typeof setInterval>;

  private readonly allNavItems: NavItem[] = [

    // ── All roles ──────────────────────────────────────
    { label: 'nav.dashboard',   icon: 'dashboard',       route: '/dashboard' },

    // ── CMS — Resident ─────────────────────────────────
    { label: 'nav.cms.complaints', icon: 'report_problem', route: '/cms/complaints',
      roles: ['RESIDENT', 'ADMIN', 'OFFICER', 'AUDITOR'], divider: true },
    { label: 'nav.cms.myComplaints', icon: 'history',      route: '/cms/my-complaints',
      roles: ['RESIDENT'] },
    { label: 'nav.cms.submitComplaint', icon: 'add_circle', route: '/cms/complaints/submit',
      roles: ['RESIDENT'] },
    { label: 'nav.cms.notifications', icon: 'notifications', route: '/cms/notifications',
      roles: ['RESIDENT', 'OFFICER'], badgeKey: 'cmsUnread' },

    // ── CMS — Officer ──────────────────────────────────
    { label: 'nav.cms.officerQueue', icon: 'assignment_ind', route: '/cms/officer',
      roles: ['OFFICER', 'ADMIN'] },

    // ── CMS — Admin / Auditor ──────────────────────────
    { label: 'nav.cms.adminPanel', icon: 'admin_panel_settings', route: '/cms/admin',
      roles: ['ADMIN', 'AUDITOR'] },

    // ── Officer portal (non-CMS) ───────────────────────
    { label: 'nav.updateProject', icon: 'edit_note',      route: '/officer/projects',
      roles: ['OFFICER'], divider: true },
    { label: 'nav.spending',      icon: 'payments',       route: '/officer/spending/new',
      roles: ['OFFICER', 'ADMIN'] },
    { label: 'nav.documents',     icon: 'folder_open',    route: '/officer/documents/upload',
      roles: ['OFFICER', 'ADMIN', 'AUDITOR'] },

    // ── Admin ──────────────────────────────────────────
    { label: 'nav.users',       icon: 'manage_accounts', route: '/admin/users',
      roles: ['ADMIN'], divider: true },
    { label: 'nav.funds',       icon: 'account_balance', route: '/admin/funds',
      roles: ['ADMIN'] },
    { label: 'nav.projects',    icon: 'construction',    route: '/admin/projects',
      roles: ['ADMIN'] },
    { label: 'nav.contractors', icon: 'engineering',     route: '/admin/contractors',
      roles: ['ADMIN'] },

    // ── Admin + Auditor ────────────────────────────────
    { label: 'nav.auditLogs',   icon: 'history',         route: '/admin/audit-logs',
      roles: ['ADMIN', 'AUDITOR'], divider: true },
    { label: 'nav.reports',     icon: 'assessment',      route: '/auditor/reports',
      roles: ['ADMIN', 'AUDITOR'] },
    { label: 'nav.auditReview', icon: 'fact_check',      route: '/auditor/audit-review',
      roles: ['AUDITOR', 'ADMIN'] },
  ];

  constructor(
    private auth:    AuthService,
    private notifSvc: CmsNotificationService
  ) {}

  ngOnInit(): void {
    this.sub = this.auth.isLoggedIn().subscribe(() => {
      this.role = this.auth.getRole();
      this.navItems = this.allNavItems.filter(item =>
        !item.roles || item.roles.includes(this.role)
      );
      // Poll unread notifications every 60s for residents and officers
      if (this.role === 'RESIDENT' || this.role === 'OFFICER') {
        this.loadUnreadCount();
        this.notifInterval = setInterval(() => this.loadUnreadCount(), 60000);
      }
    });
  }

  private loadUnreadCount(): void {
    this.notifSvc.getUnreadCount().subscribe(
      res => this.cmsUnreadCount = res.data,
      () => {}
    );
  }

  getBadge(item: NavItem): number {
    if (item.badgeKey === 'cmsUnread') return this.cmsUnreadCount;
    return 0;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.notifInterval) clearInterval(this.notifInterval);
  }
}
