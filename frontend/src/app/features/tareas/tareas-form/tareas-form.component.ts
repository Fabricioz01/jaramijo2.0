import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tareas-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
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
                    <label for="titulo" class="form-label"
                      >Título de la Tarea *</label
                    >
                    <input
                      type="text"
                      class="form-control"
                      id="titulo"
                      formControlName="titulo"
                      [class.is-invalid]="isFieldInvalid('titulo')"
                      placeholder="Ej: Revisión del Plan de Desarrollo Urbano"
                    />
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('titulo')"
                    >
                      El título es requerido y debe tener al menos 5 caracteres
                    </div>
                  </div>

                  <div class="col-md-12 mb-3">
                    <label for="descripcion" class="form-label"
                      >Descripción *</label
                    >
                    <textarea
                      class="form-control"
                      id="descripcion"
                      formControlName="descripcion"
                      rows="4"
                      [class.is-invalid]="isFieldInvalid('descripcion')"
                      placeholder="Descripción detallada de la tarea..."
                    ></textarea>
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('descripcion')"
                    >
                      La descripción es requerida
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="prioridad" class="form-label"
                      >Prioridad *</label
                    >
                    <select
                      class="form-select"
                      id="prioridad"
                      formControlName="prioridad"
                      [class.is-invalid]="isFieldInvalid('prioridad')"
                    >
                      <option value="">Seleccionar prioridad</option>
                      <option value="baja">🟢 Baja</option>
                      <option value="media">🟡 Media</option>
                      <option value="alta">🟠 Alta</option>
                      <option value="urgente">🔴 Urgente</option>
                    </select>
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('prioridad')"
                    >
                      Debe seleccionar una prioridad
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="estado" class="form-label">Estado *</label>
                    <select
                      class="form-select"
                      id="estado"
                      formControlName="estado"
                      [class.is-invalid]="isFieldInvalid('estado')"
                    >
                      <option value="pendiente">📋 Pendiente</option>
                      <option value="en_progreso">⏳ En Progreso</option>
                      <option value="completada">✅ Completada</option>
                      <option value="cancelada">❌ Cancelada</option>
                    </select>
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('estado')"
                    >
                      Debe seleccionar un estado
                    </div>
                  </div>

                  <!-- Asignación -->
                  <div class="col-12 mb-4 mt-4">
                    <h5 class="text-primary border-bottom pb-2">
                      <i class="bi bi-people me-2"></i>Asignación
                    </h5>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="direccion" class="form-label"
                      >Dirección *</label
                    >
                    <select
                      class="form-select"
                      id="direccion"
                      formControlName="direccion"
                      [class.is-invalid]="isFieldInvalid('direccion')"
                      (change)="onDireccionChange()"
                    >
                      <option value="">Seleccionar dirección</option>
                      <option value="planificacion">
                        Dirección de Planificación
                      </option>
                      <option value="obras">Dirección de Obras Públicas</option>
                      <option value="ambiente">Dirección de Ambiente</option>
                      <option value="desarrollo">
                        Dirección de Desarrollo Social
                      </option>
                      <option value="administracion">
                        Dirección Administrativa
                      </option>
                    </select>
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('direccion')"
                    >
                      Debe seleccionar una dirección
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="departamento" class="form-label"
                      >Departamento *</label
                    >
                    <select
                      class="form-select"
                      id="departamento"
                      formControlName="departamento"
                      [class.is-invalid]="isFieldInvalid('departamento')"
                      [disabled]="!tareaForm.get('direccion')?.value"
                      (change)="onDepartamentoChange()"
                    >
                      <option value="">Seleccionar departamento</option>
                      <option
                        *ngFor="let depto of departamentosFiltrados"
                        [value]="depto.id"
                      >
                        {{ depto.nombre }}
                      </option>
                    </select>
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('departamento')"
                    >
                      Debe seleccionar un departamento
                    </div>
                  </div>

                  <div class="col-md-12 mb-3">
                    <label for="asignadoA" class="form-label"
                      >Asignado a *</label
                    >
                    <select
                      class="form-select"
                      id="asignadoA"
                      formControlName="asignadoA"
                      [class.is-invalid]="isFieldInvalid('asignadoA')"
                      [disabled]="!tareaForm.get('departamento')?.value"
                    >
                      <option value="">Seleccionar usuario</option>
                      <option
                        *ngFor="let usuario of usuariosFiltrados"
                        [value]="usuario.id"
                      >
                        {{ usuario.nombres }} {{ usuario.apellidos }} -
                        {{ usuario.cargo }}
                      </option>
                    </select>
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('asignadoA')"
                    >
                      Debe asignar la tarea a un usuario
                    </div>
                  </div>

                  <!-- Fechas -->
                  <div class="col-12 mb-4 mt-4">
                    <h5 class="text-primary border-bottom pb-2">
                      <i class="bi bi-calendar me-2"></i>Cronograma
                    </h5>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="fechaInicio" class="form-label"
                      >Fecha de Inicio *</label
                    >
                    <input
                      type="date"
                      class="form-control"
                      id="fechaInicio"
                      formControlName="fechaInicio"
                      [class.is-invalid]="isFieldInvalid('fechaInicio')"
                    />
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('fechaInicio')"
                    >
                      La fecha de inicio es requerida
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="fechaVencimiento" class="form-label"
                      >Fecha de Vencimiento *</label
                    >
                    <input
                      type="date"
                      class="form-control"
                      id="fechaVencimiento"
                      formControlName="fechaVencimiento"
                      [class.is-invalid]="isFieldInvalid('fechaVencimiento')"
                    />
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('fechaVencimiento')"
                    >
                      La fecha de vencimiento is requerida y debe ser posterior
                      a la fecha de inicio
                    </div>
                  </div>

                  <!-- Progreso y Etiquetas -->
                  <div class="col-12 mb-4 mt-4">
                    <h5 class="text-primary border-bottom pb-2">
                      <i class="bi bi-gear me-2"></i>Configuración Adicional
                    </h5>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="progreso" class="form-label"
                      >Progreso (%)</label
                    >
                    <input
                      type="range"
                      class="form-range"
                      id="progreso"
                      formControlName="progreso"
                      min="0"
                      max="100"
                      step="5"
                    />
                    <div class="d-flex justify-content-between">
                      <small class="text-muted">0%</small>
                      <strong class="text-primary"
                        >{{ tareaForm.get('progreso')?.value }}%</strong
                      >
                      <small class="text-muted">100%</small>
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="etiquetas" class="form-label">Etiquetas</label>
                    <input
                      type="text"
                      class="form-control"
                      id="etiquetas"
                      formControlName="etiquetasInput"
                      placeholder="Separar por comas: urbanismo, desarrollo, ambiente"
                    />
                    <small class="text-muted"
                      >Separe las etiquetas con comas</small
                    >
                  </div>

                  <div class="col-md-12 mb-3" *ngIf="etiquetasList.length > 0">
                    <div class="d-flex flex-wrap gap-1">
                      <span
                        class="badge bg-primary"
                        *ngFor="let etiqueta of etiquetasList; let i = index"
                      >
                        {{ etiqueta }}
                        <button
                          type="button"
                          class="btn-close btn-close-white ms-1"
                          (click)="removeEtiqueta(i)"
                          style="font-size: 0.6em;"
                        ></button>
                      </span>
                    </div>
                  </div>

                  <div class="col-md-12 mb-3">
                    <label for="observaciones" class="form-label"
                      >Observaciones</label
                    >
                    <textarea
                      class="form-control"
                      id="observaciones"
                      formControlName="observaciones"
                      rows="3"
                      placeholder="Observaciones adicionales sobre la tarea..."
                    ></textarea>
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

      .form-range::-webkit-slider-thumb {
        background: #0d6efd;
      }

      .is-invalid {
        border-color: #dc3545;
      }

      .border-bottom {
        border-bottom: 2px solid #e9ecef !important;
      }

      .badge {
        font-size: 0.875em;
      }
    `,
  ],
})
export class TareasFormComponent implements OnInit {
  tareaForm: FormGroup;
  loading = false;
  isEditing = false;
  tareaId: string | null = null;
  etiquetasList: string[] = [];

  departamentosFiltrados: any[] = [];
  usuariosFiltrados: any[] = [];

  departamentos = [
    {
      id: 'plan-urbana',
      nombre: 'Planificación Urbana',
      direccion: 'planificacion',
    },
    {
      id: 'plan-rural',
      nombre: 'Planificación Rural',
      direccion: 'planificacion',
    },
    { id: 'obras-viales', nombre: 'Obras Viales', direccion: 'obras' },
    {
      id: 'obras-edificaciones',
      nombre: 'Obras y Edificaciones',
      direccion: 'obras',
    },
    {
      id: 'gestion-ambiental',
      nombre: 'Gestión Ambiental',
      direccion: 'ambiente',
    },
  ];

  usuarios = [
    {
      id: '1',
      nombres: 'María',
      apellidos: 'González',
      cargo: 'Coordinadora',
      departamento: 'plan-urbana',
    },
    {
      id: '2',
      nombres: 'Carlos',
      apellidos: 'Mendoza',
      cargo: 'Ingeniero',
      departamento: 'obras-viales',
    },
    {
      id: '3',
      nombres: 'Ana',
      apellidos: 'Rodríguez',
      cargo: 'Bióloga',
      departamento: 'gestion-ambiental',
    },
    {
      id: '4',
      nombres: 'Luis',
      apellidos: 'Morales',
      cargo: 'Arquitecto',
      departamento: 'plan-urbana',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.tareaForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', Validators.required],
      prioridad: ['media', Validators.required],
      estado: ['pendiente', Validators.required],
      direccion: ['', Validators.required],
      departamento: ['', Validators.required],
      asignadoA: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaVencimiento: ['', Validators.required],
      progreso: [0],
      etiquetasInput: [''],
      observaciones: [''],
    });
  }

  ngOnInit(): void {
    this.tareaId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.tareaId;

    // Set default dates
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    const unaSemana = new Date(hoy);
    unaSemana.setDate(hoy.getDate() + 7);

    this.tareaForm.patchValue({
      fechaInicio: hoy.toISOString().split('T')[0],
      fechaVencimiento: unaSemana.toISOString().split('T')[0],
    });

    // Custom validator for fechas
    this.tareaForm.addValidators(this.fechasValidator.bind(this));

    // Watch etiquetas input
    this.tareaForm.get('etiquetasInput')?.valueChanges.subscribe((value) => {
      if (value && value.includes(',')) {
        const etiquetas = value
          .split(',')
          .map((e: string) => e.trim())
          .filter((e: string) => e);
        etiquetas.forEach((etiqueta: string) => {
          if (!this.etiquetasList.includes(etiqueta)) {
            this.etiquetasList.push(etiqueta);
          }
        });
        this.tareaForm.get('etiquetasInput')?.setValue('');
      }
    });

    if (this.isEditing) {
      this.loadTarea();
    }
  }

  fechasValidator(control: any) {
    const fechaInicio = control.get('fechaInicio')?.value;
    const fechaVencimiento = control.get('fechaVencimiento')?.value;

    if (
      fechaInicio &&
      fechaVencimiento &&
      new Date(fechaVencimiento) <= new Date(fechaInicio)
    ) {
      control.get('fechaVencimiento')?.setErrors({ fechaInvalida: true });
      return { fechaInvalida: true };
    }

    return null;
  }

  loadTarea(): void {
    // Mock data for editing
    const mockData = {
      titulo: 'Revisión del Plan de Desarrollo Urbano',
      descripcion:
        'Revisar y actualizar el plan de desarrollo urbano para el sector norte de la ciudad',
      prioridad: 'alta',
      estado: 'en_progreso',
      direccion: 'planificacion',
      departamento: 'plan-urbana',
      asignadoA: '1',
      fechaInicio: '2024-01-15',
      fechaVencimiento: '2024-02-15',
      progreso: 65,
      observaciones: 'Proyecto prioritario para el desarrollo del cantón',
    };

    this.tareaForm.patchValue(mockData);
    this.etiquetasList = ['urbanismo', 'desarrollo', 'planificación'];
    this.onDireccionChange();
    this.onDepartamentoChange();
  }

  onDireccionChange(): void {
    const direccionSeleccionada = this.tareaForm.get('direccion')?.value;
    this.departamentosFiltrados = this.departamentos.filter(
      (dept) => dept.direccion === direccionSeleccionada
    );

    this.tareaForm.get('departamento')?.setValue('');
    this.tareaForm.get('asignadoA')?.setValue('');
    this.usuariosFiltrados = [];
  }

  onDepartamentoChange(): void {
    const departamentoSeleccionado = this.tareaForm.get('departamento')?.value;
    this.usuariosFiltrados = this.usuarios.filter(
      (user) => user.departamento === departamentoSeleccionado
    );

    this.tareaForm.get('asignadoA')?.setValue('');
  }

  removeEtiqueta(index: number): void {
    this.etiquetasList.splice(index, 1);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.tareaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.tareaForm.valid) {
      this.loading = true;

      const formData = {
        ...this.tareaForm.value,
        etiquetas: this.etiquetasList,
      };

      // Remove etiquetasInput as it's not needed
      delete formData.etiquetasInput;

      setTimeout(() => {
        console.log('Tarea a guardar:', formData);
        this.loading = false;
        this.goBack();
      }, 1000);
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
