import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Departamento, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class DepartamentoService {
  private readonly API_URL = '/api/v1/departamentos';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Departamento[]>> {
    return this.http.get<ApiResponse<Departamento[]>>(this.API_URL);
  }

  getById(id: string): Observable<ApiResponse<Departamento>> {
    return this.http.get<ApiResponse<Departamento>>(`${this.API_URL}/${id}`);
  }

  create(
    departamento: Partial<Departamento>
  ): Observable<ApiResponse<Departamento>> {
    return this.http.post<ApiResponse<Departamento>>(
      this.API_URL,
      departamento
    );
  }

  update(
    id: string,
    departamento: Partial<Departamento>
  ): Observable<ApiResponse<Departamento>> {
    return this.http.put<ApiResponse<Departamento>>(
      `${this.API_URL}/${id}`,
      departamento
    );
  }

  delete(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.API_URL}/${id}`);
  }

  getUsers(id: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.API_URL}/${id}/users`);
  }
}
