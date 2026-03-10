import { Injectable }    from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable }    from 'rxjs';
import { environment }   from '../../../environments/environment';
import {
  ApiResponse, PageResponse,
  Fund, CreateFundRequest, FundStatus,
  Expenditure, CreateExpenditureRequest,
  User, CreateUserRequest,
  Document, DocumentType,
  AuditLog, AuditAction
} from '../models/models';

// ── Fund Service ──────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class FundService {
  private readonly base = `${environment.apiUrl}/funds`;
  constructor(private http: HttpClient) {}

  getAllFunds(page = 0, size = 10): Observable<ApiResponse<PageResponse<Fund>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<Fund>>>(this.base, { params });
  }

  getFundById(id: number): Observable<ApiResponse<Fund>> {
    return this.http.get<ApiResponse<Fund>>(`${this.base}/${id}`);
  }

  getPublicFundById(id: number): Observable<ApiResponse<Fund>> {
    return this.http.get<ApiResponse<Fund>>(`${this.base}/public/${id}`);
  }

  getFundsByStatus(status: FundStatus): Observable<ApiResponse<Fund[]>> {
    return this.http.get<ApiResponse<Fund[]>>(`${this.base}/status/${status}`);
  }

  getFundsByYear(year: string): Observable<ApiResponse<Fund[]>> {
    return this.http.get<ApiResponse<Fund[]>>(`${this.base}/year/${year}`);
  }

  createFund(req: CreateFundRequest): Observable<ApiResponse<Fund>> {
    return this.http.post<ApiResponse<Fund>>(this.base, req);
  }

  updateFund(id: number, req: CreateFundRequest): Observable<ApiResponse<Fund>> {
    return this.http.put<ApiResponse<Fund>>(`${this.base}/${id}`, req);
  }

  deleteFund(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`);
  }
  getPublicFunds(page = 0, size = 50): Observable<ApiResponse<PageResponse<Fund> | Fund[]>> {
  const params = new HttpParams().set('page', page).set('size', size);
  return this.http.get<ApiResponse<PageResponse<Fund> | Fund[]>>(`${this.base}/public`, { params });
}

getPublicFundsByStatus(status: FundStatus): Observable<ApiResponse<Fund[]>> {
  return this.http.get<ApiResponse<Fund[]>>(`${this.base}/public/status/${status}`);
}
}

// ── Expenditure Service ───────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ExpenditureService {
  private readonly base = `${environment.apiUrl}/expenditures`;
  constructor(private http: HttpClient) {}

  getByProject(projectId: number, page = 0, size = 20): Observable<ApiResponse<PageResponse<Expenditure>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<Expenditure>>>(
      `${this.base}/project/${projectId}`, { params }
    );
  }

  getById(id: number): Observable<ApiResponse<Expenditure>> {
    return this.http.get<ApiResponse<Expenditure>>(`${this.base}/${id}`);
  }

  create(req: CreateExpenditureRequest): Observable<ApiResponse<Expenditure>> {
    return this.http.post<ApiResponse<Expenditure>>(this.base, req);
  }

  verify(id: number): Observable<ApiResponse<Expenditure>> {
    return this.http.put<ApiResponse<Expenditure>>(`${this.base}/${id}/verify`, {});
  }
  getByProjectDateRange(projectId: number, from: string, to: string): Observable<ApiResponse<Expenditure[]>> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<ApiResponse<Expenditure[]>>(
      `${this.base}/project/${projectId}/date-range`, { params }
    );
  }

  getPendingVerifications(): Observable<ApiResponse<Expenditure[]>> {
    return this.http.get<ApiResponse<Expenditure[]>>(`${this.base}/pending-verification`);
  }
}

// ── User Service ──────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly base = `${environment.apiUrl}/users`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(this.base);
  }

  getById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.base}/${id}`);
  }

  create(req: CreateUserRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.base, req);
  }

  activate(id: number): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${this.base}/${id}/activate`, {});
  }

  deactivate(id: number): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${this.base}/${id}/deactivate`, {});
  }

  resetPassword(id: number, newPassword: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/${id}/reset-password`, { newPassword });
  }
}


// ── Document Service ──────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly base = `${environment.apiUrl}/documents`;
  constructor(private http: HttpClient) {}

  getPublicByProject(projectId: number): Observable<ApiResponse<Document[]>> {
    return this.http.get<ApiResponse<Document[]>>(
      `${this.base}/public/project/${projectId}`
    );
  }

  getByProject(projectId: number): Observable<ApiResponse<Document[]>> {
    return this.http.get<ApiResponse<Document[]>>(
      `${this.base}/project/${projectId}`
    );
  }

  upload(
    file: File,
    documentType: string,
    titleEn?: string,
    titleHi?: string,
    projectId?: number,
    fundId?: number,
    expenditureId?: number,
    isPublic: boolean = true
  ): Observable<ApiResponse<Document>> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('documentType', documentType);
    if (titleEn)       fd.append('titleEn', titleEn);
    if (titleHi)       fd.append('titleHi', titleHi);
    if (projectId)     fd.append('projectId', String(projectId));
    if (fundId)        fd.append('fundId', String(fundId));
    if (expenditureId) fd.append('expenditureId', String(expenditureId));
    fd.append('isPublic', String(isPublic));
    return this.http.post<ApiResponse<Document>>(this.base, fd);
  }

  getByFund(fundId: number): Observable<ApiResponse<Document[]>> {
    return this.http.get<ApiResponse<Document[]>>(`${this.base}/fund/${fundId}`);
  }

  getByExpenditure(expenditureId: number): Observable<ApiResponse<Document[]>> {
    return this.http.get<ApiResponse<Document[]>>(`${this.base}/expenditure/${expenditureId}`);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`);
  }

  downloadFile(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/${id}/download`, { responseType: 'blob' });
  }
}

// ── Contractor Service ────────────────────────────────────

import { Contractor, ContractorCategory } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ContractorService {
  private readonly base = `${environment.apiUrl}/contractors`;
  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 12): Observable<ApiResponse<PageResponse<Contractor>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<Contractor>>>(this.base, { params });
  }

  getPublicContractors(page = 0, size = 12): Observable<ApiResponse<PageResponse<Contractor>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<Contractor>>>(`${this.base}/public`, { params });
  }

  getById(id: number): Observable<ApiResponse<Contractor>> {
    return this.http.get<ApiResponse<Contractor>>(`${this.base}/${id}`);
  }

  create(req: Partial<Contractor>): Observable<ApiResponse<Contractor>> {
    return this.http.post<ApiResponse<Contractor>>(this.base, req);
  }

  update(id: number, req: Partial<Contractor>): Observable<ApiResponse<Contractor>> {
    return this.http.put<ApiResponse<Contractor>>(`${this.base}/${id}`, req);
  }

  blacklist(id: number, reason: string): Observable<ApiResponse<Contractor>> {
    return this.http.patch<ApiResponse<Contractor>>(`${this.base}/${id}/blacklist`, { reason });
  }

  removeFromBlacklist(id: number): Observable<ApiResponse<Contractor>> {
    return this.http.patch<ApiResponse<Contractor>>(`${this.base}/${id}/remove-blacklist`, {});
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`);
  }
}
// ── Audit Log Service ─────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly base = `${environment.apiUrl}/audit-logs`;
  constructor(private http: HttpClient) {}

  // GET /audit-logs/record/{tableName}/{recordId}  → List (no pagination)
  getRecordHistory(tableName: string, recordId: number): Observable<ApiResponse<AuditLog[]>> {
    return this.http.get<ApiResponse<AuditLog[]>>(
      `${this.base}/record/${tableName}/${recordId}`
    );
  }

  // GET /audit-logs/user/{userId}?page&size
  getByUser(userId: number, page = 0, size = 20): Observable<ApiResponse<PageResponse<AuditLog>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<AuditLog>>>(
      `${this.base}/user/${userId}`, { params }
    );
  }

  // GET /audit-logs/action/{action}?page&size
  getByAction(action: AuditAction, page = 0, size = 20): Observable<ApiResponse<PageResponse<AuditLog>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<AuditLog>>>(
      `${this.base}/action/${action}`, { params }
    );
  }

  // GET /audit-logs/date-range?from=&to=&page&size
  getByDateRange(from: string, to: string, page = 0, size = 50): Observable<ApiResponse<PageResponse<AuditLog>>> {
    const params = new HttpParams()
      .set('from', from).set('to', to)
      .set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<AuditLog>>>(
      `${this.base}/date-range`, { params }
    );
  }
}