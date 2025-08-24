import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginGuard } from './core/guards/login.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/tareas-home',
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
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
    canActivate: [LoginGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
    canActivate: [LoginGuard],
  },
  {
    path: 'tareas-home',
    loadComponent: () =>
      import('./features/tareas/tareas-home/tareas-home.component').then(
        (m) => m.TareasHomeComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'direcciones',
    loadChildren: () =>
      import('./features/direcciones/direcciones.routes').then(
        (m) => m.DIRECCIONES_ROUTES
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'departamentos',
    loadChildren: () =>
      import('./features/departamentos/departamentos.routes').then(
        (m) => m.departamentosRoutes
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'usuarios',
    loadChildren: () =>
      import('./features/usuarios/usuarios.routes').then(
        (m) => m.usuariosRoutes
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'roles',
    loadChildren: () =>
      import('./features/roles/roles.routes').then((m) => m.rolesRoutes),
    canActivate: [AuthGuard],
  },
  {
    path: 'tareas',
    loadChildren: () =>
      import('./features/tareas/tareas.routes').then((m) => m.tareasRoutes),
    canActivate: [AuthGuard],
  },
  {
    path: 'archivos',
    loadChildren: () =>
      import('./features/files/files.routes').then((m) => m.filesRoutes),
    canActivate: [AuthGuard],
  },
  {
    path: 'notificaciones',
    loadComponent: () =>
      import('./features/notifications/notifications.component').then(
        (m) => m.NotificationsComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'usuarios/perfil',
    loadComponent: () =>
      import('./features/usuarios/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [AuthGuard],
  },

  {
    path: '**',
    redirectTo: '/tareas-home',
  },
];
