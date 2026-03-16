import { Component, OnInit }  from '@angular/core';
import { ActivatedRoute }     from '@angular/router';
import { MatSnackBar }        from '@angular/material/snack-bar';
import {
  PublicComplaintService, ResidentComplaintService
} from '../../services/cms.services';
import { AuthService }         from '../../../../core/services/auth.service';
import { ComplaintDetailResponse } from '../../models/cms.models';
import { environment }             from '../../../../../environments/environment';

@Component({
  standalone: false,
  selector: 'vp-complaint-detail',
  templateUrl: './complaint-detail.component.html',
  styleUrls: ['./complaint-detail.component.scss']
})
export class ComplaintDetailComponent implements OnInit {

  complaint?: ComplaintDetailResponse;
  loading   = false;
  voting    = false;
  role      = '';
  userId    = 0;

  constructor(
    private route:     ActivatedRoute,
    private pubSvc:    PublicComplaintService,
    private resSvc:    ResidentComplaintService,
    private auth:      AuthService,
    private snack:     MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.role   = this.auth.getRole();
    this.userId = this.auth.getUser()?.id ?? 0;
    const num   = this.route.snapshot.paramMap.get('complaintNumber')!;
    this.loadDetail(num);
  }

  loadDetail(num: string): void {
    this.loading = true;
    this.pubSvc.getDetail(num).subscribe({
      next:  res => { this.complaint = res.data; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  toggleVote(): void {
    if (!this.complaint || this.voting) return;
    this.voting = true;
    this.resSvc.vote(this.complaint.id).subscribe({
      next: res => {
        if (this.complaint) {
          this.complaint.hasVoted    = res.data.voted;
          this.complaint.supportCount = res.data.newSupportCount;
        }
        this.voting = false;
      },
      error: () => { this.voting = false; }
    });
  }

  acceptResolution(): void {
    if (!this.complaint) return;
    this.resSvc.acceptResolution(this.complaint.id).subscribe({
      next: res => {
        this.complaint = res.data;
        this.snack.open('Resolution accepted. Case closed.', 'OK', { duration: 4000 });
      },
      error: err => {
        this.snack.open(err.error?.message ?? 'Failed to accept resolution.', 'Dismiss', { duration: 4000 });
      }
    });
  }

  rejectResolution(): void {
    if (!this.complaint) return;
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    this.resSvc.rejectResolution(this.complaint.id, { rejectionReason: reason }).subscribe({
      next: res => {
        this.complaint = res.data;
        this.snack.open('Resolution rejected. Complaint re-opened.', 'OK', { duration: 4000 });
      },
      error: err => {
        this.snack.open(err.error?.message ?? 'Failed to reject resolution.', 'Dismiss', { duration: 4000 });
      }
    });
  }

  getDownloadUrl(evidenceId: number): string {
    return `${environment.apiUrl}/complaints/${this.complaint?.id}/evidence/${evidenceId}/download`;
  }

  isOwner(): boolean {
    return this.complaint?.submitterDisplayName !== 'Anonymous Resident' && this.role === 'RESIDENT';
  }

  canVote(): boolean {
    return this.role === 'RESIDENT' &&
      this.complaint?.status !== 'CLOSED' &&
      this.complaint?.status !== 'REJECTED';
  }

  canRespondToResolution(): boolean {
    return this.isOwner() && this.complaint?.status === 'RESOLVED';
  }

  isImage(fileType: string | null): boolean {
    return fileType?.startsWith('image/') ?? false;
  }

  formatEvidenceType(type: string): string {
    return type ? type.replace(/_/g, ' ') : '';
  }
}
