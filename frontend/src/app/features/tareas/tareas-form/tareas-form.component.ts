import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { UserService } from '../../../core/services/user.service';
import { DireccionService } from '../../../core/services/direccion.service';
import { DepartamentoService } from '../../../core/services/departamento.service';
import { FileService } from '../../../core/services/file.service';
import { AlertService } from '../../../core/services/alert.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-tareas-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  template: `
    <app-header></app-header>
    <div class="container-fluid py-4">
      <div class="row justify-content-center">
        <div class="col-md-10">
          <div class="d-flex align-items-center mb-4">
            <button class="btn btn-outline-secondary me-3" (click)="goBack()">
              <i class="bi bi-arrow-left"></i>
            </button>
            <div>
              <h1 class="h3 mb-0">
                {{ isEditing ? 'Editar' : 'Nueva' }} Tarea
              </h1>
              <p class="text-muted mb-0">
                {{
                  isEditing
                    ? 'Modificar información de la tarea'
                    : 'Crear una nueva tarea'
                }}
              </p>
            </div>
          </div>

          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <form [formGroup]="tareaForm" (ngSubmit)="onSubmit()">
                <div class="row">
                  <!-- Información básica -->
                  <div class="col-12 mb-4">
                    <h5 class="text-primary border-bottom pb-2">
                      <i class="bi bi-info-circle me-2"></i>Información Básica
                    </h5>
                  </div>

                  <div class="col-md-12 mb-3">
                    <label class="form-label">Título *</label>
                    <input
                      type="text"
                      class="form-control"
                      formControlName="title"
                      [class.is-invalid]="invalid('title')"
                      placeholder="Ej: Revisión del Plan Urbano"
                    />
                    <div class="invalid-feedback">Título requerido</div>
                  </div>

                  <div class="col-md-12 mb-3">
                    <label class="form-label">Descripción</label>
                    <textarea
                      rows="4"
                      class="form-control"
                      formControlName="description"
                      placeholder="Descripción detallada..."
                    ></textarea>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label">Estado *</label>
                    <select
                      class="form-select"
                      formControlName="status"
                      [class.is-invalid]="invalid('status')"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="in_progress">En Progreso</option>
                      <option value="completed">Completada</option>
                    </select>
                    <div class="invalid-feedback">Debe seleccionar estado</div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label">Fecha de vencimiento</label>
                    <input
                      type="date"
                      class="form-control"
                      formControlName="dueDate"
                    />
                  </div>

                  <!-- Asignación -->
                  <div class="col-12 mb-4 mt-4">
                    <h5 class="text-primary border-bottom pb-2">
                      <i class="bi bi-people me-2"></i>Asignación
                    </h5>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label">Dirección *</label>
                    <select
                      class="form-select"
                      formControlName="direccionId"
                      (change)="onDireccionChange()"
                      [class.is-invalid]="invalid('direccionId')"
                    >
                      <option value="">Seleccionar dirección</option>
                      <option *ngFor="let d of direcciones" [value]="d._id">
                        {{ d.name }}
                      </option>
                    </select>
                    <div class="invalid-feedback">
                      Debe seleccionar dirección
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label">Departamento *</label>
                    <select
                      class="form-select"
                      formControlName="departamentoId"
                      (change)="onDepartamentoChange()"
                      [disabled]="!tareaForm.get('direccionId')?.value"
                      [class.is-invalid]="invalid('departamentoId')"
                    >
                      <option value="">Seleccionar departamento</option>
                      <option
                        *ngFor="let d of departamentosFiltrados"
                        [value]="d._id"
                      >
                        {{ d.name }}
                      </option>
                    </select>
                    <div class="invalid-feedback">
                      Debe seleccionar departamento
                    </div>
                  </div>

                  <div class="col-md-12 mb-3">
                    <label class="form-label">Asignado a</label>
                    <select
                      class="form-select"
                      formControlName="assignedToIds"
                      [disabled]="!tareaForm.get('departamentoId')?.value"
                    >
                      <option value="">Sin asignar</option>
                      <option
                        *ngFor="let u of usuariosFiltrados"
                        [value]="u._id"
                      >
                        {{ u.name }} {{ u.lastName }} - {{ u.position }}
                      </option>
                    </select>
                  </div>

                  <!-- Archivos -->
                  <div class="col-12 mb-3">
                    <label class="form-label"
                      >Archivos adjuntos (opcional)</label
                    >
                    <input
                      type="file"
                      multiple
                      class="form-control"
                      accept=".pdf,.xlsx,.xls"
                      (change)="onFilesSelected($event)"
                    />
                    <ul class="mt-2" *ngIf="archivos.length">
                      <li *ngFor="let f of archivos">{{ f.name }}</li>
                    </ul>
                  </div>
                </div>

                <div class="d-flex justify-content-end gap-2 pt-3 border-top">
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    (click)="goBack()"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="tareaForm.invalid || loading"
                  >
                    <span
                      *ngIf="loading"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>
                    {{ isEditing ? 'Actualizar' : 'Crear' }} Tarea
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        border-radius: 1rem;
      }
      .btn {
        border-radius: 0.5rem;
      }
      .form-control,
      .form-select {
        border-radius: 0.5rem;
      }
      .is-invalid {
        border-color: #dc3545;
      }
    `,
  ],
})
export class TareasFormComponent implements OnInit {
  tareaForm!: FormGroup;
  loading = false;
  isEditing = false;
  tareaId: string | null = null;

  direcciones: any[] = [];
  departamentos: any[] = [];
  usuarios: any[] = [];
  departamentosFiltrados: any[] = [];
  usuariosFiltrados: any[] = [];

  archivos: File[] = [];

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

  ngOnInit(): void {
    this.buildForm();
    this.tareaId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.tareaId;

    this.prefillDates();
    this.loadData();

    if (this.isEditing) {
      this.loadTarea();
    }
  }

  buildForm() {
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
      ?.valueChanges.subscribe(() => this.onDireccionChange());
    this.tareaForm
      .get('departamentoId')
      ?.valueChanges.subscribe(() => this.onDepartamentoChange());
  }

  prefillDates() {
    const hoy = new Date();
    const vencimiento = new Date(hoy);
    vencimiento.setDate(hoy.getDate() + 7);
    this.tareaForm.patchValue({
      dueDate: vencimiento.toISOString().split('T')[0],
    });
  }

  loadData() {
    this.direccionService
      .getAll()
      .subscribe((r) => (this.direcciones = r.data || []));
    this.departamentoService
      .getAll()
      .subscribe((r) => (this.departamentos = r.data || []));
    this.userService.getAll().subscribe((r) => (this.usuarios = r.data || []));
  }

  loadTarea(): void {
    if (!this.tareaId) return;

    this.taskService.getById(this.tareaId).subscribe({
      next: (res) => {
        const t = res.data;
        if (!t) {
          this.alert.error('Tarea no encontrada');
          return;
        }

        // departamentoId puede ser string u objeto
        let departamentoId: string = '';
        if (
          typeof t.departamentoId === 'object' &&
          t.departamentoId !== null &&
          '_id' in t.departamentoId
        ) {
          departamentoId = (t.departamentoId as any)._id;
        } else if (typeof t.departamentoId === 'string') {
          departamentoId = t.departamentoId;
        }

        // assignedToIds es string[]
        let assignedToId = '';
        if (Array.isArray(t.assignedToIds) && t.assignedToIds.length > 0) {
          assignedToId = t.assignedToIds[0];
        }

        this.tareaForm.patchValue({
          title: t.title,
          description: t.description ?? '',
          status: t.status,
          departamentoId: departamentoId,
          assignedToIds: assignedToId,
          dueDate: t.dueDate
            ? new Date(t.dueDate).toISOString().split('T')[0]
            : '',
        });

        // localizar dirección asociada al departamento
        const dep = this.departamentos.find((d) => d._id === departamentoId);
        if (dep) {
          let direccionId = '';
          if (
            typeof dep.direccionId === 'object' &&
            dep.direccionId !== null &&
            '_id' in dep.direccionId
          ) {
            direccionId = (dep.direccionId as any)._id;
          } else if (typeof dep.direccionId === 'string') {
            direccionId = dep.direccionId;
          }
          this.tareaForm.patchValue({
            direccionId: direccionId,
          });
        }

        this.onDireccionChange();
        this.onDepartamentoChange();
      },
      error: () => this.alert.error('Error al cargar la tarea'),
    });
  }

  onDireccionChange() {
    const id = this.tareaForm.get('direccionId')?.value;
    this.departamentosFiltrados = this.departamentos.filter((d: any) =>
      typeof d.direccionId === 'object'
        ? d.direccionId._id === id
        : d.direccionId === id
    );
    if (!this.isEditing) {
      this.tareaForm.patchValue({ departamentoId: '', assignedToIds: '' });
      this.usuariosFiltrados = [];
    }
  }

  onDepartamentoChange() {
    const id = this.tareaForm.get('departamentoId')?.value;
    this.usuariosFiltrados = this.usuarios.filter((u: any) =>
      typeof u.departamentoId === 'object'
        ? u.departamentoId._id === id
        : u.departamentoId === id
    );
    if (!this.isEditing) this.tareaForm.patchValue({ assignedToIds: '' });
  }

  onFilesSelected(e: Event) {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    files.forEach((f) => {
      const v = this.fileService.validateFile(f);
      if (v.valid) this.archivos.push(f);
      else this.alert.error(v.error || 'Archivo inválido');
    });
  }

  invalid(c: string) {
    const f = this.tareaForm.get(c);
    return f && f.invalid && (f.dirty || f.touched);
  }

  onSubmit() {
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

    const finish = () => {
      this.loading = false;
      this.goBack();
    };

    const uploadAttachments = (taskId: string) => {
      if (!this.archivos.length) return finish();
      this.fileService.uploadMultipleFiles(this.archivos, taskId).subscribe({
        complete: finish,
        error: () => {
          this.loading = false;
          this.alert.error('Error subiendo archivos');
        },
      });
    };

    if (this.isEditing) {
      this.taskService.update(this.tareaId!, payload).subscribe({
        next: (r) => {
          const id = r.data?._id;
          if (id) {
            uploadAttachments(id);
          } else {
            this.loading = false;
            this.alert.error('Error: respuesta inválida del servidor');
          }
        },
        error: () => {
          this.loading = false;
          this.alert.error('Error al actualizar la tarea');
        },
      });
    } else {
      this.taskService.create(payload).subscribe({
        next: (r) => {
          const id = r.data?._id;
          if (id) {
            uploadAttachments(id);
          } else {
            this.loading = false;
            this.alert.error('Error: respuesta inválida del servidor');
          }
        },
        error: () => {
          this.loading = false;
          this.alert.error('Error al crear la tarea');
        },
      });
    }
  }

  goBack() {
    this.router.navigate(['/tareas']);
  }
}
