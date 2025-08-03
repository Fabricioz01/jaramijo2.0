import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { Router } from '@angular/router';
import { DepartamentoService } from '../../../core/services/departamento.service';
import { DireccionService } from '../../../core/services/direccion.service';
import { AlertService } from '../../../core/services/alert.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { ConfirmModalComponent } from '../../../shared/components/alerts/confirm-modal.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-departamentos-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderComponent,
    ConfirmModalComponent,
  ],
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
        border: none;
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
      @media (max-width: 600px) {
        .action-menu {
          min-width: 120px;
        }
      }
    `,
  ],
  template: `
    <app-header></app-header>
    <app-confirm-modal
      [visible]="showDeleteModal"
      [message]="getDeleteMessage()"
      (confirm)="confirmarEliminar()"
      (cancel)="cancelarEliminar()"
    ></app-confirm-modal>
    <div class="container-fluid py-4" *ngIf="canAccessModule()">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-0">Departamentos</h1>
          <p class="text-muted">Gestión de departamentos por dirección</p>
        </div>
        <div>
          <button class="btn btn-outline-secondary me-2" (click)="goBack()">
            <i class="bi bi-arrow-left me-2"></i>Volver
          </button>
          <button
            type="button"
            class="btn btn-primary"
            (click)="navigateToForm()"
            *ngIf="canCreateDepartamento()"
          >
            <i class="bi bi-plus-lg me-2"></i>Nuevo Departamento
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card mb-4">
        <div class="card-body">
          <form [formGroup]="filterForm" class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Filtrar por dirección</label>
              <select class="form-select" formControlName="direccion">
                <option value="">Todas las direcciones</option>
                <option
                  *ngFor="let direccion of direcciones"
                  [value]="direccion.name"
                >
                  {{ direccion.name }}
                </option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Buscar</label>
              <input
                type="text"
                class="form-control"
                formControlName="buscar"
                placeholder="Buscar por nombre..."
                (input)="filtrarDepartamentos()"
              />
            </div>
          </form>
        </div>
      </div>

      <!-- Lista de departamentos -->
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <!-- Estado de carga -->
          <div *ngIf="cargando" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2 text-muted">Cargando departamentos...</p>
          </div>

          <!-- Departamentos -->
          <div class="row" *ngIf="!cargando">
            <div
              class="col-md-6 col-lg-4 mb-3"
              *ngFor="let depto of departamentosFiltrados; let i = index"
            >
              <div
                class="card h-100 border-start border-primary border-4 position-relative"
              >
                <div class="card-body">
                  <div
                    class="d-flex justify-content-between align-items-start mb-2"
                  >
                    <h6 class="card-title text-primary mb-0">
                      {{ depto.name }}
                    </h6>
                    <div
                      class="action-menu-wrapper"
                      [class.open]="openedMenuIndex === i"
                    >
                      <button
                        class="btn btn-sm btn-outline-secondary action-menu-btn"
                        (click)="toggleMenu(i, $event)"
                        aria-label="Abrir menú de acciones"
                        [attr.aria-expanded]="openedMenuIndex === i"
                        [attr.aria-controls]="'actionMenu' + i"
                        tabindex="0"
                      >
                        <i class="bi bi-three-dots"></i>
                      </button>
                      <ul
                        class="action-menu"
                        *ngIf="openedMenuIndex === i"
                        [attr.id]="'actionMenu' + i"
                        role="menu"
                      >
                        <li role="menuitem" *ngIf="canEditDepartamento()">
                          <button
                            class="action-item"
                            (click)="editarDepartamento(depto); closeMenu()"
                          >
                            <i class="bi bi-pencil me-2"></i>Editar
                          </button>
                        </li>
                        <li role="menuitem" *ngIf="canDeleteDepartamento()">
                          <button
                            class="action-item text-danger"
                            (click)="openDeleteModal(depto); closeMenu()"
                          >
                            <i class="bi bi-trash me-2"></i>Eliminar
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <p class="text-muted small mb-2">
                    <i class="bi bi-building me-1"></i>
                    {{ getDireccionName(depto) }}
                  </p>
                  <div
                    class="d-flex justify-content-between align-items-center mt-3"
                  >
                    <small class="text-muted">
                      <i class="bi bi-calendar me-1"></i>
                      {{ depto.createdAt | date : 'short' }}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Estado vacío -->
          <div
            class="text-center py-5"
            *ngIf="!cargando && departamentosFiltrados.length === 0"
          >
            <i class="bi bi-folder2-open display-1 text-muted"></i>
            <p class="text-muted mt-3">
              {{
                departamentos.length === 0
                  ? 'No hay departamentos registrados'
                  : 'No se encontraron departamentos con los filtros aplicados'
              }}
            </p>
            <button
              class="btn btn-primary"
              (click)="navigateToForm()"
              *ngIf="departamentos.length === 0"
            >
              <i class="bi bi-plus-lg me-2"></i>Crear primer departamento
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DepartamentosListComponent implements OnInit {
  filterForm: FormGroup;
  departamentos: any[] = [];
  departamentosFiltrados: any[] = [];
  direcciones: any[] = [];
  cargando = false;
  showDeleteModal = false;
  departamentoAEliminar: any = null;
  openedMenuIndex: number | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private departamentoService: DepartamentoService,
    private direccionService: DireccionService,
    private alertService: AlertService,
    public authService: AuthService
  ) {
    this.filterForm = this.fb.group({
      direccion: [''],
      buscar: [''],
    });
  }

  ngOnInit(): void {
    this.cargarDirecciones();
    this.cargarDepartamentos();
    this.filterForm.valueChanges.subscribe(() => {
      this.filtrarDepartamentos();
    });
  }

  cargarDirecciones(): void {
    this.direccionService.getAll().subscribe({
      next: (response) => {
        this.direcciones = response.data || [];
      },
      error: (error) => {
        console.error('Error al cargar direcciones:', error);
      },
    });
  }

  cargarDepartamentos(): void {
    this.cargando = true;
    this.departamentoService.getAll().subscribe({
      next: (response: any) => {
        console.log('✅ Departamentos cargados:', response);
        this.departamentos = response.data || [];
        this.departamentosFiltrados = [...this.departamentos];
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('❌ Error cargando departamentos:', error);
        this.alertService.error('Error al cargar departamentos');
        this.departamentos = [];
        this.departamentosFiltrados = [];
        this.cargando = false;
      },
    });
  }

  getDireccionName(departamento: any): string {
    if (
      typeof departamento.direccionId === 'object' &&
      departamento.direccionId?.name
    ) {
      return departamento.direccionId.name;
    }
    return 'Sin dirección';
  }

  filtrarDepartamentos(): void {
    const filtros = this.filterForm.value;
    this.departamentosFiltrados = this.departamentos.filter((depto) => {
      const direccionName =
        typeof depto.direccionId === 'object' ? depto.direccionId.name : '';

      const matchesDireccion =
        !filtros.direccion ||
        direccionName.toLowerCase().includes(filtros.direccion.toLowerCase());

      const matchesBuscar =
        !filtros.buscar ||
        depto.name.toLowerCase().includes(filtros.buscar.toLowerCase());

      return matchesDireccion && matchesBuscar;
    });
  }

  editarDepartamento(departamento: any): void {
    this.router.navigate(['/departamentos/form', departamento._id]);
  }

  openDeleteModal(departamento: any): void {
    this.departamentoAEliminar = departamento;
    this.showDeleteModal = true;
  }

  cancelarEliminar(): void {
    this.showDeleteModal = false;
    this.departamentoAEliminar = null;
  }

  confirmarEliminar(): void {
    if (!this.departamentoAEliminar) return;
    this.departamentoService.delete(this.departamentoAEliminar._id).subscribe({
      next: (response) => {
        this.alertService.success(
          response.message || 'Departamento eliminado exitosamente'
        );
        this.cargarDepartamentos();
        this.cancelarEliminar();
      },
      error: (error) => {
        const errorMessage =
          error.error?.message || 'Error al eliminar departamento';
        this.alertService.error(errorMessage);
        this.cancelarEliminar();
      },
    });
  }

  navigateToForm(): void {
    this.router.navigate(['/departamentos/nuevo']);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  canAccessModule(): boolean {
    return this.authService.canAccessModule('departamentos');
  }
  canCreateDepartamento(): boolean {
    return this.authService.canAccessAction('departamentos', 'create');
  }
  canEditDepartamento(): boolean {
    return this.authService.canAccessAction('departamentos', 'edit');
  }
  canDeleteDepartamento(): boolean {
    return this.authService.canAccessAction('departamentos', 'delete');
  }

  toggleMenu(index: number, event: Event): void {
    event.stopPropagation();
    this.openedMenuIndex = this.openedMenuIndex === index ? null : index;
  }

  closeMenu(): void {
    this.openedMenuIndex = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.openedMenuIndex !== null) {
      this.openedMenuIndex = null;
    }
  }

  getDeleteMessage(): string {
    return this.departamentoAEliminar
      ? `¿Está seguro de eliminar el departamento '${this.departamentoAEliminar.name}'? Esta acción no se puede deshacer.`
      : '';
  }
}
