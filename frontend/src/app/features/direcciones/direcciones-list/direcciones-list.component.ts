import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { Router } from '@angular/router';
import { DireccionService } from '../../../core/services/direccion.service';
import { AlertService } from '../../../core/services/alert.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmModalComponent } from '../../../shared/components/alerts/confirm-modal.component';

function getDeleteMessage(this: any): string {
  return this.direccionAEliminar
    ? '¿Está seguro de eliminar la dirección \'" + this.direccionAEliminar.name + "\'? Esta acción no se puede deshacer.'
    : '';
}

@Component({
  selector: 'app-direcciones-list',
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
    <div class="container-fluid py-4" *ngIf="canAccessModule()">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-0">Direcciones</h1>
          <p class="text-muted">Gestión de direcciones organizacionales</p>
        </div>
        <div>
          <button class="btn btn-outline-secondary me-2" (click)="goBack()">
            <i class="bi bi-arrow-left me-2"></i>Volver
          </button>
          <button
            class="btn btn-primary"
            (click)="navigateToForm()"
            *ngIf="canCreateDireccion()"
          >
            <i class="bi bi-plus-circle me-2"></i>Nueva Dirección
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card mb-4">
        <div class="card-body">
          <form [formGroup]="filterForm" class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Buscar</label>
              <input
                type="text"
                class="form-control"
                formControlName="buscar"
                placeholder="Buscar por nombre o descripción..."
                (input)="filtrarDirecciones()"
              />
            </div>
            <div class="col-md-6">
              <label class="form-label">Estado</label>
              <select
                class="form-select"
                formControlName="estado"
                (change)="filtrarDirecciones()"
              >
                <option value="">Todos los estados</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>
          </form>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <!-- Estado de carga -->
          <div *ngIf="cargando" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2 text-muted">Cargando direcciones...</p>
          </div>

          <!-- Lista de direcciones -->
          <div *ngIf="!cargando && direccionesFiltradas.length > 0" class="row">
            <div
              class="col-md-6 col-lg-4 mb-4"
              *ngFor="let direccion of direccionesFiltradas; let i = index"
            >
              <div
                class="card h-100 border-start border-success border-4 position-relative"
              >
                <div class="card-body">
                  <div
                    class="d-flex justify-content-between align-items-start mb-2"
                  >
                    <h6 class="card-title text-success mb-0">
                      {{ direccion.name }}
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
                        <!-- Solo dejar editar -->
                        <li role="menuitem" *ngIf="canEditDireccion()">
                          <button
                            class="action-item"
                            (click)="editarDireccion(direccion); closeMenu()"
                          >
                            <i class="bi bi-pencil me-2"></i>Editar
                          </button>
                        </li>
                        <li role="menuitem" *ngIf="canDeleteDireccion()">
                          <button
                            class="action-item text-danger"
                            (click)="openDeleteModal(direccion, i); closeMenu()"
                          >
                            <i class="bi bi-trash me-2"></i>Eliminar
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <p class="card-text text-muted mb-3">
                    {{ direccion.descripcion ? direccion.descripcion : 'Sin descripción' }}
                  </p>
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <span
                      class="badge"
                      [class]="
                        direccion.active !== false
                          ? 'bg-success'
                          : 'bg-secondary'
                      "
                    >
                      {{ direccion.active !== false ? 'Activo' : 'Inactivo' }}
                    </span>
                    <small class="text-muted">
                      Creado: {{ direccion.createdAt | date : 'dd/MM/yyyy' }}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Estado vacío -->
          <div
            class="text-center py-5"
            *ngIf="!cargando && direccionesFiltradas.length === 0"
          >
            <i class="bi bi-building display-1 text-muted"></i>
            <h4 class="mt-3">
              {{
                direcciones.length === 0
                  ? 'No hay direcciones registradas'
                  : 'No se encontraron direcciones'
              }}
            </h4>
            <p class="text-muted">
              {{
                direcciones.length === 0
                  ? 'Comienza creando la primera dirección'
                  : 'Intenta con otros filtros de búsqueda'
              }}
            </p>
            <div class="d-flex gap-2 justify-content-center mt-4">
              <button class="btn btn-outline-primary" (click)="goBack()">
                <i class="bi bi-arrow-left me-2"></i>Volver al Dashboard
              </button>
              <button
                class="btn btn-primary"
                (click)="navigateToForm()"
                *ngIf="direcciones.length === 0"
              >
                <i class="bi bi-plus-circle me-2"></i>Crear Primera Dirección
              </button>
            </div>
          </div>
        </div>
        <!-- Modal de confirmación -->
        <app-confirm-modal
          [visible]="showDeleteModal"
          [message]="getDeleteMessage()"
          (confirm)="confirmarEliminar()"
          (cancel)="cancelarEliminar()"
        ></app-confirm-modal>
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
      }
      .btn {
        border-radius: 0.5rem;
      }
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
})
export class DireccionesListComponent implements OnInit {
  getDeleteMessage(): string {
    return this.direccionAEliminar
      ? `¿Está seguro de eliminar la dirección '${this.direccionAEliminar.name}'? Esta acción no se puede deshacer.`
      : '';
  }
  filterForm: FormGroup;
  direcciones: any[] = [];
  direccionesFiltradas: any[] = [];
  cargando = false;

