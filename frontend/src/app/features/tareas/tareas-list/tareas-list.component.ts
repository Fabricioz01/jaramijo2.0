import { Component, OnInit, HostListener } from '@angular/core';
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
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmModalComponent } from '../../../shared/components/alerts/confirm-modal.component';

interface Estadisticas {
  total: number;
  enProgreso: number;
  completadas: number;
  urgentes: number;
}

@Component({
  selector: 'app-tareas-list',
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
      <!-- Encabezado -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-0">Gestión de Tareas</h1>
          <p class="text-muted">Administra todas las tareas del municipio</p>
        </div>
        <div>
          <button class="btn btn-outline-secondary me-2" (click)="goBack()">
            <i class="bi bi-arrow-left me-2"></i>Volver
          </button>
          <button
            class="btn btn-primary"
            (click)="navigateToForm()"
            *ngIf="canCreateTarea()"
          >
            <i class="bi bi-plus-lg me-2"></i>Nueva Tarea
          </button>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="row mb-4" *ngIf="!cargando">
        <ng-container *ngFor="let card of cards">
          <div class="col-md-3 mb-3">
            <div class="card border-0 text-white" [ngClass]="card.bg">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h4 class="mb-0">{{ card.count }}</h4>
                    <p class="mb-0 opacity-75">{{ card.label }}</p>
                  </div>
                  <i class="{{ card.icon }} fs-1 opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
        </ng-container>
      </div>

      <!-- Filtros -->
      <div class="card mb-4">
        <div class="card-body">
          <form [formGroup]="filterForm" class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Estado</label>
              <select class="form-select" formControlName="estado">
                <option value="">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="in_progress">En Progreso</option>
                <option value="completed">Completada</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Departamento</label>
              <select class="form-select" formControlName="departamento">
                <option value="">Todos</option>
                <option *ngFor="let d of getDepartamentosUnicos()" [value]="d">
                  {{ d }}
                </option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Buscar</label>
              <input
                type="text"
                class="form-control"
                formControlName="buscar"
              />
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de confirmación -->
      <app-confirm-modal
        [visible]="showConfirmModal"
        [message]="
          '¿Está seguro de eliminar esta tarea? Esta acción no se puede deshacer.'
        "
        (confirm)="confirmarEliminarTarea()"
        (cancel)="cancelarEliminarTarea()"
      ></app-confirm-modal>

      <!-- Lista -->
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <div *ngIf="cargando" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
            <p class="mt-2 text-muted">Cargando tareas...</p>
          </div>

          <ng-container *ngIf="!cargando && tareasFiltradas.length">
            <div class="row">
              <div
                class="col-md-6 col-lg-4 mb-4"
                *ngFor="let t of tareasFiltradas; let i = index"
              >
                <div
                  class="card h-100 border-start border-4"
                  [ngClass]="getEstadoCardClass(t.status)"
                >
                  <div class="card-body">
                    <div
                      class="d-flex justify-content-between align-items-start mb-2"
                    >
                      <h6 class="card-title mb-0">{{ t.title }}</h6>
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
                          <li>
                            <button
                              class="action-item"
                              (click)="verTarea(t._id); closeMenu()"
                            >
                              <i class="bi bi-eye me-2"></i>Ver
                            </button>
                          </li>
                          <li *ngIf="canEditTarea()">
                            <button
                              class="action-item"
                              (click)="editarTarea(t._id); closeMenu()"
                            >
                              <i class="bi bi-pencil me-2"></i>Editar
                            </button>
                          </li>
                          <li *ngIf="canDeleteTarea()">
                            <button
                              class="action-item text-danger"
                              (click)="eliminarTarea(t._id); closeMenu()"
                            >
                              <i class="bi bi-trash me-2"></i>Eliminar
                            </button>
                          </li>
                          <li *ngIf="!canEditTarea() && !canDeleteTarea()">
                            <span class="action-item disabled text-muted"
                              >Sin acciones disponibles</span
                            >
                          </li>
                        </ul>
                      </div>
                    </div>

                    <p class="text-muted small mb-2">
                      {{ t.description | slice : 0 : 100
                      }}{{ t.description?.length > 100 ? '...' : '' }}
                    </p>

                    <div class="mb-3">
                      <span
                        class="badge me-2"
                        [ngClass]="getEstadoBadgeClass(t.status)"
                        >{{ getEstadoLabel(t.status) }}</span
                      >
                      <span
                        class="badge bg-info text-dark"
                        *ngIf="t.departamentoId && t.departamentoId.name"
                      >
                        {{ t.departamentoId.name }}
                      </span>
                    </div>

                    <div class="row text-center">
                      <div class="col">
                        <small class="text-muted d-block">Asignado a</small>
                        <small class="fw-bold">
                          {{
                            t.assignedToIds &&
                            t.assignedToIds.length > 0 &&
                            t.assignedToIds[0].name
                              ? t.assignedToIds[0].name
                              : 'Sin asignar'
                          }}
                        </small>
                      </div>
                      <div class="col">
                        <small class="text-muted d-block">Vence</small>
                        <small
                          class="fw-bold"
                          [ngClass]="getFechaVencimientoClass(t.dueDate)"
                          >{{ t.dueDate | date : 'dd/MM/yyyy' }}</small
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>

          <div
            class="text-center py-5"
            *ngIf="!cargando && tareasFiltradas.length === 0"
          >
            <i class="bi bi-list-task display-1 text-muted"></i>
            <h4 class="mt-3">
              {{
                tareas.length
                  ? 'No se encontraron tareas'
                  : 'No hay tareas registradas'
              }}
            </h4>
          </div>
        </div>
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

  openedMenuIndex: number | null = null;
  showConfirmModal = false;
  selectedTareaId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private taskService: TaskService,
    private alert: AlertService,
    public authService: AuthService
  ) {
    this.filterForm = this.fb.group({
      estado: [''],
      departamento: [''],
      buscar: [''],
    });
  }

  get cards() {
    return [
      {
        label: 'Total Tareas',
        count: this.estadisticas.total,
        bg: 'bg-primary',
        icon: 'bi bi-list-task',
      },
      {
        label: 'En Progreso',
        count: this.estadisticas.enProgreso,
        bg: 'bg-warning',
        icon: 'bi bi-clock',
      },
      {
        label: 'Completadas',
        count: this.estadisticas.completadas,
        bg: 'bg-success',
        icon: 'bi bi-check-circle',
      },
      {
        label: 'Urgentes',
        count: this.estadisticas.urgentes,
        bg: 'bg-danger',
        icon: 'bi bi-exclamation-triangle',
      },
    ];
  }

  ngOnInit() {
    this.load();
    this.filterForm.valueChanges.subscribe(() => this.apply());
  }

  load() {
    this.cargando = true;
    this.taskService.getAll().subscribe({
      next: (r: any) => {
        this.tareas = r.data || [];
        this.apply();
        this.countStats();
        this.cargando = false;
      },
      error: () => {
        this.alert.error('Error al cargar tareas');
        this.cargando = false;
      },
    });
  }

  apply() {
    const f = this.filterForm.value;
    this.tareasFiltradas = this.tareas.filter((t) => {
      if (!t) return false;
      const okEstado = !f.estado || t.status === f.estado;
      const okDep =
        !f.departamento ||
        (t.departamentoId && t.departamentoId.name === f.departamento);
      const q = f.buscar?.toLowerCase() || '';
      const okBuscar =
        !q ||
        (typeof t.title === 'string' && t.title.toLowerCase().includes(q)) ||
        (typeof t.description === 'string' &&
          t.description.toLowerCase().includes(q));
      return okEstado && okDep && okBuscar;
    });
  }

  countStats() {
    this.estadisticas = {
      total: this.tareas.length,
      enProgreso: this.tareas.filter((t) => t && t.status === 'in_progress')
        .length,
      completadas: this.tareas.filter((t) => t && t.status === 'completed')
        .length,
      urgentes: this.tareas.filter((t) => {
        if (!t || !t.dueDate) return false;
        const v = new Date(t.dueDate);
        if (isNaN(v.getTime())) return false;
        const d = Math.ceil((v.getTime() - Date.now()) / (1000 * 3600 * 24));
        return d <= 3 && t.status !== 'completed';
      }).length,
    };
  }

  /* helpers */
  getEstadoCardClass(s: string) {
    return (
      {
        pending: 'border-warning',
        in_progress: 'border-info',
        completed: 'border-success',
      }[s] || 'border-secondary'
    );
  }
  getEstadoBadgeClass(s: string) {
    return (
      {
        pending: 'bg-warning',
        in_progress: 'bg-info',
        completed: 'bg-success',
      }[s] || 'bg-secondary'
    );
  }
  getEstadoLabel(s: string) {
    return (
      {
        pending: 'Pendiente',
        in_progress: 'En Progreso',
        completed: 'Completada',
      }[s] || s
    );
  }
  getFechaVencimientoClass(f: string) {
    if (!f) return '';
    const v = new Date(f);
    if (isNaN(v.getTime())) return '';
    const h = Date.now();
    const d = Math.ceil((v.getTime() - h) / (1000 * 3600 * 24));
    if (d < 0) return 'text-danger';
    if (d <= 3) return 'text-warning';
    return 'text-success';
  }

  /* acciones */
  verTarea(id: string) {
    this.router.navigate(['/tareas', id, 'ver']);
  }
  editarTarea(id: string) {
    this.router.navigate(['/tareas', id, 'editar']);
  }
  eliminarTarea(id: string) {
    this.selectedTareaId = id;
    this.showConfirmModal = true;
  }
  confirmarEliminarTarea() {
    if (!this.selectedTareaId) return;
    this.taskService.delete(this.selectedTareaId).subscribe({
      next: () => {
        this.showConfirmModal = false;
        this.selectedTareaId = null;
        this.load();
        this.alert.success('Tarea eliminada correctamente');
      },
      error: () => {
        this.alert.error('No se pudo eliminar la tarea');
        this.showConfirmModal = false;
        this.selectedTareaId = null;
      },
    });
  }
  cancelarEliminarTarea() {
    this.showConfirmModal = false;
    this.selectedTareaId = null;
  }

  /* menú acciones */
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

  /* navegación */
  navigateToForm() {
    this.router.navigate(['/tareas/nueva']);
  }
  goBack() {
    this.router.navigate(['/dashboard']);
  }

  /* permisos */
  canAccessModule() {
    return this.authService.canAccessModule('tareas');
  }
  canCreateTarea() {
    return this.authService.canAccessAction('tareas', 'create');
  }
  canEditTarea() {
    return this.authService.canAccessAction('tareas', 'update');
  }
  canDeleteTarea() {
    return this.authService.canAccessAction('tareas', 'delete');
  }

  getDepartamentosUnicos() {
    return [
      ...new Set(
        this.tareas
          .filter((t) => t.departamentoId && t.departamentoId.name)
          .map((t) => t.departamentoId.name)
      ),
    ];
  }
}
