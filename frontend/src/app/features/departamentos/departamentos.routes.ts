import { Routes } from '@angular/router';

export const departamentosRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./departamentos-list/departamentos-list.component').then(
        (m) => m.DepartamentosListComponent
      ),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./departamentos-form/departamentos-form.component').then(
        (m) => m.DepartamentosFormComponent
      ),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./departamentos-form/departamentos-form.component').then(
        (m) => m.DepartamentosFormComponent
      ),
  },
];
