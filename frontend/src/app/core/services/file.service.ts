import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FileModel, ApiResponse } from '../models';

export interface FileUpload {
  file: File;
  progress: number;
  uploading: boolean;
  error?: string;
  result?: any;
}

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private readonly API_URL = '/api/v1/files';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<FileModel[]>> {
    return this.http.get<ApiResponse<FileModel[]>>(this.API_URL);
  }

  getById(id: string): Observable<ApiResponse<FileModel>> {
    return this.http.get<ApiResponse<FileModel>>(`${this.API_URL}/${id}`);
  }

  download(id: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${id}/download`, {
      responseType: 'blob',
    });
  }

  delete(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.API_URL}/${id}`);
  }

  downloadFile(id: string, filename: string): void {
    this.download(id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  uploadFile(
    file: File,
    taskId?: string
  ): Observable<{ progress: number; result?: any }> {
    const formData = new FormData();
    formData.append('file', file);
    const url = taskId ? `/api/v1/tasks/${taskId}/attach` : this.API_URL;
    return this.http
      .post(url, formData, { observe: 'events', reportProgress: true })
      .pipe(
        map((event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            const progress = Math.round(
              (100 * event.loaded) / (event.total || 1)
            );
            return { progress };
          }
          if (event.type === HttpEventType.Response) {
            return { progress: 100, result: event.body };
          }
          return { progress: 0 };
        })
      );
  }

  uploadMultipleFiles(
    files: File[],
    taskId?: string
  ): Observable<FileUpload[]> {
    const uploads: FileUpload[] = files.map((file) => ({
      file,
      progress: 0,
      uploading: true,
    }));
    return new Observable<FileUpload[]>((observer) => {
      let done = 0;
      files.forEach((file, i) => {
        this.uploadFile(file, taskId).subscribe({
          next: (r) => {
            uploads[i].progress = r.progress;
            if (r.result) {
              uploads[i].result = r.result;
              uploads[i].uploading = false;
            }
            observer.next([...uploads]);
          },
          error: (e) => {
            uploads[i].uploading = false;
            uploads[i].error = e.message;
            observer.next([...uploads]);
          },
          complete: () => {
            done++;
            if (done === files.length) observer.complete();
          },
        });
      });
    });
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    const max = 10 * 1024 * 1024;
    const ok = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (file.size > max)
      return { valid: false, error: 'El archivo no puede superar los 10MB' };
    if (!ok.includes(file.type))
      return { valid: false, error: 'Solo se permiten archivos PDF y Excel' };
    return { valid: true };
  }

  getFileIcon(type: string): string {
    if (type.includes('pdf')) return 'bi bi-file-earmark-pdf text-danger';
    if (type.includes('excel') || type.includes('spreadsheet'))
      return 'bi bi-file-earmark-excel text-success';
    if (type.includes('word') || type.includes('document'))
      return 'bi bi-file-earmark-word text-primary';
    if (type.includes('image')) return 'bi bi-file-earmark-image text-info';
    return 'bi bi-file-earmark text-secondary';
  }

  formatFileSize(b: number): string {
    if (!b) return '0 Bytes';
    const k = 1024;
    const i = Math.floor(Math.log(b) / Math.log(k));
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
