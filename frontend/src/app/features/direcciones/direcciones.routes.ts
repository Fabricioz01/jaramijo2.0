import { Routes } from '@angular/router';

export const DIRECCIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./direcciones-list/direcciones-list.component').then(
        (m) => m.DireccionesListComponent
      ),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./direcciones-form/direcciones-form.component').then(
        (m) => m.DireccionesFormComponent
      ),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./direcciones-form/direcciones-form.component').then(
        (m) => m.DireccionesFormComponent
      ),
  },
];
