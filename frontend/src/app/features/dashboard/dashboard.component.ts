import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AlertsComponent } from '../../shared/components/alerts/alerts.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

import {
  ReportsService,
  ReportData,
} from '../../core/services/reports.service';
import { DashboardChartsComponent } from './dashboard-charts.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AlertsComponent,
    HeaderComponent,
    DashboardChartsComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  user: any = null;
  report: ReportData | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private reportsService: ReportsService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
    });
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.reportsService.getGeneralReport().subscribe((report) => {
      this.report = report;
    });
  }

  getTareasActivas(): number {
    const enProgreso =
      this.report?.tareas.porEstado.find((e) => e.estado === 'En Progreso')
        ?.cantidad ?? 0;
    const pendiente =
      this.report?.tareas.porEstado.find((e) => e.estado === 'Pendiente')
        ?.cantidad ?? 0;
    return enProgreso + pendiente;
  }
  getTareasCompletadas(): number {
    return (
      this.report?.tareas.porEstado.find((e) => e.estado === 'Completada')
        ?.cantidad ?? 0
    );
  }
  getTareasPendientes(): number {
    return (
      this.report?.tareas.porEstado.find((e) => e.estado === 'Pendiente')
        ?.cantidad ?? 0
    );
  }
  getUsuariosActivos(): number {
    return this.report?.usuarios.activos ?? 0;
  }

  logout(): void {
    this.authService.logout().subscribe({
      complete: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
