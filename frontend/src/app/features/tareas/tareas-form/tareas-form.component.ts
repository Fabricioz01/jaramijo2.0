import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, distinctUntilChanged, finalize } from 'rxjs/operators';

import { TaskService } from '../../../core/services/task.service';
import { UserService } from '../../../core/services/user.service';
import { DireccionService } from '../../../core/services/direccion.service';
import { DepartamentoService } from '../../../core/services/departamento.service';
import { FileService } from '../../../core/services/file.service';
import { AlertService } from '../../../core/services/alert.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { ConfirmModalComponent } from '../../../shared/components/alerts/confirm-modal.component';

type Id = string;

interface Direccion {
  _id: Id;
  name: string;
}
interface Departamento {
  _id: Id;
  name: string;
  direccionId: Id | Direccion;
}
interface Usuario {
  _id: Id;
  name: string;
  lastName: string;
  position: string;
  departamentoId: Id | Departamento;
}

@Component({
  selector: 'app-tareas-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './tareas-form.component.html',
  styleUrls: ['./tareas-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TareasFormComponent implements OnInit, OnDestroy {
  tareaForm!: FormGroup;
  loading = false;
  isEditing = false;
  tareaId: Id | null = null;

  direcciones: Direccion[] = [];
  departamentos: Departamento[] = [];
  usuarios: Usuario[] = [];
  departamentosFiltrados: Departamento[] = [];
  usuariosFiltrados: Usuario[] = [];
  archivos: File[] = [];
  originalAttachments: {
    _id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
  }[] = [];

  resolutionFile: {
    _id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
  } | null = null;

  showDeleteModal = false;
  fileToDelete: string | null = null;
  isResolutionFileDelete = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private taskService: TaskService,
    private userService: UserService,
    private direccionService: DireccionService,
    private departamentoService: DepartamentoService,
    public fileService: FileService,
    private alert: AlertService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.tareaId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.tareaId;
    this.prefillDates();
    this.loadCatalogs();
    if (this.isEditing) {
      this.loadTarea();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ──────────────── Form setup ──────────────── */
  private buildForm(): void {
    this.tareaForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: [''],
      status: ['pending', Validators.required],
      direccionId: ['', Validators.required],
      departamentoId: [{ value: '', disabled: true }, Validators.required],
      assignedToIds: [{ value: '', disabled: true }],
      dueDate: [''],
    });

    this.tareaForm
      .get('direccionId')
      ?.valueChanges.pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe(() => this.onDireccionChange());

    this.tareaForm
      .get('departamentoId')
      ?.valueChanges.pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe(() => this.onDepartamentoChange());
  }

  private prefillDates(): void {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    this.tareaForm.patchValue({ dueDate: d.toISOString().split('T')[0] });
  }

  /* ──────────────── Load catalogs ──────────────── */
  private loadCatalogs(): void {
    this.loading = true;
    forkJoin({
      direcciones: this.direccionService.getAll(),
      departamentos: this.departamentoService.getAll(),
      usuarios: this.userService.getAll(),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ direcciones, departamentos, usuarios }) => {
          this.direcciones = direcciones.data ?? [];
          this.departamentos =
            departamentos.data?.map((d: any) => ({
              ...d,
              direccionId: d.direccionId ?? '',
            })) ?? [];
          this.usuarios =
            usuarios.data?.map((u: any) => ({
              ...u,
              departamentoId:
                typeof u.departamentoId === 'object'
                  ? u.departamentoId._id
                  : u.departamentoId,
            })) ?? [];
          this.cdr.markForCheck();
        },
        error: () => this.alert.error('Error cargando catálogos'),
      });
  }

  /* ──────────────── Load task ──────────────── */
  private loadTarea(): void {
    if (!this.tareaId) return;
    this.taskService.getById(this.tareaId).subscribe({
      next: (response) => {
        const t = response?.data;
        if (!t) {
          this.alert.error('Error al cargar la tarea');
          return;
        }
        this.tareaForm.patchValue({
          title: t.title,
          description: t.description,
          status: t.status,
          direccionId: t.departamentoId?.direccionId?._id || '',
          departamentoId: t.departamentoId?._id || '',
          assignedToIds: t.assignedToIds?.map((u: any) => u._id) || [],
          dueDate: t.dueDate
            ? new Date(t.dueDate).toISOString().split('T')[0]
            : '',
        });
        this.originalAttachments = t.attachmentIds || [];
        this.resolutionFile = t.resolutionFileId || null;
        this.cdr.markForCheck();
      },
      error: () => this.alert.error('Error al cargar la tarea'),
    });
  }

  /* ──────────────── Select changes ──────────────── */
  onDireccionChange(): void {
    const id = this.tareaForm.get('direccionId')?.value as Id;
    this.departamentosFiltrados = this.departamentos.filter((d) =>
      typeof d.direccionId === 'object'
        ? d.direccionId._id === id
        : d.direccionId === id
    );

    const depCtrl = this.tareaForm.get('departamentoId');
    const assCtrl = this.tareaForm.get('assignedToIds');

    if (this.departamentosFiltrados.length) {
      depCtrl?.enable({ emitEvent: false });
    } else {
      depCtrl?.disable({ emitEvent: false });
      depCtrl?.reset();
      assCtrl?.disable({ emitEvent: false });
      assCtrl?.reset();
      this.usuariosFiltrados = [];
    }
    this.cdr.markForCheck();
  }

  onDepartamentoChange(): void {
    const id = this.tareaForm.get('departamentoId')?.value as Id;
    this.usuariosFiltrados = this.usuarios.filter((u) =>
      typeof u.departamentoId === 'object'
        ? u.departamentoId._id === id
        : u.departamentoId === id
    );

    const assCtrl = this.tareaForm.get('assignedToIds');
    this.usuariosFiltrados.length
      ? assCtrl?.enable({ emitEvent: false })
      : assCtrl?.disable({ emitEvent: false });

    this.cdr.markForCheck();
  }

  /* ──────────────── Files ──────────────── */
  onFilesSelected(e: Event): void {
    const files = Array.from((e.target as HTMLInputElement).files ?? []);
    files.forEach((f) => {
      this.archivos.push(f);
    });
    this.cdr.markForCheck();
  }

  removeAttachment(fileId: string): void {
    if (!this.tareaId) return;
    this.fileToDelete = fileId;
    this.isResolutionFileDelete = false;
    this.showDeleteModal = true;
  }

  removeResolutionFile(): void {
    if (!this.tareaId) return;
    this.isResolutionFileDelete = true;
    this.showDeleteModal = true;
  }

  confirmarEliminarArchivo(): void {
    if (!this.tareaId) return;

    if (this.isResolutionFileDelete) {
      // Eliminar archivo de resolución
      this.taskService.removeResolutionFile(this.tareaId).subscribe({
        next: () => {
          this.resolutionFile = null;
          this.showDeleteModal = false;
          this.isResolutionFileDelete = false;
          this.alert.success('Archivo de resolución eliminado');
          this.cdr.markForCheck();
        },
        error: () => {
          this.alert.error('No se pudo eliminar el archivo de resolución');
          this.showDeleteModal = false;
          this.isResolutionFileDelete = false;
        },
      });
    } else if (this.fileToDelete) {
      // Eliminar archivo adjunto
      this.taskService
        .removeAttachment(this.tareaId, this.fileToDelete)
        .subscribe({
          next: () => {
            this.originalAttachments = this.originalAttachments.filter(
              (file) => file._id !== this.fileToDelete
            );
            this.fileToDelete = null;
            this.showDeleteModal = false;
            this.alert.success('Archivo eliminado');
            this.cdr.markForCheck();
          },
          error: () => {
            this.alert.error('No se pudo eliminar el archivo');
            this.fileToDelete = null;
            this.showDeleteModal = false;
          },
        });
    }
  }

  cancelarEliminarArchivo(): void {
    this.showDeleteModal = false;
    this.fileToDelete = null;
    this.isResolutionFileDelete = false;
  }

  /* ──────────────── Submit ──────────────── */
  invalid(c: string): boolean {
    const ctrl = this.tareaForm.get(c);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  onSubmit(): void {
    if (this.tareaForm.invalid) {
      Object.values(this.tareaForm.controls).forEach((c) => c.markAsTouched());
      return;
    }
    this.loading = true;

    const v = this.tareaForm.value;
    const payload = {
      title: v.title,
      description: v.description || undefined,
      status: v.status,
      departamentoId: v.departamentoId,
      assignedToIds: v.assignedToIds ? [v.assignedToIds] : [],
      dueDate: v.dueDate ? new Date(v.dueDate) : undefined,
    };

    const finish = (): void => {
      this.loading = false;
      this.goBack();
    };

    const uploadFiles = (taskId: Id): void => {
      if (!this.archivos.length) return finish();
      this.fileService.uploadMultipleFiles(this.archivos, taskId).subscribe({
        complete: () => finish(),
        error: () => {
          this.loading = false;
          this.alert.error('Error subiendo archivos');
        },
      });
    };

    const success = (id?: Id): void => {
      id ? uploadFiles(id) : (this.loading = false);
    };

    if (this.isEditing) {
      this.taskService.update(this.tareaId!, payload).subscribe({
        next: (r) => {
          this.alert.success(r.message || 'Tarea actualizada exitosamente');
          success(r.data?._id);
        },
        error: (error) => {
          this.loading = false;
          const errorMessage =
            error.error?.message || 'Error al actualizar la tarea';
          this.alert.error(errorMessage);
        },
      });
    } else {
      this.taskService.create(payload).subscribe({
        next: (r) => {
          this.alert.success(r.message || 'Tarea creada exitosamente');
          success(r.data?._id);
        },
        error: (error) => {
          this.loading = false;
          const errorMessage =
            error.error?.message || 'Error al crear la tarea';
          this.alert.error(errorMessage);
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/tareas']);
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
