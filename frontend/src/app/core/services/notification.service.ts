import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { ApiResponse } from '../models';

export interface Notification {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'success' | 'error';
  leida: boolean;
  fechaCreacion: Date;
  usuarioId: string;
  tareaId?: string;
  url?: string;
  icono?: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly API_URL = '/api/v1/notifications';
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeNotifications();
    this.startPolling();
  }

  private initializeNotifications(): void {
    this.loadNotifications();
  }

  private startPolling(): void {
    // Verificar nuevas notificaciones cada 30 segundos
    interval(30000).subscribe(() => {
      this.loadNotifications();
    });
  }

  private loadNotifications(): void {
    // Simulamos la carga de notificaciones desde la API
    const demoNotifications = this.generateDemoNotifications();
    this.notificationsSubject.next(demoNotifications);
    this.updateUnreadCount(demoNotifications);
  }

  getAll(): Observable<ApiResponse<Notification[]>> {
    return this.http.get<ApiResponse<Notification[]>>(this.API_URL);
  }

  markAsRead(id: string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.API_URL}/${id}/read`, {});
  }

  markAllAsRead(): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.API_URL}/read-all`, {});
  }

  delete(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.API_URL}/${id}`);
  }

  create(
    notification: Partial<Notification>
  ): Observable<ApiResponse<Notification>> {
    return this.http.post<ApiResponse<Notification>>(
      this.API_URL,
      notification
    );
  }

  // Métodos para gestión local de notificaciones
  markAsReadLocal(id: string): void {
    const notifications = this.notificationsSubject.value;
    const notification = notifications.find((n) => n.id === id);
    if (notification && !notification.leida) {
      notification.leida = true;
      this.notificationsSubject.next([...notifications]);
      this.updateUnreadCount(notifications);
    }
  }

  markAllAsReadLocal(): void {
    const notifications = this.notificationsSubject.value;
    notifications.forEach((n) => (n.leida = true));
    this.notificationsSubject.next([...notifications]);
    this.updateUnreadCount(notifications);
  }

  deleteLocal(id: string): void {
    const notifications = this.notificationsSubject.value;
    const filteredNotifications = notifications.filter((n) => n.id !== id);
    this.notificationsSubject.next(filteredNotifications);
    this.updateUnreadCount(filteredNotifications);
  }

  addNotification(notification: Partial<Notification>): void {
    const newNotification: Notification = {
      id: this.generateId(),
      titulo: notification.titulo || '',
      mensaje: notification.mensaje || '',
      tipo: notification.tipo || 'info',
      leida: false,
      fechaCreacion: new Date(),
      usuarioId: notification.usuarioId || '',
      tareaId: notification.tareaId,
      url: notification.url,
      icono:
        notification.icono || this.getDefaultIcon(notification.tipo || 'info'),
    };

    const notifications = this.notificationsSubject.value;
    notifications.unshift(newNotification);
    this.notificationsSubject.next([...notifications]);
    this.updateUnreadCount(notifications);
  }

  private updateUnreadCount(notifications: Notification[]): void {
    const unreadCount = notifications.filter((n) => !n.leida).length;
    this.unreadCountSubject.next(unreadCount);
  }

  private getDefaultIcon(tipo: string): string {
    switch (tipo) {
      case 'success':
        return 'bi-check-circle';
      case 'error':
        return 'bi-exclamation-triangle';
      case 'warning':
        return 'bi-exclamation-triangle-fill';
      case 'info':
        return 'bi-info-circle';
      default:
        return 'bi-bell';
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateDemoNotifications(): Notification[] {
    return [
      {
        id: '1',
        titulo: 'Nueva tarea asignada',
        mensaje:
          'Se te ha asignado la tarea "Revisión de documentos municipales"',
        tipo: 'info',
        leida: false,
        fechaCreacion: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
        usuarioId: 'user1',
        tareaId: 'task1',
        url: '/tareas/task1',
        icono: 'bi-list-task',
      },
      {
        id: '2',
        titulo: 'Tarea próxima a vencer',
        mensaje: 'La tarea "Informe mensual" vence en 2 días',
        tipo: 'warning',
        leida: false,
        fechaCreacion: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
        usuarioId: 'user1',
        tareaId: 'task2',
        url: '/tareas/task2',
        icono: 'bi-clock',
      },
      {
        id: '3',
        titulo: 'Tarea completada',
        mensaje:
          'María González completó la tarea "Actualización de base de datos"',
        tipo: 'success',
        leida: true,
        fechaCreacion: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        usuarioId: 'user1',
        tareaId: 'task3',
        url: '/tareas/task3',
        icono: 'bi-check-circle',
      },
      {
        id: '4',
        titulo: 'Nuevo archivo subido',
        mensaje: 'Carlos López subió un nuevo archivo: "Presupuesto_2024.xlsx"',
        tipo: 'info',
        leida: true,
        fechaCreacion: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
        usuarioId: 'user1',
        url: '/archivos',
        icono: 'bi-file-earmark-excel',
      },
      {
        id: '5',
        titulo: 'Sistema actualizado',
        mensaje: 'El sistema ha sido actualizado con nuevas funcionalidades',
        tipo: 'success',
        leida: true,
        fechaCreacion: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 día atrás
        usuarioId: 'user1',
        icono: 'bi-arrow-up-circle',
      },
    ];
  }
}
