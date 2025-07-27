import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService, Alert } from '../../../core/services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alert-container">
      <div
        *ngFor="let alert of alerts"
        class="alert alert-dismissible fade show"
        [class.alert-success]="alert.type === 'success'"
        [class.alert-danger]="alert.type === 'error'"
        [class.alert-warning]="alert.type === 'warning'"
        [class.alert-info]="alert.type === 'info'"
        role="alert"
      >
        <i
          [class.bi-check-circle]="alert.type === 'success'"
          [class.bi-exclamation-triangle]="alert.type === 'error'"
          [class.bi-exclamation-triangle-fill]="alert.type === 'warning'"
          [class.bi-info-circle]="alert.type === 'info'"
          class="bi me-2"
        ></i>
        {{ alert.message }}
        <button
          type="button"
          class="btn-close"
          (click)="remove(alert.id)"
        ></button>
      </div>
    </div>
  `,
  styles: [
    `
      .alert-container {
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 1050;
        width: 350px;
      }

      .alert {
        margin-bottom: 10px;
        animation: slideInRight 0.3s ease-out;
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `,
  ],
})
export class AlertsComponent implements OnInit, OnDestroy {
  alerts: Alert[] = [];
  private subscription?: Subscription;

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.subscription = this.alertService.alerts$.subscribe(
      (alerts: Alert[]) => (this.alerts = alerts)
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  remove(id: string): void {
    this.alertService.remove(id);
  }
}
