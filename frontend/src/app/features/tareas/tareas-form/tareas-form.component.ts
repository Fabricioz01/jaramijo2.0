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
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
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

  /* ──────────────── Lifecycle ──────────────── */
  ngOnInit(): void {
    this.buildForm();
    this.tareaId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.tareaId;
    this.prefillDates();
    this.loadCatalogs();
    if (this.isEditing) this.loadTarea();
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
      next: ({ data: t }) => {
        if (!t) return this.alert.error('Tarea no encontrada');

        this.originalAttachments = t.attachmentIds ?? [];

        const depObj =
          typeof t.departamentoId === 'object'
            ? (t.departamentoId as Departamento)
            : null;
        const dirObj =
          depObj && typeof depObj.direccionId === 'object'
            ? (depObj.direccionId as Direccion)
            : null;

        const direccionId = dirObj ? dirObj._id : '';
        const departamentoId = depObj ? depObj._id : t.departamentoId;
        const assignedToId =
          Array.isArray(t.assignedToIds) && t.assignedToIds.length
            ? t.assignedToIds[0]._id
            : '';

        this.tareaForm.patchValue({
          title: t.title,
          description: t.description ?? '',
          status: t.status,
          dueDate: t.dueDate
            ? new Date(t.dueDate).toISOString().split('T')[0]
            : '',
          direccionId,
          departamentoId,
          assignedToIds: assignedToId,
        });

        this.onDireccionChange();
        this.onDepartamentoChange();
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
      const v = this.fileService.validateFile(f);
      v.valid ? this.archivos.push(f) : this.alert.error(v.error ?? '');
    });
    this.cdr.markForCheck();
  }

  removeAttachment(fileId: string): void {
    if (!this.tareaId) return;
    if (!confirm('¿Eliminar archivo?')) return;

    // 1. Quita el vínculo en la tarea
    this.taskService.removeAttachment(this.tareaId, fileId).subscribe({
      next: () => {
        // 2. Borra el archivo real
        this.fileService.delete(fileId).subscribe({
          next: () => {
            this.originalAttachments = this.originalAttachments.filter(
              (a) => a._id !== fileId
            );
            this.alert.success('Archivo eliminado');
            this.cdr.markForCheck();
          },
          error: () => this.alert.error('Error eliminando archivo'),
        });
      },
      error: () => this.alert.error('Error eliminando adjunto'),
    });
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
        next: (r) => success(r.data?._id),
        error: () => {
          this.loading = false;
          this.alert.error('Error al actualizar la tarea');
        },
      });
    } else {
      this.taskService.create(payload).subscribe({
        next: (r) => success(r.data?._id),
        error: () => {
          this.loading = false;
          this.alert.error('Error al crear la tarea');
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/tareas']);
  }
}
