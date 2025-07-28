import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { AlertService } from '../../../core/services/alert.service';
import { FileService } from '../../../core/services/file.service';

@Component({
  selector: 'app-tareas-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tareas-detail.component.html',
  styleUrls: ['./tareas-detail.component.scss'],
})
export class TareasDetailComponent implements OnInit {
  tarea: any = null;
  cargando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private alert: AlertService,
    private fileService: FileService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.alert.error('ID de tarea no válido');
      this.router.navigate(['/tareas']);
      return;
    }
    this.cargando = true;
    this.taskService.getById(id).subscribe({
      next: (r: any) => {
        this.tarea = r.data;
        this.cargando = false;
      },
      error: () => {
        this.alert.error('No se pudo cargar la tarea');
        this.cargando = false;
        this.router.navigate(['/tareas']);
      },
    });
  }

  volver() {
    this.router.navigate(['/tareas']);
  }

  descargarArchivo(file: any) {
    if (!file || !file._id) return;
    this.fileService.downloadFile(file._id, file.originalName || file.filename);
  }

  getFileIcon(type: string): string {
    if (!type) return 'bi bi-file-earmark text-secondary';
    if (type.includes('pdf')) return 'bi bi-file-earmark-pdf text-danger';
    if (type.includes('excel') || type.includes('spreadsheet'))
      return 'bi bi-file-earmark-excel text-success';
    if (type.includes('word') || type.includes('document'))
      return 'bi bi-file-earmark-word text-primary';
    if (type.includes('image')) return 'bi bi-file-earmark-image text-info';
    return 'bi bi-file-earmark text-secondary';
  }
}
