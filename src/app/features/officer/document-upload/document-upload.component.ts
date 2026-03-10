import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { DocumentService } from '../../../core/services/api.services';
import { ProjectService }  from '../../../core/services/project.service';
import { FundService }     from '../../../core/services/api.services';
import { Document as VpDoc, DocumentType, Project, Fund } from '../../../core/models/models';

@Component({
  standalone: false,
  selector:    'vp-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls:   ['./document-upload.component.scss']
})
export class DocumentUploadComponent implements OnInit, OnDestroy {

  projects:  Project[] = [];
  funds:     Fund[]    = [];
  documents: VpDoc[]   = [];

  loadingProjects = true;
  loadingDocs     = false;
  uploading       = false;

  selectedFile: File | null = null;
  dragOver      = false;

  activeTab: 'upload' | 'view' = 'upload';
  selectedProjectId: number | '' = '';

  // Preview state
  previewDoc:     VpDoc | null       = null;
  previewUrl:     SafeResourceUrl | null = null;
  safeImageUrl:   SafeUrl | null     = null;
  previewBlobUrl: string | null      = null;
  previewLoading  = false;
  previewError    = false;
  previewIsImage  = false;
  previewIsPdf    = false;
  private blobUrls: string[]         = [];

  form: FormGroup;

  readonly docTypes: DocumentType[] = [
    'PHOTO','SANCTION_ORDER','WORK_ORDER','BILL','COMPLETION_CERT','AGREEMENT','OTHER'
  ];
  readonly docTypeIcons: Record<string, string> = {
    PHOTO:'photo_camera', SANCTION_ORDER:'gavel', WORK_ORDER:'assignment',
    BILL:'receipt', COMPLETION_CERT:'workspace_premium', AGREEMENT:'handshake', OTHER:'description'
  };
  readonly docTypeColors: Record<string, string> = {
    PHOTO:'#7b1fa2', SANCTION_ORDER:'#1565c0', WORK_ORDER:'#2e7d32',
    BILL:'#c62828', COMPLETION_CERT:'#e65100', AGREEMENT:'#00695c', OTHER:'#546e7a'
  };
  readonly acceptedTypes = '.pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.csv,.txt';

  constructor(
    private fb:          FormBuilder,
    private documentSvc: DocumentService,
    private projectSvc:  ProjectService,
    private fundSvc:     FundService,
    private snackBar:    MatSnackBar,
    private sanitizer:   DomSanitizer
  ) {
    this.form = this.fb.group({
      documentType: ['', Validators.required],
      titleEn:      ['', Validators.maxLength(200)],
      titleHi:      ['', Validators.maxLength(200)],
      projectId:    [null],
      fundId:       [null],
      isPublic:     [true],
    });
  }

  ngOnInit(): void {
    this.projectSvc.getAllProjects(0, 200).subscribe({
      next: res => { this.projects = res.data?.content ?? []; this.loadingProjects = false; },
      error: ()  => { this.loadingProjects = false; }
    });
    this.fundSvc.getAllFunds(0, 100).subscribe({
      next: res => this.funds = res.data?.content ?? []
    });
  }

  ngOnDestroy(): void { this.revokeBlobUrls(); }
  private revokeBlobUrls(): void { this.blobUrls.forEach(u => URL.revokeObjectURL(u)); this.blobUrls = []; }

