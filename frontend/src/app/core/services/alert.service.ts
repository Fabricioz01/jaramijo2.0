import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Alert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timeout?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  public alerts$ = this.alertsSubject.asObservable();

  constructor() {}

  success(message: string, timeout = 5000): void {
    this.show('success', message, timeout);
  }

  error(message: string, timeout = 7000): void {
    this.show('error', message, timeout);
  }

  warning(message: string, timeout = 6000): void {
    this.show('warning', message, timeout);
  }

  info(message: string, timeout = 5000): void {
    this.show('info', message, timeout);
  }

  private show(type: Alert['type'], message: string, timeout?: number): void {
    const alert: Alert = {
      id: this.generateId(),
      type,
      message,
      timeout,
    };

    const currentAlerts = this.alertsSubject.value;
    this.alertsSubject.next([...currentAlerts, alert]);

    if (timeout && timeout > 0) {
      setTimeout(() => {
        this.remove(alert.id);
      }, timeout);
    }
  }

  remove(id: string): void {
    const currentAlerts = this.alertsSubject.value;
    const filteredAlerts = currentAlerts.filter((alert) => alert.id !== id);
    this.alertsSubject.next(filteredAlerts);
  }

  clear(): void {
    this.alertsSubject.next([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
