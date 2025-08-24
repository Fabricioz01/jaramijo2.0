import { Component, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
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
import { PermissionSyncService } from '../../../core/services/permission-sync.service';
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

                  <div class="col-md-12 mb-3" *ngIf="getResourceNames().length > 0">
                    <label class="form-label">Permisos del Sistema</label>
                    <div class="permissions-container">
                      <div 
                        class="resource-group" 
                        *ngFor="let resource of getResourceNames()"
                      >
                        <div class="resource-header">
                          <div class="d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center">
                              <div class="form-check me-3">
                                <input
                                  class="form-check-input"
                                  type="checkbox"
                                  [id]="'resource-' + resource"
                                  [checked]="isResourceFullySelected(resource)"
                                  [class.indeterminate]="isResourcePartiallySelected(resource)"
                                  (change)="toggleAllResourcePermissions(resource)"
                                />
                              </div>
                              <h6 class="mb-0 fw-bold text-capitalize">
                                <i class="bi bi-folder me-2"></i>
                                {{ getResourceDisplayName(resource) }}
                              </h6>
                            </div>
                            <span class="badge bg-light text-dark">
                              {{ groupedPermissions[resource].length }} permisos
                            </span>
                          </div>
                        </div>
                        
                        <div class="permissions-grid">
                          <div 
                            class="permission-item"
                            *ngFor="let permission of groupedPermissions[resource]"
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
                                <div class="d-flex align-items-center">
                                  <i 
                                    [class]="getActionIcon(permission.action) + ' me-2 ' + getActionColor(permission.action)"
                                  ></i>
                                  <span class="permission-text">
                                    {{ permission.action | titlecase }}
                                  </span>
                                </div>
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

      .permissions-container {
        background: #f8f9fa;
        border-radius: 1rem;
        padding: 1.5rem;
        border: 1px solid #e9ecef;
      }

      .resource-group {
        background: white;
        border-radius: 0.75rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        overflow: hidden;
        border: 1px solid #e9ecef;
      }

      .resource-group:last-child {
        margin-bottom: 0;
      }

      .resource-header {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        padding: 1rem 1.25rem;
        border-bottom: 1px solid #e9ecef;
      }

      .resource-header h6 {
        color: #495057;
        font-weight: 600;
      }

      .permissions-grid {
        padding: 1.25rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.75rem;
      }

      .permission-item {
        background: #f8f9fa;
        border-radius: 0.5rem;
        padding: 0.75rem;
        border: 1px solid #e9ecef;
        transition: all 0.2s ease;
      }

      .permission-item:hover {
        background: #e9ecef;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .permission-item .form-check {
        margin: 0;
      }

      .permission-item .form-check-input {
        margin-top: 0.125rem;
      }

      .permission-text {
        font-weight: 500;
        color: #495057;
      }

      .form-check-input.indeterminate {
        background-color: #6c757d;
        border-color: #6c757d;
        opacity: 0.8;
      }

      .form-check-input.indeterminate:after {
        content: '—';
        color: white;
        font-weight: bold;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 0.8em;
      }

      @media (max-width: 768px) {
        .permissions-grid {
          grid-template-columns: 1fr;
        }
        
        .permissions-container {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class RolesFormComponent implements OnInit, AfterViewChecked {
  rolForm: FormGroup;
  loading = false;
  isEditing = false;
  rolId: string | null = null;
  permisosSeleccionados: string[] = [];
  permissions: any[] = [];
  groupedPermissions: { [key: string]: any[] } = {};

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private alertService: AlertService,
    private permissionSyncService: PermissionSyncService,
    private cdr: ChangeDetectorRef
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

  ngAfterViewChecked(): void {
    this.updateIndeterminateStates();
  }

  updateIndeterminateStates(): void {
    Object.keys(this.groupedPermissions).forEach(resource => {
      const checkbox = document.getElementById(`resource-${resource}`) as HTMLInputElement;
      if (checkbox) {
        checkbox.indeterminate = this.isResourcePartiallySelected(resource);
      }
    });
  }

  loadPermissions(): void {
    this.permissionService.getAll().subscribe({
      next: (response) => {
        this.permissions = response.data || [];
        this.groupPermissionsByResource();
      },
      error: (error) => {
        console.error('Error al cargar permisos:', error);
        this.alertService.error('Error al cargar permisos');
      },
    });
  }

  groupPermissionsByResource(): void {
    this.groupedPermissions = {};
    this.permissions.forEach(permission => {
      const resource = permission.resource;
      if (!this.groupedPermissions[resource]) {
        this.groupedPermissions[resource] = [];
      }
      this.groupedPermissions[resource].push(permission);
    });

    Object.keys(this.groupedPermissions).forEach(resource => {
      this.groupedPermissions[resource].sort((a, b) => {
        const actionOrder = ['create', 'read', 'update', 'delete'];
        return actionOrder.indexOf(a.action) - actionOrder.indexOf(b.action);
      });
    });
  }

  getResourceNames(): string[] {
    return Object.keys(this.groupedPermissions).sort();
  }

  getResourceDisplayName(resource: string): string {
    return resource.charAt(0).toUpperCase() + resource.slice(1);
  }

  isResourceFullySelected(resource: string): boolean {
    const permissions = this.groupedPermissions[resource] || [];
    return permissions.length > 0 && permissions.every(p => this.isPermisoSelected(p._id));
  }

  isResourcePartiallySelected(resource: string): boolean {
    const permissions = this.groupedPermissions[resource] || [];
    return permissions.some(p => this.isPermisoSelected(p._id)) && 
           !permissions.every(p => this.isPermisoSelected(p._id));
  }

  toggleAllResourcePermissions(resource: string): void {
    const permissions = this.groupedPermissions[resource] || [];
    const isFullySelected = this.isResourceFullySelected(resource);
    
    permissions.forEach(permission => {
      if (isFullySelected) {
        // Deseleccionar todos
        const index = this.permisosSeleccionados.indexOf(permission._id);
        if (index > -1) {
          this.permisosSeleccionados.splice(index, 1);
        }
      } else {
        // Seleccionar todos
        if (!this.isPermisoSelected(permission._id)) {
          this.permisosSeleccionados.push(permission._id);
        }
      }
    });
  }

  getActionIcon(action: string): string {
    const icons: { [key: string]: string } = {
      'create': 'bi-plus-circle',
      'read': 'bi-eye',
      'update': 'bi-pencil',
      'delete': 'bi-trash'
    };
    return icons[action] || 'bi-gear';
  }

  getActionColor(action: string): string {
    const colors: { [key: string]: string } = {
      'create': 'text-success',
      'read': 'text-info',
      'update': 'text-warning',
      'delete': 'text-danger'
    };
    return colors[action] || 'text-secondary';
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
          
          // Forzar actualización de la vista
          this.cdr.detectChanges();
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
            this.alertService.success(
              response.message || 'Rol actualizado exitosamente'
            );
            
            // Notificar que un rol fue actualizado para refrescar permisos automáticamente
            this.permissionSyncService.notifyRoleUpdated();
            
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
            this.alertService.success(
              response.message || 'Rol creado exitosamente'
            );
            
            // No necesario refrescar permisos para rol nuevo ya que no afecta usuarios existentes
            
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
