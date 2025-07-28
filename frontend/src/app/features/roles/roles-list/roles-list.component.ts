import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { RoleService } from '../../../core/services/role.service';
import { AlertService } from '../../../core/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { ConfirmModalComponent } from '../../../shared/components/alerts/confirm-modal.component';
import { Role, Permission } from '../../../core/models';

type RoleWithPermissions = Role & { permissionIds: (string | Permission)[] };

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderComponent,
    ConfirmModalComponent,
  ],
  template: `
    <app-header></app-header>

    <!-- Modal de confirmación -->
    <app-confirm-modal
      [visible]="showConfirmModal"
      [message]="
        '¿Está seguro de eliminar este rol? Esta acción no se puede deshacer.'
      "
      (confirm)="confirmarEliminarRol()"
      (cancel)="cancelarEliminarRol()"
    ></app-confirm-modal>

    <div class="container-fluid py-4" *ngIf="canAccessModule()">
      <!-- Encabezado -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-0">Roles del Sistema</h1>
          <p class="text-muted">Gestión de roles y permisos</p>
        </div>
        <button
          class="btn btn-primary"
          (click)="navigateToForm()"
          *ngIf="canCreateRole()"
        >
          <i class="bi bi-shield-plus me-2"></i>Nuevo Rol
        </button>
      </div>

      <!-- Filtro -->
      <div class="card mb-4">
        <div class="card-body">
          <form [formGroup]="filterForm" class="row g-3">
            <div class="col-md-12">
              <label class="form-label">Buscar</label>
              <input
                type="text"
                class="form-control"
                formControlName="buscar"
                placeholder="Buscar por nombre..."
              />
            </div>
          </form>
        </div>
      </div>

      <!-- Lista -->
      <div class="row" *ngIf="!loading">
        <div
          class="col-md-6 col-lg-4 mb-4"
          *ngFor="let rol of rolesFiltrados; let i = index"
        >
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <!-- Nombre y menú -->
              <div class="d-flex justify-content-between align-items-start mb-3">
                <h6 class="card-title fw-bold text-primary">{{ rol.name }}</h6>

                <div
                  class="action-menu-wrapper"
                  [class.open]="openedMenuIndex === i"
                >
                  <button
                    class="btn btn-sm btn-outline-secondary action-menu-btn"
                    (click)="toggleMenu(i, $event)"
                    aria-label="Abrir menú de acciones"
                  >
                    <i class="bi bi-three-dots"></i>
                  </button>

                  <ul class="action-menu" *ngIf="openedMenuIndex === i">
                    <li *ngIf="canViewRole()">
                      <button
                        class="action-item"
                        (click)="verRol(rol._id); closeMenu()"
                      >
                        <i class="bi bi-eye me-2"></i>Ver
                      </button>
                    </li>
                    <li *ngIf="canEditRole()">
                      <button
                        class="action-item"
                        (click)="editarRol(rol._id); closeMenu()"
                      >
                        <i class="bi bi-pencil me-2"></i>Editar
                      </button>
                    </li>
                    <li *ngIf="canDeleteRole()">
                      <button
                        class="action-item text-danger"
                        (click)="eliminarRol(rol._id); closeMenu()"
                      >
                        <i class="bi bi-trash me-2"></i>Eliminar
                      </button>
                    </li>
                    <li
                      *ngIf="
                        !canViewRole() && !canEditRole() && !canDeleteRole()
                      "
                    >
                      <span class="action-item disabled text-muted">
                        Sin acciones disponibles
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Permisos -->
              <div class="mb-2">
                <small class="text-muted fw-semibold">PERMISOS</small>
                <span class="badge bg-light text-dark ms-2">{{
                  rol.permissionIds.length
                }}</span>
              </div>

              <div class="d-flex flex-wrap gap-1 mb-3">
                <span
                  class="badge bg-primary"
                  *ngFor="let p of rol.permissionIds.slice(0, 3)"
                >
                  {{ getPermissionDisplay(p) }}
                </span>
                <span
                  class="badge bg-secondary"
                  *ngIf="rol.permissionIds.length > 3"
                >
                  +{{ rol.permissionIds.length - 3 }} más
                </span>
              </div>

              <!-- Fecha -->
              <small class="text-muted">
                <i class="bi bi-calendar me-1"></i>{{ formatDate(rol.createdAt) }}
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty / Loading -->
      <div
        class="text-center py-5"
        *ngIf="!loading && rolesFiltrados.length === 0"
      >
        <i class="bi bi-shield-exclamation display-1 text-muted"></i>
        <h4 class="mt-3">No hay roles</h4>
        <p class="text-muted">Comienza creando roles para el sistema</p>
        <button
          class="btn btn-primary"
          (click)="navigateToForm()"
          *ngIf="canCreateRole()"
        >
          <i class="bi bi-shield-plus me-2"></i>Crear Rol
        </button>
      </div>

      <div class="text-center py-5" *ngIf="loading">
        <span class="spinner-border" role="status"></span>
      </div>
    </div>
  `,
  styles: [
    `
      .action-menu-wrapper {
        position: relative;
        display: inline-block;
      }
      .action-menu-btn {
        border-radius: 50%;
        width: 2.2rem;
        height: 2.2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s;
      }
      .action-menu {
        position: absolute;
        top: 120%;
        right: 0;
        min-width: 160px;
        background: #fff;
        border-radius: 0.75rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
        padding: 0.5rem 0;
        z-index: 10;
        animation: fadeInMenu 0.18s;
        list-style: none;
      }
      .action-item {
        width: 100%;
        background: none;
        border: none;
        text-align: left;
        padding: 0.6rem 1.2rem;
        font-size: 1rem;
        color: #333;
        border-radius: 0.5rem;
        transition: background 0.13s, color 0.13s;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .action-item:hover,
      .action-item:focus {
        background: #f5f5f5;
        color: #1976d2;
        outline: none;
      }
      .action-item.text-danger {
        color: #e53935;
      }
      .action-item.text-danger:hover {
        background: #ffeaea;
        color: #b71c1c;
      }
      @keyframes fadeInMenu {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class RolesListComponent implements OnInit {
  filterForm: FormGroup;
  roles: RoleWithPermissions[] = [];
  rolesFiltrados: RoleWithPermissions[] = [];
  loading = false;

  openedMenuIndex: number | null = null;
  showConfirmModal = false;
  selectedRoleId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private roleService: RoleService,
    private alertService: AlertService,
    public authService: AuthService
  ) {
    this.filterForm = this.fb.group({
      buscar: [''],
    });
  }

  /* ------------------- ciclo de vida ------------------- */
  ngOnInit(): void {
    this.cargarRoles();
    this.filterForm.valueChanges.subscribe(() => this.aplicarFiltros());
  }

  /* ------------------- CRUD ------------------- */
  cargarRoles(): void {
    this.loading = true;
    this.roleService.getAll().subscribe({
      next: (res) => {
        this.roles = res.data as RoleWithPermissions[];
        this.rolesFiltrados = [...this.roles];
        this.loading = false;
      },
      error: () => {
        this.alertService.error('Error al cargar roles');
        this.loading = false;
      },
    });
  }

  eliminarRol(id: string): void {
    this.selectedRoleId = id;
    this.showConfirmModal = true;
  }

  confirmarEliminarRol(): void {
    if (!this.selectedRoleId) return;
    this.roleService.delete(this.selectedRoleId).subscribe({
      next: () => {
        this.alertService.success('Rol eliminado exitosamente');
        this.cargarRoles();
        this.cancelarEliminarRol();
      },
      error: () => {
        this.alertService.error('Error al eliminar rol');
        this.cancelarEliminarRol();
      },
    });
  }

  cancelarEliminarRol(): void {
    this.showConfirmModal = false;
    this.selectedRoleId = null;
  }

  navigateToForm(): void {
    this.router.navigate(['/roles/nuevo']);
  }
  verRol(id: string): void {
    this.router.navigate(['/roles', id, 'detalle']);
  }
  editarRol(id: string): void {
    this.router.navigate(['/roles', id, 'editar']);
  }

  aplicarFiltros(): void {
    const { buscar } = this.filterForm.value;
    this.rolesFiltrados = this.roles.filter((r) =>
      !buscar ? true : r.name.toLowerCase().includes(buscar.toLowerCase())
    );
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES');
  }

 getPermissionDisplay(p: Permission | string): string {
  if (typeof p === 'string') return p;
  return `${p.action} ${p.resource}`.replace(/^\w/, (c) => c.toUpperCase());
}


  canAccessModule(): boolean {
    return this.authService.canAccessModule('roles');
  }
  canCreateRole(): boolean {
    return this.authService.canAccessAction('roles', 'create');
  }
  canViewRole(): boolean {
    return this.authService.canAccessAction('roles', 'read');
  }
  canEditRole(): boolean {
    return this.authService.canAccessAction('roles', 'update');
  }
  canDeleteRole(): boolean {
    return this.authService.canAccessAction('roles', 'delete');
  }

  toggleMenu(i: number, e: Event): void {
    e.stopPropagation();
    this.openedMenuIndex = this.openedMenuIndex === i ? null : i;
  }
  closeMenu(): void {
    this.openedMenuIndex = null;
  }
  @HostListener('document:click')
  onDocClick(): void {
    this.closeMenu();
  }
}
