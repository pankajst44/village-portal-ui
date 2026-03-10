import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'vp-public-layout',
  template: `
    <vp-public-navbar></vp-public-navbar>
    <main class="public-main">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: var(--color-bg); }
    .public-main { max-width: 1280px; margin: 0 auto; }
  `]
})
export class PublicLayoutComponent {}