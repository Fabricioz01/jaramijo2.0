import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AlertService } from '../../../core/services/alert.service';
import { User } from '../../../core/models';
import { DepartamentoService } from '../../../core/services/departamento.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { ConfirmModalComponent } from '../../../shared/components/alerts/confirm-modal.component';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    ConfirmModalComponent,
  ],
  template: `
    <app-header></app-header>
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-0">Usuarios</h1>
          <p class="text-muted">Gestión de usuarios del sistema</p>
        </div>
        <div>
          <button class="btn btn-outline-secondary me-2" (click)="goBack()">
            <i class="bi bi-arrow-left me-2"></i>Volver
          </button>
          <button
            class="btn btn-primary"
            (click)="navigateToForm()"
            *ngIf="canCreateUser()"
          >
            <i class="bi bi-person-plus me-2"></i>Nuevo Usuario
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <form [formGroup]="filterForm" class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Buscar</label>
              <input
                type="text"
                class="form-control"
                placeholder="Nombre, email..."
                formControlName="busqueda"
              />
            </div>
            <div class="col-md-4">
              <label class="form-label">Departamento</label>
              <select class="form-select" formControlName="departamento">
                <option value="">Todos</option>
                <option *ngFor="let dep of departamentos" [value]="dep._id">
                  {{ dep.name }}
                </option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Estado</label>
              <select class="form-select" formControlName="estado">
                <option value="">Todos</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>
          </form>
        </div>
      </div>

      <!-- Lista de usuarios -->
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <!-- Loading -->
          <div *ngIf="cargando" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>

          <!-- Tabla de usuarios -->
          <div
            *ngIf="!cargando && usuariosFiltrados.length > 0"
            class="table-responsive"
          >
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Departamento</th>
                  <th>Roles</th>
                  <th>Estado</th>
                  <th>Fecha Registro</th>
                  <th>Última Actualización</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let usuario of usuariosFiltrados">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar-circle me-3">
                        {{ getInitials(usuario.name) }}
                      </div>
                      <div class="flex-grow-1">
                        <div class="fw-semibold">{{ usuario.name }}</div>
                      </div>
                      <button
                        class="btn btn-sm btn-outline-secondary"
                        (click)="copyToClipboard(usuario.email, usuario.name)"
                        title="Copiar Email"
                        type="button"
                      >
                        <i class="bi bi-copy"></i>
                      </button>
                    </div>
                  </td>
                  <td>{{ usuario.email }}</td>
                  <td>{{ getDepartamentoName(usuario.departamentoId) }}</td>
                  <td>
                    <small class="text-muted">{{
                      getRoleNames(usuario.roleIds)
                    }}</small>
                  </td>
                  <td>
                    <span
                      class="badge"
                      [class]="usuario.active ? 'bg-success' : 'bg-secondary'"
                      (click)="toggleActivo(usuario)"
                      style="cursor: pointer"
                      title="Clic para cambiar estado"
                    >
                      {{ usuario.active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td>
                    <small class="text-muted">{{
                      usuario.createdAt | date : 'dd/MM/yyyy HH:mm'
                    }}</small>
                  </td>
                  <td>
                    <small class="text-muted">{{
                      usuario.updatedAt | date : 'dd/MM/yyyy HH:mm'
                    }}</small>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        (click)="navigateToEdit(usuario)"
                        title="Editar"
                        *ngIf="canEditUser()"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        (click)="eliminarUsuario(usuario)"
                        title="Eliminar"
                        *ngIf="canDeleteUser()"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mensaje cuando no hay usuarios -->
          <div
            class="text-center py-5"
            *ngIf="!cargando && usuariosFiltrados.length === 0"
          >
            <i class="bi bi-people display-1 text-muted"></i>
            <h4 class="mt-3">No hay usuarios</h4>
            <p class="text-muted">
              {{
                usuarios.length === 0
                  ? 'Comienza agregando usuarios al sistema'
                  : 'No hay usuarios que coincidan con los filtros'
              }}
            </p>

            <div class="d-flex gap-2 justify-content-center mt-4">
              <button class="btn btn-outline-primary" (click)="goBack()">
                <i class="bi bi-arrow-left me-2"></i>Volver al Dashboard
              </button>
              <button
                class="btn btn-primary"
                (click)="navigateToForm()"
                *ngIf="canCreateUser()"
              >
                <i class="bi bi-person-plus me-2"></i>Crear Usuario
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <app-confirm-modal
      [visible]="showDeleteModal"
      [message]="getDeleteMessage()"
      (confirm)="confirmarEliminarUsuario()"
      (cancel)="cancelarEliminarUsuario()"
    ></app-confirm-modal>
  `,
  styles: [
    `
      .display-1 {
        font-size: 4rem;
      }

      .card {
        border-radius: 1rem;
      }

      .btn {
        border-radius: 0.5rem;
      }

      .avatar-circle {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 14px;
      }

      .table th {
        border-top: none;
        font-weight: 600;
        color: #6c757d;
      }

      .badge {
        transition: all 0.2s ease;
      }

      .badge:hover {
        transform: scale(1.05);
      }
    `,
  ],
})
export class UsuariosListComponent implements OnInit {
  filterForm: FormGroup;
  usuarios: User[] = [];
  usuariosFiltrados: User[] = [];
  cargando = false;

