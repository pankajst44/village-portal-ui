import { Injectable }                from '@angular/core';
import { HttpClient, HttpParams }    from '@angular/common/http';
import { Observable }                from 'rxjs';
import { environment }               from '../../../../environments/environment';
import { ApiResponse, PageResponse, AuthResponse } from '../../../core/models/models';
import {
  CategoryResponse,
  ComplaintDetailResponse,
  ComplaintStatsResponse,
  ComplaintSummaryResponse,
  ComplaintStatus,
  ComplaintPriority,
  NotificationResponse,
  VoteResponse,
  SubmitComplaintRequest,
  PostUpdateRequest,
  ResolveComplaintRequest,
  AssignComplaintRequest,
  RejectComplaintRequest,
  ResolutionResponseRequest,
  OtpVerifyRequest,
  ResidentRegisterRequest,
} from '../models/cms.models';

// ── Resident Auth Service ─────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ResidentAuthService {
  private readonly base = `${environment.apiUrl}/auth`;
  constructor(private http: HttpClient) {}

  register(req: ResidentRegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.base}/register/resident`, req);
  }

  sendOtp(phone: string): Observable<ApiResponse<void>> {
    const params = new HttpParams().set('phone', phone);
    return this.http.post<ApiResponse<void>>(`${this.base}/otp/send`, null, { params });
  }

  verifyOtp(req: OtpVerifyRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.base}/otp/verify`, req);
  }

  getOtpStatus(): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.base}/otp/status`);
  }
}

// ── Public Complaint Service ──────────────────────────────

@Injectable({ providedIn: 'root' })
export class PublicComplaintService {
  private readonly base = `${environment.apiUrl}/complaints/public`;
  constructor(private http: HttpClient) {}

  getCategories(): Observable<ApiResponse<CategoryResponse[]>> {
    return this.http.get<ApiResponse<CategoryResponse[]>>(`${this.base}/categories`);
  }

  getStats(villageId?: number): Observable<ApiResponse<ComplaintStatsResponse>> {
    let params = new HttpParams();
    if (villageId) params = params.set('villageId', villageId);
    return this.http.get<ApiResponse<ComplaintStatsResponse>>(`${this.base}/stats`, { params });
  }

  list(filters: {
    status?:     ComplaintStatus;
    categoryId?: number;
    wardNumber?: number;
    search?:     string;
    page?:       number;
    size?:       number;
    sortBy?:     string;
    sortDir?:    string;
  }): Observable<ApiResponse<PageResponse<ComplaintSummaryResponse>>> {
    let params = new HttpParams();
    if (filters.status)     params = params.set('status', filters.status);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters.wardNumber) params = params.set('wardNumber', filters.wardNumber);
    if (filters.search)     params = params.set('search', filters.search);
    params = params
      .set('page',    filters.page    ?? 0)
      .set('size',    filters.size    ?? 10)
      .set('sortBy',  filters.sortBy  ?? 'createdAt')
      .set('sortDir', filters.sortDir ?? 'desc');
    return this.http.get<ApiResponse<PageResponse<ComplaintSummaryResponse>>>(this.base, { params });
  }

  getDetail(complaintNumber: string): Observable<ApiResponse<ComplaintDetailResponse>> {
    return this.http.get<ApiResponse<ComplaintDetailResponse>>(`${this.base}/${complaintNumber}`);
  }

  getEvidenceDownloadUrl(complaintId: number, evidenceId: number): string {
    return `${environment.apiUrl}/complaints/${complaintId}/evidence/${evidenceId}/download`;
  }
}

// ── Resident Complaint Service ────────────────────────────

@Injectable({ providedIn: 'root' })
export class ResidentComplaintService {
  private readonly base = `${environment.apiUrl}/complaints`;
  constructor(private http: HttpClient) {}

  submit(req: SubmitComplaintRequest): Observable<ApiResponse<ComplaintDetailResponse>> {
    return this.http.post<ApiResponse<ComplaintDetailResponse>>(this.base, req);
  }

  uploadEvidence(complaintId: number, files: File[]): Observable<ApiResponse<void>> {
    const fd = new FormData();
    files.forEach(f => fd.append('files', f, f.name));
    return this.http.post<ApiResponse<void>>(`${this.base}/${complaintId}/evidence`, fd);
  }

  vote(complaintId: number): Observable<ApiResponse<VoteResponse>> {
    return this.http.post<ApiResponse<VoteResponse>>(`${this.base}/${complaintId}/vote`, null);
  }

  myComplaints(page = 0, size = 10): Observable<ApiResponse<PageResponse<ComplaintSummaryResponse>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<ComplaintSummaryResponse>>>(`${this.base}/my`, { params });
  }

  acceptResolution(complaintId: number): Observable<ApiResponse<ComplaintDetailResponse>> {
    return this.http.post<ApiResponse<ComplaintDetailResponse>>(
      `${this.base}/${complaintId}/resolution/accept`, null
    );
  }

  rejectResolution(complaintId: number, req: ResolutionResponseRequest): Observable<ApiResponse<ComplaintDetailResponse>> {
    return this.http.post<ApiResponse<ComplaintDetailResponse>>(
      `${this.base}/${complaintId}/resolution/reject`, req
    );
  }
}

// ── Notification Service ──────────────────────────────────

@Injectable({ providedIn: 'root' })
export class CmsNotificationService {
  private readonly base = `${environment.apiUrl}/complaints/notifications`;
  constructor(private http: HttpClient) {}

  getNotifications(page = 0, size = 20): Observable<ApiResponse<PageResponse<NotificationResponse>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<NotificationResponse>>>(this.base, { params });
  }

  getUnreadCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.base}/unread-count`);
  }

  markRead(notificationId: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/${notificationId}/read`, null);
  }

  markAllRead(): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/read-all`, null);
  }
}

