import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

interface Tarea {
  _id: string;
  titulo: string;
  descripcion: string;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  fechaInicio: Date;
  fechaVencimiento: Date;
  fechaCreacion: Date;
  asignadoA: {
    _id: string;
    nombres: string;
    apellidos: string;
    email: string;
    cargo: string;
  };
  creadoPor: {
    _id: string;
    nombres: string;
    apellidos: string;
  };
  departamento: {
    _id: string;
    nombre: string;
    direccion: {
      _id: string;
      nombre: string;
    };
  };
  etiquetas: string[];
  progreso: number;
  observaciones?: string;
  archivos?: any[];
}

@Component({
  selector: 'app-tareas-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4" *ngIf="tarea">
      <div class="d-flex align-items-center mb-4">
        <button class="btn btn-outline-secondary me-3" (click)="goBack()">
          <i class="bi bi-arrow-left"></i>
        </button>
        <div class="flex-grow-1">
          <h1 class="h3 mb-0">{{ tarea.titulo }}</h1>
          <div class="d-flex align-items-center gap-2 mt-2">
            <span class="badge" [class]="getEstadoBadgeClass(tarea.estado)">
              {{ getEstadoTexto(tarea.estado) }}
            </span>
            <span
              class="badge"
              [class]="getPrioridadBadgeClass(tarea.prioridad)"
            >
              {{ getPrioridadTexto(tarea.prioridad) }}
            </span>
            <small class="text-muted ms-2">
              Creado el {{ formatDate(tarea.fechaCreacion) }}
            </small>
          </div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary" (click)="editarTarea()">
            <i class="bi bi-pencil me-2"></i>Editar
          </button>
          <div class="dropdown">
            <button
              class="btn btn-outline-secondary dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              <i class="bi bi-three-dots"></i>
            </button>
            <ul class="dropdown-menu">
              <li>
                <a class="dropdown-item" href="#"
                  ><i class="bi bi-download me-2"></i>Exportar PDF</a
                >
              </li>
              <li>
                <a class="dropdown-item" href="#"
                  ><i class="bi bi-share me-2"></i>Compartir</a
                >
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <a class="dropdown-item text-danger" (click)="eliminarTarea()">
                  <i class="bi bi-trash me-2"></i>Eliminar</a
                >
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Información Principal -->
        <div class="col-lg-8 mb-4">
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-transparent">
              <h5 class="mb-0">
                <i class="bi bi-info-circle me-2"></i>Información General
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold">Estado</label>
                  <div>
                    <span
                      class="badge fs-6"
                      [class]="getEstadoBadgeClass(tarea.estado)"
                    >
                      {{ getEstadoTexto(tarea.estado) }}
                    </span>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold">Prioridad</label>
                  <div>
                    <span
                      class="badge fs-6"
                      [class]="getPrioridadBadgeClass(tarea.prioridad)"
                    >
                      {{ getPrioridadTexto(tarea.prioridad) }}
                    </span>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold">Fecha de Inicio</label>
                  <div class="text-muted">
                    <i class="bi bi-calendar-event me-2"></i
                    >{{ formatDate(tarea.fechaInicio) }}
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold">Fecha de Vencimiento</label>
                  <div
                    [class]="
                      isVencida(tarea.fechaVencimiento)
                        ? 'text-danger fw-bold'
                        : 'text-muted'
                    "
                  >
                    <i class="bi bi-calendar-x me-2"></i
                    >{{ formatDate(tarea.fechaVencimiento) }}
                    <span *ngIf="isVencida(tarea.fechaVencimiento)" class="ms-2"
                      >(VENCIDA)</span
                    >
                    <span
                      *ngIf="!isVencida(tarea.fechaVencimiento)"
                      class="ms-2"
                    >
                      ({{ getDiasRestantes(tarea.fechaVencimiento) }} días
                      restantes)
                    </span>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Progreso</label>
                <div class="d-flex align-items-center">
                  <div class="progress flex-grow-1 me-3" style="height: 8px;">
                    <div
                      class="progress-bar"
                      [style.width.%]="tarea.progreso"
                      [class]="getProgresoBg(tarea.progreso)"
                    ></div>
                  </div>
                  <span class="fw-bold">{{ tarea.progreso }}%</span>
                </div>
              </div>

              <div
                class="mb-3"
                *ngIf="tarea.etiquetas && tarea.etiquetas.length > 0"
              >
                <label class="form-label fw-bold">Etiquetas</label>
                <div>
                  <span
                    class="badge bg-light text-dark me-2"
                    *ngFor="let etiqueta of tarea.etiquetas"
                  >
                    <i class="bi bi-tag me-1"></i>{{ etiqueta }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Descripción -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-transparent">
              <h5 class="mb-0">
                <i class="bi bi-file-text me-2"></i>Descripción
              </h5>
            </div>
            <div class="card-body">
              <p class="mb-0" style="white-space: pre-line;">
                {{ tarea.descripcion }}
              </p>
            </div>
          </div>

          <!-- Observaciones -->
          <div class="card border-0 shadow-sm mb-4" *ngIf="tarea.observaciones">
            <div class="card-header bg-transparent">
              <h5 class="mb-0">
                <i class="bi bi-chat-text me-2"></i>Observaciones
              </h5>
            </div>
            <div class="card-body">
              <p class="mb-0" style="white-space: pre-line;">
                {{ tarea.observaciones }}
              </p>
            </div>
          </div>

          <!-- Archivos -->
          <div
            class="card border-0 shadow-sm"
            *ngIf="tarea.archivos && tarea.archivos.length > 0"
          >
            <div class="card-header bg-transparent">
              <h5 class="mb-0">
                <i class="bi bi-paperclip me-2"></i>Archivos Adjuntos
              </h5>
            </div>
            <div class="card-body">
              <div class="list-group list-group-flush">
                <div
                  class="list-group-item px-0"
                  *ngFor="let archivo of tarea.archivos"
                >
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div class="d-flex align-items-center">
                      <i class="bi bi-file-earmark-pdf text-danger me-3"></i>
                      <div>
                        <h6 class="mb-0">{{ archivo.nombre }}</h6>
                        <small class="text-muted"
                          >{{ archivo.tamano }} KB</small
                        >
                      </div>
                    </div>
                    <button class="btn btn-outline-primary btn-sm">
                      <i class="bi bi-download"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel Lateral -->
        <div class="col-lg-4">
          <!-- Asignación -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-transparent">
              <h5 class="mb-0"><i class="bi bi-people me-2"></i>Asignación</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label fw-bold small">Asignado a</label>
                <div class="d-flex align-items-center">
                  <div class="avatar-circle me-3">
                    {{
                      getInitials(
                        tarea.asignadoA.nombres +
                          ' ' +
                          tarea.asignadoA.apellidos
                      )
                    }}
                  </div>
                  <div>
                    <div class="fw-semibold">
                      {{ tarea.asignadoA.nombres }}
                      {{ tarea.asignadoA.apellidos }}
                    </div>
                    <small class="text-muted">{{
                      tarea.asignadoA.cargo
                    }}</small>
                    <div>
                      <small class="text-muted">{{
                        tarea.asignadoA.email
                      }}</small>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold small">Departamento</label>
                <div class="text-muted">
                  <i class="bi bi-building me-2"></i
                  >{{ tarea.departamento.nombre }}
                  <div>
                    <small>{{ tarea.departamento.direccion.nombre }}</small>
                  </div>
                </div>
              </div>

              <div class="mb-0">
                <label class="form-label fw-bold small">Creado por</label>
                <div class="text-muted">
                  <i class="bi bi-person me-2"></i
                  >{{ tarea.creadoPor.nombres }} {{ tarea.creadoPor.apellidos }}
                </div>
              </div>
            </div>
          </div>

          <!-- Cronograma -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-transparent">
              <h5 class="mb-0">
                <i class="bi bi-calendar me-2"></i>Cronograma
              </h5>
            </div>
            <div class="card-body">
              <div class="timeline">
                <div class="timeline-item">
                  <div class="timeline-marker bg-primary"></div>
                  <div class="timeline-content">
                    <h6 class="mb-1">Tarea Creada</h6>
                    <small class="text-muted">{{
                      formatDate(tarea.fechaCreacion)
                    }}</small>
                  </div>
                </div>
                <div class="timeline-item">
                  <div
                    class="timeline-marker"
                    [class]="
                      tarea.estado !== 'pendiente'
                        ? 'bg-success'
                        : 'bg-secondary'
                    "
                  ></div>
                  <div class="timeline-content">
                    <h6 class="mb-1">Inicio Programado</h6>
                    <small class="text-muted">{{
                      formatDate(tarea.fechaInicio)
                    }}</small>
                  </div>
                </div>
                <div class="timeline-item">
                  <div
                    class="timeline-marker"
                    [class]="
                      tarea.estado === 'completada'
                        ? 'bg-success'
                        : isVencida(tarea.fechaVencimiento)
                        ? 'bg-danger'
                        : 'bg-secondary'
                    "
                  ></div>
                  <div class="timeline-content">
                    <h6 class="mb-1">Vencimiento</h6>
                    <small
                      [class]="
                        isVencida(tarea.fechaVencimiento)
                          ? 'text-danger fw-bold'
                          : 'text-muted'
                      "
                    >
                      {{ formatDate(tarea.fechaVencimiento) }}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Acciones Rápidas -->
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent">
              <h5 class="mb-0">
                <i class="bi bi-lightning me-2"></i>Acciones Rápidas
              </h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <button
                  class="btn btn-outline-success btn-sm"
                  *ngIf="tarea.estado !== 'completada'"
                  (click)="cambiarEstado('completada')"
                >
                  <i class="bi bi-check-circle me-2"></i>Marcar como Completada
                </button>
                <button
                  class="btn btn-outline-warning btn-sm"
                  *ngIf="tarea.estado === 'pendiente'"
                  (click)="cambiarEstado('en_progreso')"
                >
                  <i class="bi bi-play-circle me-2"></i>Iniciar Tarea
                </button>
                <button class="btn btn-outline-info btn-sm">
                  <i class="bi bi-chat me-2"></i>Agregar Comentario
                </button>
                <button class="btn btn-outline-secondary btn-sm">
                  <i class="bi bi-paperclip me-2"></i>Subir Archivo
                </button>
              </div>
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

      .timeline {
        position: relative;
        padding-left: 20px;
      }

      .timeline::before {
        content: '';
        position: absolute;
        left: 8px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #e9ecef;
      }

      .timeline-item {
        position: relative;
        margin-bottom: 20px;
      }

      .timeline-marker {
        position: absolute;
        left: -12px;
        top: 0;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 0 2px #e9ecef;
      }

      .timeline-content {
        margin-left: 15px;
      }

      .progress {
        border-radius: 10px;
      }
    `,
  ],
})
export class TareasDetailComponent implements OnInit {
  tarea: Tarea | null = null;
  tareaId: string | null = null;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.tareaId = this.route.snapshot.paramMap.get('id');
    this.loadTarea();
  }

  loadTarea(): void {
    // Mock data - en producción se cargaría desde el servicio
    this.tarea = {
      _id: '1',
      titulo: 'Revisión del Plan de Desarrollo Urbano',
      descripcion: `Revisar y actualizar el plan de desarrollo urbano para el sector norte de la ciudad, incluyendo:

• Análisis de factibilidad técnica y económica
• Propuestas de mejora en la infraestructura vial
• Estudio de impacto ambiental
• Consulta ciudadana y socialización del proyecto
• Elaboración de cronograma de ejecución

Esta tarea es de alta prioridad debido a los compromisos adquiridos con la comunidad y los organismos de control.`,
      estado: 'en_progreso',
      prioridad: 'alta',
      fechaInicio: new Date('2024-01-15'),
      fechaVencimiento: new Date('2024-02-15'),
      fechaCreacion: new Date('2024-01-10'),
      asignadoA: {
        _id: '1',
        nombres: 'María',
        apellidos: 'González',
        email: 'maria.gonzalez@municipio.gob.ec',
        cargo: 'Coordinadora de Planificación',
      },
      creadoPor: {
        _id: '2',
        nombres: 'Juan',
        apellidos: 'Pérez',
      },
      departamento: {
        _id: '1',
        nombre: 'Planificación Urbana',
        direccion: {
          _id: '1',
          nombre: 'Dirección de Planificación',
        },
      },
      etiquetas: ['urbanismo', 'desarrollo', 'planificación', 'prioritario'],
      progreso: 65,
      observaciones:
        'Proyecto prioritario para el desarrollo del cantón. Se requiere coordinación estrecha con el departamento de obras públicas.',
      archivos: [
        { nombre: 'Plan_Desarrollo_V1.pdf', tamano: '2,450' },
        { nombre: 'Estudio_Factibilidad.xlsx', tamano: '890' },
      ],
    };
  }

  getInitials(nombre: string): string {
    return nombre
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'completada':
        return 'bg-success';
      case 'en_progreso':
        return 'bg-primary';
      case 'pendiente':
        return 'bg-warning';
      case 'cancelada':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getPrioridadBadgeClass(prioridad: string): string {
    switch (prioridad) {
      case 'urgente':
        return 'bg-danger';
      case 'alta':
        return 'bg-warning';
      case 'media':
        return 'bg-info';
      case 'baja':
        return 'bg-secondary';
      default:
        return 'bg-light text-dark';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_progreso':
        return 'En Progreso';
      case 'completada':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return estado;
    }
  }

  getPrioridadTexto(prioridad: string): string {
    switch (prioridad) {
      case 'baja':
        return 'Baja';
      case 'media':
        return 'Media';
      case 'alta':
        return 'Alta';
      case 'urgente':
        return 'Urgente';
      default:
        return prioridad;
    }
  }

  getProgresoBg(progreso: number): string {
    if (progreso === 100) return 'bg-success';
    if (progreso >= 70) return 'bg-info';
    if (progreso >= 40) return 'bg-warning';
    return 'bg-danger';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  isVencida(fecha: Date): boolean {
    return new Date(fecha) < new Date();
  }

  getDiasRestantes(fecha: Date): number {
    const hoy = new Date();
    const vencimiento = new Date(fecha);
    const diferencia = vencimiento.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  editarTarea(): void {
    this.router.navigate(['/tareas', this.tareaId, 'editar']);
  }

  eliminarTarea(): void {
    if (confirm('¿Está seguro de eliminar esta tarea?')) {
      console.log('Eliminar tarea:', this.tareaId);
      this.goBack();
    }
  }

  cambiarEstado(nuevoEstado: string): void {
    if (this.tarea) {
      this.tarea.estado = nuevoEstado as any;
      if (nuevoEstado === 'completada') {
        this.tarea.progreso = 100;
      } else if (nuevoEstado === 'en_progreso' && this.tarea.progreso === 0) {
        this.tarea.progreso = 25;
      }
      console.log('Cambiar estado a:', nuevoEstado);
    }
  }

  goBack(): void {
    this.router.navigate(['/tareas']);
  }
}
