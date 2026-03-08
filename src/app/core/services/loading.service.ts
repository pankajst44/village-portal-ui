import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private loading$ = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loading$.asObservable();

  show(): void { this.loading$.next(true); }
  hide(): void { this.loading$.next(false); }
}
