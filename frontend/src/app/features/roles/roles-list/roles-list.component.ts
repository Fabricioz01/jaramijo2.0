import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleService } from '../../../core/services/role.service';
import { AlertService } from '../../../core/services/alert.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  template: `
    <app-header></app-header>
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-0">Roles del Sistema</h1>
          <p class="text-muted">Gestión de roles y permisos</p>
        </div>
        <button class="btn btn-primary" (click)="navigateToForm()">
          <i class="bi bi-shield-plus me-2"></i>Nuevo Rol
        </button>
      </div>

      <!-- Filtros -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <form [formGroup]="filterForm" class="row g-3">
            <div class="col-md-12">
              <label for="buscar" class="form-label">Buscar</label>
              <input
                type="text"
                class="form-control"
                id="buscar"
                formControlName="buscar"
                placeholder="Buscar por nombre..."
              />
            </div>
          </form>
        </div>
      </div>

      <!-- Lista de roles -->
      <div class="row">
        <div class="col-md-6 col-lg-4 mb-4" *ngFor="let rol of rolesFiltrados">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <div
                class="d-flex justify-content-between align-items-start mb-3"
              >
                <div class="d-flex align-items-center">
                  <div
                    class="role-icon me-3"
                    [class]="getRoleIconClass(rol.name)"
                  >
                    <i [class]="getRoleIcon(rol.name)"></i>
                  </div>
                  <div>
                    <h6 class="card-title mb-0 fw-bold">{{ rol.name }}</h6>
                    <span class="badge bg-success"> Activo </span>
                  </div>
                </div>
                <div class="dropdown">
                  <button
                    class="btn btn-sm btn-outline-secondary dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    <i class="bi bi-three-dots"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <a class="dropdown-item" (click)="editarRol(rol._id)">
                        <i class="bi bi-pencil me-2"></i>Editar</a
                      >
                    </li>
                    <li>
                      <a class="dropdown-item" (click)="duplicarRol(rol._id)">
                        <i class="bi bi-files me-2"></i>Duplicar</a
                      >
                    </li>
                    <li><hr class="dropdown-divider" /></li>
                    <li>
                      <a
                        class="dropdown-item text-danger"
                        (click)="eliminarRol(rol._id)"
                      >
                        <i class="bi bi-trash me-2"></i>Eliminar</a
                      >
                    </li>
                  </ul>
                </div>
              </div>

              <div class="mb-3">
                <div
                  class="d-flex justify-content-between align-items-center mb-2"
                >
                  <small class="text-muted fw-semibold">PERMISOS</small>
                  <span class="badge bg-light text-dark">{{
                    rol.permissionIds?.length || 0
                  }}</span>
                </div>
                <div class="permisos-preview">
                  <span
                    class="badge bg-primary me-1 mb-1"
                    *ngFor="
                      let permiso of (rol.permissionIds || []).slice(0, 3)
                    "
                  >
                    {{ getPermissionDisplay(permiso) }}
                  </span>
                  <span
                    class="badge bg-secondary"
                    *ngIf="(rol.permissionIds?.length || 0) > 3"
                  >
                    +{{ (rol.permissionIds?.length || 0) - 3 }} más
                  </span>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">
                  <i class="bi bi-calendar me-1"></i>
                  {{ formatDate(rol.createdAt) }}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center py-5" *ngIf="rolesFiltrados.length === 0">
        <i class="bi bi-shield-exclamation display-1 text-muted"></i>
        <h4 class="mt-3">No hay roles</h4>
        <p class="text-muted">Comienza creando roles para el sistema</p>

        <div class="d-flex gap-2 justify-content-center mt-4">
          <button class="btn btn-outline-primary" (click)="goBack()">
            <i class="bi bi-arrow-left me-2"></i>Volver al Dashboard
          </button>
          <button class="btn btn-primary" (click)="navigateToForm()">
            <i class="bi bi-shield-plus me-2"></i>Crear Rol
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .display-1 {
        font-size: 4rem;
      }

      .card {
        border-radius: 1rem;
        transition: transform 0.2s;
      }

      .card:hover {
        transform: translateY(-2px);
      }

      .btn {
        border-radius: 0.5rem;
      }

      .role-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
      }

      .role-admin {
        background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      }

      .role-supervisor {
        background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
      }

      .role-empleado {
        background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
      }

      .role-default {
        background: linear-gradient(135deg, #6c757d 0%, #545b62 100%);
      }

      .permisos-preview {
        min-height: 32px;
      }

      .badge {
        font-size: 0.75em;
      }
    `,
  ],
})
export class RolesListComponent implements OnInit {
  filterForm: FormGroup;
  roles: any[] = [];
  rolesFiltrados: any[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private roleService: RoleService,
    private alertService: AlertService
  ) {
    this.filterForm = this.fb.group({
      buscar: [''],
    });
  }

  ngOnInit(): void {
    this.cargarRoles();
    this.setupFilters();
  }

  cargarRoles(): void {
    this.loading = true;
    this.roleService.getAll().subscribe({
      next: (response) => {
        console.log('✅ Roles cargados:', response);
        this.roles = response.data || [];
        this.rolesFiltrados = [...this.roles];
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error cargando roles:', error);
        this.alertService.error('Error al cargar roles');
        this.roles = [];
        this.rolesFiltrados = [];
        this.loading = false;
      },
    });
  }

  setupFilters(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  aplicarFiltros(): void {
    const filtros = this.filterForm.value;
    this.rolesFiltrados = this.roles.filter((rol) => {
      const buscarMatch =
        !filtros.buscar ||
        rol.name.toLowerCase().includes(filtros.buscar.toLowerCase());

      return buscarMatch;
    });
  }

  getRoleIconClass(nombre: string): string {
    switch (nombre.toLowerCase()) {
      case 'administrador':
        return 'role-admin';
      case 'supervisor':
        return 'role-supervisor';
      case 'empleado':
        return 'role-empleado';
      default:
        return 'role-default';
    }
  }

  getRoleIcon(nombre: string): string {
    switch (nombre.toLowerCase()) {
      case 'administrador':
        return 'bi bi-shield-fill-check';
      case 'supervisor':
        return 'bi bi-eye-fill';
      case 'empleado':
        return 'bi bi-person-fill';
      default:
        return 'bi bi-shield-fill';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES');
  }

  getPermissionDisplay(permiso: any): string {
    if (typeof permiso === 'string') {
      return permiso;
    }

    if (typeof permiso === 'object' && permiso) {
      // Format: action + resource (e.g., "create archivos")
      const action = permiso.action || '';
      const resource = permiso.resource || '';
      return `${action} ${resource}`.trim();
    }

    return 'Permiso';
  }

  navigateToForm(): void {
    this.router.navigate(['/roles/nuevo']);
  }

  editarRol(id: string): void {
    this.router.navigate(['/roles', id, 'editar']);
  }

  duplicarRol(id: string): void {
    console.log('Duplicar rol:', id);
    // Implementar lógica de duplicación
  }

  eliminarRol(id: string): void {
    if (
      confirm(
        '¿Está seguro de eliminar este rol? Esta acción no se puede deshacer.'
      )
    ) {
      this.roleService.delete(id).subscribe({
        next: () => {
          this.alertService.success('Rol eliminado exitosamente');
          this.cargarRoles();
        },
        error: (error) => {
          console.error('Error eliminando rol:', error);
          this.alertService.error('Error al eliminar rol');
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
