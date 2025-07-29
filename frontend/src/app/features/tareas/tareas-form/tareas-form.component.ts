import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  OnInit,
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

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private taskService: TaskService,
    private userService: UserService,
    private direccionService: DireccionService,
    private departamentoService: DepartamentoService,
    private fileService: FileService,
    private alert: AlertService
  ) {}

  /* ──────────────── Lifecycle ──────────────── */
  ngOnInit(): void {
    console.log('[Init] TareasForm');
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
    console.log('[Destroy] TareasForm');
  }

  private buildForm(): void {
    this.tareaForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: [''],
      status: ['pending', Validators.required],
      direccionId: ['', Validators.required],
      departamentoId: ['', Validators.required],
      assignedToIds: [''],
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
    const today = new Date();
    const due = new Date(today);
    due.setDate(today.getDate() + 7);
    this.tareaForm.patchValue({
      dueDate: due.toISOString().split('T')[0],
    });
    console.log('[Prefill] dueDate →', due.toISOString().split('T')[0]);
  }

  private loadCatalogs(): void {
    console.time('[Catalogs]');
    this.loading = true;
    forkJoin({
      direcciones: this.direccionService.getAll(),
      departamentos: this.departamentoService.getAll(),
      usuarios: this.userService.getAll(),
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          console.timeEnd('[Catalogs]');
        })
      )
      .subscribe({
        next: ({ direcciones, departamentos, usuarios }) => {
          this.direcciones = (direcciones.data ?? []) as unknown as Direccion[];
          this.departamentos =
            (departamentos.data ?? []) as unknown as Departamento[];
          this.usuarios = (usuarios.data ?? []) as unknown as Usuario[];
          console.log(
            `[Catalogs] ${this.direcciones.length} direcciones, ` +
              `${this.departamentos.length} departamentos, ` +
              `${this.usuarios.length} usuarios`
          );
        },
        error: () => this.alert.error('Error cargando catálogos'),
      });
  }

  private loadTarea(): void {
    if (!this.tareaId) return;
    console.time('[loadTarea]');
    this.taskService.getById(this.tareaId).subscribe({
      next: ({ data: t }) => {
        console.timeEnd('[loadTarea]');
        if (!t) return this.alert.error('Tarea no encontrada');

        console.log('[loadTarea] data →', t);

        const departamentoId =
          typeof t.departamentoId === 'object' && t.departamentoId
            ? (t.departamentoId as Departamento)._id
            : (t.departamentoId as Id);

        const assignedToId =
          Array.isArray(t.assignedToIds) && t.assignedToIds.length
            ? t.assignedToIds[0]
            : '';

        this.tareaForm.patchValue({
          title: t.title,
          description: t.description ?? '',
          status: t.status,
          departamentoId,
          assignedToIds: assignedToId,
          dueDate: t.dueDate
            ? new Date(t.dueDate).toISOString().split('T')[0]
            : '',
        });

        const dep = this.departamentos.find((d) => d._id === departamentoId);
        if (dep) {
          const direccionId =
            typeof dep.direccionId === 'object'
              ? dep.direccionId._id
              : dep.direccionId;
          this.tareaForm.patchValue({ direccionId });
        }

        this.onDireccionChange();
        this.onDepartamentoChange();
      },
      error: () => this.alert.error('Error al cargar la tarea'),
    });
  }

  onDireccionChange(): void {
    console.time('[onDireccionChange]');
    const id = this.tareaForm.get('direccionId')?.value as Id;
    this.departamentosFiltrados = this.departamentos.filter((d) =>
      typeof d.direccionId === 'object'
        ? d.direccionId._id === id
        : d.direccionId === id
    );
    console.log(
      `[onDireccionChange] id=${id} → ${this.departamentosFiltrados.length} resultados`
    );
    if (!this.isEditing) {
      this.tareaForm.patchValue(
        { departamentoId: '', assignedToIds: '' },
        { emitEvent: false }
      );
      this.usuariosFiltrados = [];
    }
    console.timeEnd('[onDireccionChange]');
  }

  onDepartamentoChange(): void {
    console.time('[onDepartamentoChange]');
    const id = this.tareaForm.get('departamentoId')?.value as Id;
    this.usuariosFiltrados = this.usuarios.filter((u) =>
      typeof u.departamentoId === 'object'
        ? u.departamentoId._id === id
        : u.departamentoId === id
    );
    console.log(
      `[onDepartamentoChange] id=${id} → ${this.usuariosFiltrados.length} usuarios`
    );
    if (!this.isEditing) {
      this.tareaForm.patchValue({ assignedToIds: '' }, { emitEvent: false });
    }
    console.timeEnd('[onDepartamentoChange]');
  }

  /* ──────────────── Files ──────────────── */
  onFilesSelected(e: Event): void {
    const files = Array.from((e.target as HTMLInputElement).files ?? []);
    files.forEach((f) => {
      const v = this.fileService.validateFile(f);
      if (v.valid) {
        this.archivos.push(f);
        console.log('[Files] +', f.name);
      } else {
        this.alert.error(v.error ?? 'Archivo inválido');
      }
    });
  }

  /* ──────────────── Helpers ──────────────── */
  invalid(c: string): boolean {
    const control = this.tareaForm.get(c);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  /* ──────────────── Submit ──────────────── */
  onSubmit(): void {
    if (this.tareaForm.invalid) {
      Object.values(this.tareaForm.controls).forEach((c) => c.markAsTouched());
      return;
    }
    this.loading = true;
    console.log('[Submit] payload →', this.tareaForm.value);

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
      console.time('[uploadFiles]');
      this.fileService.uploadMultipleFiles(this.archivos, taskId).subscribe({
        complete: () => {
          console.timeEnd('[uploadFiles]');
          finish();
        },
        error: () => {
          this.loading = false;
          this.alert.error('Error subiendo archivos');
        },
      });
    };

    const success = (id?: Id): void => {
      id
        ? uploadFiles(id)
        : (this.loading = false) ||
          this.alert.error('Respuesta inválida del servidor');
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

  /* ──────────────── Navigation ──────────────── */
  goBack(): void {
    this.router.navigate(['/tareas']);
  }
}
