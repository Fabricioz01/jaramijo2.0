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
  selector: 'app-departamentos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="d-flex align-items-center mb-4">
            <button class="btn btn-outline-secondary me-3" (click)="goBack()">
              <i class="bi bi-arrow-left"></i>
            </button>
            <div>
              <h1 class="h3 mb-0">
                {{ isEditing ? 'Editar' : 'Nuevo' }} Departamento
              </h1>
              <p class="text-muted mb-0">
                {{
                  isEditing
                    ? 'Modificar información del departamento'
                    : 'Crear un nuevo departamento'
                }}
              </p>
            </div>
          </div>

          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <form [formGroup]="departamentoForm" (ngSubmit)="onSubmit()">
                <div class="row">
                  <div class="col-md-12 mb-3">
                    <label for="nombre" class="form-label"
                      >Nombre del Departamento *</label
                    >
                    <input
                      type="text"
                      class="form-control"
                      id="nombre"
                      formControlName="nombre"
                      [class.is-invalid]="isFieldInvalid('nombre')"
                      placeholder="Ej: Departamento de Planificación Urbana"
                    />
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('nombre')"
                    >
                      El nombre es requerido y debe tener al menos 3 caracteres
                    </div>
                  </div>

                  <div class="col-md-12 mb-3">
                    <label for="direccion" class="form-label"
                      >Dirección *</label
                    >
                    <select
                      class="form-select"
                      id="direccion"
                      formControlName="direccion"
                      [class.is-invalid]="isFieldInvalid('direccion')"
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

                  <div class="col-md-12 mb-3">
                    <label for="descripcion" class="form-label"
                      >Descripción</label
                    >
                    <textarea
                      class="form-control"
                      id="descripcion"
                      formControlName="descripcion"
                      rows="3"
                      placeholder="Descripción de las funciones del departamento"
                    ></textarea>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="responsable" class="form-label"
                      >Responsable</label
                    >
                    <input
                      type="text"
                      class="form-control"
                      id="responsable"
                      formControlName="responsable"
                      placeholder="Nombre del responsable"
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="telefono" class="form-label">Teléfono</label>
                    <input
                      type="tel"
                      class="form-control"
                      id="telefono"
                      formControlName="telefono"
                      placeholder="Número de contacto"
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      formControlName="email"
                      [class.is-invalid]="isFieldInvalid('email')"
                      placeholder="correo@municipio.gob.ec"
                    />
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('email')"
                    >
                      Ingrese un email válido
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="ubicacion" class="form-label">Ubicación</label>
                    <input
                      type="text"
                      class="form-control"
                      id="ubicacion"
                      formControlName="ubicacion"
                      placeholder="Ej: Edificio Principal, Oficina 201"
                    />
                  </div>

                  <div class="col-md-12 mb-3">
                    <label for="objetivos" class="form-label">Objetivos</label>
                    <textarea
                      class="form-control"
                      id="objetivos"
                      formControlName="objetivos"
                      rows="2"
                      placeholder="Objetivos principales del departamento"
                    ></textarea>
                  </div>

                  <div class="col-md-6 mb-3">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        id="activo"
                        formControlName="activo"
                      />
                      <label class="form-check-label" for="activo">
                        Departamento activo
                      </label>
                    </div>
                  </div>
                </div>

                <div class="d-flex gap-2 justify-content-end pt-3">
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
                    [disabled]="departamentoForm.invalid || loading"
                  >
                    <span
                      *ngIf="loading"
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    {{ isEditing ? 'Actualizar' : 'Guardar' }} Departamento
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

      .form-check-input:checked {
        background-color: #0d6efd;
        border-color: #0d6efd;
      }

      .is-invalid {
        border-color: #dc3545;
      }
    `,
  ],
})
export class DepartamentosFormComponent implements OnInit {
  departamentoForm: FormGroup;
  loading = false;
  isEditing = false;
  departamentoId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.departamentoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      direccion: ['', Validators.required],
      descripcion: [''],
      responsable: [''],
      telefono: [''],
      email: ['', Validators.email],
      ubicacion: [''],
      objetivos: [''],
      activo: [true],
    });
  }

  ngOnInit(): void {
    this.departamentoId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.departamentoId;

    if (this.isEditing) {
      this.loadDepartamento();
    }
  }

  loadDepartamento(): void {
    // Aquí cargarías los datos del departamento desde el servicio
    // Por ahora simulamos datos
    const mockData = {
      nombre: 'Planificación Urbana',
      direccion: 'planificacion',
      descripcion: 'Encargado del desarrollo urbano y territorial',
      responsable: 'Ing. María González',
      telefono: '04-123-4567',
      email: 'planificacion@municipio.gob.ec',
      ubicacion: 'Edificio Principal, 2do Piso',
      objetivos: 'Desarrollar planes de ordenamiento territorial',
      activo: true,
    };

    this.departamentoForm.patchValue(mockData);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.departamentoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.departamentoForm.valid) {
      this.loading = true;

      // Simulamos el guardado
      setTimeout(() => {
        console.log('Departamento a guardar:', this.departamentoForm.value);
        this.loading = false;
        this.goBack();
      }, 1000);
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.departamentoForm.controls).forEach((key) => {
        this.departamentoForm.get(key)?.markAsTouched();
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/departamentos']);
  }
}
