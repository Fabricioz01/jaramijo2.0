import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { AlertService } from '../../../core/services/alert.service';

interface Estadisticas {
  total: number;
  enProgreso: number;
  completadas: number;
  urgentes: number;
}

@Component({
  selector: 'app-tareas-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-0">Gestión de Tareas</h1>
          <p class="text-muted">Administra todas las tareas del municipio</p>
        </div>
        <div>
          <button class="btn btn-outline-secondary me-2" (click)="goBack()">
            <i class="bi bi-arrow-left me-2"></i>Volver
          </button>
          <button class="btn btn-primary" (click)="navigateToForm()">
            <i class="bi bi-plus-lg me-2"></i>Nueva Tarea
          </button>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="row mb-4" *ngIf="!cargando">
        <div class="col-md-3 mb-3">
          <div class="card border-0 bg-primary text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-0">{{ estadisticas.total }}</h4>
                  <p class="mb-0 opacity-75">Total Tareas</p>
                </div>
                <i class="bi bi-list-task fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card border-0 bg-warning text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-0">{{ estadisticas.enProgreso }}</h4>
                  <p class="mb-0 opacity-75">En Progreso</p>
                </div>
                <i class="bi bi-clock fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card border-0 bg-success text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-0">{{ estadisticas.completadas }}</h4>
                  <p class="mb-0 opacity-75">Completadas</p>
                </div>
                <i class="bi bi-check-circle fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card border-0 bg-danger text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="mb-0">{{ estadisticas.urgentes }}</h4>
                  <p class="mb-0 opacity-75">Urgentes</p>
                </div>
                <i class="bi bi-exclamation-triangle fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card mb-4">
        <div class="card-body">
          <form [formGroup]="filterForm" class="row g-3">
            <div class="col-md-3">
              <label class="form-label">Estado</label>
              <select class="form-select" formControlName="estado">
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Prioridad</label>
              <select class="form-select" formControlName="prioridad">
                <option value="">Todas las prioridades</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Departamento</label>
              <select class="form-select" formControlName="departamento">
                <option value="">Todos los departamentos</option>
                <!-- Opciones dinámicas basadas en datos reales -->
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Buscar</label>
              <input
                type="text"
                class="form-control"
                formControlName="buscar"
                placeholder="Buscar por título..."
              />
            </div>
          </form>
        </div>
      </div>

      <!-- Lista de tareas -->
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <!-- Estado de carga -->
          <div *ngIf="cargando" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2 text-muted">Cargando tareas...</p>
          </div>

          <!-- Tareas -->
          <div *ngIf="!cargando && tareasFiltradas.length > 0">
            <div class="row">
              <div
                class="col-md-6 col-lg-4 mb-4"
                *ngFor="let tarea of tareasFiltradas"
              >
                <div
                  class="card h-100 border-start border-4"
                  [class]="getEstadoCardClass(tarea.estado)"
                >
                  <div class="card-body">
                    <div
                      class="d-flex justify-content-between align-items-start mb-2"
                    >
                      <h6 class="card-title mb-0">{{ tarea.titulo }}</h6>
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
                              (click)="verTarea(tarea._id)"
                            >
                              <i class="bi bi-eye me-2"></i>Ver
                            </a>
                          </li>
                          <li>
                            <a
                              class="dropdown-item"
                              href="#"
                              (click)="editarTarea(tarea._id)"
                            >
                              <i class="bi bi-pencil me-2"></i>Editar
                            </a>
                          </li>
                          <li><hr class="dropdown-divider" /></li>
                          <li>
                            <a
                              class="dropdown-item text-danger"
                              href="#"
                              (click)="eliminarTarea(tarea._id)"
                            >
                              <i class="bi bi-trash me-2"></i>Eliminar
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <p class="card-text text-muted small mb-2">
                      {{ tarea.descripcion | slice : 0 : 100
                      }}{{ tarea.descripcion?.length > 100 ? '...' : '' }}
                    </p>

                    <div class="mb-3">
                      <span
                        class="badge me-2"
                        [class]="getEstadoBadgeClass(tarea.estado)"
                      >
                        {{ getEstadoLabel(tarea.estado) }}
                      </span>
                      <span
                        class="badge"
                        [class]="getPrioridadBadgeClass(tarea.prioridad)"
                      >
                        {{ getPrioridadLabel(tarea.prioridad) }}
                      </span>
                    </div>

                    <div class="row text-center">
                      <div class="col">
                        <small class="text-muted d-block">Asignado a</small>
                        <small class="fw-bold">{{
                          tarea.asignado?.name || 'Sin asignar'
                        }}</small>
                      </div>
                      <div class="col">
                        <small class="text-muted d-block">Vencimiento</small>
                        <small
                          class="fw-bold"
                          [class]="
                            getFechaVencimientoClass(tarea.fechaVencimiento)
                          "
                        >
                          {{ tarea.fechaVencimiento | date : 'dd/MM/yyyy' }}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Estado vacío -->
          <div
            class="text-center py-5"
            *ngIf="!cargando && tareasFiltradas.length === 0"
          >
            <i class="bi bi-list-task display-1 text-muted"></i>
            <h4 class="mt-3">
              {{
                tareas.length === 0
                  ? 'No hay tareas registradas'
                  : 'No se encontraron tareas'
              }}
            </h4>
            <p class="text-muted">
              {{
                tareas.length === 0
                  ? 'Comienza creando la primera tarea'
                  : 'Intenta con otros filtros de búsqueda'
              }}
            </p>
            <button
              class="btn btn-primary"
              (click)="navigateToForm()"
              *ngIf="tareas.length === 0"
            >
              <i class="bi bi-plus-lg me-2"></i>Crear Primera Tarea
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TareasListComponent implements OnInit {
  filterForm: FormGroup;
  tareas: any[] = [];
  tareasFiltradas: any[] = [];
  cargando = false;
  estadisticas: Estadisticas = {
    total: 0,
    enProgreso: 0,
    completadas: 0,
    urgentes: 0,
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private taskService: TaskService,
    private alertService: AlertService
  ) {
    this.filterForm = this.fb.group({
      estado: [''],
      prioridad: [''],
      departamento: [''],
      buscar: [''],
    });
  }

  ngOnInit(): void {
    this.cargarTareas();
    this.setupFilters();
  }

  cargarTareas(): void {
    this.cargando = true;
    this.taskService.getAll().subscribe({
      next: (response: any) => {
        console.log('✅ Tareas cargadas:', response);
        this.tareas = response.data || [];
        this.tareasFiltradas = [...this.tareas];
        this.calcularEstadisticas();
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('❌ Error cargando tareas:', error);
        this.alertService.error('Error al cargar tareas');
        this.tareas = [];
        this.tareasFiltradas = [];
        this.cargando = false;
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
    this.tareasFiltradas = this.tareas.filter((tarea) => {
      const matchesEstado = !filtros.estado || tarea.estado === filtros.estado;
      const matchesPrioridad =
        !filtros.prioridad || tarea.prioridad === filtros.prioridad;
      const matchesBuscar =
        !filtros.buscar ||
        tarea.titulo.toLowerCase().includes(filtros.buscar.toLowerCase()) ||
        tarea.descripcion?.toLowerCase().includes(filtros.buscar.toLowerCase());

      return matchesEstado && matchesPrioridad && matchesBuscar;
    });
  }

  calcularEstadisticas(): void {
    this.estadisticas = {
      total: this.tareas.length,
      enProgreso: this.tareas.filter((t) => t.estado === 'en_progreso').length,
      completadas: this.tareas.filter((t) => t.estado === 'completada').length,
      urgentes: this.tareas.filter((t) => t.prioridad === 'urgente').length,
    };
  }

  getEstadoCardClass(estado: string): string {
    const classes = {
      pendiente: 'border-warning',
      en_progreso: 'border-info',
      completada: 'border-success',
      cancelada: 'border-danger',
    };
    return classes[estado as keyof typeof classes] || 'border-secondary';
  }

  getEstadoBadgeClass(estado: string): string {
    const classes = {
      pendiente: 'bg-warning',
      en_progreso: 'bg-info',
      completada: 'bg-success',
      cancelada: 'bg-danger',
    };
    return classes[estado as keyof typeof classes] || 'bg-secondary';
  }

  getEstadoLabel(estado: string): string {
    const labels = {
      pendiente: 'Pendiente',
      en_progreso: 'En Progreso',
      completada: 'Completada',
      cancelada: 'Cancelada',
    };
    return labels[estado as keyof typeof labels] || estado;
  }

  getPrioridadBadgeClass(prioridad: string): string {
    const classes = {
      baja: 'bg-secondary',
      media: 'bg-primary',
      alta: 'bg-warning',
      urgente: 'bg-danger',
    };
    return classes[prioridad as keyof typeof classes] || 'bg-secondary';
  }

  getPrioridadLabel(prioridad: string): string {
    const labels = {
      baja: 'Baja',
      media: 'Media',
      alta: 'Alta',
      urgente: 'Urgente',
    };
    return labels[prioridad as keyof typeof labels] || prioridad;
  }

  getFechaVencimientoClass(fecha: string): string {
    if (!fecha) return '';
    const vencimiento = new Date(fecha);
    const hoy = new Date();
    const diffDias = Math.ceil(
      (vencimiento.getTime() - hoy.getTime()) / (1000 * 3600 * 24)
    );

    if (diffDias < 0) return 'text-danger'; // Vencida
    if (diffDias <= 3) return 'text-warning'; // Por vencer
    return 'text-success'; // A tiempo
  }

  verTarea(id: string): void {
    this.router.navigate(['/tareas/detalle', id]);
  }

  editarTarea(id: string): void {
    this.router.navigate(['/tareas/editar', id]);
  }

  eliminarTarea(id: string): void {
    if (confirm('¿Está seguro de que desea eliminar esta tarea?')) {
      this.taskService.delete(id).subscribe({
        next: () => {
          this.alertService.success('Tarea eliminada exitosamente');
          this.cargarTareas();
        },
        error: (error: any) => {
          console.error('Error eliminando tarea:', error);
          this.alertService.error('Error al eliminar tarea');
        },
      });
    }
  }

  navigateToForm(): void {
    this.router.navigate(['/tareas/nuevo']);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
