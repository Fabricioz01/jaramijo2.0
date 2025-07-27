import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginGuard } from './core/guards/login.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
    canActivate: [LoginGuard],
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/components/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'direcciones',
        loadChildren: () =>
          import('./features/direcciones/direcciones.routes').then(
            (m) => m.DIRECCIONES_ROUTES
          ),
      },
      {
        path: 'departamentos',
        loadChildren: () =>
          import('./features/departamentos/departamentos.routes').then(
            (m) => m.departamentosRoutes
          ),
      },
      {
        path: 'usuarios',
        loadChildren: () =>
          import('./features/usuarios/usuarios.routes').then(
            (m) => m.usuariosRoutes
          ),
      },
      {
        path: 'roles',
        loadChildren: () =>
          import('./features/roles/roles.routes').then((m) => m.rolesRoutes),
      },
      {
        path: 'tareas',
        loadChildren: () =>
          import('./features/tareas/tareas.routes').then((m) => m.tareasRoutes),
      },
      {
        path: 'archivos',
        loadChildren: () =>
          import('./features/files/files.routes').then((m) => m.filesRoutes),
      },
      {
        path: 'reportes',
        loadChildren: () =>
          import('./features/reports/reports.routes').then(
            (m) => m.reportsRoutes
          ),
      },
      {
        path: 'dashboard/usuarios/perfil',
        loadComponent: () =>
          import('./features/usuarios/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
      {
        path: 'dashboard/configuracion',
        loadComponent: () =>
          import('./features/configuracion/configuracion.component').then(
            (m) => m.ConfiguracionComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
