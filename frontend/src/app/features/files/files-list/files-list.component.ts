import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileService, FileUpload } from '../../../core/services/file.service';
import { AlertService } from '../../../core/services/alert.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FileModel } from '../../../core/models/file.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-files-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  template: `
    <app-header></app-header>
    <div class="container-fluid py-4" *ngIf="canAccessModule()">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="h3 mb-0">
              <i class="bi bi-files me-2"></i>
              Gestión de Archivos
            </h1>
            <button
              class="btn btn-primary"
              (click)="openUploadModal()"
              type="button"
              *ngIf="canCreateFile()"
            >
              <i class="bi bi-cloud-upload me-2"></i>
              Subir Archivos
            </button>
          </div>

          <!-- Filtros y búsqueda -->
          <div class="card mb-4">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Buscar archivos</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Buscar por nombre..."
                      [(ngModel)]="filtros.termino"
                      (input)="filtrarArchivos()"
                    />
                  </div>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Tipo de archivo</label>
                  <select
                    class="form-select"
                    [(ngModel)]="filtros.tipo"
                    (change)="filtrarArchivos()"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="word">Word</option>
                    <option value="imagen">Imagen</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Fecha</label>
                  <select
                    class="form-select"
                    [(ngModel)]="filtros.periodo"
                    (change)="filtrarArchivos()"
                  >
                    <option value="">Todo el tiempo</option>
                    <option value="hoy">Hoy</option>
                    <option value="semana">Esta semana</option>
                    <option value="mes">Este mes</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Lista de archivos -->
          <div class="card">
            <div
              class="card-header d-flex justify-content-between align-items-center"
            >
              <h5 class="mb-0">Archivos ({{ archivosFiltrados.length }})</h5>
              <div class="btn-group btn-group-sm">
                <button
                  class="btn btn-outline-secondary"
                  [class.active]="vista === 'lista'"
                  (click)="vista = 'lista'"
                >
                  <i class="bi bi-list"></i>
                </button>
                <button
                  class="btn btn-outline-secondary"
                  [class.active]="vista === 'cuadricula'"
                  (click)="vista = 'cuadricula'"
                >
                  <i class="bi bi-grid"></i>
                </button>
              </div>
            </div>
            <div class="card-body">
              <div *ngIf="cargando" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
              </div>

              <div
                *ngIf="!cargando && archivosFiltrados.length === 0"
                class="text-center py-5 text-muted"
              >
                <i class="bi bi-files display-1"></i>
                <h5 class="mt-3">No hay archivos</h5>
                <p>Sube tu primer archivo para comenzar</p>
              </div>

              <!-- Vista de lista -->
              <div
                *ngIf="
                  !cargando && archivosFiltrados.length > 0 && vista === 'lista'
                "
                class="table-responsive"
              >
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Archivo</th>
                      <th>Tipo</th>
                      <th>Tamaño</th>
                      <th>Tarea asociada</th>
                      <th>Subido por</th>
                      <th>Fecha</th>
                      <th width="120">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let archivo of archivosFiltrados">
                      <td>
                        <div class="d-flex align-items-center">
                          <i
                            [class]="getFileIcon(archivo.mimeType)"
                            class="me-2"
                          ></i>
                          <div>
                            <div class="fw-medium">
                              {{ archivo.originalName }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="badge bg-light text-dark">
                          {{ getFileType(archivo.mimeType) }}
                        </span>
                      </td>
                      <td>{{ formatFileSize(archivo.size) }}</td>
                      <td>
                        {{ archivo.taskId?.title || '-' }}
                      </td>
                      <td>
                        {{ getUploaderName(archivo.uploaderId) }}
                      </td>
                      <td>
                        {{ archivo.createdAt | date : 'dd/MM/yyyy HH:mm' }}
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button
                            class="btn btn-outline-primary"
                            (click)="descargarArchivo(archivo)"
                            title="Descargar"
                          >
                            <i class="bi bi-download"></i>
                          </button>
                          <button
                            class="btn btn-outline-danger"
                            (click)="eliminarArchivo(archivo)"
                            title="Eliminar"
                            *ngIf="canDeleteFile()"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Vista de cuadrícula -->
              <div
                *ngIf="
                  !cargando &&
                  archivosFiltrados.length > 0 &&
                  vista === 'cuadricula'
                "
                class="row g-3"
              >
                <div
                  class="col-md-4 col-lg-3"
                  *ngFor="let archivo of archivosFiltrados"
                >
                  <div class="card h-100">
                    <div class="card-body text-center">
                      <i
                        [class]="getFileIcon(archivo.mimeType)"
                        style="font-size: 3rem;"
                      ></i>
                      <h6
                        class="card-title mt-2 text-truncate"
                        [title]="archivo.originalName"
                      >
                        {{ archivo.originalName }}
                      </h6>
                      <p class="card-text">
                        <small class="text-muted">
                          {{ formatFileSize(archivo.size) }}
                        </small>
                      </p>
                      <div class="btn-group btn-group-sm">
                        <button
                          class="btn btn-outline-primary"
                          (click)="descargarArchivo(archivo)"
                        >
                          <i class="bi bi-download"></i>
                        </button>
                        <button
                          class="btn btn-outline-danger"
                          (click)="eliminarArchivo(archivo)"
                          *ngIf="canDeleteFile()"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="uploadModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-cloud-upload me-2"></i>
              Subir Archivos
            </h5>
            <button
              type="button"
              class="btn-close"
              (click)="closeUploadModal()"
            ></button>
          </div>
          <div class="modal-body">
            <!-- Zona de drop -->
            <div
              class="border-dashed p-4 text-center mb-3"
              [class.border-primary]="arrastrando"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
            >
              <i class="bi bi-cloud-upload display-1 text-muted"></i>
              <h5>Arrastra archivos aquí o haz clic para seleccionar</h5>
              <p class="text-muted">
                Archivos permitidos: PDF y Excel únicamente<br />
                Tamaño máximo: 10MB por archivo
              </p>
              <input
                type="file"
                #fileInput
                multiple
                accept=".pdf,.xlsx,.xls"
                class="d-none"
                (change)="onFileSelected($event)"
              />
              <button class="btn btn-primary" (click)="fileInput.click()">
                Seleccionar Archivos
              </button>
            </div>

            <!-- Lista de archivos para subir -->
            <div *ngIf="archivosSubida.length > 0">
              <h6>Archivos seleccionados:</h6>
              <div class="list-group">
                <div
                  class="list-group-item"
                  *ngFor="let upload of archivosSubida; let i = index"
                >
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div class="flex-grow-1">
                      <div class="d-flex align-items-center">
                        <i
                          [class]="getFileIcon(upload.file.type)"
                          class="me-2"
                        ></i>
                        <div>
                          <div class="fw-medium">{{ upload.file.name }}</div>
                          <small class="text-muted">
                            {{ formatFileSize(upload.file.size) }}
                          </small>
                        </div>
                      </div>

                      <!-- Barra de progreso -->
                      <div
                        *ngIf="upload.uploading || upload.progress > 0"
                        class="progress mt-2"
                        style="height: 5px;"
                      >
                        <div
                          class="progress-bar"
                          [style.width.%]="upload.progress"
                          [class.bg-success]="upload.progress === 100"
                          [class.bg-danger]="upload.error"
                        ></div>
                      </div>

                      <!-- Error -->
                      <div *ngIf="upload.error" class="text-danger small mt-1">
                        <i class="bi bi-exclamation-triangle me-1"></i>
                        {{ upload.error }}
                      </div>
                    </div>

                    <div class="ms-3">
                      <button
                        *ngIf="!upload.uploading && !upload.result"
                        class="btn btn-sm btn-outline-danger"
                        (click)="removerArchivo(i)"
                      >
                        <i class="bi bi-x"></i>
                      </button>
                      <i
                        *ngIf="upload.uploading"
                        class="bi bi-hourglass-split text-primary"
                      ></i>
                      <i
                        *ngIf="upload.result"
                        class="bi bi-check-circle text-success"
                      ></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              (click)="closeUploadModal()"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-primary"
              [disabled]="archivosSubida.length === 0 || subiendoArchivos"
              (click)="subirArchivos()"
            >
              <span
                *ngIf="subiendoArchivos"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              <i *ngIf="!subiendoArchivos" class="bi bi-cloud-upload me-2"></i>
              Subir Archivos
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .border-dashed {
        border: 2px dashed #dee2e6;
        border-radius: 0.375rem;
        transition: border-color 0.2s ease;
      }

      .border-dashed:hover,
      .border-dashed.border-primary {
        border-color: var(--bs-primary) !important;
        background-color: rgba(13, 110, 253, 0.05);
      }

      .table td {
        vertical-align: middle;
      }

      .card:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        transition: box-shadow 0.2s ease;
      }
    `,
  ],
})
export class FilesListComponent implements OnInit {
  archivos: FileModel[] = [];
  archivosFiltrados: FileModel[] = [];
  archivosSubida: FileUpload[] = [];
  cargando = false;
  subiendoArchivos = false;
  arrastrando = false;
  vista: 'lista' | 'cuadricula' = 'lista';

