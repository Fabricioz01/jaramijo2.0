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

interface Permiso {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
}

@Component({
  selector: 'app-roles-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row justify-content-center">
        <div class="col-md-10">
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
                  <!-- Información Básica -->
                  <div class="col-12 mb-4">
                    <h5 class="text-primary border-bottom pb-2">
                      <i class="bi bi-info-circle me-2"></i>Información Básica
                    </h5>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="nombre" class="form-label"
                      >Nombre del Rol *</label
                    >
                    <input
                      type="text"
                      class="form-control"
                      id="nombre"
                      formControlName="nombre"
                      [class.is-invalid]="isFieldInvalid('nombre')"
                      placeholder="Ej: Supervisor de Obras"
                    />
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('nombre')"
                    >
                      El nombre es requerido y debe tener al menos 3 caracteres
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <div class="form-check mt-4">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        id="activo"
                        formControlName="activo"
                      />
                      <label class="form-check-label" for="activo">
                        Rol activo (puede ser asignado a usuarios)
                      </label>
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
                      rows="3"
                      [class.is-invalid]="isFieldInvalid('descripcion')"
                      placeholder="Descripción detallada del rol y sus responsabilidades..."
                    ></textarea>
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('descripcion')"
                    >
                      La descripción es requerida
                    </div>
                  </div>

                  <!-- Permisos -->
                  <div class="col-12 mb-4 mt-4">
                    <h5 class="text-primary border-bottom pb-2">
                      <i class="bi bi-shield-check me-2"></i>Permisos del
                      Sistema
                    </h5>
                    <p class="text-muted">
                      Seleccione los permisos que tendrá este rol
                    </p>
                  </div>

                  <!-- Filtro de permisos -->
                  <div class="col-12 mb-4">
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="filtroPermisos"
                        [ngModelOptions]="{ standalone: true }"
                        placeholder="Buscar permisos..."
                      />
                    </div>
                  </div>

                  <!-- Lista de permisos por categoría -->
                  <div class="col-12" *ngFor="let categoria of categorias">
                    <div
                      class="card mb-3"
                      *ngIf="getPermisosPorCategoria(categoria).length > 0"
                    >
                      <div class="card-header bg-light">
                        <div
                          class="d-flex justify-content-between align-items-center"
                        >
                          <h6 class="mb-0">
                            <i
                              [class]="getCategoriaIcon(categoria)"
                              class="me-2"
                            ></i>
                            {{ categoria }}
                          </h6>
                          <div>
                            <button
                              type="button"
                              class="btn btn-sm btn-outline-primary me-2"
                              (click)="selectAllInCategory(categoria)"
                            >
                              Seleccionar Todo
                            </button>
                            <button
                              type="button"
                              class="btn btn-sm btn-outline-secondary"
                              (click)="clearAllInCategory(categoria)"
                            >
                              Limpiar
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="card-body">
                        <div class="row">
                          <div
                            class="col-md-6 mb-2"
                            *ngFor="
                              let permiso of getPermisosPorCategoria(categoria)
                            "
                          >
                            <div class="form-check">
                              <input
                                class="form-check-input"
                                type="checkbox"
                                [id]="permiso.id"
                                [value]="permiso.id"
                                [checked]="isPermisoSelected(permiso.id)"
                                (change)="togglePermiso(permiso.id)"
                              />
                              <label
                                class="form-check-label"
                                [for]="permiso.id"
                              >
                                <strong>{{ permiso.nombre }}</strong>
                                <small class="d-block text-muted">{{
                                  permiso.descripcion
                                }}</small>
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
  filtroPermisos = '';
  permisosSeleccionados: string[] = [];

  categorias = ['Usuarios', 'Tareas', 'Departamentos', 'Reportes', 'Sistema'];

  permisos: Permiso[] = [
    // Usuarios
    {
      id: 'users.create',
      nombre: 'Crear Usuarios',
      descripcion: 'Puede crear nuevos usuarios en el sistema',
      categoria: 'Usuarios',
    },
    {
      id: 'users.read',
      nombre: 'Ver Usuarios',
      descripcion: 'Puede ver la lista y detalles de usuarios',
      categoria: 'Usuarios',
    },
    {
      id: 'users.update',
      nombre: 'Editar Usuarios',
      descripcion: 'Puede modificar información de usuarios',
      categoria: 'Usuarios',
    },
    {
      id: 'users.delete',
      nombre: 'Eliminar Usuarios',
      descripcion: 'Puede eliminar usuarios del sistema',
      categoria: 'Usuarios',
    },
    {
      id: 'users.assign',
      nombre: 'Asignar Roles',
      descripcion: 'Puede asignar roles a usuarios',
      categoria: 'Usuarios',
    },

    // Tareas
    {
      id: 'tasks.create',
      nombre: 'Crear Tareas',
      descripcion: 'Puede crear nuevas tareas',
      categoria: 'Tareas',
    },
    {
      id: 'tasks.read',
      nombre: 'Ver Tareas',
      descripcion: 'Puede ver tareas del sistema',
      categoria: 'Tareas',
    },
    {
      id: 'tasks.update',
      nombre: 'Editar Tareas',
      descripcion: 'Puede modificar tareas existentes',
      categoria: 'Tareas',
    },
    {
      id: 'tasks.delete',
      nombre: 'Eliminar Tareas',
      descripcion: 'Puede eliminar tareas del sistema',
      categoria: 'Tareas',
    },
    {
      id: 'tasks.assign',
      nombre: 'Asignar Tareas',
      descripcion: 'Puede asignar tareas a usuarios',
      categoria: 'Tareas',
    },
    {
      id: 'tasks.manage',
      nombre: 'Gestión Completa',
      descripcion: 'Gestión completa de todas las tareas',
      categoria: 'Tareas',
    },

    // Departamentos
    {
      id: 'departments.create',
      nombre: 'Crear Departamentos',
      descripcion: 'Puede crear nuevos departamentos',
      categoria: 'Departamentos',
    },
    {
      id: 'departments.read',
      nombre: 'Ver Departamentos',
      descripcion: 'Puede ver información de departamentos',
      categoria: 'Departamentos',
    },
    {
      id: 'departments.update',
      nombre: 'Editar Departamentos',
      descripcion: 'Puede modificar departamentos',
      categoria: 'Departamentos',
    },
    {
      id: 'departments.delete',
      nombre: 'Eliminar Departamentos',
      descripcion: 'Puede eliminar departamentos',
      categoria: 'Departamentos',
    },

    // Reportes
    {
      id: 'reports.basic',
      nombre: 'Reportes Básicos',
      descripcion: 'Puede ver reportes básicos del sistema',
      categoria: 'Reportes',
    },
    {
      id: 'reports.advanced',
      nombre: 'Reportes Avanzados',
      descripcion: 'Puede generar reportes detallados',
      categoria: 'Reportes',
    },
    {
      id: 'reports.department',
      nombre: 'Reportes Departamentales',
      descripcion: 'Puede ver reportes de su departamento',
      categoria: 'Reportes',
    },
    {
      id: 'reports.export',
      nombre: 'Exportar Reportes',
      descripcion: 'Puede exportar reportes a PDF/Excel',
      categoria: 'Reportes',
    },

    // Sistema
    {
      id: 'system.settings',
      nombre: 'Configuración',
      descripcion: 'Puede modificar configuraciones del sistema',
      categoria: 'Sistema',
    },
    {
      id: 'system.backup',
      nombre: 'Respaldos',
      descripcion: 'Puede crear y restaurar respaldos',
      categoria: 'Sistema',
    },
    {
      id: 'system.logs',
      nombre: 'Ver Logs',
      descripcion: 'Puede ver logs del sistema',
      categoria: 'Sistema',
    },
    {
      id: 'roles.manage',
      nombre: 'Gestión de Roles',
      descripcion: 'Puede crear y modificar roles',
      categoria: 'Sistema',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.rolForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', Validators.required],
      activo: [true],
    });
  }

  ngOnInit(): void {
    this.rolId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.rolId;

    if (this.isEditing) {
      this.loadRol();
    }
  }

  loadRol(): void {
    // Mock data for editing
    const mockData = {
      nombre: 'Supervisor de Obras',
      descripcion:
        'Supervisa las tareas del departamento de obras públicas y puede asignar tareas a empleados.',
      activo: true,
    };

    this.rolForm.patchValue(mockData);
    this.permisosSeleccionados = [
      'tasks.create',
      'tasks.read',
      'tasks.update',
      'tasks.assign',
      'reports.department',
    ];
  }

  getPermisosPorCategoria(categoria: string): Permiso[] {
    return this.permisos.filter((permiso) => {
      const categoriaMatch = permiso.categoria === categoria;
      const filtroMatch =
        !this.filtroPermisos ||
        permiso.nombre
          .toLowerCase()
          .includes(this.filtroPermisos.toLowerCase()) ||
        permiso.descripcion
          .toLowerCase()
          .includes(this.filtroPermisos.toLowerCase());
      return categoriaMatch && filtroMatch;
    });
  }

  getCategoriaIcon(categoria: string): string {
    switch (categoria) {
      case 'Usuarios':
        return 'bi bi-people';
      case 'Tareas':
        return 'bi bi-list-task';
      case 'Departamentos':
        return 'bi bi-building';
      case 'Reportes':
        return 'bi bi-graph-up';
      case 'Sistema':
        return 'bi bi-gear';
      default:
        return 'bi bi-shield';
    }
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

  selectAllInCategory(categoria: string): void {
    const permisosCategoria = this.getPermisosPorCategoria(categoria);
    permisosCategoria.forEach((permiso) => {
      if (!this.isPermisoSelected(permiso.id)) {
        this.permisosSeleccionados.push(permiso.id);
      }
    });
  }

  clearAllInCategory(categoria: string): void {
    const permisosCategoria = this.getPermisosPorCategoria(categoria);
    permisosCategoria.forEach((permiso) => {
      const index = this.permisosSeleccionados.indexOf(permiso.id);
      if (index > -1) {
        this.permisosSeleccionados.splice(index, 1);
      }
    });
  }

  getPermisoNombre(permisoId: string): string {
    const permiso = this.permisos.find((p) => p.id === permisoId);
    return permiso ? permiso.nombre : permisoId;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.rolForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.rolForm.valid && this.permisosSeleccionados.length > 0) {
      this.loading = true;

      const formData = {
        ...this.rolForm.value,
        permisos: this.permisosSeleccionados,
      };

      setTimeout(() => {
        console.log('Rol a guardar:', formData);
        this.loading = false;
        this.goBack();
      }, 1000);
    } else {
      Object.keys(this.rolForm.controls).forEach((key) => {
        this.rolForm.get(key)?.markAsTouched();
      });

      if (this.permisosSeleccionados.length === 0) {
        alert('Debe seleccionar al menos un permiso para el rol');
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/roles']);
  }
}
