import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RoleService } from '../../../core/services/role.service';
import { PermissionService } from '../../../core/services/permission.service';
import { AlertService } from '../../../core/services/alert.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-roles-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HeaderComponent],
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
              <h1 class="h3 mb-0">{{ isEditing ? 'Editar' : 'Nuevo' }} Rol</h1>
              <p class="text-muted mb-0">
                {{
                  isEditing
                    ? 'Modificar información del rol'
                    : 'Crear un nuevo rol del sistema'
                }}
              </p>
            </div>
          </div>

          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <form [formGroup]="rolForm" (ngSubmit)="onSubmit()">
                <div class="row">
                  <div class="col-md-12 mb-3">
                    <label for="name" class="form-label"
                      >Nombre del Rol *</label
                    >
                    <input
                      type="text"
                      class="form-control"
                      id="name"
                      formControlName="name"
                      [class.is-invalid]="isFieldInvalid('name')"
                      placeholder="Ej: Supervisor de Obras"
                    />
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('name')"
                    >
                      El nombre es requerido y debe tener al menos 3 caracteres
                    </div>
                  </div>

                  <div class="col-md-12 mb-3" *ngIf="permissions.length > 0">
                    <label class="form-label">Permisos Disponibles</label>
                    <div class="card">
                      <div class="card-body">
                        <div class="row">
                          <div
                            class="col-md-6 mb-2"
                            *ngFor="let permission of permissions"
                          >
                            <div class="form-check">
                              <input
                                class="form-check-input"
                                type="checkbox"
                                [id]="permission._id"
                                [checked]="isPermisoSelected(permission._id)"
                                (change)="togglePermiso(permission._id)"
                              />
                              <label
                                class="form-check-label"
                                [for]="permission._id"
                              >
                                <strong
                                  >{{ permission.action | titlecase }}
                                  {{ permission.resource | titlecase }}</strong
                                >
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Resumen de permisos seleccionados -->
                  <div
                    class="col-12 mt-4"
                    *ngIf="permisosSeleccionados.length > 0"
                  >
                    <div class="alert alert-info">
                      <h6>
                        <i class="bi bi-info-circle me-2"></i>Permisos
                        Seleccionados ({{ permisosSeleccionados.length }})
                      </h6>
                      <div class="d-flex flex-wrap gap-1 mt-2">
                        <span
                          class="badge bg-primary"
                          *ngFor="let permisoId of permisosSeleccionados"
                        >
                          {{ getPermisoNombre(permisoId) }}
                          <button
                            type="button"
                            class="btn-close btn-close-white ms-1"
                            (click)="togglePermiso(permisoId)"
                            style="font-size: 0.6em;"
                          ></button>
                        </span>
                      </div>
                    </div>
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
                    [disabled]="rolForm.invalid || loading"
                  >
                    <span
                      *ngIf="loading"
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    {{ isEditing ? 'Actualizar' : 'Crear' }} Rol
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

      .border-bottom {
        border-bottom: 2px solid #e9ecef !important;
      }

      .badge {
        font-size: 0.75em;
      }

      .form-check-label {
        cursor: pointer;
      }
    `,
  ],
})
export class RolesFormComponent implements OnInit {
  rolForm: FormGroup;
  loading = false;
  isEditing = false;
  rolId: string | null = null;
  permisosSeleccionados: string[] = [];
  permissions: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private alertService: AlertService
  ) {
    this.rolForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit(): void {
    this.rolId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.rolId;

    this.loadPermissions();

    if (this.isEditing) {
      this.loadRol();
    }
  }

  loadPermissions(): void {
    this.permissionService.getAll().subscribe({
      next: (response) => {
        this.permissions = response.data || [];
      },
      error: (error) => {
        console.error('Error al cargar permisos:', error);
        this.alertService.error('Error al cargar permisos');
      },
    });
  }

  loadRol(): void {
    if (!this.rolId) return;

    this.roleService.getById(this.rolId).subscribe({
      next: (response) => {
        const role = response.data;
        if (role) {
          this.rolForm.patchValue({ name: role.name });

          this.permisosSeleccionados = (role.permissionIds || []).map(
            (p: any) => (typeof p === 'string' ? p : p._id)
          );
        }
      },
      error: () => {
        console.error('Error al cargar rol');
        this.alertService.error('Error al cargar el rol');
      },
    });
  }

  isPermisoSelected(permisoId: string): boolean {
    return this.permisosSeleccionados.includes(permisoId);
  }

  togglePermiso(permisoId: string): void {
    const index = this.permisosSeleccionados.indexOf(permisoId);
    if (index > -1) {
      this.permisosSeleccionados.splice(index, 1);
    } else {
      this.permisosSeleccionados.push(permisoId);
    }
  }

  getPermisoNombre(permisoId: string): string {
    const permission = this.permissions.find((p) => p._id === permisoId);
    return permission
      ? `${permission.action} ${permission.resource}`
      : permisoId;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.rolForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.rolForm.valid && this.permisosSeleccionados.length > 0) {
      this.loading = true;

      const roleData = {
        name: this.rolForm.value.name,
        permissionIds: this.permisosSeleccionados,
      };

      if (this.isEditing) {
        this.roleService.update(this.rolId!, roleData).subscribe({
          next: (response) => {
            console.log('Rol actualizado:', response);
            this.alertService.success(
              response.message || 'Rol actualizado exitosamente'
            );
            this.loading = false;
            this.goBack();
          },
          error: (error) => {
            console.error('Error al actualizar rol:', error);
            const errorMessage =
              error.error?.message || 'Error al actualizar el rol';
            this.alertService.error(errorMessage);
            this.loading = false;
          },
        });
      } else {
        this.roleService.create(roleData).subscribe({
          next: (response) => {
            console.log('Rol creado:', response);
            this.alertService.success(
              response.message || 'Rol creado exitosamente'
            );
            this.loading = false;
            this.goBack();
          },
          error: (error) => {
            console.error('Error al crear rol:', error);
            const errorMessage =
              error.error?.message || 'Error al crear el rol';
            this.alertService.error(errorMessage);
            this.loading = false;
          },
        });
      }
    } else {
      Object.keys(this.rolForm.controls).forEach((key) => {
        this.rolForm.get(key)?.markAsTouched();
      });

      if (this.permisosSeleccionados.length === 0) {
        this.alertService.error(
          'Debe seleccionar al menos un permiso para el rol'
        );
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/roles']);
  }
}
