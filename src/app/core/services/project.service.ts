import { Injectable }    from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable }    from 'rxjs';
import { environment }   from '../../../environments/environment';
import {
  ApiResponse, PageResponse,
  Project, CreateProjectRequest, UpdateProgressRequest,
  ProjectStatus, ProjectType
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProjectService {

  private readonly base = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  // ── Public ─────────────────────────────────────────────
  getPublicProjects(
    page = 0, size = 10,
    status?: ProjectStatus, type?: ProjectType
  ): Observable<ApiResponse<PageResponse<Project>>> {
    let params = new HttpParams()
      .set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    if (type)   params = params.set('type',   type);
    return this.http.get<ApiResponse<PageResponse<Project>>>(
      `${this.base}/public`, { params }
    );
  }

  getPublicProjectById(id: number): Observable<ApiResponse<Project>> {
    return this.http.get<ApiResponse<Project>>(`${this.base}/public/${id}`);
  }

  // ── Authenticated ──────────────────────────────────────
  getAllProjects(page = 0, size = 20): Observable<ApiResponse<PageResponse<Project>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<Project>>>(this.base, { params });
  }

  getProjectById(id: number): Observable<ApiResponse<Project>> {
    return this.http.get<ApiResponse<Project>>(`${this.base}/${id}`);
  }

  createProject(req: CreateProjectRequest): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(this.base, req);
  }

  updateProject(id: number, req: CreateProjectRequest): Observable<ApiResponse<Project>> {
    return this.http.put<ApiResponse<Project>>(`${this.base}/${id}`, req);
  }

  updateProgress(id: number, req: UpdateProgressRequest): Observable<ApiResponse<Project>> {
    return this.http.patch<ApiResponse<Project>>(`${this.base}/${id}/progress`, req);
  }

  deleteProject(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`);
  }
}
