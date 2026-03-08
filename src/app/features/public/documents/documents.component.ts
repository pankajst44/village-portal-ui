import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { DocumentService }   from '../../../core/services/api.services';
import { ProjectService }    from '../../../core/services/project.service';
import { LanguageService }   from '../../../core/services/language.service';
import { Document as VpDoc, DocumentType, Project } from '../../../core/models/models';

@Component({
  standalone: false,
  selector:    'vp-documents',
  templateUrl: './documents.component.html',
  styleUrls:   ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit, OnDestroy {

  projects:        Project[] = [];
  projectsLoading  = true;
  selectedProject: Project | null = null;

  documents:       VpDoc[] = [];
  loading          = false;
  error            = false;
  currentLang      = 'en';

  searchTerm   = '';
  selectedType: DocumentType | '' = '';

  // Preview state
  previewDoc:       VpDoc | null = null;
  previewUrl:       SafeResourceUrl | null = null;
  previewBlobUrl:   string | null = null;   // raw URL for revoke
  safeImageUrl:     SafeUrl | null = null;
  previewLoading    = false;
  previewError      = false;
  previewIsImage    = false;
  previewIsPdf      = false;

  // Track created blob URLs for cleanup
  private blobUrls: string[] = [];

  readonly docTypes: DocumentType[] = [
    'PHOTO', 'SANCTION_ORDER', 'WORK_ORDER', 'BILL', 'COMPLETION_CERT', 'AGREEMENT', 'OTHER'
  ];

  constructor(
    private documentSvc: DocumentService,
    private projectSvc:  ProjectService,
    private langSvc:     LanguageService,
    private sanitizer:   DomSanitizer
  ) {}

  ngOnInit(): void {
    this.langSvc.currentLang.subscribe(l => this.currentLang = l);
    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.revokeBlobUrls();
  }

  private revokeBlobUrls(): void {
    this.blobUrls.forEach(u => URL.revokeObjectURL(u));
    this.blobUrls = [];
  }

  loadProjects(): void {
    this.projectsLoading = true;
    this.projectSvc.getPublicProjects(0, 100).subscribe({
      next:  res => { this.projects = res.data?.content ?? []; this.projectsLoading = false; },
      error: ()  => { this.projectsLoading = false; }
    });
  }

  selectProject(project: Project): void {
    this.selectedProject = project;
    this.searchTerm      = '';
    this.selectedType    = '';
    this.closePreview();
    this.loadDocuments();
  }

  loadDocuments(): void {
    if (!this.selectedProject) return;
    this.loading = true;
    this.error   = false;
    this.documentSvc.getPublicByProject(this.selectedProject.id).subscribe({
      next:  res => { this.documents = (res.data as unknown as VpDoc[]) ?? []; this.loading = false; },
      error: () => {
        this.documentSvc.getByProject(this.selectedProject!.id).subscribe({
          next:  res => { this.documents = (res.data as unknown as VpDoc[]) ?? []; this.loading = false; },
          error: ()  => { this.loading = false; this.error = true; }
        });
      }
    });
  }

  clearProject(): void {
    this.selectedProject = null;
    this.documents       = [];
    this.closePreview();
  }

  // ── Preview ────────────────────────────────────────────

  openPreview(doc: VpDoc): void {
    this.previewDoc     = doc;
    this.previewLoading = true;
    this.previewError   = false;
    this.previewUrl     = null;
    this.previewBlobUrl = null;
    this.safeImageUrl   = null;

    // fileType may be a MIME string like "image/jpeg" or just "jpeg" — normalise to extension
    const raw = doc.fileType?.toLowerCase() ?? '';
    const ft  = raw.includes('/') ? raw.split('/').pop()! : raw;
    // Also handle "jpeg" vs "jpg"
    this.previewIsImage = ['jpg','jpeg','png','gif','webp','bmp'].some(e => ft.includes(e));
    this.previewIsPdf   = ft.includes('pdf');

    if (!this.previewIsImage && !this.previewIsPdf) {
      this.previewLoading = false;
      this.triggerDownload(doc);
      this.previewDoc = null;
      return;
    }

    this.documentSvc.downloadFile(doc.id).subscribe({
      next: (blob: Blob) => {
        // Use blob's own content-type if available, else infer
        const mimeType = blob.type || (this.previewIsPdf ? 'application/pdf' : `image/${ft}`);
        const typed    = new Blob([blob], { type: mimeType });
        const url      = URL.createObjectURL(typed);
        this.blobUrls.push(url);
        this.previewBlobUrl = url;
        // Both image and PDF need a SafeUrl — bypassSecurityTrustUrl for img src
        this.safeImageUrl = this.sanitizer.bypassSecurityTrustUrl(url);
        // SafeResourceUrl for iframe src
        this.previewUrl   = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.previewLoading = false;
      },
      error: () => { this.previewLoading = false; this.previewError = true; }
    });
  }

  closePreview(): void {
    this.previewDoc     = null;
    this.previewUrl     = null;
    this.previewBlobUrl = null;
    this.safeImageUrl   = null;
    this.previewLoading = false;
    this.previewError   = false;
  }

  // ── Download ───────────────────────────────────────────

  download(doc: VpDoc): void {
    this.triggerDownload(doc);
  }

  private triggerDownload(doc: VpDoc): void {
    this.documentSvc.downloadFile(doc.id).subscribe({
      next: (blob: Blob) => {
        const url  = URL.createObjectURL(blob);
        const a    = window.document.createElement('a');
        a.href     = url;
        a.download = doc.originalFileName;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      },
      error: () => {}
    });
  }

  // ── Helpers ────────────────────────────────────────────

  label(en?: string, hi?: string): string {
    return (this.currentLang === 'hi' && hi) ? hi : (en ?? '');
  }

  canPreview(doc: VpDoc): boolean {
    const raw = doc.fileType?.toLowerCase() ?? '';
    const ft  = raw.includes('/') ? raw.split('/').pop()! : raw;
    return ['jpg','jpeg','png','gif','webp','bmp','pdf'].some(e => ft.includes(e));
  }

  get filteredDocuments(): VpDoc[] {
    let result = this.documents;
    if (this.selectedType) result = result.filter(d => d.documentType === this.selectedType);
    if (this.searchTerm.trim()) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(d =>
        d.titleEn?.toLowerCase().includes(t) ||
        d.originalFileName?.toLowerCase().includes(t) ||
        d.uploadedByUsername?.toLowerCase().includes(t)
      );
    }
    return result;
  }

  getDocIcon(type: DocumentType): string {
    const icons: Record<DocumentType, string> = {
      PHOTO: 'photo_camera', SANCTION_ORDER: 'gavel', WORK_ORDER: 'assignment',
      BILL: 'receipt', COMPLETION_CERT: 'workspace_premium', AGREEMENT: 'handshake', OTHER: 'description'
    };
    return icons[type] ?? 'description';
  }

  getDocColor(type: DocumentType): string {
    const colors: Record<DocumentType, string> = {
      PHOTO: '#7b1fa2', SANCTION_ORDER: '#1565c0', WORK_ORDER: '#2e7d32',
      BILL: '#c62828', COMPLETION_CERT: '#e65100', AGREEMENT: '#00695c', OTHER: '#546e7a'
    };
    return colors[type] ?? '#546e7a';
  }

  formatSize(kb?: number): string {
    if (!kb) return '—';
    return kb < 1024 ? `${kb} KB` : `${(kb / 1024).toFixed(1)} MB`;
  }

  get totalCount():  number { return this.documents.length; }
  get publicCount(): number { return this.documents.filter(d => d.isPublic).length; }

  getTypeCount(type: DocumentType): number {
    return this.documents.filter(d => d.documentType === type).length;
  }
}