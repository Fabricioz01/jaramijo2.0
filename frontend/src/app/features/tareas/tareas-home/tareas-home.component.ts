import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';

import { Task, TaskStatus } from '../../../core/models';
import { TaskService, AlertService } from '../../../core/services';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { ResolveTaskModalComponent } from '../tareas-resueltas/resolve-task-modal.component';

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasTasks: boolean;
  tasks: Task[];
  date: Date;
}

interface SelectedDayTasks {
  date: Date;
  tasks: Task[];
}

@Component({
  selector: 'app-tareas-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    HeaderComponent,
    ResolveTaskModalComponent,
  ],
  templateUrl: './tareas-home.component.html',
  styleUrl: './tareas-home.component.scss',
})
export class TareasHomeComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  loading = false;
  selectedStatus: 'all' | 'pending' | 'in_progress' = 'all';
  expandedTasks = new Set<string>();

  // Resolve modal properties
  showResolveModal = false;
  selectedTaskForResolve: Task | null = null;

  // Calendar properties
  currentDate = new Date();
  calendarDays: CalendarDay[] = [];
  daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  selectedDayTasks: SelectedDayTasks | null = null;

  constructor(
    private taskService: TaskService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.generateCalendar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Filtrar solo tareas 'pending' e 'in_progress'
          this.tasks = (response.data || []).filter(
            (task) => task.status === 'pending' || task.status === 'in_progress'
          );
          this.filterTasks();
          this.generateCalendar();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
          this.loading = false;
        },
      });
  }

  filterByStatus(status: 'all' | 'pending' | 'in_progress'): void {
    this.selectedStatus = status;
    this.filterTasks();
  }

  private filterTasks(): void {
    if (this.selectedStatus === 'all') {
      this.filteredTasks = [...this.tasks];
    } else {
      this.filteredTasks = this.tasks.filter(
        (task) => task.status === this.selectedStatus
      );
    }
  }

  toggleDescription(taskId: string): void {
    if (this.expandedTasks.has(taskId)) {
      this.expandedTasks.delete(taskId);
    } else {
      this.expandedTasks.add(taskId);
    }
  }

  viewTaskDetail(taskId: string): void {
    this.router.navigate(['/tareas', taskId, 'ver']);
  }

  goToDelivery(taskId: string): void {
    const task = this.tasks.find((t) => t._id === taskId);
    if (task) {
      this.selectedTaskForResolve = task;
      this.showResolveModal = true;
    }
  }

  closeResolveModal(): void {
    this.showResolveModal = false;
    this.selectedTaskForResolve = null;
  }

  onResolveTask(file: File): void {
    if (!this.selectedTaskForResolve) return;

    this.taskService
      .resolveTask(this.selectedTaskForResolve._id, file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.alertService.success('Tarea resuelta exitosamente');
          this.showResolveModal = false;
          this.selectedTaskForResolve = null;
          // Recargar las tareas para actualizar la lista
          this.loadTasks();
        },
        error: (error) => {
          console.error('Error resolving task:', error);
          this.alertService.error('Error al resolver la tarea');
        },
      });
  }

  // Status helper methods
  getStatusClass(status: TaskStatus): string {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'in_progress':
        return 'in_progress';
      default:
        return '';
    }
  }

  getStatusIcon(status: TaskStatus): string {
    switch (status) {
      case 'pending':
        return 'schedule';
      case 'in_progress':
        return 'update';
      default:
        return 'help_outline';
    }
  }

  getStatusLabel(status: TaskStatus): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'in_progress':
        return 'En Progreso';
      default:
        return status;
    }
  }

  // Date helper methods
  isOverdue(dueDate?: Date): boolean {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }

  isDueSoon(dueDate?: Date): boolean {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const threeDaysFromNow = new Date(
      today.getTime() + 3 * 24 * 60 * 60 * 1000
    );

    return due >= today && due <= threeDaysFromNow && !this.isOverdue(dueDate);
  }

  formatDueDate(dueDate?: Date): string {
    if (!dueDate) return '';

    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Reset hours for accurate comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return 'Hoy';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Mañana';
    } else if (this.isOverdue(dueDate)) {
      const diffTime = today.getTime() - date.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    }
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

  getNoTasksMessage(): string {
    switch (this.selectedStatus) {
      case 'pending':
        return 'pendientes';
      case 'in_progress':
        return 'en progreso';
      default:
        return 'activas';
    }
  }

  // Calendar methods
  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Get first day of month and last day
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get first day of calendar (might be from previous month)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Generate calendar days
    this.calendarDays = [];
    const currentDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dayTasks = this.getTasksForDate(currentDate);

      this.calendarDays.push({
        day: currentDate.getDate(),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.getTime() === today.getTime(),
        hasTasks: dayTasks.length > 0,
        tasks: dayTasks,
        date: new Date(currentDate),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  private getTasksForDate(date: Date): Task[] {
    return this.tasks.filter((task) => {
      if (!task.dueDate) return false;

      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);

      return taskDate.getTime() === compareDate.getTime();
    });
  }

  previousMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  getMonthYearText(): string {
    return this.currentDate.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
    });
  }

  openTasksModal(day: CalendarDay): void {
    if (day.hasTasks) {
      this.selectedDayTasks = {
        date: day.date,
        tasks: day.tasks,
      };
    }
  }

  closeTasksModal(): void {
    this.selectedDayTasks = null;
  }
}
