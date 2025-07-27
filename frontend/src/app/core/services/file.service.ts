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

export interface FileInfo {
  id: string;
  nombre: string;
  nombreOriginal: string;
  mimetype: string;
  tamanio: number;
  ruta: string;
  fechaSubida: Date;
  subidoPor: string;
  descripcion?: string;
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
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  uploadFile(
    file: File,
    descripcion?: string
  ): Observable<{ progress: number; result?: any }> {
    const formData = new FormData();
    formData.append('file', file);
    if (descripcion) {
      formData.append('descripcion', descripcion);
    }

    return this.http
      .post(`${this.API_URL}/upload`, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((event) => {
          if (event.type === HttpEventType.UploadProgress) {
            const progress = Math.round(
              (100 * event.loaded) / (event.total || 1)
            );
            return { progress };
          } else if (event.type === HttpEventType.Response) {
            return { progress: 100, result: event.body };
          }
          return { progress: 0 };
        })
      );
  }

  uploadMultipleFiles(files: File[]): Observable<FileUpload[]> {
    const uploads: FileUpload[] = files.map((file) => ({
      file,
      progress: 0,
      uploading: true,
    }));

    files.forEach((file, index) => {
      this.uploadFile(file).subscribe({
        next: (result) => {
          uploads[index].progress = result.progress;
          if (result.result) {
            uploads[index].result = result.result;
            uploads[index].uploading = false;
          }
        },
        error: (error) => {
          uploads[index].error = error.message;
          uploads[index].uploading = false;
        },
      });
    });

    return new Observable((observer) => {
      observer.next(uploads);
    });
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'El archivo no puede superar los 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Formato de archivo no permitido' };
    }

    return { valid: true };
  }

  getFileIcon(mimetype: string): string {
    console.log('🔍 FileService - getFileIcon called with mimetype:', mimetype);

    if (!mimetype || typeof mimetype !== 'string') {
      console.warn('⚠️ FileService - Invalid mimetype:', mimetype);
      return 'bi bi-file-earmark text-secondary';
    }

    if (mimetype.includes('pdf')) return 'bi bi-file-earmark-pdf text-danger';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet'))
      return 'bi bi-file-earmark-excel text-success';
    if (mimetype.includes('word') || mimetype.includes('document'))
      return 'bi bi-file-earmark-word text-primary';
    if (mimetype.includes('image')) return 'bi bi-file-earmark-image text-info';
    return 'bi bi-file-earmark text-secondary';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
