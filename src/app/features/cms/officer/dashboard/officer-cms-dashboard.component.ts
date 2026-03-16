import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar }        from '@angular/material/snack-bar';
import { OfficerComplaintService, PublicComplaintService } from '../../services/cms.services';
import { ComplaintSummaryResponse, ComplaintDetailResponse } from '../../models/cms.models';
import { PageEvent }          from '@angular/material/paginator';
import { environment }        from '../../../../../environments/environment';

@Component({
  standalone: false,
  selector: 'vp-officer-cms-dashboard',
  templateUrl: './officer-cms-dashboard.component.html',
  styleUrls: ['./officer-cms-dashboard.component.scss']
})
export class OfficerCmsDashboardComponent implements OnInit {

  complaints:  ComplaintSummaryResponse[] = [];
  selected?:   ComplaintDetailResponse;
  loading      = false;
  total        = 0;
  page         = 0;
  pageSize     = 10;
  submitting   = false;

  updateForm:  FormGroup;
  resolveForm: FormGroup;
  activePanel: 'update' | 'resolve' | null = null;
  proofFiles:  File[] = [];

  constructor(
    private fb:     FormBuilder,
    private svc:    OfficerComplaintService,
    private pubSvc: PublicComplaintService,
    private snack:  MatSnackBar
  ) {
    this.updateForm  = this.fb.group({ note: ['', [Validators.required, Validators.minLength(5)]], isPublicNote: [true] });
    this.resolveForm = this.fb.group({ resolutionNote: ['', [Validators.required, Validators.minLength(20)]] });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.getAssigned(this.page, this.pageSize).subscribe({
      next: res => {
        this.complaints = res.data.content;
        this.total      = res.data.totalElements;
        this.loading    = false;
      },
      error: () => { this.loading = false; }
    });
  }

  selectComplaint(c: ComplaintSummaryResponse): void {
    this.pubSvc.getDetail(c.complaintNumber).subscribe(res => {
      this.selected    = res.data;
      this.activePanel = null;
      this.updateForm.reset({ note: '', isPublicNote: true });
      this.resolveForm.reset();
      this.proofFiles  = [];
    });
  }

  postUpdate(): void {
    if (this.updateForm.invalid || !this.selected) { this.updateForm.markAllAsTouched(); return; }
    this.submitting = true;
    this.svc.postUpdate(this.selected.id, this.updateForm.value).subscribe({
      next: res => {
        this.selected = res.data;
        this.submitting = false;
        this.activePanel = null;
        this.snack.open('Update posted successfully.', 'OK', { duration: 3000 });
        this.updateForm.reset({ note: '', isPublicNote: true });
      },
      error: err => {
        this.submitting = false;
        this.snack.open(err.error?.message ?? 'Failed to post update.', 'Dismiss', { duration: 4000 });
      }
    });
  }

  onProofSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.proofFiles = [...this.proofFiles, ...Array.from(input.files)].slice(0, 5);
  }

  uploadAndResolve(): void {
    if (!this.selected) return;
    if (this.resolveForm.invalid) { this.resolveForm.markAllAsTouched(); return; }
    this.submitting = true;

    const doResolve = () => {
      this.svc.resolve(this.selected!.id, this.resolveForm.value).subscribe({
        next: res => {
          this.selected = res.data;
          this.submitting = false;
          this.activePanel = null;
          this.load();
          this.snack.open('Complaint marked as resolved!', 'OK', { duration: 4000 });
        },
        error: err => {
          this.submitting = false;
          this.snack.open(err.error?.message ?? 'Failed to resolve.', 'Dismiss', { duration: 4000 });
        }
      });
    };

    if (this.proofFiles.length > 0) {
      this.svc.uploadResolutionProof(this.selected.id, this.proofFiles).subscribe({
        complete: () => doResolve(),
        error:    () => doResolve()
      });
    } else {
      doResolve();
    }
  }

  onPage(e: PageEvent): void { this.page = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

  getEvidenceUrl(complaintId: number, evidenceId: number): string {
    return `${environment.apiUrl}/complaints/${complaintId}/evidence/${evidenceId}/download`;
  }
}
