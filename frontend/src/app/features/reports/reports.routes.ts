import { Routes } from '@angular/router';
import { ReportsDashboardComponent } from './reports-dashboard/reports-dashboard.component';

export const reportsRoutes: Routes = [
  {
    path: '',
    component: ReportsDashboardComponent,
    title: 'Reportes y Estadísticas',
  },
];
