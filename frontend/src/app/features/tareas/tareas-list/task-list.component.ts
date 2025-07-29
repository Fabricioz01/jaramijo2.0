import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { AlertService } from '../../../core/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { Task } from '../../../core/models';
import { ConfirmModalComponent } from '../../../shared/components/alerts/confirm-modal.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderComponent,
    ConfirmModalComponent,
  ],
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  filterForm: FormGroup;
  loading = false;

  openedMenuIndex: number | null = null;
  showConfirmModal = false;
  selectedTaskId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private taskService: TaskService,
    private alertService: AlertService,
    public authService: AuthService
  ) {
    this.filterForm = this.fb.group({
      buscar: [''],
    });
  }

  ngOnInit(): void {
    this.loadTasks();
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getAll().subscribe({
      next: (res) => {
        this.tasks = res.data ?? [];
        this.filteredTasks = [...this.tasks];
        this.loading = false;
      },
      error: () => {
        this.alertService.error('Error al cargar tareas');
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    const { buscar } = this.filterForm.value;
    this.filteredTasks = this.tasks.filter((task) =>
      !buscar ? true : task.title.toLowerCase().includes(buscar.toLowerCase())
    );
  }

  eliminarTarea(id: string): void {
    this.selectedTaskId = id;
    this.showConfirmModal = true;
  }

  confirmarEliminarTarea(): void {
    if (!this.selectedTaskId) return;
    this.taskService.delete(this.selectedTaskId).subscribe({
      next: () => {
        this.alertService.success('Tarea eliminada exitosamente');
        this.loadTasks();
        this.cancelarEliminarTarea();
      },
      error: () => {
        this.alertService.error('Error al eliminar tarea');
        this.cancelarEliminarTarea();
      },
    });
  }

  cancelarEliminarTarea(): void {
    this.showConfirmModal = false;
    this.selectedTaskId = null;
  }

  verTarea(id: string): void {
    this.router.navigate(['/tareas', id, 'ver']);
  }

  editarTarea(id: string): void {
    this.router.navigate(['/tareas', id, 'editar']);
  }

  crearTarea(): void {
    this.router.navigate(['/tareas/nueva']);
  }

  formatDate(date?: Date): string {
    return date ? new Date(date).toLocaleDateString('es-ES') : 'Sin fecha';
  }

  toggleMenu(i: number, e: Event): void {
    e.stopPropagation();
    this.openedMenuIndex = this.openedMenuIndex === i ? null : i;
  }

  closeMenu(): void {
    this.openedMenuIndex = null;
  }

  @HostListener('document:click')
  onDocClick(): void {
    this.closeMenu();
  }
}
