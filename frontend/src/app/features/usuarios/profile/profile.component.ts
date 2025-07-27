import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { AuthService } from '../../../core/services/auth.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ReactiveFormsModule],
  template: `
    <app-header></app-header>

    <div class="container-fluid p-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-person-circle me-2"></i>Mi Perfil</h2>
            <button
              type="button"
              class="btn btn-outline-secondary"
              (click)="goBack()"
            >
              <i class="bi bi-arrow-left me-1"></i>Volver
            </button>
          </div>

          <div class="row">
            <!-- Información Personal -->
            <div class="col-md-8">
              <div class="card">
                <div class="card-header">
                  <h5 class="mb-0">
                    <i class="bi bi-person me-2"></i>Información Personal
                  </h5>
                </div>
                <div class="card-body">
                  <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label for="name" class="form-label">Nombre</label>
                        <input
                          type="text"
                          class="form-control"
                          id="name"
                          formControlName="name"
                          [class.is-invalid]="
                            profileForm.get('name')?.invalid &&
                            profileForm.get('name')?.touched
                          "
                        />
                        <div
                          class="invalid-feedback"
                          *ngIf="
                            profileForm.get('name')?.invalid &&
                            profileForm.get('name')?.touched
                          "
                        >
                          El nombre es requerido
                        </div>
                      </div>
                      <div class="col-md-6 mb-3">
                        <label for="email" class="form-label"
                          >Correo Electrónico</label
                        >
                        <input
                          type="email"
                          class="form-control"
                          id="email"
                          formControlName="email"
                          [class.is-invalid]="
                            profileForm.get('email')?.invalid &&
                            profileForm.get('email')?.touched
                          "
                        />
                        <div
                          class="invalid-feedback"
                          *ngIf="
                            profileForm.get('email')?.invalid &&
                            profileForm.get('email')?.touched
                          "
                        >
                          Ingrese un correo válido
                        </div>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label for="telefono" class="form-label"
                          >Teléfono</label
                        >
                        <input
                          type="tel"
                          class="form-control"
                          id="telefono"
                          formControlName="telefono"
                        />
                      </div>
                      <div class="col-md-6 mb-3">
                        <label for="cedula" class="form-label">Cédula</label>
                        <input
                          type="text"
                          class="form-control"
                          id="cedula"
                          formControlName="cedula"
                          readonly
                        />
                      </div>
                    </div>
                    <div class="d-flex justify-content-end">
                      <button
                        type="submit"
                        class="btn btn-primary"
                        [disabled]="profileForm.invalid || loading"
                      >
                        <span
                          *ngIf="loading"
                          class="spinner-border spinner-border-sm me-2"
                        ></span>
                        <i class="bi bi-check-lg me-1"></i>Actualizar
                        Información
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <!-- Cambiar Contraseña -->
              <div class="card mt-4">
                <div class="card-header">
                  <h5 class="mb-0">
                    <i class="bi bi-shield-lock me-2"></i>Cambiar Contraseña
                  </h5>
                </div>
                <div class="card-body">
                  <form
                    [formGroup]="passwordForm"
                    (ngSubmit)="changePassword()"
                  >
                    <div class="mb-3">
                      <label for="currentPassword" class="form-label"
                        >Contraseña Actual</label
                      >
                      <input
                        type="password"
                        class="form-control"
                        id="currentPassword"
                        formControlName="currentPassword"
                        [class.is-invalid]="
                          passwordForm.get('currentPassword')?.invalid &&
                          passwordForm.get('currentPassword')?.touched
                        "
                      />
                      <div
                        class="invalid-feedback"
                        *ngIf="
                          passwordForm.get('currentPassword')?.invalid &&
                          passwordForm.get('currentPassword')?.touched
                        "
                      >
                        La contraseña actual es requerida
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label for="newPassword" class="form-label"
                          >Nueva Contraseña</label
                        >
                        <input
                          type="password"
                          class="form-control"
                          id="newPassword"
                          formControlName="newPassword"
                          [class.is-invalid]="
                            passwordForm.get('newPassword')?.invalid &&
                            passwordForm.get('newPassword')?.touched
                          "
                        />
                        <div
                          class="invalid-feedback"
                          *ngIf="
                            passwordForm.get('newPassword')?.invalid &&
                            passwordForm.get('newPassword')?.touched
                          "
                        >
                          La contraseña debe tener al menos 6 caracteres
                        </div>
                      </div>
                      <div class="col-md-6 mb-3">
                        <label for="confirmPassword" class="form-label"
                          >Confirmar Contraseña</label
                        >
                        <input
                          type="password"
                          class="form-control"
                          id="confirmPassword"
                          formControlName="confirmPassword"
                          [class.is-invalid]="
                            passwordForm.get('confirmPassword')?.invalid &&
                            passwordForm.get('confirmPassword')?.touched
                          "
                        />
                        <div
                          class="invalid-feedback"
                          *ngIf="
                            passwordForm.get('confirmPassword')?.invalid &&
                            passwordForm.get('confirmPassword')?.touched
                          "
                        >
                          Las contraseñas no coinciden
                        </div>
                      </div>
                    </div>
                    <div class="d-flex justify-content-end">
                      <button
                        type="submit"
                        class="btn btn-warning"
                        [disabled]="passwordForm.invalid || loadingPassword"
                      >
                        <span
                          *ngIf="loadingPassword"
                          class="spinner-border spinner-border-sm me-2"
                        ></span>
                        <i class="bi bi-key me-1"></i>Cambiar Contraseña
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <!-- Panel Lateral -->
            <div class="col-md-4">
              <!-- Información del Usuario -->
              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">
                    <i class="bi bi-info-circle me-2"></i>Información de Usuario
                  </h6>
                </div>
                <div class="card-body">
                  <div class="text-center mb-3">
                    <i
                      class="bi bi-person-circle"
                      style="font-size: 4rem; color: #6c757d;"
                    ></i>
                  </div>
                  <div class="mb-2">
                    <strong>Departamento:</strong>
                    <span class="ms-2">{{
                      user?.departamentoId?.name || 'No asignado'
                    }}</span>
                  </div>
                  <div class="mb-2">
                    <strong>Roles:</strong>
                    <div class="mt-1">
                      <span
                        *ngFor="let role of user?.roles"
                        class="badge bg-primary me-1"
                      >
                        {{ role.name }}
                      </span>
                    </div>
                  </div>
                  <div class="mb-2">
                    <strong>Estado:</strong>
                    <span
                      class="badge ms-2"
                      [class.bg-success]="user?.isActive"
                      [class.bg-danger]="!user?.isActive"
                    >
                      {{ user?.isActive ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                  <div class="mb-2">
                    <strong>Fecha de Registro:</strong>
                    <small class="text-muted d-block">{{
                      user?.createdAt | date : 'dd/MM/yyyy'
                    }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  user: any = null;
  loading = false;
  loadingPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      cedula: [''],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
      if (user) {
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
          telefono: (user as any).telefono || '',
          cedula: (user as any).cedula || '',
        });
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (
      newPassword &&
      confirmPassword &&
      newPassword.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ mismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }

    return null;
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      // Aquí implementarías la llamada al servicio para actualizar el perfil
      console.log('Actualizando perfil:', this.profileForm.value);

      // Simular llamada a API
      setTimeout(() => {
        this.loading = false;
        alert('Perfil actualizado correctamente');
      }, 1000);
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.loadingPassword = true;
      // Aquí implementarías la llamada al servicio para cambiar contraseña
      console.log('Cambiando contraseña');

      // Simular llamada a API
      setTimeout(() => {
        this.loadingPassword = false;
        this.passwordForm.reset();
        alert('Contraseña cambiada correctamente');
      }, 1000);
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
