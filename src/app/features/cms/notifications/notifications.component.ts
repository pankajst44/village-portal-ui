import { Component, OnInit } from '@angular/core';
import { CmsNotificationService }  from '../services/cms.services';
import { NotificationResponse }    from '../models/cms.models';
import { PageEvent }               from '@angular/material/paginator';

@Component({
  standalone: false,
  selector: 'vp-cms-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class CmsNotificationsComponent implements OnInit {

  notifications: NotificationResponse[] = [];
  loading     = false;
  total       = 0;
  page        = 0;
  pageSize    = 20;
  unreadCount = 0;

  constructor(private svc: CmsNotificationService) {}

  ngOnInit(): void { this.load(); this.loadCount(); }

  load(): void {
    this.loading = true;
    this.svc.getNotifications(this.page, this.pageSize).subscribe({
      next: res => {
        this.notifications = res.data.content;
        this.total         = res.data.totalElements;
        this.loading       = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadCount(): void {
    this.svc.getUnreadCount().subscribe(res => this.unreadCount = res.data);
  }

  markRead(n: NotificationResponse): void {
    if (n.isRead) return;
    this.svc.markRead(n.id).subscribe(() => {
      n.isRead = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    });
  }

  markAllRead(): void {
    this.svc.markAllRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
      this.unreadCount = 0;
    });
  }

  onPage(e: PageEvent): void { this.page = e.pageIndex; this.load(); }

  notificationIcon(type: string): string {
    const map: Record<string, string> = {
      COMPLAINT_SUBMITTED:  'check_circle',
      COMPLAINT_VERIFIED:   'verified',
      COMPLAINT_REJECTED:   'cancel',
      COMPLAINT_ASSIGNED:   'assignment_ind',
      OFFICER_UPDATE:       'update',
      RESOLUTION_READY:     'task_alt',
      RESOLUTION_ACCEPTED:  'thumb_up',
      RESOLUTION_REJECTED:  'thumb_down',
      ESCALATION_ALERT:     'warning',
    };
    return map[type] ?? 'notifications';
  }
}
