import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-direcciones-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HeaderComponent],
  template: `
    <app-header></app-header>
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-0">Direcciones</h1>
          <p class="text-muted">Gestión de direcciones organizacionales</p>
        </div>
        <div>
          <button class="btn btn-outline-secondary me-2" (click)="goBack()">
            <i class="bi bi-arrow-left me-2"></i>Volver
          </button>
          <button class="btn btn-primary" (click)="navigateToForm()">
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
              *ngFor="let direccion of direccionesFiltradas"
            >
              <div class="card h-100 border-start border-success border-4">
                <div class="card-body">
                  <div
                    class="d-flex justify-content-between align-items-start mb-2"
                  >
                    <h6 class="card-title text-success mb-0">
                      {{ direccion.name }}
                    </h6>
                    <div class="dropdown">
                      <button
                        class="btn btn-sm btn-outline-secondary dropdown-toggle"
                        data-bs-toggle="dropdown"
                      >
                        <i class="bi bi-three-dots"></i>
                      </button>
                      <ul class="dropdown-menu">
                        <li>
                          <a
                            class="dropdown-item"
                            href="#"
                            (click)="editarDireccion(direccion)"
                          >
                            <i class="bi bi-pencil me-2"></i>Editar
                          </a>
                        </li>
                        <li>
                          <a
                            class="dropdown-item text-danger"
                            href="#"
                            (click)="eliminarDireccion(direccion._id)"
                          >
                            <i class="bi bi-trash me-2"></i>Eliminar
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <p class="card-text text-muted mb-3">
                    {{ direccion.description || 'Sin descripción' }}
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
    `,
  ],
})
export class DireccionesListComponent implements OnInit {
  filterForm: FormGroup;
  direcciones: any[] = [];
  direccionesFiltradas: any[] = [];
  cargando = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private direccionService: DireccionService,
    private alertService: AlertService
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
        console.log('✅ Direcciones cargadas:', response);
        this.direcciones = response.data || [];
        this.direccionesFiltradas = [...this.direcciones];
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('❌ Error cargando direcciones:', error);
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

  editarDireccion(direccion: any): void {
    this.router.navigate(['/direcciones', direccion._id, 'editar']);
  }

  eliminarDireccion(id: string): void {
    if (confirm('¿Está seguro de que desea eliminar esta dirección?')) {
      this.direccionService.delete(id).subscribe({
        next: () => {
          this.alertService.success('Dirección eliminada exitosamente');
          this.cargarDirecciones();
        },
        error: (error: any) => {
          console.error('Error eliminando dirección:', error);
          this.alertService.error('Error al eliminar dirección');
        },
      });
    }
  }

  navigateToForm(): void {
    this.router.navigate(['/direcciones/nuevo']);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
