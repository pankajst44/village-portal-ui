import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService }  from '../../../core/services/project.service';
import { LanguageService } from '../../../core/services/language.service';
import { Project }         from '../../../core/models/models';

@Component({
  standalone: false,
  selector:    'vp-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls:   ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {

  project:    Project | null = null;
  loading     = true;
  error       = false;
  currentLang = 'en';

  constructor(
    private route:      ActivatedRoute,
    private router:     Router,
    private projectSvc: ProjectService,
    private langSvc:    LanguageService
  ) {}

  ngOnInit(): void {
    this.langSvc.currentLang.subscribe(l => this.currentLang = l);
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/projects']); return; }
    this.projectSvc.getPublicProjectById(id).subscribe({
      next:  res => { this.project = res.data ?? null; this.loading = false; },
      error: ()  => { this.loading = false; this.error = true; }
    });
  }

  label(en?: string, hi?: string): string {
    return (this.currentLang === 'hi' && hi) ? hi : (en ?? '');
  }

  getProgressClass(pct: number): string {
    if (pct >= 75) return 'high';
    if (pct >= 40) return 'medium';
    return 'low';
  }

  goBack(): void { this.router.navigate(['/projects']); }
}