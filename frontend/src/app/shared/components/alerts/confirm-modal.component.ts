import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="modal-backdrop"
      *ngIf="visible"
      (click)="onCancel()"
      tabindex="-1"
      aria-hidden="true"
    ></div>
    <div
      class="modal-container"
      *ngIf="visible"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      aria-describedby="modalDesc"
    >
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h2 id="modalTitle" class="modal-title">Confirmar acción</h2>
        <p id="modalDesc" class="modal-message">
          {{ message }}
        </p>
        <div class="modal-actions">
          <button
            type="button"
            class="btn btn-light"
            (click)="onCancel()"
            aria-label="Cancelar"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="btn btn-danger"
            (click)="onConfirm()"
            aria-label="Confirmar"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        z-index: 1040;
        animation: fadeIn 0.2s;
      }
      .modal-container {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1050;
        animation: fadeIn 0.2s;
      }
      .modal-content {
        background: #fff;
        border-radius: 1rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
        padding: 2rem 1.5rem 1.5rem 1.5rem;
        min-width: 320px;
        max-width: 90vw;
        text-align: center;
        animation: scaleIn 0.2s;
      }
      .modal-title {
        font-size: 1.4rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }
      .modal-message {
        font-size: 1.1rem;
        margin-bottom: 1.5rem;
      }
      .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
      }
      .btn {
        min-width: 100px;
        border-radius: 0.5rem;
        font-weight: 500;
        font-size: 1rem;
        padding: 0.5rem 1.2rem;
        border: none;
        cursor: pointer;
        transition: background 0.15s;
      }
      .btn-light {
        background: #f5f5f5;
        color: #333;
      }
      .btn-light:hover {
        background: #e2e2e2;
      }
      .btn-danger {
        background: #e53935;
        color: #fff;
      }
      .btn-danger:hover {
        background: #b71c1c;
      }
      @media (max-width: 600px) {
        .modal-content {
          min-width: 90vw;
          padding: 1.2rem 0.5rem 1rem 0.5rem;
        }
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes scaleIn {
        from {
          transform: scale(0.95);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }
    `,
  ],
})
export class ConfirmModalComponent {
  @Input() message = '';
  @Input() visible = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }
  onCancel() {
    this.cancel.emit();
  }
}
