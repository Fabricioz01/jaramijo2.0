import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Direccion, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class DireccionService {
  private readonly API_URL = '/api/v1/direcciones';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Direccion[]>> {
    return this.http.get<ApiResponse<Direccion[]>>(this.API_URL);
  }

  getById(id: string): Observable<ApiResponse<Direccion>> {
    return this.http.get<ApiResponse<Direccion>>(`${this.API_URL}/${id}`);
  }

  create(direccion: Partial<Direccion>): Observable<ApiResponse<Direccion>> {
    return this.http.post<ApiResponse<Direccion>>(this.API_URL, direccion);
  }

  update(
    id: string,
    direccion: Partial<Direccion>
  ): Observable<ApiResponse<Direccion>> {
    return this.http.put<ApiResponse<Direccion>>(
      `${this.API_URL}/${id}`,
      direccion
    );
  }

  delete(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.API_URL}/${id}`);
  }

  getDepartamentos(id: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.API_URL}/${id}/departamentos`
    );
  }
}
