import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NotificationService,
  Notification,
} from '../../../core/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="nav-item dropdown">
      <a
        class="nav-link dropdown-toggle position-relative"
        href="#"
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i class="bi bi-bell fs-5"></i>
        <span
          *ngIf="unreadCount > 0"
          class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </a>

      <div class="dropdown-menu dropdown-menu-end notifications-dropdown">
        <div
          class="dropdown-header d-flex justify-content-between align-items-center"
        >
          <h6 class="mb-0">Notificaciones</h6>
          <button
            *ngIf="unreadCount > 0"
            class="btn btn-sm btn-link text-decoration-none p-0"
            (click)="markAllAsRead()"
          >
            <small>Marcar todas como leídas</small>
          </button>
        </div>

        <div class="dropdown-divider"></div>

        <div class="notifications-container">
          <div
            *ngIf="notifications.length === 0"
            class="dropdown-item-text text-center text-muted py-3"
          >
            <i class="bi bi-bell-slash display-6"></i>
            <div class="mt-2">No hay notificaciones</div>
          </div>

          <div
            *ngFor="let notification of notifications.slice(0, 5)"
            class="notification-item dropdown-item"
            [class.unread]="!notification.leida"
            (click)="handleNotificationClick(notification)"
          >
            <div class="d-flex align-items-start">
              <div class="notification-icon me-3">
                <i
                  [class]="'bi ' + notification.icono"
                  [class.text-primary]="notification.tipo === 'info'"
                  [class.text-success]="notification.tipo === 'success'"
                  [class.text-warning]="notification.tipo === 'warning'"
                  [class.text-danger]="notification.tipo === 'error'"
                ></i>
              </div>

              <div class="notification-content flex-grow-1">
                <div class="notification-title fw-medium">
                  {{ notification.titulo }}
                </div>
                <div class="notification-message text-muted small">
                  {{ notification.mensaje }}
                </div>
                <div class="notification-time text-muted small">
                  {{ getTimeAgo(notification.fechaCreacion) }}
                </div>
              </div>

              <div class="notification-actions ms-2">
                <button
                  class="btn btn-sm btn-outline-secondary"
                  (click)="deleteNotification($event, notification.id)"
                  title="Eliminar"
                >
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="notifications.length > 5" class="dropdown-divider"></div>

        <div *ngIf="notifications.length > 5" class="dropdown-item text-center">
          <a href="#" class="btn btn-sm btn-primary">
            Ver todas las notificaciones
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .notifications-dropdown {
        width: 350px;
        max-height: 400px;
        border: none;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      }

      .notifications-container {
        max-height: 300px;
        overflow-y: auto;
      }

      .notification-item {
        padding: 0.75rem 1rem;
        border: none;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .notification-item:hover {
        background-color: #f8f9fa;
      }

      .notification-item.unread {
        background-color: #e3f2fd;
        border-left: 3px solid #2196f3;
      }

      .notification-icon {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .notification-title {
        font-size: 0.875rem;
        line-height: 1.25;
        margin-bottom: 0.25rem;
      }

      .notification-message {
        font-size: 0.75rem;
        line-height: 1.3;
        margin-bottom: 0.25rem;
      }

      .notification-time {
        font-size: 0.7rem;
      }

      .badge {
        font-size: 0.6rem;
        padding: 0.25em 0.4em;
      }

      .dropdown-header {
        padding: 0.75rem 1rem;
        background-color: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
      }

      .notification-actions button {
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .notification-item:hover .notification-actions button {
        opacity: 1;
      }
    `,
  ],
})
export class NotificationsDropdownComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  private subscriptions: Subscription[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Suscribirse a las notificaciones
    this.subscriptions.push(
      this.notificationService.notifications$.subscribe(
        (notifications: Notification[]) => {
          this.notifications = notifications;
        }
      )
    );

    // Suscribirse al contador de no leídas
    this.subscriptions.push(
      this.notificationService.unreadCount$.subscribe((count: number) => {
        this.unreadCount = count;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsReadLocal();
  }

  handleNotificationClick(notification: Notification): void {
    if (!notification.leida) {
      this.notificationService.markAsReadLocal(notification.id);
    }

    // Navegar a la URL si existe
    if (notification.url) {
      // Aquí podrías usar el Router para navegar
      window.location.href = notification.url;
    }
  }

  deleteNotification(event: Event, id: string): void {
    event.stopPropagation();
    this.notificationService.deleteLocal(id);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} d`;

    return new Date(date).toLocaleDateString();
  }
}
