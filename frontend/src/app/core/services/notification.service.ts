import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, timer } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  Notification,
  NotificationResponse,
} from '../models/notification.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly API_URL = `${environment.apiUrl}/notifications`;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    // para refrescar las notificaciones cada 7 segundos
    timer(0, 7000)
      .pipe(
        switchMap(() => this.loadNotifications()),
        catchError(() => of({ success: true, data: [], count: 0 }))
      )
      .subscribe();
  }

  loadNotifications(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}`).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.notificationsSubject.next(response.data);
          const unreadCount = response.data.filter(
            (n: Notification) => !n.read
          ).length;
          this.unreadCountSubject.next(unreadCount);
        }
      }),
      catchError((error) => {
        // En caso de error, mantener el estado actual
        return of({
          success: true,
          data: [],
          count: 0,
        });
      })
    );
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http.patch(`${this.API_URL}/${notificationId}/read`, {}).pipe(
      tap(() => {
        // Actualizar el estado local
        const currentNotifications = this.notificationsSubject.value;
        const updatedNotifications = currentNotifications.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        );
        this.notificationsSubject.next(updatedNotifications);

        // Actualizar contador
        const unreadCount = updatedNotifications.filter((n) => !n.read).length;
        this.unreadCountSubject.next(unreadCount);
      })
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch(`${this.API_URL}/mark-all-read`, {}).pipe(
      tap(() => {
        // Actualizar el estado local
        const currentNotifications = this.notificationsSubject.value;
        const updatedNotifications = currentNotifications.map((n) => ({
          ...n,
          read: true,
        }));
        this.notificationsSubject.next(updatedNotifications);
        this.unreadCountSubject.next(0);
      })
    );
  }

  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${notificationId}`).pipe(
      tap(() => {
        // Actualizar el estado local
        const currentNotifications = this.notificationsSubject.value;
        const updatedNotifications = currentNotifications.filter(
          (n) => n._id !== notificationId
        );
        this.notificationsSubject.next(updatedNotifications);

        // Actualizar contador
        const unreadCount = updatedNotifications.filter((n) => !n.read).length;
        this.unreadCountSubject.next(unreadCount);
      })
    );
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'task_assigned':
        return 'bi-plus-circle';
      case 'task_due_today':
        return 'bi-clock';
      case 'task_overdue':
        return 'bi-exclamation-triangle';
      default:
        return 'bi-bell';
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
        return 'text-info';
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - new Date(date).getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  }
}