  openedMenuIndex: number | null = null;
  showDeleteModal = false;
  direccionAEliminar: any = null;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private direccionService: DireccionService,
    private alertService: AlertService,
    public authService: AuthService
  ) {
    this.filterForm = this.fb.group({
      buscar: [''],
      estado: [''],
    });
  }

  ngOnInit(): void {
    this.cargarDirecciones();
    this.filterForm.valueChanges.subscribe(() => {
      this.filtrarDirecciones();
    });
  }

  cargarDirecciones(): void {
    this.cargando = true;
    this.direccionService.getAll().subscribe({
      next: (response: any) => {
        this.direcciones = response.data || [];
        this.direccionesFiltradas = [...this.direcciones];
        this.cargando = false;
      },
      error: (error: any) => {
        this.alertService.error('Error al cargar direcciones');
        this.direcciones = [];
        this.direccionesFiltradas = [];
        this.cargando = false;
      },
    });
  }

  filtrarDirecciones(): void {
    const filtros = this.filterForm.value;
    this.direccionesFiltradas = this.direcciones.filter((direccion) => {
      const matchesBuscar =
        !filtros.buscar ||
        direccion.name.toLowerCase().includes(filtros.buscar.toLowerCase());

      const matchesEstado =
        filtros.estado === '' ||
        (filtros.estado === 'true' && direccion.active !== false) ||
        (filtros.estado === 'false' && direccion.active === false);

      return matchesBuscar && matchesEstado;
    });
  }

  // Menú de acciones
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

  editarDireccion(direccion: any): void {
    this.router.navigate(['/direcciones', direccion._id, 'editar']);
  }

  openDeleteModal(direccion: any, index: number): void {
    this.direccionAEliminar = direccion;
    this.showDeleteModal = true;
  }
  cancelarEliminar(): void {
    this.showDeleteModal = false;
    this.direccionAEliminar = null;
  }
  confirmarEliminar(): void {
    if (!this.direccionAEliminar) return;
    this.direccionService.delete(this.direccionAEliminar._id).subscribe({
      next: () => {
        this.alertService.success('Dirección eliminada exitosamente');
        this.cargarDirecciones();
        this.cancelarEliminar();
      },
      error: (error: any) => {
        this.alertService.error('Error al eliminar dirección');
        this.cancelarEliminar();
      },
    });
  }

  navigateToForm(): void {
    this.router.navigate(['/direcciones/nuevo']);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  canAccessModule(): boolean {
    return this.authService.canAccessModule('direcciones');
  }
  canCreateDireccion(): boolean {
    return this.authService.canAccessAction('direcciones', 'create');
  }
  canEditDireccion(): boolean {
    return this.authService.canAccessAction('direcciones', 'edit');
  }
  canDeleteDireccion(): boolean {
    return this.authService.canAccessAction('direcciones', 'delete');
  }
}
