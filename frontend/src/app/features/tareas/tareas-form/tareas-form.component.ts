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
                  <!-- Información Básica -->
                  <div class="col-12 mb-4">
                    <h5 class="text-primary border-bottom pb-2">
                      <i class="bi bi-info-circle me-2"></i>Información Básica
                    </h5>
                  </div>

                  <div class="col-md-12 mb-3">
                    <label for="title" class="form-label"
                      >Título de la Tarea *</label
                    >
                    <input
                      type="text"
                      class="form-control"
                      id="title"
                      formControlName="title"
                      [class.is-invalid]="isFieldInvalid('title')"
                      placeholder="Ej: Revisión del Plan de Desarrollo Urbano"
                    />
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('title')"
                    >
                      El título es requerido y debe tener al menos 5 caracteres
                    </div>
                  </div>

                  <div class="col-md-12 mb-3">
                    <label for="description" class="form-label"
                      >Descripción</label
                    >
                    <textarea
                      class="form-control"
                      id="description"
                      formControlName="description"
                      rows="4"
                      placeholder="Descripción detallada de la tarea..."
                    ></textarea>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="status" class="form-label">Estado *</label>
                    <select
                      class="form-select"
                      id="status"
                      formControlName="status"
                      [class.is-invalid]="isFieldInvalid('status')"
                    >
                      <option value="pending">📋 Pendiente</option>
                      <option value="in_progress">⏳ En Progreso</option>
                      <option value="completed">✅ Completada</option>
                    </select>
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('status')"
                    >
                      Debe seleccionar un estado
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="dueDate" class="form-label"
                      >Fecha de Vencimiento</label
                    >
                    <input
                      type="date"
                      class="form-control"
                      id="dueDate"
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
                    <label for="direccionId" class="form-label"
                      >Dirección *</label
                    >
                    <select
                      class="form-select"
                      id="direccionId"
                      formControlName="direccionId"
                      [class.is-invalid]="isFieldInvalid('direccionId')"
                    >
                      <option value="">Seleccionar dirección</option>
                      <option
                        *ngFor="let direccion of direcciones"
                        [value]="direccion._id"
                      >
                        {{ direccion.name }}
                      </option>
                    </select>
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('direccionId')"
                    >
                      Debe seleccionar una dirección
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="departamentoId" class="form-label"
                      >Departamento *</label
                    >
                    <select
                      class="form-select"
                      id="departamentoId"
                      formControlName="departamentoId"
                      [class.is-invalid]="isFieldInvalid('departamentoId')"
                      [disabled]="!tareaForm.get('direccionId')?.value"
                    >
                      <option value="">Seleccionar departamento</option>
                      <option
                        *ngFor="let depto of departamentosFiltrados"
                        [value]="depto._id"
                      >
                        {{ depto.name }}
                      </option>
                    </select>
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('departamentoId')"
                    >
                      Debe seleccionar un departamento
                    </div>
                  </div>

                  <div class="col-md-12 mb-3">
                    <label for="assignedToIds" class="form-label"
                      >Asignado a</label
                    >
                    <select
                      class="form-select"
                      id="assignedToIds"
                      formControlName="assignedToIds"
                      [disabled]="!tareaForm.get('departamentoId')?.value"
                    >
                      <option value="">Seleccionar usuario (opcional)</option>
                      <option
                        *ngFor="let usuario of usuariosFiltrados"
                        [value]="usuario._id"
                      >
                        {{ usuario.firstName }} {{ usuario.lastName }} -
                        {{ usuario.position }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="d-flex gap-2 justify-content-end pt-3 border-top">
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
                      role="status"
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

      .border-bottom {
        border-bottom: 2px solid #e9ecef !important;
      }
    `,
  ],
})
export class TareasFormComponent implements OnInit {
  tareaForm: FormGroup;
  loading = false;
  isEditing = false;
  tareaId: string | null = null;

  direcciones: any[] = [];
  departamentos: any[] = [];
  usuarios: any[] = [];
  departamentosFiltrados: any[] = [];
  usuariosFiltrados: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private taskService: TaskService,
    private userService: UserService,
    private direccionService: DireccionService,
    private departamentoService: DepartamentoService,
    private alertService: AlertService
  ) {
    this.tareaForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: [''],
      status: ['pending', Validators.required],
      direccionId: ['', Validators.required],
      departamentoId: ['', Validators.required],
      assignedToIds: [''],
      dueDate: [''],
    });
  }

  ngOnInit(): void {
    this.tareaId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.tareaId;

    // Set default dates
    const hoy = new Date();
    const unaSemana = new Date(hoy);
    unaSemana.setDate(hoy.getDate() + 7);

    this.tareaForm.patchValue({
      dueDate: unaSemana.toISOString().split('T')[0],
    });

    // Load data
    this.loadDirecciones();
    this.loadDepartamentos();
    this.loadUsuarios();

    // Watch direccion changes
    this.tareaForm.get('direccionId')?.valueChanges.subscribe(() => {
      this.onDireccionChange();
    });

    // Watch departamento changes
    this.tareaForm.get('departamentoId')?.valueChanges.subscribe(() => {
      this.onDepartamentoChange();
    });

    if (this.isEditing) {
      this.loadTarea();
    }
  }

  loadDirecciones(): void {
    this.direccionService.getAll().subscribe({
      next: (response) => {
        this.direcciones = response.data || [];
        console.log('Direcciones cargadas:', this.direcciones);
      },
      error: (error) => {
        console.error('Error al cargar direcciones:', error);
        this.alertService.error('Error al cargar direcciones');
      },
    });
  }

  loadDepartamentos(): void {
    this.departamentoService.getAll().subscribe({
      next: (response) => {
        this.departamentos = response.data || [];
        console.log('Departamentos cargados:', this.departamentos);
      },
      error: (error) => {
        console.error('Error al cargar departamentos:', error);
        this.alertService.error('Error al cargar departamentos');
      },
    });
  }

  loadUsuarios(): void {
    this.userService.getAll().subscribe({
      next: (response) => {
        this.usuarios = response.data || [];
        console.log('Usuarios cargados:', this.usuarios);
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.alertService.error('Error al cargar usuariosss');
      },
    });
  }

  loadTarea(): void {
    if (!this.tareaId) return;

    this.taskService.getById(this.tareaId).subscribe({
      next: (response) => {
        const tarea = response.data;
        if (tarea) {
          console.log('Tarea cargada:', tarea);
          this.tareaForm.patchValue({
            title: tarea.title,
            description: tarea.description || '',
            status: tarea.status,
            departamentoId: tarea.departamentoId,
            assignedToIds: tarea.assignedToIds?.[0] || '',
            dueDate: tarea.dueDate
              ? new Date(tarea.dueDate).toISOString().split('T')[0]
              : '',
          });

          // Find direccion based on departamento
          const departamento = this.departamentos.find(
            (d) => d._id === tarea.departamentoId
          );
          if (departamento) {
            this.tareaForm.patchValue({
              direccionId:
                typeof departamento.direccionId === 'object'
                  ? departamento.direccionId._id
                  : departamento.direccionId,
            });
            this.onDireccionChange();
            this.onDepartamentoChange();
          }
        }
      },
      error: (error) => {
        console.error('Error al cargar tarea:', error);
        this.alertService.error('Error al cargar la tarea');
      },
    });
  }

  onDireccionChange(): void {
    const direccionId = this.tareaForm.get('direccionId')?.value;
    if (direccionId) {
      this.departamentosFiltrados = this.departamentos.filter((depto) => {
        return typeof depto.direccionId === 'object'
          ? depto.direccionId._id === direccionId
          : depto.direccionId === direccionId;
      });
      console.log('Departamentos filtrados:', this.departamentosFiltrados);
    } else {
      this.departamentosFiltrados = [];
    }

    // Reset departamento and usuario when direccion changes
    if (!this.isEditing) {
      this.tareaForm.patchValue({
        departamentoId: '',
        assignedToIds: '',
      });
      this.usuariosFiltrados = [];
    }
  }

  onDepartamentoChange(): void {
    const departamentoId = this.tareaForm.get('departamentoId')?.value;
    console.log('Departamento seleccionado:', departamentoId);
    console.log('Todos los usuarios:', this.usuarios);

    if (departamentoId) {
      this.usuariosFiltrados = this.usuarios.filter((usuario) => {
        console.log(
          'Usuario departamentoId:',
          usuario.departamentoId,
          'Comparando con:',
          departamentoId
        );
        return typeof usuario.departamentoId === 'object'
          ? usuario.departamentoId._id === departamentoId
          : usuario.departamentoId === departamentoId;
      });
      console.log('Usuarios filtrados:', this.usuariosFiltrados);
    } else {
      this.usuariosFiltrados = [];
    }

    // Reset usuario when departamento changes (but not during editing load)
    if (!this.isEditing) {
      this.tareaForm.patchValue({ assignedToIds: '' });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.tareaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.tareaForm.valid) {
      this.loading = true;
      const formData = this.tareaForm.value;

      const tareaData = {
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status,
        departamentoId: formData.departamentoId,
        assignedToIds: formData.assignedToIds ? [formData.assignedToIds] : [],
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      };

      console.log('Datos a enviar:', tareaData);

      if (this.isEditing) {
        this.taskService.update(this.tareaId!, tareaData).subscribe({
          next: (response) => {
            console.log('Tarea actualizada:', response);
            this.alertService.success('Tarea actualizada exitosamente');
            this.loading = false;
            this.goBack();
          },
          error: (error) => {
            console.error('Error al actualizar tarea:', error);
            this.alertService.error('Error al actualizar la tarea');
            this.loading = false;
          },
        });
      } else {
        this.taskService.create(tareaData).subscribe({
          next: (response) => {
            console.log('Tarea creada:', response);
            this.alertService.success('Tarea creada exitosamente');
            this.loading = false;
            this.goBack();
          },
          error: (error) => {
            console.error('Error al crear tarea:', error);
            this.alertService.error('Error al crear la tarea');
            this.loading = false;
          },
        });
      }
    } else {
      Object.keys(this.tareaForm.controls).forEach((key) => {
        this.tareaForm.get(key)?.markAsTouched();
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/tareas']);
  }
}