  // ── File selection ──────────────────────────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.setFile(input.files[0]);
  }
  onDrop(event: DragEvent): void {
    event.preventDefault(); this.dragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.setFile(file);
  }
  onDragOver(event: DragEvent): void { event.preventDefault(); this.dragOver = true; }
  onDragLeave(): void { this.dragOver = false; }
  private setFile(file: File): void {
    this.selectedFile = file;
    if (!this.form.value.titleEn) {
      const name = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      this.form.patchValue({ titleEn: name });
    }
  }
  clearFile(): void { this.selectedFile = null; this.form.patchValue({ titleEn: '' }); }

  // ── Upload ──────────────────────────────────────────────
  upload(): void {
    if (!this.selectedFile) { this.snackBar.open('Please select a file', 'Close', { duration: 3000 }); return; }
    if (this.form.invalid)  { this.form.markAllAsTouched(); return; }
    this.uploading = true;
    const v = this.form.value;
    this.documentSvc.upload(
      this.selectedFile, v.documentType,
      v.titleEn || undefined, v.titleHi || undefined,
      v.projectId ? +v.projectId : undefined,
      v.fundId    ? +v.fundId    : undefined,
      undefined, v.isPublic
    ).subscribe({
      next: () => {
        this.uploading = false;
        this.snackBar.open('Document uploaded successfully', 'Close',
          { duration: 3000, panelClass: 'snack-success' });
        this.selectedFile = null;
        this.form.reset({ isPublic: true });
        if (this.activeTab === 'view' && this.selectedProjectId === v.projectId) this.loadDocuments();
      },
      error: err => {
        this.uploading = false;
        this.snackBar.open(err?.error?.message ?? 'Upload failed', 'Close',
          { duration: 4000, panelClass: 'snack-error' });
      }
    });
  }

  // ── View ────────────────────────────────────────────────
  onTabChange(tab: 'upload' | 'view'): void {
    this.activeTab = tab;
    this.closePreview();
    if (tab === 'view' && this.selectedProjectId) this.loadDocuments();
  }
  onViewProjectChange(): void { this.documents = []; this.closePreview(); if (this.selectedProjectId) this.loadDocuments(); }
  loadDocuments(): void {
    if (!this.selectedProjectId) return;
    this.loadingDocs = true;
    this.documentSvc.getByProject(+this.selectedProjectId).subscribe({
      next: res => { this.documents = (res.data as unknown as VpDoc[]) ?? []; this.loadingDocs = false; },
      error: () => { this.loadingDocs = false; }
    });
  }

  // ── Preview ─────────────────────────────────────────────
  openPreview(doc: VpDoc): void {
    if (this.previewDoc?.id === doc.id) { this.closePreview(); return; }
    this.previewDoc     = doc;
    this.previewLoading = true;
    this.previewError   = false;
    this.previewUrl     = null;
    this.safeImageUrl   = null;
    this.previewBlobUrl = null;

    const raw = doc.fileType?.toLowerCase() ?? '';
    const ft  = raw.includes('/') ? raw.split('/').pop()! : raw;
    this.previewIsImage = ['jpg','jpeg','png','gif','webp','bmp'].some(e => ft.includes(e));
    this.previewIsPdf   = ft.includes('pdf');

    if (!this.previewIsImage && !this.previewIsPdf) {
      // Not previewable — trigger download instead
      this.previewLoading = false;
      this.previewDoc     = null;
      this.download(doc);
      return;
    }

    this.documentSvc.downloadFile(doc.id).subscribe({
      next: (blob: Blob) => {
        const mimeType = blob.type || (this.previewIsPdf ? 'application/pdf' : `image/${ft}`);
        const typed    = new Blob([blob], { type: mimeType });
        const url      = URL.createObjectURL(typed);
        this.blobUrls.push(url);
        this.previewBlobUrl = url;
        this.safeImageUrl   = this.sanitizer.bypassSecurityTrustUrl(url);
        this.previewUrl     = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.previewLoading = false;
      },
      error: () => { this.previewLoading = false; this.previewError = true; }
    });
  }

  closePreview(): void {
    this.previewDoc = null; this.previewUrl = null;
    this.safeImageUrl = null; this.previewBlobUrl = null;
    this.previewLoading = false; this.previewError = false;
  }

  canPreview(doc: VpDoc): boolean {
    const raw = doc.fileType?.toLowerCase() ?? '';
    const ft  = raw.includes('/') ? raw.split('/').pop()! : raw;
    return ['jpg','jpeg','png','gif','webp','bmp','pdf'].some(e => ft.includes(e));
  }

  // ── Download / Delete ───────────────────────────────────
  download(doc: VpDoc): void {
    this.documentSvc.downloadFile(doc.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a   = window.document.createElement('a');
        a.href = url; a.download = doc.originalFileName; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }
    });
  }
  deleteDoc(doc: VpDoc): void {
    if (!confirm(`Delete "${doc.titleEn || doc.originalFileName}"?`)) return;
    this.documentSvc.delete(doc.id).subscribe({
      next: () => {
        this.documents = this.documents.filter(d => d.id !== doc.id);
        if (this.previewDoc?.id === doc.id) this.closePreview();
        this.snackBar.open('Document deleted', 'Close', { duration: 3000, panelClass: 'snack-success' });
      },
      error: err => this.snackBar.open(err?.error?.message ?? 'Delete failed', 'Close',
        { duration: 4000, panelClass: 'snack-error' })
    });
  }

  // ── Helpers ─────────────────────────────────────────────
  get fileSize(): string {
    if (!this.selectedFile) return '';
    const kb = this.selectedFile.size / 1024;
    return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`;
  }
  formatSize(kb?: number): string {
    if (!kb) return '—';
    return kb < 1024 ? `${kb} KB` : `${(kb / 1024).toFixed(1)} MB`;
  }
  fe(name: string)                    { return this.form.get(name); }
  hasError(name: string, err: string) { const c = this.fe(name); return c?.hasError(err) && c.touched; }
}