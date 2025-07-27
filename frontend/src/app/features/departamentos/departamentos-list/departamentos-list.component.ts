import { Component, OnInit } from '@angular/core';
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
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-departamentos-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HeaderComponent],
  template: `
    <app-header></app-header>
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
              *ngFor="let depto of departamentosFiltrados"
            >
              <div class="card h-100 border-start border-primary border-4">
                <div class="card-body">
                  <div
                    class="d-flex justify-content-between align-items-start mb-2"
                  >
                    <h6 class="card-title text-primary mb-0">
                      {{ depto.name }}
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
                            (click)="editarDepartamento(depto)"
                            *ngIf="canEditDepartamento()"
                          >
                            <i class="bi bi-pencil me-2"></i>Editar
                          </a>
                        </li>
                        <li>
                          <a
                            class="dropdown-item text-danger"
                            href="#"
                            (click)="eliminarDepartamento(depto._id)"
                            *ngIf="canDeleteDepartamento()"
                          >
                            <i class="bi bi-trash me-2"></i>Eliminar
                          </a>
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
    this.router.navigate(['/departamentos/editar', departamento._id]);
  }

  eliminarDepartamento(id: string): void {
    if (confirm('¿Está seguro de que desea eliminar este departamento?')) {
      this.departamentoService.delete(id).subscribe({
        next: () => {
          this.alertService.success('Departamento eliminado exitosamente');
          this.cargarDepartamentos();
        },
        error: (error: any) => {
          console.error('Error eliminando departamento:', error);
          this.alertService.error('Error al eliminar departamento');
        },
      });
    }
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
}
