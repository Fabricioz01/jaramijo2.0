import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

interface Rol {
  _id: string;
  nombre: string;
  descripcion: string;
  permisos: string[];
  activo: boolean;
  usuariosCount: number;
  fechaCreacion: Date;
}

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
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
            <div class="col-md-6">
              <label for="estado" class="form-label">Estado</label>
              <select class="form-select" id="estado" formControlName="estado">
                <option value="">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>
            <div class="col-md-6">
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
                    [class]="getRoleIconClass(rol.nombre)"
                  >
                    <i [class]="getRoleIcon(rol.nombre)"></i>
                  </div>
                  <div>
                    <h6 class="card-title mb-0 fw-bold">{{ rol.nombre }}</h6>
                    <span
                      class="badge"
                      [class]="rol.activo ? 'bg-success' : 'bg-secondary'"
                    >
                      {{ rol.activo ? 'Activo' : 'Inactivo' }}
                    </span>
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

              <p class="card-text text-muted mb-3">{{ rol.descripcion }}</p>

              <div class="mb-3">
                <div
                  class="d-flex justify-content-between align-items-center mb-2"
                >
                  <small class="text-muted fw-semibold">PERMISOS</small>
                  <span class="badge bg-light text-dark">{{
                    rol.permisos.length
                  }}</span>
                </div>
                <div class="permisos-preview">
                  <span
                    class="badge bg-primary me-1 mb-1"
                    *ngFor="let permiso of rol.permisos.slice(0, 3)"
                  >
                    {{ permiso }}
                  </span>
                  <span
                    class="badge bg-secondary"
                    *ngIf="rol.permisos.length > 3"
                  >
                    +{{ rol.permisos.length - 3 }} más
                  </span>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <i class="bi bi-people me-2 text-muted"></i>
                  <span class="text-muted">
                    {{ rol.usuariosCount }} usuario{{
                      rol.usuariosCount !== 1 ? 's' : ''
                    }}
                  </span>
                </div>
                <small class="text-muted">
                  {{ formatDate(rol.fechaCreacion) }}
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
  roles: Rol[] = [
    {
      _id: '1',
      nombre: 'Administrador',
      descripcion:
        'Acceso completo al sistema. Puede gestionar usuarios, roles y todas las funcionalidades.',
      permisos: [
        'users.create',
        'users.read',
        'users.update',
        'users.delete',
        'roles.manage',
        'tasks.manage',
        'reports.view',
      ],
      activo: true,
      usuariosCount: 2,
      fechaCreacion: new Date('2024-01-01'),
    },
    {
      _id: '2',
      nombre: 'Supervisor',
      descripcion:
        'Gestión de su departamento y tareas asignadas. Puede supervisar empleados.',
      permisos: [
        'tasks.create',
        'tasks.read',
        'tasks.update',
        'tasks.assign',
        'reports.department',
      ],
      activo: true,
      usuariosCount: 5,
      fechaCreacion: new Date('2024-01-05'),
    },
    {
      _id: '3',
      nombre: 'Empleado',
      descripcion:
        'Acceso básico para gestionar sus tareas asignadas y ver información departamental.',
      permisos: ['tasks.read', 'tasks.update', 'profile.update'],
      activo: true,
      usuariosCount: 15,
      fechaCreacion: new Date('2024-01-10'),
    },
    {
      _id: '4',
      nombre: 'Invitado',
      descripcion:
        'Acceso de solo lectura para consultar información básica del sistema.',
      permisos: ['tasks.read', 'reports.basic'],
      activo: false,
      usuariosCount: 0,
      fechaCreacion: new Date('2024-01-15'),
    },
  ];
  rolesFiltrados: Rol[] = [];

  constructor(private fb: FormBuilder, private router: Router) {
    this.filterForm = this.fb.group({
      estado: [''],
      buscar: [''],
    });
  }

  ngOnInit(): void {
    this.rolesFiltrados = [...this.roles];
    this.setupFilters();
  }

  setupFilters(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  aplicarFiltros(): void {
    const filtros = this.filterForm.value;
    this.rolesFiltrados = this.roles.filter((rol) => {
      const estadoMatch =
        !filtros.estado ||
        (filtros.estado === 'activo' && rol.activo) ||
        (filtros.estado === 'inactivo' && !rol.activo);

      const buscarMatch =
        !filtros.buscar ||
        rol.nombre.toLowerCase().includes(filtros.buscar.toLowerCase()) ||
        rol.descripcion.toLowerCase().includes(filtros.buscar.toLowerCase());

      return estadoMatch && buscarMatch;
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
      console.log('Eliminar rol:', id);
      // Implementar lógica de eliminación
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