  filtros = {
    termino: '',
    tipo: '',
    periodo: '',
  };

  constructor(
    private fileService: FileService,
    private alertService: AlertService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarArchivos();
  }

  cargarArchivos(): void {
    this.cargando = true;
    this.fileService.getAll().subscribe({
      next: (response: any) => {
        console.log('✅ Archivos cargados:', response);
        this.archivos = response.data || [];
        this.archivosFiltrados = [...this.archivos];
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('❌ Error cargando archivos:', error);
        // Para desarrollo, usamos datos demo si falla la API
        this.archivos = this.generarArchivosDemo();
        this.archivosFiltrados = [...this.archivos];
        this.cargando = false;
      },
    });
  }

  filtrarArchivos(): void {
    this.archivosFiltrados = this.archivos.filter((archivo) => {
      const cumpleTermino =
        !this.filtros.termino ||
        archivo.originalName
          .toLowerCase()
          .includes(this.filtros.termino.toLowerCase());

      const cumpleTipo =
        !this.filtros.tipo ||
        this.getFileType(archivo.mimeType)
          .toLowerCase()
          .includes(this.filtros.tipo);

      // Convertir createdAt a Date si es string
      let fechaArchivo: Date;
      if (typeof archivo.createdAt === 'string') {
        fechaArchivo = new Date(archivo.createdAt);
      } else {
        fechaArchivo = archivo.createdAt;
      }

      const cumplePeriodo =
        !this.filtros.periodo ||
        this.verificarPeriodo(fechaArchivo, this.filtros.periodo);

      return cumpleTermino && cumpleTipo && cumplePeriodo;
    });
  }
  getUploaderName(
    uploader: string | { _id: string; name: string; email: string }
  ): string {
    if (
      typeof uploader === 'object' &&
      uploader !== null &&
      'name' in uploader
    ) {
      return uploader.name;
    }
    if (typeof uploader === 'string') {
      return uploader;
    }
    return '-';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando = false;

    const files = Array.from(event.dataTransfer?.files || []);
    this.procesarArchivos(files);
  }

