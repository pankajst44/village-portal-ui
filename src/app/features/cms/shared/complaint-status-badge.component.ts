import { Component, Input } from '@angular/core';
import { ComplaintStatus, ComplaintPriority, STATUS_LABELS, PRIORITY_LABELS } from '../models/cms.models';

@Component({
  standalone: false,
  selector: 'vp-complaint-status-badge',
  template: `
    <span class="status-badge" [style.background]="bg" [style.color]="'#fff'">
      {{ label }}
    </span>`,
  styles: [`
    .status-badge {
      display: inline-block; padding: 3px 10px; border-radius: 12px;
      font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;
    }
  `]
})
export class ComplaintStatusBadgeComponent {
  @Input() status!: ComplaintStatus;
  get bg():    string { return STATUS_LABELS[this.status]?.color ?? '#9e9e9e'; }
  get label(): string { return STATUS_LABELS[this.status]?.en    ?? this.status; }
}

@Component({
  standalone: false,
  selector: 'vp-priority-badge',
  template: `
    <span class="priority-badge" [style.color]="color" [style.border-color]="color">
      <mat-icon style="font-size:13px;height:13px;width:13px;vertical-align:middle">
        {{ priority === 'CRITICAL' ? 'warning' : 'flag' }}
      </mat-icon>
      {{ label }}
    </span>`,
  styles: [`
    .priority-badge {
      display: inline-flex; align-items: center; gap: 3px;
      padding: 2px 8px; border-radius: 10px; border: 1px solid;
      font-size: 11px; font-weight: 600; text-transform: uppercase;
    }
  `]
})
export class PriorityBadgeComponent {
  @Input() priority!: ComplaintPriority;
  get color(): string { return PRIORITY_LABELS[this.priority]?.color ?? '#666'; }
  get label(): string { return PRIORITY_LABELS[this.priority]?.en    ?? this.priority; }
}
