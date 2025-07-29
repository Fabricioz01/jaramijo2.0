import { Routes } from '@angular/router';

export const tareasRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./tareas-list/task-list.component').then(
        (m) => m.TaskListComponent
      ),
  },
  {
    path: 'nueva',
    loadComponent: () =>
      import('./tareas-form/tareas-form.component').then(
        (m) => m.TareasFormComponent
      ),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./tareas-form/tareas-form.component').then(
        (m) => m.TareasFormComponent
      ),
  },
  {
    path: ':id/ver',
    loadComponent: () =>
      import('./tareas-detail/tareas-detail.component').then(
        (m) => m.TareasDetailComponent
      ),
  },
];
