import {
  Component, OnInit, OnDestroy, ViewChild, HostListener
} from '@angular/core';
import { MatSidenav }      from '@angular/material/sidenav';
import { Router, NavigationEnd } from '@angular/router';
import { Subject }         from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  standalone: false,
  selector:    'vp-shell',
  templateUrl: './shell.component.html',
  styleUrls:   ['./shell.component.scss']
})
export class ShellComponent implements OnInit, OnDestroy {

  @ViewChild('sidenav') sidenav!: MatSidenav;

  isMobile   = false;
  sidenavOpen = true;
  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkViewport();

    // Close sidenav on mobile after navigation
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.isMobile) this.sidenav?.close();
    });
  }

  @HostListener('window:resize')
  onResize(): void { this.checkViewport(); }

  private checkViewport(): void {
    this.isMobile    = window.innerWidth < 960;
    this.sidenavOpen = !this.isMobile;
  }

  toggleSidenav(): void {
    this.sidenav?.toggle();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
