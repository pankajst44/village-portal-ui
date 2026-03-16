import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router }        from '@angular/router';
import { forkJoin, of }                  from 'rxjs';
import { catchError }                    from 'rxjs/operators';
import { DomSanitizer, SafeUrl }         from '@angular/platform-browser';

import { ProjectService }   from '../../../core/services/project.service';
import { DocumentService }  from '../../../core/services/api.services';
import { FundService }      from '../../../core/services/api.services';
import { LanguageService }  from '../../../core/services/language.service';
import { Project, Document, Fund } from '../../../core/models/models';
import { environment }      from '../../../../environments/environment';

@Component({
  standalone: false,
  selector:    'vp-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls:   ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit, OnDestroy {

  project:     Project | null = null;
  documents:   Document[]     = [];
  images:      Document[]     = [];
  fund:        Fund | null    = null;

  loading      = true;
  docsLoading  = false;
  error        = false;
  currentLang  = 'en';
  activeTab    = 0;

  // Image lightbox
  lightboxDoc:  Document | null = null;
  lightboxUrl:  SafeUrl | null  = null;
  lightboxLoading = false;

  // Document preview
  previewDoc:  Document | null = null;
  previewUrl:  SafeUrl | null  = null;
  previewLoading = false;

  private blobUrls: string[] = [];

  readonly apiBase = environment.apiUrl;

  constructor(
    private route:       ActivatedRoute,
    private router:      Router,
    private projectSvc:  ProjectService,
    private documentSvc: DocumentService,
    private fundSvc:     FundService,
    private langSvc:     LanguageService,
    private sanitizer:   DomSanitizer
  ) {}

  ngOnInit(): void {
    this.langSvc.currentLang.subscribe(l => this.currentLang = l);
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/projects']); return; }
    this.loadAll(id);
  }

  ngOnDestroy(): void {
    this.blobUrls.forEach(u => URL.revokeObjectURL(u));
  }

  private loadAll(id: number): void {
    this.loading = true;
    forkJoin({
      project: this.projectSvc.getPublicProjectById(id).pipe(catchError(() => of(null))),
      docs:    this.documentSvc.getPublicByProject(id).pipe(catchError(() => of(null))),
    }).subscribe(({ project, docs }) => {
      if (!project?.data) { this.error = true; this.loading = false; return; }
      this.project   = project.data;
      const allDocs  = docs?.data ?? [];
      // Photos tab: documentType is PHOTO
      this.images    = allDocs.filter(d => d.documentType === 'PHOTO');
      // Documents tab: everything that is NOT a PHOTO
      this.documents = allDocs.filter(d => d.documentType !== 'PHOTO');

      // Load fund if linked
      if (this.project.fundId) {
        this.fundSvc.getPublicFundById(this.project.fundId)
          .pipe(catchError(() => of(null)))
          .subscribe(r => { this.fund = r?.data ?? null; });
      }
      this.loading = false;
    });
  }

  isImage(doc: Document): boolean {
    const t = doc.fileType?.toLowerCase() ?? '';
    return t.includes('image') || t.includes('jpg') || t.includes('jpeg')
        || t.includes('png') || t.includes('gif') || t.includes('webp');
  }

  isPdf(doc: Document): boolean {
    return (doc.fileType?.toLowerCase() ?? '').includes('pdf');
  }

  canPreview(doc: Document): boolean {
    return this.isImage(doc) || this.isPdf(doc);
  }

  // ── Lightbox for images ──────────────────────────────────
  openLightbox(doc: Document): void {
    this.lightboxDoc     = doc;
    this.lightboxUrl     = null;
    this.lightboxLoading = true;
    this.documentSvc.downloadFile(doc.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        this.blobUrls.push(url);
        this.lightboxUrl     = this.sanitizer.bypassSecurityTrustUrl(url);
        this.lightboxLoading = false;
      },
      error: () => { this.lightboxLoading = false; }
    });
  }

  closeLightbox(): void {
    this.lightboxDoc = null;
    this.lightboxUrl = null;
  }

  // ── Document preview ─────────────────────────────────────
  openPreview(doc: Document): void {
    this.previewDoc     = doc;
    this.previewUrl     = null;
    this.previewLoading = true;
    this.documentSvc.downloadFile(doc.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        this.blobUrls.push(url);
        if (this.isImage(doc)) {
          this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(url);
        } else if (this.isPdf(doc)) {
          this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        } else {
          // Auto-download unsupported types
          const a = document.createElement('a');
          a.href = url; a.download = doc.originalFileName; a.click();
        }
        this.previewLoading = false;
      },
      error: () => { this.previewLoading = false; }
    });
  }

  closePreview(): void { this.previewDoc = null; this.previewUrl = null; }

  download(doc: Document): void {
    this.documentSvc.downloadFile(doc.id).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = doc.originalFileName; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    });
  }

  // ── Helpers ──────────────────────────────────────────────
  label(en?: string, hi?: string): string {
    return (this.currentLang === 'hi' && hi) ? hi : (en ?? '');
  }

  getProgressClass(pct: number): string {
    if (pct >= 75) return 'high';
    if (pct >= 40) return 'medium';
    return 'low';
  }

  get spentPct(): number {
    if (!this.project || !this.project.allocatedBudget) return 0;
    return Math.min((this.project.totalSpent / this.project.allocatedBudget) * 100, 100);
  }

  formatSize(kb?: number): string {
    if (!kb) return '';
    if (kb < 1024) return `${kb} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  }

  docIcon(doc: Document): string {
    if (this.isImage(doc)) return 'image';
    if (this.isPdf(doc))   return 'picture_as_pdf';
    const t = doc.fileType?.toLowerCase() ?? '';
    if (t.includes('word') || t.includes('doc')) return 'description';
    if (t.includes('sheet') || t.includes('xls')) return 'table_chart';
    return 'insert_drive_file';
  }

  goBack(): void { this.router.navigate(['/projects']); }
}