// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ReportsService, ReportData } from '../../../core/services';
// import { AlertService } from '../../../core/services';
// import { AuthService } from '../../../core/services/auth.service';

// @Component({
//   selector: 'app-reports-dashboard',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   template: `
//     <div class="container-fluid" *ngIf="canAccessModule()">
//       <div class="row">
//         <div class="col-12">
//           <div class="d-flex justify-content-between align-items-center mb-4">
//             <h1 class="h3 mb-0">
//               <i class="bi bi-graph-up me-2"></i>
//               Reportes y Estadísticas
//             </h1>
//             <div class="btn-group">
//               <button
//                 class="btn btn-outline-primary"
//                 (click)="exportReport('excel')"
//                 *ngIf="canExportReport()"
//               >
//                 <i class="bi bi-file-earmark-excel me-2"></i>
//                 Exportar Excel
//               </button>
//               <button
//                 class="btn btn-outline-danger"
//                 (click)="exportReport('pdf')"
//                 *ngIf="canExportReport()"
//               >
//                 <i class="bi bi-file-earmark-pdf me-2"></i>
//                 Exportar PDF
//               </button>
//             </div>
//           </div>

//           <!-- Filtros de fecha -->
//           <div class="card mb-4">
//             <div class="card-body">
//               <div class="row g-3">
//                 <div class="col-md-3">
//                   <label class="form-label">Desde</label>
//                   <input
//                     type="date"
//                     class="form-control"
//                     [(ngModel)]="filtros.fechaInicio"
//                     (change)="actualizarReporte()"
//                   />
//                 </div>
//                 <div class="col-md-3">
//                   <label class="form-label">Hasta</label>
//                   <input
//                     type="date"
//                     class="form-control"
//                     [(ngModel)]="filtros.fechaFin"
//                     (change)="actualizarReporte()"
//                   />
//                 </div>
//                 <div class="col-md-3">
//                   <label class="form-label">Período</label>
//                   <select
//                     class="form-select"
//                     [(ngModel)]="filtros.periodo"
//                     (change)="aplicarPeriodo()"
//                   >
//                     <option value="">Personalizado</option>
//                     <option value="hoy">Hoy</option>
//                     <option value="semana">Última semana</option>
//                     <option value="mes">Último mes</option>
//                     <option value="trimestre">Último trimestre</option>
//                     <option value="año">Último año</option>
//                   </select>
//                 </div>
//                 <div class="col-md-3 d-flex align-items-end">
//                   <button
//                     class="btn btn-primary w-100"
//                     (click)="actualizarReporte()"
//                     [disabled]="cargando"
//                   >
//                     <span
//                       *ngIf="cargando"
//                       class="spinner-border spinner-border-sm me-2"
//                     ></span>
//                     <i *ngIf="!cargando" class="bi bi-arrow-clockwise me-2"></i>
//                     Actualizar
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <!-- Métricas principales -->
//           <div class="row mb-4">
//             <div class="col-lg-3 col-md-6 mb-3">
//               <div class="card bg-primary text-white h-100">
//                 <div class="card-body">
//                   <div
//                     class="d-flex justify-content-between align-items-center"
//                   >
//                     <div>
//                       <h5 class="card-title">Total Tareas</h5>
//                       <h2 class="mb-0">{{ getTareasTotal() }}</h2>
//                     </div>
//                     <i class="bi bi-list-task display-4"></i>
//                   </div>
//                   <div class="mt-3">
//                     <small>
//                       <i class="bi bi-check-circle me-1"></i>
//                       {{ getTareasCompletadas() }} completadas
//                     </small>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div class="col-lg-3 col-md-6 mb-3">
//               <div class="card bg-success text-white h-100">
//                 <div class="card-body">
//                   <div
//                     class="d-flex justify-content-between align-items-center"
//                   >
//                     <div>
//                       <h5 class="card-title">Usuarios Activos</h5>
//                       <h2 class="mb-0">{{ getUsuariosActivos() }}</h2>
//                     </div>
//                     <i class="bi bi-people display-4"></i>
//                   </div>
//                   <div class="mt-3">
//                     <small>
//                       de {{ getUsuariosTotal() }} usuarios totales
//                     </small>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div class="col-lg-3 col-md-6 mb-3">
//               <div class="card bg-info text-white h-100">
//                 <div class="card-body">
//                   <div
//                     class="d-flex justify-content-between align-items-center"
//                   >
//                     <div>
//                       <h5 class="card-title">Archivos</h5>
//                       <h2 class="mb-0">{{ getArchivosTotal() }}</h2>
//                     </div>
//                     <i class="bi bi-files display-4"></i>
//                   </div>
//                   <div class="mt-3">
//                     <small>
//                       {{ formatFileSize(getArchivosTamanioTotal()) }} totales
//                     </small>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div class="col-lg-3 col-md-6 mb-3">
//               <div class="card bg-warning text-white h-100">
//                 <div class="card-body">
//                   <div
//                     class="d-flex justify-content-between align-items-center"
//                   >
//                     <div>
//                       <h5 class="card-title">Tiempo Promedio</h5>
//                       <h2 class="mb-0">{{ getTiempoPromedioComplecion() }}</h2>
//                     </div>
//                     <i class="bi bi-clock display-4"></i>
//                   </div>
//                   <div class="mt-3">
//                     <small>días para completar tareas</small>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <!-- Gráficos -->
//           <div class="row">
//             <!-- Tareas por Estado -->
//             <div class="col-lg-6 mb-4">
//               <div class="card h-100">
//                 <div class="card-header">
//                   <h5 class="mb-0">
//                     <i class="bi bi-pie-chart me-2"></i>
//                     Tareas por Estado
//                   </h5>
//                 </div>
//                 <div class="card-body">
//                   <div class="chart-container" style="height: 300px;">
//                     <canvas #chartTareasEstado></canvas>
//                   </div>
//                   <div class="mt-3">
//                     <div class="row text-center">
//                       <div
//                         class="col-3"
//                         *ngFor="let item of getTareasPorEstado()"
//                       >
//                         <div class="mb-2">
//                           <div
//                             class="badge"
//                             [class.bg-success]="item.estado === 'Completada'"
//                             [class.bg-warning]="item.estado === 'En Progreso'"
//                             [class.bg-secondary]="item.estado === 'Pendiente'"
//                             [class.bg-danger]="item.estado === 'Vencida'"
//                           >
//                             {{ item.cantidad }}
//                           </div>
//                         </div>
//                         <small class="text-muted">{{ item.estado }}</small>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <!-- Tareas por Prioridad -->
//             <div class="col-lg-6 mb-4">
//               <div class="card h-100">
//                 <div class="card-header">
//                   <h5 class="mb-0">
//                     <i class="bi bi-bar-chart me-2"></i>
//                     Tareas por Prioridad
//                   </h5>
//                 </div>
//                 <div class="card-body">
//                   <div class="chart-container" style="height: 300px;">
//                     <canvas #chartTareasPrioridad></canvas>
//                   </div>
//                   <div class="mt-3">
//                     <div class="row text-center">
//                       <div
//                         class="col-4"
//                         *ngFor="let item of getTareasPorPrioridad()"
//                       >
//                         <div class="mb-2">
//                           <div
//                             class="badge"
//                             [class.bg-danger]="item.prioridad === 'Alta'"
//                             [class.bg-warning]="item.prioridad === 'Media'"
//                             [class.bg-success]="item.prioridad === 'Baja'"
//                           >
//                             {{ item.cantidad }}
//                           </div>
//                         </div>
//                         <small class="text-muted">{{ item.prioridad }}</small>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <!-- Rendimiento mensual -->
//           <div class="row">
//             <div class="col-12 mb-4">
//               <div class="card">
//                 <div class="card-header">
//                   <h5 class="mb-0">
//                     <i class="bi bi-graph-up-arrow me-2"></i>
//                     Rendimiento Mensual
//                   </h5>
//                 </div>
//                 <div class="card-body">
//                   <div class="chart-container" style="height: 400px;">
//                     <canvas #chartRendimientoMensual></canvas>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <!-- Tablas de datos -->
//           <div class="row">
//             <!-- Usuarios más activos -->
//             <div class="col-lg-6 mb-4">
//               <div class="card">
//                 <div class="card-header">
//                   <h5 class="mb-0">
//                     <i class="bi bi-trophy me-2"></i>
//                     Usuarios Más Activos
//                   </h5>
//                 </div>
//                 <div class="card-body">
//                   <div class="table-responsive">
//                     <table class="table table-sm">
//                       <thead>
//                         <tr>
//                           <th>#</th>
//                           <th>Usuario</th>
//                           <th>Tareas</th>
//                           <th>%</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         <tr
//                           *ngFor="
//                             let usuario of getUsuariosMasActivos();
//                             let i = index
//                           "
//                         >
//                           <td>
//                             <span
//                               class="badge"
//                               [class.bg-warning]="i === 0"
//                               [class.bg-secondary]="i === 1"
//                               [class.bg-dark]="i === 2"
//                               [class.bg-light]="i > 2"
//                               [class.text-dark]="i > 2"
//                             >
//                               {{ i + 1 }}
//                             </span>
//                           </td>
//                           <td>{{ usuario.usuario }}</td>
//                           <td>{{ usuario.tareas }}</td>
//                           <td>
//                             <div class="progress" style="height: 15px;">
//                               <div
//                                 class="progress-bar"
//                                 [style.width.%]="
//                                   calculatePercentage(
//                                     usuario.tareas,
//                                     getTareasCompletadas()
//                                   )
//                                 "
//                               >
//                                 {{
//                                   calculatePercentage(
//                                     usuario.tareas,
//                                     getTareasCompletadas()
//                                   )
//                                 }}%
//                               </div>
//                             </div>
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <!-- Tareas por Departamento -->
//             <div class="col-lg-6 mb-4">
//               <div class="card">
//                 <div class="card-header">
//                   <h5 class="mb-0">
//                     <i class="bi bi-building me-2"></i>
//                     Tareas por Departamento
//                   </h5>
//                 </div>
//                 <div class="card-body">
//                   <div class="table-responsive">
//                     <table class="table table-sm">
//                       <thead>
//                         <tr>
//                           <th>Departamento</th>
//                           <th>Tareas</th>
//                           <th>%</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         <tr *ngFor="let dept of getTareasPorDepartamento()">
//                           <td>{{ dept.departamento }}</td>
//                           <td>{{ dept.cantidad }}</td>
//                           <td>
//                             <div class="progress" style="height: 15px;">
//                               <div
//                                 class="progress-bar bg-info"
//                                 [style.width.%]="
//                                   calculatePercentage(
//                                     dept.cantidad,
//                                     getTareasTotal()
//                                   )
//                                 "
//                               >
//                                 {{
//                                   calculatePercentage(
//                                     dept.cantidad,
//                                     getTareasTotal()
//                                   )
//                                 }}%
//                               </div>
//                             </div>
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [
//     `
//       .card {
//         box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//         border: none;
//       }

//       .card-header {
//         background-color: #f8f9fa;
//         border-bottom: 1px solid #dee2e6;
//       }

//       .chart-container {
//         position: relative;
//         width: 100%;
//       }

//       .badge {
//         font-size: 0.875rem;
//         padding: 0.5em 0.75em;
//       }

//       .progress {
//         background-color: #e9ecef;
//       }

//       .display-4 {
//         opacity: 0.7;
//       }

//       .table-sm td {
//         vertical-align: middle;
//       }
//     `,
//   ],
// })
// export class ReportsDashboardComponent implements OnInit {
//   reportData: ReportData | null = null;
//   cargando = false;

//   filtros = {
//     fechaInicio: '',
//     fechaFin: '',
//     periodo: '',
//   };

//   constructor(
//     private reportsService: ReportsService,
//     private alertService: AlertService,
//     public authService: AuthService
//   ) {}

//   ngOnInit(): void {
//     this.filtros.periodo = 'mes';
//     this.aplicarPeriodo();
//     this.cargarReportData();
//   }

//   aplicarPeriodo(): void {
//     const hoy = new Date();
//     let fechaInicio: Date;

//     switch (this.filtros.periodo) {
//       case 'hoy':
//         fechaInicio = new Date(hoy);
//         break;
//       case 'semana':
//         fechaInicio = new Date(hoy);
//         fechaInicio.setDate(hoy.getDate() - 7);
//         break;
//       case 'mes':
//         fechaInicio = new Date(hoy);
//         fechaInicio.setMonth(hoy.getMonth() - 1);
//         break;
//       case 'trimestre':
//         fechaInicio = new Date(hoy);
//         fechaInicio.setMonth(hoy.getMonth() - 3);
//         break;
//       case 'año':
//         fechaInicio = new Date(hoy);
//         fechaInicio.setFullYear(hoy.getFullYear() - 1);
//         break;
//       default:
//         return;
//     }

//     this.filtros.fechaInicio = fechaInicio.toISOString().split('T')[0];
//     this.filtros.fechaFin = hoy.toISOString().split('T')[0];
//   }

//   cargarReportData(): void {
//     this.cargando = true;

//     const fechaInicio = this.filtros.fechaInicio
//       ? new Date(this.filtros.fechaInicio)
//       : undefined;
//     const fechaFin = this.filtros.fechaFin
//       ? new Date(this.filtros.fechaFin)
//       : undefined;

//     this.reportsService.getGeneralReport(fechaInicio, fechaFin).subscribe({
//       next: (data) => {
//         this.reportData = data;
//         this.cargando = false;
//         this.alertService.success('Reporte actualizado correctamente');
//       },
//       error: (error) => {
//         console.error('Error al cargar reportes:', error);
//         // Si hay error en la API, cargar datos demo
//         const demoData = this.reportsService.generateDemoData();
//         this.reportData = demoData;
//         this.cargando = false;
//         this.alertService.warning('Usando datos de demostración');
//       },
//     });
//   }

//   actualizarReporte(): void {
//     this.cargarReportData();
//   }

//   exportReport(format: 'excel' | 'pdf'): void {
//     this.alertService.info(
//       `Generando reporte en formato ${format.toUpperCase()}...`
//     );

//     if (!this.reportData) {
//       this.alertService.error('No hay datos para exportar');
//       return;
//     }

//     this.reportsService.exportReport(format, this.reportData).subscribe({
//       next: (blob) => {
//         const filename = `reporte_${new Date().toISOString().split('T')[0]}`;
//         this.reportsService.downloadReport(filename, blob, format);
//         this.alertService.success(`Reporte exportado exitosamente`);
//       },
//       error: (error) => {
//         console.error('Error al exportar:', error);
//         this.alertService.error('Error al exportar el reporte');
//       },
//     });
//   }

//   formatFileSize(bytes: number): string {
//     return this.reportsService.formatFileSize(bytes);
//   }

//   calculatePercentage(value: number, total: number): number {
//     return this.reportsService.calculatePercentage(value, total);
//   }

//   getTareasTotal(): number {
//     return this.reportData?.tareas?.total || 0;
//   }

//   getTareasCompletadas(): number {
//     return this.reportData?.tareas?.completadas || 0;
//   }

//   getUsuariosActivos(): number {
//     return this.reportData?.usuarios?.activos || 0;
//   }

//   getUsuariosTotal(): number {
//     return this.reportData?.usuarios?.total || 0;
//   }

//   getArchivosTotal(): number {
//     return this.reportData?.archivos?.total || 0;
//   }

//   getArchivosTamanioTotal(): number {
//     return this.reportData?.archivos?.tamanioTotal || 0;
//   }

//   getTiempoPromedioComplecion(): number {
//     return this.reportData?.rendimiento?.tiempoPromedioComplecion || 0;
//   }

//   getTareasPorEstado(): any[] {
//     return this.reportData?.tareas?.porEstado || [];
//   }

//   getTareasPorPrioridad(): any[] {
//     return this.reportData?.tareas?.porPrioridad || [];
//   }

//   getUsuariosMasActivos(): any[] {
//     return this.reportData?.rendimiento?.usuariosMasActivos || [];
//   }

//   getTareasPorDepartamento(): any[] {
//     return this.reportData?.tareas?.porDepartamento || [];
//   }

//   canAccessModule(): boolean {
//     return this.authService.canAccessModule('reportes');
//   }
//   canExportReport(): boolean {
//     return this.authService.canAccessAction('reportes', 'export');
//   }
// }
