import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../core/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  loading = true;
  private subscription = new Subscription();

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
    }
  }

  ngOnInit(): void {
    this.subscription.add(
      this.notificationService.notifications$.subscribe(
        (notifications: Notification[]) => {
          this.notifications = notifications;
          this.loading = false;
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification._id || index.toString();
  }

  markAsRead(notification: Notification): void {
    if (!notification.read && notification._id) {
      this.notificationService.markAsRead(notification._id).subscribe({
        next: () => {
          notification.read = true;
        },
        error: (error) => {
          console.error('Error al marcar notificación como leída:', error);
        },
      });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach((n) => (n.read = true));
      },
      error: (error) => {
        console.error(
          'Error al marcar todas las notificaciones como leídas:',
          error
        );
      },
    });
  }

  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (notification._id) {
      this.notificationService.deleteNotification(notification._id).subscribe({
        next: () => {
          // La actualización se manejará automáticamente por el observable
        },
        error: (error) => {
          console.error('Error al eliminar notificación:', error);
        },
      });
    }
  }

  navigateToTask(notification: Notification): void {
    if (notification.taskId) {
      // Marcar como leída al hacer clic
      this.markAsRead(notification);

      // Navegar a las tareas
      this.router.navigate(['/tareas'], {
        queryParams: { taskId: notification.taskId },
      });
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'task_assigned':
        return 'bi bi-inbox';
      case 'task_due_today':
        return 'bi bi-clock-history';
      case 'task_overdue':
        return 'bi bi-exclamation-triangle-fill';
      default:
        return 'bi bi-bell-fill';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'task_assigned':
        return 'text-primary';
      case 'task_due_today':
        return 'text-warning';
      case 'task_overdue':
        return 'text-danger';
      default:
        return 'text-primary';
    }
  }

  getTimeAgo(date: Date): string {
    return this.notificationService.getTimeAgo(date);
  }

  getNotificationTitle(type: string): string {
    switch (type) {
      case 'task_assigned':
        return 'Nueva tarea asignada';
      case 'task_due_today':
        return 'Tarea vence hoy';
      case 'task_overdue':
        return 'Tarea vencida';
      default:
        return 'Notificación';
    }
  }

  hasUnreadNotifications(): boolean {
    return this.notifications.some((n) => !n.read);
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }
}