// ── Officer Complaint Service ─────────────────────────────

@Injectable({ providedIn: 'root' })
export class OfficerComplaintService {
  private readonly base = `${environment.apiUrl}/complaints`;
  constructor(private http: HttpClient) {}

  getAssigned(page = 0, size = 10): Observable<ApiResponse<PageResponse<ComplaintSummaryResponse>>> {
    const params = new HttpParams()
      .set('page', page).set('size', size)
      .set('sortBy', 'dueDate').set('sortDir', 'asc');
    return this.http.get<ApiResponse<PageResponse<ComplaintSummaryResponse>>>(
      `${this.base}/assigned`, { params }
    );
  }

  postUpdate(complaintId: number, req: PostUpdateRequest): Observable<ApiResponse<ComplaintDetailResponse>> {
    return this.http.post<ApiResponse<ComplaintDetailResponse>>(
      `${this.base}/${complaintId}/update`, req
    );
  }

  uploadResolutionProof(complaintId: number, files: File[]): Observable<ApiResponse<void>> {
    const fd = new FormData();
    files.forEach(f => fd.append('files', f, f.name));
    return this.http.post<ApiResponse<void>>(
      `${this.base}/${complaintId}/evidence/resolution`, fd
    );
  }

  resolve(complaintId: number, req: ResolveComplaintRequest): Observable<ApiResponse<ComplaintDetailResponse>> {
    return this.http.post<ApiResponse<ComplaintDetailResponse>>(
      `${this.base}/${complaintId}/resolve`, req
    );
  }
}

// ── Admin Complaint Service ───────────────────────────────

@Injectable({ providedIn: 'root' })
export class AdminComplaintService {
  private readonly base = `${environment.apiUrl}/complaints/admin`;
  constructor(private http: HttpClient) {}

  listAll(filters: {
    status?:       ComplaintStatus;
    priority?:     ComplaintPriority;
    categoryId?:   number;
    escalatedOnly?: boolean;
    page?:         number;
    size?:         number;
    sortBy?:       string;
    sortDir?:      string;
  }): Observable<ApiResponse<PageResponse<ComplaintSummaryResponse>>> {
    let params = new HttpParams();
    if (filters.status)        params = params.set('status', filters.status);
    if (filters.priority)      params = params.set('priority', filters.priority);
    if (filters.categoryId)    params = params.set('categoryId', filters.categoryId);
    if (filters.escalatedOnly) params = params.set('escalatedOnly', true);
    params = params
      .set('page',    filters.page    ?? 0)
      .set('size',    filters.size    ?? 10)
      .set('sortBy',  filters.sortBy  ?? 'createdAt')
      .set('sortDir', filters.sortDir ?? 'desc');
    return this.http.get<ApiResponse<PageResponse<ComplaintSummaryResponse>>>(this.base, { params });
  }

  getStats(): Observable<ApiResponse<ComplaintStatsResponse>> {
    return this.http.get<ApiResponse<ComplaintStatsResponse>>(`${this.base}/stats`);
  }

  verify(complaintId: number, note?: string): Observable<ApiResponse<ComplaintDetailResponse>> {
    let params = new HttpParams();
    if (note) params = params.set('note', note);
    return this.http.post<ApiResponse<ComplaintDetailResponse>>(
      `${this.base}/${complaintId}/verify`, null, { params }
    );
  }

  reject(complaintId: number, req: RejectComplaintRequest): Observable<ApiResponse<ComplaintDetailResponse>> {
    return this.http.post<ApiResponse<ComplaintDetailResponse>>(
      `${this.base}/${complaintId}/reject`, req
    );
  }

  assign(complaintId: number, req: AssignComplaintRequest): Observable<ApiResponse<ComplaintDetailResponse>> {
    return this.http.post<ApiResponse<ComplaintDetailResponse>>(
      `${this.base}/${complaintId}/assign`, req
    );
  }

  escalate(complaintId: number, level: number, note?: string): Observable<ApiResponse<ComplaintDetailResponse>> {
    let params = new HttpParams().set('level', level);
    if (note) params = params.set('note', note);
    return this.http.post<ApiResponse<ComplaintDetailResponse>>(
      `${this.base}/${complaintId}/escalate`, null, { params }
    );
  }

  changePriority(complaintId: number, priority: ComplaintPriority): Observable<ApiResponse<ComplaintDetailResponse>> {
    const params = new HttpParams().set('priority', priority);
    return this.http.patch<ApiResponse<ComplaintDetailResponse>>(
      `${this.base}/${complaintId}/priority`, null, { params }
    );
  }

  toggleVisibility(complaintId: number): Observable<ApiResponse<ComplaintDetailResponse>> {
    return this.http.patch<ApiResponse<ComplaintDetailResponse>>(
      `${this.base}/${complaintId}/visibility`, null
    );
  }
}
