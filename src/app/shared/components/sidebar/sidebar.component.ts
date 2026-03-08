import { Component, OnInit } from '@angular/core';
import { AuthService }       from '../../../core/services/auth.service';

interface NavItem {
  label:    string;       // i18n key
  icon:     string;       // material icon
  route:    string;
  roles?:   string[];     // undefined = everyone
  divider?: boolean;
}

@Component({
  standalone: false,
  selector:    'vp-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls:   ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  navItems: NavItem[] = [];
  role = '';

  private allNavItems: NavItem[] = [
    { label: 'nav.dashboard',  icon: 'dashboard',     route: '/dashboard' },
    { label: 'nav.projects',   icon: 'construction',  route: '/projects' },
    { label: 'nav.funds',      icon: 'account_balance',route: '/funds' },
    { label: 'nav.contractors',icon: 'engineering',   route: '/contractors' },
    { label: 'nav.spending',   icon: 'payments',      route: '/spending' },
    { label: 'nav.documents',  icon: 'folder_open',   route: '/documents' },
    // Officer-specific
    { label: 'nav.projects',   icon: 'edit_note',     route: '/officer/projects',
      roles: ['OFFICER'], divider: true },
    // Admin-specific
    { label: 'nav.users',      icon: 'manage_accounts', route: '/admin/users',
      roles: ['ADMIN'], divider: true },
    { label: 'nav.auditLogs',  icon: 'history',       route: '/admin/audit-logs',
      roles: ['ADMIN', 'AUDITOR'] },
    { label: 'nav.reports',    icon: 'assessment',    route: '/auditor/reports',
      roles: ['ADMIN', 'AUDITOR'] },
  ];

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.role = this.auth.getRole();
    this.navItems = this.allNavItems.filter(item =>
      !item.roles || item.roles.includes(this.role)
    );
  }
}
