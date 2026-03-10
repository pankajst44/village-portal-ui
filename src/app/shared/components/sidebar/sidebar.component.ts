import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label:    string;
  icon:     string;
  route:    string;
  roles?:   string[];
  divider?: boolean;
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
  private sub?: Subscription;

  private readonly allNavItems: NavItem[] = [

    // ── All roles ──────────────────────────────────────────
    { label: 'nav.dashboard',   icon: 'dashboard',       route: '/dashboard' },

    // ── Officer only (not shown to ADMIN — admin has dedicated admin routes) ──
    { label: 'nav.updateProject', icon: 'edit_note',     route: '/officer/projects',
      roles: ['OFFICER'], divider: true },
    { label: 'nav.spending',      icon: 'payments',      route: '/officer/spending/new',
      roles: ['OFFICER', 'ADMIN'] },
    { label: 'nav.documents',     icon: 'folder_open',   route: '/officer/documents/upload',
      roles: ['OFFICER', 'ADMIN', 'AUDITOR'] },

    // ── Admin ──────────────────────────────────────────────
    { label: 'nav.users',       icon: 'manage_accounts', route: '/admin/users',
      roles: ['ADMIN'], divider: true },
    { label: 'nav.funds',       icon: 'account_balance', route: '/admin/funds',
      roles: ['ADMIN'] },
    { label: 'nav.projects',    icon: 'construction',    route: '/admin/projects',
      roles: ['ADMIN'] },
    { label: 'nav.contractors', icon: 'engineering',     route: '/admin/contractors',
      roles: ['ADMIN'] },

    // ── Admin + Auditor ────────────────────────────────────
    { label: 'nav.auditLogs',   icon: 'history',         route: '/admin/audit-logs',
      roles: ['ADMIN', 'AUDITOR'], divider: true },
    { label: 'nav.reports',     icon: 'assessment',      route: '/auditor/reports',
      roles: ['ADMIN', 'AUDITOR'] },
    { label: 'nav.auditReview', icon: 'fact_check',      route: '/auditor/audit-review',
      roles: ['AUDITOR', 'ADMIN'] },
  ];

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.sub = this.auth.isLoggedIn().subscribe(() => {
      this.role = this.auth.getRole();
      this.navItems = this.allNavItems.filter(item =>
        !item.roles || item.roles.includes(this.role)
      );
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}