  onFileSelected(event: any): void {
    console.log(
      '🔍 FilesListComponent - Archivos seleccionados:',
      event.target.files
    );
    const files = Array.from(event.target.files) as File[];
    this.procesarArchivos(files);
  }

  procesarArchivos(files: File[]): void {
    console.log('🔍 FilesListComponent - Procesando archivos:', files);
    files.forEach((file) => {
      console.log(
        '🔍 FilesListComponent - Validando archivo:',
        file.name,
        file.type
      );
      const validation = this.fileService.validateFile(file);
      if (validation.valid) {
        this.archivosSubida.push({
          file,
          progress: 0,
          uploading: false,
        });
        console.log(
          '✅ FilesListComponent - Archivo agregado a la lista de subida'
        );
      } else {
        console.error(
          '❌ FilesListComponent - Error de validación:',
          validation.error
        );
        this.alertService.error(validation.error || 'Error en archivo');
      }
    });
  }

  removerArchivo(index: number): void {
    this.archivosSubida.splice(index, 1);
  }

  subirArchivos(): void {
    this.subiendoArchivos = true;
    const files = this.archivosSubida.map((u) => u.file);

    this.fileService.uploadMultipleFiles(files).subscribe({
      next: (uploads) => {
        this.archivosSubida = uploads;
      },
      complete: () => {
        this.subiendoArchivos = false;
        this.alertService.success('Archivos subidos correctamente');
        this.closeUploadModal();
        this.cargarArchivos();
      },
      error: (err) => {
        this.subiendoArchivos = false;
        this.alertService.error('Error al subir archivos');
      },
    });
  }

