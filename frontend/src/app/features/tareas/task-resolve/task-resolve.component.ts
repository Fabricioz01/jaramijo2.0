import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';

import { Task } from '../../../core/models';
import { TaskService, AlertService } from '../../../core/services';
import { ResolveTaskModalComponent } from '../tareas-resueltas/resolve-task-modal.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-task-resolve',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ResolveTaskModalComponent,
    HeaderComponent,
  ],
  templateUrl: './task-resolve.component.html',
  styleUrl: './task-resolve.component.scss',
})
export class TaskResolveComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  task: Task | null = null;
  loading = false;
  showResolveModal = false;
  taskId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.taskId = params['id'];
      if (this.taskId) {
        this.loadTask();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTask(): void {
    this.loading = true;
    this.taskService
      .getById(this.taskId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.task = response.data || null;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading task:', error);
          this.alertService.error('Error al cargar la tarea');
          this.loading = false;
          this.router.navigate(['/tareas-home']);
        },
      });
  }

  openResolveModal(): void {
    this.showResolveModal = true;
  }

  closeResolveModal(): void {
    this.showResolveModal = false;
  }

  onResolveTask(file: File): void {
    this.taskService
      .resolveTask(this.taskId, file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.alertService.success('Tarea resuelta exitosamente');
          this.showResolveModal = false;
          this.router.navigate(['/tareas-home']);
        },
        error: (error) => {
          console.error('Error resolving task:', error);
          this.alertService.error('Error al resolver la tarea');
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/tareas-home']);
  }

  formatDueDate(dueDate?: Date): string {
    if (!dueDate) return '';

    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return 'Hoy';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Mañana';
    } else if (date < today) {
      const diffTime = today.getTime() - date.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `Vencida hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'in_progress':
        return 'status-progress';
      case 'completed':
        return 'status-completed';
      case 'resolved':
        return 'status-resolved';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'in_progress':
        return 'En Progreso';
      case 'completed':
        return 'Completada';
      case 'resolved':
        return 'Resuelta';
      default:
        return status;
    }
  }

  isOverdue(dueDate?: Date): boolean {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }

  getAssignedUsersText(assignedUsers: any[]): string {
    if (!assignedUsers || assignedUsers.length === 0) {
      return 'Sin asignar';
    }

    if (assignedUsers.length === 1) {
      return assignedUsers[0].name;
    } else if (assignedUsers.length === 2) {
      return `${assignedUsers[0].name} y ${assignedUsers[1].name}`;
    } else {
      return `${assignedUsers[0].name} y ${assignedUsers.length - 1} más`;
    }
  }
}
