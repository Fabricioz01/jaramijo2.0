import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resolve-task-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resolve-task-modal.component.html',
  styleUrls: ['./resolve-task-modal.component.scss'],
})
export class ResolveTaskModalComponent {
  @Input() visible = false;
  @Output() confirm = new EventEmitter<File>();
  @Output() cancel = new EventEmitter<void>();

  selectedFile: File | null = null;
  uploading = false;
  showErrors = false;

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];

      // Validar archivo
      if (!this.isValidFile(file)) {
        return;
      }

      this.selectedFile = file;
      this.showErrors = false;
    }
  }

  onConfirm(): void {
    if (!this.selectedFile) {
      this.showErrors = true;
      return;
    }

    this.uploading = true;
    this.confirm.emit(this.selectedFile);
  }

  onCancel(): void {
    this.reset();
    this.cancel.emit();
  }

  private isValidFile(file: File): boolean {
    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB en bytes
    if (file.size > maxSize) {
      alert(
        'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.'
      );
      return false;
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        'Tipo de archivo no permitido. Solo se permiten archivos PDF y Excel.'
      );
      return false;
    }

    return true;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private reset(): void {
    this.selectedFile = null;
    this.uploading = false;
    this.showErrors = false;
  }

  // Método para resetear el modal desde el componente padre
  public resetModal(): void {
    this.reset();
  }
}
