import { Component }     from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  standalone: false,
  selector: 'vp-spinner',
  template: `
    <div class="spinner-overlay" *ngIf="loadingSvc.isLoading$ | async">
      <mat-progress-bar mode="indeterminate" color="accent"></mat-progress-bar>
    </div>
  `,
  styles: [`
    .spinner-overlay {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 9999;
    }
    mat-progress-bar { height: 3px !important; }
  `]
})
export class SpinnerComponent {
  constructor(public loadingSvc: LoadingService) {}
}
