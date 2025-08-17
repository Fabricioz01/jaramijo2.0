import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
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

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  selectedFile: File | null = null;
  uploading = false;
  showErrors = false;

  // Nuevas propiedades para mejorar la UX
  dragOver = false;
  uploadProgress = 0; // porcentaje para la barra de progreso

  // Mensajes de validación estilo toast dentro del modal
  validationMessage: string | null = null;
  validationType: 'error' | 'info' = 'error';
  showValidation = false;
  private validationTimeout?: any;

  showValidationMessage(
    message: string,
    type: 'error' | 'info' = 'error',
    ttl = 3500
  ) {
    this.validationMessage = message;
    this.validationType = type;
    this.showValidation = true;
    if (this.validationTimeout) clearTimeout(this.validationTimeout);
    this.validationTimeout = setTimeout(() => {
      this.showValidation = false;
      this.validationMessage = null;
    }, ttl);
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      if (target.files.length > 1) {
        this.showValidationMessage(
          'Solo puede seleccionar un archivo. Por favor seleccione uno solo.',
          'error'
        );
        return;
      }

      const file = target.files[0];

      // Validar archivo
      if (!this.isValidFile(file)) {
        return;
      }

      this.selectedFile = file;
      this.showErrors = false;
      this.uploadProgress = 0;
    }
  }

  onConfirm(): void {
    if (!this.selectedFile) {
      this.showErrors = true;
      this.showValidationMessage(
        'Debe seleccionar un archivo antes de continuar.',
        'error'
      );
      return;
    }

    // Iniciar animación de subida y emitir el archivo al componente padre
    this.uploading = true;
    this.uploadProgress = 0;

    // Emitir el archivo inmediatamente para que el padre haga la subida
    this.confirm.emit(this.selectedFile);

    // Simulación visual de progreso hasta 100%
    const interval = setInterval(() => {
      if (this.uploadProgress < 95) {
        this.uploadProgress += Math.floor(Math.random() * 8) + 4; // 4-11
        if (this.uploadProgress > 95) this.uploadProgress = 95;
      } else {
        clearInterval(interval);
        const finishInterval = setInterval(() => {
          this.uploadProgress += 5;
          if (this.uploadProgress >= 100) {
            clearInterval(finishInterval);
            this.uploadProgress = 100;
            this.uploading = false;
            this.showValidationMessage(
              'Archivo enviado correctamente',
              'info',
              2500
            );
          }
        }, 150);
      }
    }, 180);
  }

  onCancel(): void {
    this.reset();
    this.cancel.emit();
  }

  private isValidFile(file: File): boolean {
    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB en bytes
    if (file.size > maxSize) {
      this.showValidationMessage(
        'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.',
        'error'
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
      this.showValidationMessage(
        'Tipo de archivo no permitido. Solo se permiten archivos PDF y Excel.',
        'error'
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
    this.uploadProgress = 0;
    this.dragOver = false;
    this.showValidation = false;
    this.validationMessage = null;
    if (this.validationTimeout) clearTimeout(this.validationTimeout);
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Método para resetear el modal desde el componente padre
  public resetModal(): void {
    this.reset();
  }

  // Nuevas utilidades para la UI
  triggerFileInput(): void {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    const dt = event.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      if (dt.files.length > 1) {
        this.showValidationMessage(
          'Solo puede arrastrar un archivo a la vez.',
          'error'
        );
        return;
      }
      const file = dt.files[0];
      if (!this.isValidFile(file)) return;
      this.selectedFile = file;
      this.showErrors = false;
      this.uploadProgress = 0;
    }
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.showErrors = false;
    this.uploadProgress = 0;
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  fileIconClass(file: File | null): string {
    if (!file) return 'bi-file-earmark-fill';
    const name = file.name.toLowerCase();
    if (name.endsWith('.pdf') || file.type === 'application/pdf') {
      return 'bi-file-earmark-pdf-fill text-danger';
    }
    if (
      name.endsWith('.xls') ||
      name.endsWith('.xlsx') ||
      file.type === 'application/vnd.ms-excel' ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return 'bi-file-earmark-spreadsheet-fill text-success';
    }
    return 'bi-file-earmark-fill';
  }

  // Atajo: cerrar modal con Escape
  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent): void {
    if (this.visible) {
      this.onCancel();
    }
  }
}
