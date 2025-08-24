import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DepartamentoService } from '../../../core/services/departamento.service';
import { DireccionService } from '../../../core/services/direccion.service';
import { AlertService } from '../../../core/services/alert.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-departamentos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  template: `
    <app-header></app-header>
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
                    <label for="name" class="form-label"
                      >Nombre del Departamento *</label
                    >
                    <input
                      type="text"
                      class="form-control"
                      id="name"
                      formControlName="name"
                      [class.is-invalid]="isFieldInvalid('name')"
                      placeholder="Ej: Departamento de Planificación Urbana"
                    />
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('name')"
                    >
                      El nombre es requerido y debe tener al menos 3 caracteres
                    </div>
                  </div>

                  <div class="col-md-12 mb-3">
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
  direcciones: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private departamentoService: DepartamentoService,
    private direccionService: DireccionService,
    private alertService: AlertService
  ) {
    this.departamentoForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      direccionId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.departamentoId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.departamentoId;
    this.loadDirecciones();
    if (this.isEditing) {
      this.loadDepartamento();
    }
  }

  loadDirecciones(): void {
    this.direccionService.getAll().subscribe({
      next: (response) => {
        this.direcciones = response.data || [];
      },
      error: (error) => {
        console.error('Error al cargar direcciones:', error);
        this.alertService.error('Error al cargar direcciones');
      },
    });
  }

  loadDepartamento(): void {
    if (!this.departamentoId) return;

    this.departamentoService.getById(this.departamentoId).subscribe({
      next: (response) => {
        const departamento = response.data;
        if (departamento) {
          this.departamentoForm.patchValue({
            name: departamento.name,
            direccionId:
              typeof departamento.direccionId === 'object'
                ? departamento.direccionId._id
                : departamento.direccionId,
          });
        }
      },
      error: (error) => {
        console.error('Error al cargar departamento:', error);
        this.alertService.error('Error al cargar el departamento');
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.departamentoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.departamentoForm.valid) {
      this.loading = true;
      const formData = this.departamentoForm.value;

      const departamentoData = {
        name: formData.name,
        direccionId: formData.direccionId,
      };

      if (this.isEditing) {
        this.departamentoService
          .update(this.departamentoId!, departamentoData)
          .subscribe({
            next: (response) => {
              this.alertService.success(
                'Departamento actualizado exitosamente'
              );
              this.loading = false;
              this.goBack();
            },
            error: (error) => {
              console.error('Error al actualizar departamento:', error);
              this.alertService.error('Error al actualizar el departamento');
              this.loading = false;
            },
          });
      } else {
        this.departamentoService.create(departamentoData).subscribe({
          next: (response) => {
            this.alertService.success('Departamento creado exitosamente');
            this.loading = false;
            this.goBack();
          },
          error: (error) => {
            console.error('Error al crear departamento:', error);
            this.alertService.error('Error al crear el departamento');
            this.loading = false;
          },
        });
      }
    } else {
      Object.keys(this.departamentoForm.controls).forEach((key) => {
        this.departamentoForm.get(key)?.markAsTouched();
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/departamentos']);
  }
}
