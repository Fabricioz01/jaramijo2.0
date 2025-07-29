import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  ApiResponse,
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
private readonly API_URL = `${environment.apiUrl}/tasks`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Task[]>> {
  return this.http.get<ApiResponse<Task[]>>(this.API_URL, {
    params: { _: Date.now().toString() },
    headers: { 'cache-control': 'no-cache', pragma: 'no-cache' },
  });
}

  getById(id: string): Observable<ApiResponse<Task>> {
    return this.http.get<ApiResponse<Task>>(`${this.API_URL}/${id}`);
  }

  create(task: CreateTaskRequest): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(this.API_URL, task);
  }

  update(id: string, task: UpdateTaskRequest): Observable<ApiResponse<Task>> {
    return this.http.put<ApiResponse<Task>>(`${this.API_URL}/${id}`, task);
  }

  delete(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.API_URL}/${id}`);
  }

  attachFile(taskId: string, file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<any>>(
      `${this.API_URL}/${taskId}/attach`,
      formData
    );
  }

  removeAttachment(
    taskId: string,
    fileId: string
  ): Observable<ApiResponse<Task>> {
    return this.http.delete<ApiResponse<Task>>(
      `${this.API_URL}/${taskId}/attachments/${fileId}`
    );
  }
}
