import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ApiResponse,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly API_URL = '/api/v1/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(this.API_URL);
  }

  getById(id: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.API_URL}/${id}`);
  }

  create(user: CreateUserRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.API_URL, user);
  }

  update(id: string, user: UpdateUserRequest): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.API_URL}/${id}`, user);
  }

  delete(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.API_URL}/${id}`);
  }

  toggleActive(id: string): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(
      `${this.API_URL}/${id}/toggle-active`,
      {}
    );
  }
}
