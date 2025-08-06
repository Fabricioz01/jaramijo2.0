import { Component, OnInit, OnDestroy } from '@angular/core';
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
      this.notificationService.markAsRead(notification._id).subscribe();
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe();
  }

  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    if (notification._id) {
      this.notificationService.deleteNotification(notification._id).subscribe();
    }
  }

  navigateToTask(notification: Notification): void {
    if (notification.taskId) {
      this.markAsRead(notification);
      this.router.navigate(['/tareas']);
    }
  }

  getNotificationIcon(type: string): string {
    return this.notificationService.getNotificationIcon(type);
  }

  getNotificationColor(type: string): string {
    return this.notificationService.getNotificationColor(type);
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
}
