import { Routes } from '@angular/router';

export const rolesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./roles-list/roles-list.component').then(
        (m) => m.RolesListComponent
      ),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./roles-form/roles-form.component').then(
        (m) => m.RolesFormComponent
      ),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./roles-form/roles-form.component').then(
        (m) => m.RolesFormComponent
      ),
  },
];