  departamentos: any[] = [];

  // Modal de confirmación
  showDeleteModal = false;
  usuarioAEliminar: User | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private alertService: AlertService,
    private departamentoService: DepartamentoService,
    public authService: AuthService
  ) {
    this.filterForm = this.fb.group({
      busqueda: [''],
      departamento: [''],
      estado: [''],
    });
  }

  // Métodos de permisos para el template
  canCreateUser(): boolean {
    return this.authService.canAccessAction('usuarios', 'create');
  }
  canEditUser(): boolean {
    return this.authService.canAccessAction('usuarios', 'update');
  }
  canDeleteUser(): boolean {
    return this.authService.canAccessAction('usuarios', 'delete');
  }

  ngOnInit(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.filtrarUsuarios();
    });

    this.cargarUsuarios();
    this.cargarDepartamentos();
  }

  cargarDepartamentos(): void {
    this.departamentoService.getAll().subscribe({
      next: (response) => {
        this.departamentos = response.data || [];
      },
      error: (error) => {
        this.alertService.error('Error al cargar departamentos');
      },
    });
  }

  cargarUsuarios(): void {
    this.userService.getAll().subscribe({
      next: (response) => {
        this.usuarios = response.data || [];
        this.filtrarUsuarios();
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
      },
    });
  }

  filtrarUsuarios(): void {
    const { busqueda, departamento, estado } = this.filterForm.value;

    this.usuariosFiltrados = this.usuarios.filter((usuario) => {
      const coincideBusqueda = busqueda
        ? usuario.name.toLowerCase().includes(busqueda.toLowerCase()) ||
          usuario.email.toLowerCase().includes(busqueda.toLowerCase())
        : true;

      const coincideDepartamento = departamento
        ? typeof usuario.departamentoId === 'object' &&
          usuario.departamentoId._id === departamento
        : true;

      const coincideEstado = estado
        ? estado === 'activo'
          ? usuario.active
          : !usuario.active
        : true;

      return coincideBusqueda && coincideDepartamento && coincideEstado;
    });
  }

  getInitials(nombre: string): string {
    if (!nombre) return 'UN';
    return nombre
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  eliminarUsuario(usuario: User): void {
    this.usuarioAEliminar = usuario;
    this.showDeleteModal = true;
  }

  confirmarEliminarUsuario(): void {
    if (!this.usuarioAEliminar) return;

    this.userService.delete(this.usuarioAEliminar._id).subscribe({
      next: (response) => {
        this.alertService.success(
          response.message || 'Usuario eliminado exitosamente'
        );
        this.cargarUsuarios();
        this.cancelarEliminarUsuario();
      },
      error: (error) => {
        const errorMessage =
          error.error?.message || 'Error al eliminar usuario';
        this.alertService.error(errorMessage);
        console.error('Error:', error);
        this.cancelarEliminarUsuario();
      },
    });
  }

  cancelarEliminarUsuario(): void {
    this.showDeleteModal = false;
    this.usuarioAEliminar = null;
  }

  getDeleteMessage(): string {
    return this.usuarioAEliminar
      ? `¿Está seguro de eliminar al usuario '${this.usuarioAEliminar.name} ${this.usuarioAEliminar.lastName}'? Esta acción no se puede deshacer.`
      : '';
  }

  toggleActivo(usuario: User): void {
    this.userService.toggleActive(usuario._id).subscribe({
      next: () => {
        const accion = usuario.active ? 'desactivado' : 'activado';
        this.alertService.success(`Usuario ${accion} exitosamente`);
        this.cargarUsuarios();
      },
      error: (error) => {
        this.alertService.error('Error al cambiar estado del usuario');
        console.error('Error:', error);
      },
    });
  }

  getDepartamentoName(departamentoId: any): string {
    if (!departamentoId) return 'Sin asignar';
    if (
      typeof departamentoId === 'object' &&
      departamentoId !== null &&
      departamentoId.name
    ) {
      return departamentoId.name;
    }
    const found = this.departamentos.find(
      (dep) => dep._id === departamentoId || dep.id === departamentoId
    );
    return found ? found.name : 'Sin asignar';
  }

  getRoleNames(roleIds: any[]): string {
    if (!roleIds || !Array.isArray(roleIds)) return 'Sin roles';
    return roleIds
      .map((role) => {
        if (typeof role === 'object' && role?.name) {
          return role.name;
        }
        return role;
      })
      .join(', ');
  }

  navigateToForm(): void {
    this.router.navigate(['/usuarios/nuevo']);
  }

  navigateToEdit(usuario: User): void {
    this.router.navigate(['/usuarios', usuario._id, 'editar']);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  copyToClipboard(email: string, userName: string): void {
    navigator.clipboard
      .writeText(email)
      .then(() => {
        // Show success message
        this.alertService.success(
          `El correo de ${userName} copiado al portapapeles`
        );
      })
      .catch((err) => {
        console.error('Error al copiar al portapapeles: ', err);
        this.alertService.error('Error al copiar Correo');
      });
  }
}
