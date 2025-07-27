import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DireccionService } from '../../../core/services/direccion.service';
import { AlertService } from '../../../core/services/alert.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-direcciones-form',
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
                {{ isEditing ? 'Editar' : 'Nueva' }} Dirección
              </h1>
              <p class="text-muted mb-0">
                {{
                  isEditing
                    ? 'Modificar información de la dirección'
                    : 'Crear una nueva dirección organizacional'
                }}
              </p>
            </div>
          </div>

          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <form [formGroup]="direccionForm" (ngSubmit)="onSubmit()">
                <div class="row">
                  <div class="col-md-12 mb-3">
                    <label for="nombre" class="form-label"
                      >Nombre de la Dirección</label
                    >
                    <input
                      type="text"
                      class="form-control"
                      id="nombre"
                      formControlName="name"
                      placeholder="Ej: Dirección de Planificación"
                    />
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
                      placeholder="Descripción de las funciones de la dirección"
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

                  <div class="col-md-12 mb-3">
                    <label for="ubicacion" class="form-label">Ubicación</label>
                    <input
                      type="text"
                      class="form-control"
                      id="ubicacion"
                      formControlName="ubicacion"
                      placeholder="Ej: Edificio Principal, 2do Piso"
                    />
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
                        Dirección activa
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
                    [disabled]="direccionForm.invalid || loading"
                  >
                    <span
                      *ngIf="loading"
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    {{ isEditing ? 'Actualizar' : 'Guardar' }} Dirección
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
    `,
  ],
})
export class DireccionesFormComponent implements OnInit {
  direccionForm: FormGroup;
  loading = false;
  isEditing = false;
  direccionId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private direccionService: DireccionService,
    private alertService: AlertService
  ) {
    this.direccionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      activo: [true],
    });
  }

  ngOnInit(): void {
    this.direccionId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.direccionId;

    if (this.isEditing) {
      this.loadDireccion();
    }
  }

  loadDireccion(): void {
    if (!this.direccionId) return;

    this.direccionService.getById(this.direccionId).subscribe({
      next: (response) => {
        const direccion = response.data;
        if (direccion) {
          this.direccionForm.patchValue({
            name: direccion.name,
            activo: true, // Por defecto activo ya que el modelo no tiene este campo
          });
        }
      },
      error: (error) => {
        console.error('Error al cargar dirección:', error);
        this.alertService.error('Error al cargar la dirección');
      },
    });
  }

  onSubmit(): void {
    if (this.direccionForm.valid) {
      this.loading = true;
      const formData = this.direccionForm.value;

      const direccionData = {
        name: formData.name,
      };

      if (this.isEditing) {
        this.direccionService
          .update(this.direccionId!, direccionData)
          .subscribe({
            next: (response) => {
              console.log('Dirección actualizada:', response);
              this.alertService.success('Dirección actualizada exitosamente');
              this.loading = false;
              this.goBack();
            },
            error: (error) => {
              console.error('Error al actualizar dirección:', error);
              this.alertService.error('Error al actualizar la dirección');
              this.loading = false;
            },
          });
      } else {
        this.direccionService.create(direccionData).subscribe({
          next: (response) => {
            console.log('Dirección creada:', response);
            this.alertService.success('Dirección creada exitosamente');
            this.loading = false;
            this.goBack();
          },
          error: (error) => {
            console.error('Error al crear dirección:', error);
            this.alertService.error('Error al crear la dirección');
            this.loading = false;
          },
        });
      }
    } else {
      Object.keys(this.direccionForm.controls).forEach((key) => {
        this.direccionForm.get(key)?.markAsTouched();
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/direcciones']);
  }
}
