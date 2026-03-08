// Stat Card, Status Badge, Budget Bar
// Spinner is in spinner/spinner.component.ts
import { Component, Input } from '@angular/core';

// ── Stat Card ─────────────────────────────────────────────
@Component({
  standalone: false,
  selector: 'vp-stat-card',
  template: `
    <div class="stat-card" [class]="'accent-' + accent">
      <div class="stat-icon">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <div class="stat-body">
        <div class="stat-value">{{ value }}</div>
        <div class="stat-label">{{ label }}</div>
        <div class="stat-sub" *ngIf="sub">{{ sub }}</div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-md);
      display: flex;
      align-items: flex-start;
      gap: var(--space-md);
      transition: box-shadow 0.2s;
      &:hover { box-shadow: var(--shadow-md); }
    }
    .stat-icon {
      width: 44px; height: 44px;
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      background: var(--color-primary-50);
      mat-icon { color: var(--color-primary); font-size: 22px; }
      flex-shrink: 0;
    }
    .accent-orange .stat-icon { background: #fff3e0; mat-icon { color: var(--color-accent); } }
    .accent-green  .stat-icon { background: #e8f5e9; mat-icon { color: var(--color-success); } }
    .accent-blue   .stat-icon { background: #e3f2fd; mat-icon { color: var(--color-info); } }
    .accent-red    .stat-icon { background: #ffebee; mat-icon { color: var(--color-error); } }
    .stat-value {
      font-size: 1.5rem; font-weight: 700;
      color: var(--color-text); line-height: 1.2;
    }
    .stat-label {
      font-size: 0.8rem; color: var(--color-text-secondary);
      margin-top: 2px; line-height: 1.3;
    }
    .stat-sub { font-size: 0.72rem; color: var(--color-text-hint); margin-top: 2px; }
  `]
})
export class StatCardComponent {
  @Input() icon   = 'info';
  @Input() value  = '0';
  @Input() label  = '';
  @Input() sub    = '';
  @Input() accent: 'green' | 'orange' | 'blue' | 'red' | 'default' = 'default';
}

// ── Status Badge ──────────────────────────────────────────
@Component({
  standalone: false,
  selector: 'vp-status-badge',
  template: `<span class="status-chip {{ status }}">{{ label }}</span>`,
  styles:   [`:host { display: inline-block; }`]
})
export class StatusBadgeComponent {
  @Input() status = '';
  @Input() label  = '';
}

// ── Budget Bar ────────────────────────────────────────────
@Component({
  standalone: false,
  selector: 'vp-budget-bar',
  template: `
    <div class="budget-bar">
      <div class="budget-track">
        <div class="budget-fill"
             [style.width.%]="pct"
             [class.high]="pct >= 85"
             [class.medium]="pct >= 60 && pct < 85"
             [class.low]="pct < 60">
        </div>
      </div>
      <span class="budget-pct">{{ pct | number:'1.0-0' }}%</span>
    </div>
  `,
  styles: [`
    .budget-bar { display: flex; align-items: center; gap: 8px; }
    .budget-track {
      flex: 1; height: 6px; background: var(--color-border);
      border-radius: 3px; overflow: hidden;
    }
    .budget-fill {
      height: 100%; border-radius: 3px;
      background: var(--color-primary);
      transition: width 0.4s ease;
      &.high   { background: var(--color-error); }
      &.medium { background: var(--color-warning); }
      &.low    { background: var(--color-success); }
    }
    .budget-pct { font-size: 0.75rem; font-weight: 600;
                  color: var(--color-text-secondary); min-width: 36px; }
  `]
})
export class BudgetBarComponent {
  @Input() spent     = 0;
  @Input() allocated = 1;
  get pct(): number {
    return this.allocated > 0 ? Math.min((this.spent / this.allocated) * 100, 100) : 0;
  }
}
