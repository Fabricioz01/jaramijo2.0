import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private readonly API_URL = '/api/v1/roles';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(this.API_URL);
  }

  getById(id: string): Observable<ApiResponse<Role>> {
    return this.http.get<ApiResponse<Role>>(`${this.API_URL}/${id}`);
  }

  create(role: Partial<Role>): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>(this.API_URL, role);
  }

  update(id: string, role: Partial<Role>): Observable<ApiResponse<Role>> {
    return this.http.put<ApiResponse<Role>>(`${this.API_URL}/${id}`, role);
  }

  delete(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.API_URL}/${id}`);
  }

  addPermission(
    roleId: string,
    permissionId: string
  ): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>(
      `${this.API_URL}/${roleId}/permissions`,
      { permissionId }
    );
  }

  removePermission(
    roleId: string,
    permissionId: string
  ): Observable<ApiResponse<Role>> {
    return this.http.delete<ApiResponse<Role>>(
      `${this.API_URL}/${roleId}/permissions/${permissionId}`
    );
  }
}
