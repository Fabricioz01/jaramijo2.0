import { Routes } from '@angular/router';
import { FilesListComponent } from './files-list/files-list.component';

export const filesRoutes: Routes = [
  {
    path: '',
    component: FilesListComponent,
    title: 'Gestión de Archivos',
  },
];
