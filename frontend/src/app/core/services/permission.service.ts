import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Permission, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private readonly API_URL = '/api/v1/permissions';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Permission[]>> {
    return this.http.get<ApiResponse<Permission[]>>(this.API_URL);
  }

  getById(id: string): Observable<ApiResponse<Permission>> {
    return this.http.get<ApiResponse<Permission>>(`${this.API_URL}/${id}`);
  }

  create(permission: Partial<Permission>): Observable<ApiResponse<Permission>> {
    return this.http.post<ApiResponse<Permission>>(this.API_URL, permission);
  }

  update(
    id: string,
    permission: Partial<Permission>
  ): Observable<ApiResponse<Permission>> {
    return this.http.put<ApiResponse<Permission>>(
      `${this.API_URL}/${id}`,
      permission
    );
  }

  delete(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.API_URL}/${id}`);
  }
}
