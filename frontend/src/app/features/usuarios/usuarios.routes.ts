import { Routes } from '@angular/router';

export const usuariosRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./usuarios-list/usuarios-list.component').then(
        (m) => m.UsuariosListComponent
      ),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./usuarios-form/usuarios-form.component').then(
        (m) => m.UsuariosFormComponent
      ),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./usuarios-form/usuarios-form.component').then(
        (m) => m.UsuariosFormComponent
      ),
  },
];