  descargarArchivo(archivo: FileModel): void {
    console.log('Descargando archivo:', archivo);
    this.fileService.downloadFile(archivo._id, archivo.originalName);
    this.alertService.success('Descargando archivo...');
  }

  eliminarArchivo(archivo: FileModel): void {
    if (confirm('¿Estás seguro de que deseas eliminar este archivo?')) {
      this.fileService.delete(archivo._id).subscribe({
        next: () => {
          this.alertService.success('Archivo eliminado exitosamente');
          this.cargarArchivos();
        },
        error: (error) => {
          console.error('Error al eliminar archivo:', error);
          this.alertService.error('Error al eliminar archivo');
        },
      });
    }
  }

  openUploadModal(): void {
    console.log('🔍 FilesListComponent - Abriendo modal de subida de archivos');
    this.archivosSubida = [];

    // Manually open the modal using DOM manipulation
    const modalElement = document.getElementById('uploadModal');
    if (modalElement) {
      modalElement.style.display = 'block';
      modalElement.classList.add('show');
      modalElement.setAttribute('aria-modal', 'true');
      modalElement.removeAttribute('aria-hidden');

      // Add backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      backdrop.id = 'modal-backdrop';
      document.body.appendChild(backdrop);

      // Prevent body scroll
      document.body.classList.add('modal-open');
    }
  }

  closeUploadModal(): void {
    const modalElement = document.getElementById('uploadModal');
    if (modalElement) {
      modalElement.style.display = 'none';
      modalElement.classList.remove('show');
      modalElement.setAttribute('aria-hidden', 'true');
      modalElement.removeAttribute('aria-modal');

      // Remove backdrop
      const backdrop = document.getElementById('modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }

      // Restore body scroll
      document.body.classList.remove('modal-open');
    }
  }

  getFileIcon(mimetype: string): string {
    console.log('🔍 FilesListComponent - getFileIcon called with:', mimetype);
    return this.fileService.getFileIcon(mimetype || '');
  }

  getFileType(mimetype: string): string {
    if (!mimetype || typeof mimetype !== 'string') {
      return 'Archivo';
    }

    if (mimetype.includes('pdf')) return 'PDF';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet'))
      return 'Excel';
    if (mimetype.includes('word') || mimetype.includes('document'))
      return 'Word';
    if (mimetype.includes('image')) return 'Imagen';
    return 'Archivo';
  }

  formatFileSize(bytes: number): string {
    return this.fileService.formatFileSize(bytes);
  }

  verificarPeriodo(fecha: Date, periodo: string): boolean {
    const ahora = new Date();
    const fechaArchivo = new Date(fecha);

    switch (periodo) {
      case 'hoy':
        return fechaArchivo.toDateString() === ahora.toDateString();
      case 'semana':
        const inicioSemana = new Date(ahora);
        inicioSemana.setDate(ahora.getDate() - 7);
        return fechaArchivo >= inicioSemana;
      case 'mes':
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        return fechaArchivo >= inicioMes;
      default:
        return true;
    }
  }

  private generarArchivosDemo(): FileModel[] {
    return [
      {
        _id: '1',
        filename: 'informe_municipal_2024.pdf',
        originalName: 'Informe Municipal 2024.pdf',
        mimeType: 'application/pdf',
        size: 2548736,
        uploaderId: 'user1',
        createdAt: new Date('2024-01-15'),
      },
      {
        _id: '2',
        filename: 'presupuesto_2024.xlsx',
        originalName: 'Presupuesto 2024.xlsx',
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 1024000,
        uploaderId: 'user2',
        createdAt: new Date('2024-01-10'),
      },
    ];
  }

  canAccessModule(): boolean {
    return this.authService.canAccessModule('archivos');
  }
  canCreateFile(): boolean {
    return this.authService.canAccessAction('archivos', 'create');
  }
  canDeleteFile(): boolean {
    return this.authService.canAccessAction('archivos', 'delete');
  }
}
