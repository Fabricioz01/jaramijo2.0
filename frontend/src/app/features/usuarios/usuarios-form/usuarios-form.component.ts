import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { DepartamentoService } from '../../../core/services/departamento.service';
import { RoleService } from '../../../core/services/role.service';
import { DireccionService } from '../../../core/services/direccion.service';
import { Departamento, Role, Direccion } from '../../../core/models';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-usuarios-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  template: `
    <app-header></app-header>
    <div class="container-fluid py-4">
      <div class="row justify-content-center">
        <div class="col-md-10">
          <div class="d-flex align-items-center mb-4">
            <button class="btn btn-outline-secondary me-3" (click)="goBack()">
              <i class="bi bi-arrow-left"></i>
            </button>
            <div>
              <h1 class="h3 mb-0">
                {{ isEditing ? 'Editar' : 'Nuevo' }} Usuario
              </h1>
              <p class="text-muted mb-0">
                {{
                  isEditing
                    ? 'Modificar información del usuario'
                    : 'Crear un nuevo usuario del sistema'
                }}
              </p>
            </div>
          </div>

          <div
            *ngIf="usuarioForm.invalid && usuarioForm.touched"
            class="alert alert-danger mb-3"
          >
            <strong>Por favor corrija los siguientes errores:</strong>
            <ul class="mb-0">
              <li *ngIf="isFieldInvalid('nombres')">Nombres es obligatorio.</li>
              <li *ngIf="isFieldInvalid('apellidos')">
                Apellidos es obligatorio.
              </li>
              <li *ngIf="isFieldInvalid('cedula')">
                Cédula es obligatoria y debe tener 10 dígitos.
              </li>
              <li *ngIf="isFieldInvalid('email')">
                Email es obligatorio y debe ser válido.
              </li>
              <li *ngIf="isFieldInvalid('direccion')">
                Dirección es obligatoria.
              </li>
              <li *ngIf="isFieldInvalid('departamento')">
                Departamento es obligatorio.
              </li>
              <li *ngIf="isFieldInvalid('rol')">Rol es obligatorio.</li>
              <li *ngIf="isFieldInvalid('password') && !isEditing">
                Contraseña es obligatoria y debe tener al menos 6 caracteres.
              </li>
              <li *ngIf="isFieldInvalid('confirmPassword') && !isEditing">
                Las contraseñas no coinciden.
              </li>
            </ul>
          </div>

          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <form [formGroup]="usuarioForm" (ngSubmit)="onSubmit()">
                <div class="row">
                  <!-- Información Personal -->
                  <div class="col-12 mb-4">
                    <h5 class="text-primary border-bottom pb-2">
                      <i class="bi bi-person me-2"></i>Información Personal
                    </h5>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="nombres" class="form-label">Nombres *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="nombres"
                      formControlName="nombres"
                      [class.is-invalid]="isFieldInvalid('nombres')"
                      placeholder="Nombres completos"
                    />
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('nombres')"
                    >
                      Los nombres son requeridos
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="apellidos" class="form-label"
                      >Apellidos *</label
                    >
                    <input
                      type="text"
                      class="form-control"
                      id="apellidos"
                      formControlName="apellidos"
                      [class.is-invalid]="isFieldInvalid('apellidos')"
                      placeholder="Apellidos completos"
                    />
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('apellidos')"
                    >
                      Los apellidos son requeridos
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="cedula" class="form-label">Cédula *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="cedula"
                      formControlName="cedula"
                      [class.is-invalid]="isFieldInvalid('cedula')"
                      placeholder="1234567890"
                    />
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('cedula')"
                    >
                      La cédula es requerida y debe tener 10 dígitos
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="telefono" class="form-label">Teléfono</label>
                    <input
                      type="tel"
                      class="form-control"
                      id="telefono"
                      formControlName="telefono"
                      placeholder="0987654321"
                    />
                  </div>

                  <div class="col-md-12 mb-3">
                    <label for="email" class="form-label">Email *</label>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      formControlName="email"
                      [class.is-invalid]="isFieldInvalid('email')"
                      placeholder="usuario@municipio.gob.ec"
                    />
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('email')"
                    >
                      Ingrese un email válido
                    </div>
                  </div>

                  <!-- Información Laboral -->
                  <div class="col-12 mb-4 mt-4">
                    <h5 class="text-primary border-bottom pb-2">
                      <i class="bi bi-briefcase me-2"></i>Información Laboral
                    </h5>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="direccion" class="form-label"
                      >Dirección *</label
                    >
                    <select
                      class="form-select"
                      id="direccion"
                      formControlName="direccion"
                      [class.is-invalid]="isFieldInvalid('direccion')"
                      (change)="onDireccionChange()"
                    >
                      <option value="">Seleccionar dirección</option>
                      <option
                        *ngFor="let direccion of direcciones"
                        [value]="direccion._id"
                      >
                        {{ direccion.name }}
                      </option>
                    </select>
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('direccion')"
                    >
                      Debe seleccionar una dirección
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="departamento" class="form-label"
                      >Departamento *</label
                    >
                    <select
                      class="form-select"
                      id="departamento"
                      formControlName="departamento"
                      [class.is-invalid]="isFieldInvalid('departamento')"
                      [disabled]="!usuarioForm.get('direccion')?.value"
                    >
                      <option value="">Seleccionar departamento</option>
                      <option
                        *ngFor="let depto of departamentosFiltrados"
                        [value]="depto._id"
                      >
                        {{ depto.name }}
                      </option>
                    </select>
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('departamento')"
                    >
                      Debe seleccionar un departamento
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="cargo" class="form-label">Cargo</label>
                    <input
                      type="text"
                      class="form-control"
                      id="cargo"
                      formControlName="cargo"
                      placeholder="Ej: Analista, Coordinador, etc."
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="rol" class="form-label"
                      >Rol del Sistema *</label
                    >
                    <select
                      class="form-select"
                      id="rol"
                      formControlName="rol"
                      [class.is-invalid]="isFieldInvalid('rol')"
                    >
                      <option value="">Seleccionar rol</option>
                      <option *ngFor="let role of roles" [value]="role._id">
                        {{ role.name }}
                      </option>
                    </select>
                    <div class="invalid-feedback" *ngIf="isFieldInvalid('rol')">
                      Debe seleccionar un rol
                    </div>
                  </div>

                  <!-- Acceso al Sistema -->
                  <div class="col-12 mb-4 mt-4" *ngIf="!isEditing">
                    <h5 class="text-primary border-bottom pb-2">
                      <i class="bi bi-shield-lock me-2"></i>Acceso al Sistema
                    </h5>
                  </div>

                  <div class="col-md-6 mb-3" *ngIf="!isEditing">
                    <label for="password" class="form-label"
                      >Contraseña *</label
                    >
                    <input
                      type="password"
                      class="form-control"
                      id="password"
                      formControlName="password"
                      [class.is-invalid]="isFieldInvalid('password')"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('password')"
                    >
                      La contraseña debe tener al menos 6 caracteres
                    </div>
                  </div>

                  <div class="col-md-6 mb-3" *ngIf="!isEditing">
                    <label for="confirmPassword" class="form-label"
                      >Confirmar Contraseña *</label
                    >
                    <input
                      type="password"
                      class="form-control"
                      id="confirmPassword"
                      formControlName="confirmPassword"
                      [class.is-invalid]="isFieldInvalid('confirmPassword')"
                      placeholder="Repetir contraseña"
                    />
                    <div
                      class="invalid-feedback"
                      *ngIf="isFieldInvalid('confirmPassword')"
                    >
                      Las contraseñas no coinciden
                    </div>
                  </div>

                  <div class="col-md-12 mb-3">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        id="activo"
                        formControlName="activo"
                      />
                      <label class="form-check-label" for="activo">
                        Usuario activo (puede acceder al sistema)
                      </label>
                    </div>
                  </div>
                </div>

                <div class="d-flex gap-2 justify-content-end pt-3 border-top">
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    (click)="goBack()"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="usuarioForm.invalid || loading"
                  >
                    <span
                      *ngIf="loading"
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    {{ isEditing ? 'Actualizar' : 'Guardar' }} Usuario
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        border-radius: 1rem;
      }

      .btn {
        border-radius: 0.5rem;
      }

      .form-control,
      .form-select {
        border-radius: 0.5rem;
      }

      .form-check-input:checked {
        background-color: #0d6efd;
        border-color: #0d6efd;
      }

      .is-invalid {
        border-color: #dc3545;
      }

      .border-bottom {
        border-bottom: 2px solid #e9ecef !important;
      }
    `,
  ],
})
export class UsuariosFormComponent implements OnInit {
  usuarioForm: FormGroup;
  loading = false;
  isEditing = false;
  usuarioId: string | null = null;

  // Datos de las APIs
  direcciones: Direccion[] = [];
  departamentos: Departamento[] = [];
  roles: Role[] = [];
  departamentosFiltrados: Departamento[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private departamentoService: DepartamentoService,
    private roleService: RoleService,
    private direccionService: DireccionService
  ) {
    this.usuarioForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      cedula: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      telefono: [''],
      email: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
      departamento: ['', Validators.required],
      cargo: [''],
      rol: ['', Validators.required],
      password: [''],
      confirmPassword: [''],
      activo: [true],
    });
  }

  ngOnInit(): void {
    this.usuarioId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.usuarioId;

    if (!this.isEditing) {
      // Para nuevos usuarios, la contraseña es requerida
      this.usuarioForm
        .get('password')
        ?.setValidators([Validators.required, Validators.minLength(6)]);
      this.usuarioForm
        .get('confirmPassword')
        ?.setValidators([Validators.required]);
    }

    // Cargar datos de las APIs
    this.loadDirecciones();
    this.loadDepartamentos();
    this.loadRoles();

    if (this.isEditing) {
      this.loadUsuario();
    }
  }

  loadDirecciones(): void {
    this.direccionService.getAll().subscribe({
      next: (response) => {
        this.direcciones = response.data || [];
      },
      error: (error) => {
        console.error('Error al cargar direcciones:', error);
      },
    });
  }

  loadDepartamentos(): void {
    this.departamentoService.getAll().subscribe({
      next: (response) => {
        this.departamentos = response.data || [];
      },
      error: (error) => {
        console.error('Error al cargar departamentos:', error);
      },
    });
  }

  loadRoles(): void {
    this.roleService.getAll().subscribe({
      next: (response) => {
        this.roles = response.data || [];
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
      },
    });
  }

  loadUsuario(): void {
    if (!this.usuarioId) return;

    this.userService.getById(this.usuarioId).subscribe({
      next: (response) => {
        const user = response.data;
        if (user) {
          // Encontrar el departamento del usuario para obtener su dirección
          const userDepartamento = this.departamentos.find(
            (dept) => dept._id === user.departamentoId
          );
          let direccionId = '';

          if (userDepartamento) {
            direccionId =
              typeof userDepartamento.direccionId === 'object'
                ? userDepartamento.direccionId._id
                : userDepartamento.direccionId;
          }

          this.usuarioForm.patchValue({
            nombres: user.name.split(' ')[0] || '',
            apellidos: user.name.split(' ').slice(1).join(' ') || '',
            email: user.email,
            direccion: direccionId,
            departamento: user.departamentoId,
            rol: user.roleIds[0] || '',
            activo: user.active,
          });

          // Filtrar departamentos después de establecer la dirección
          this.onDireccionChange();
          // Volver a establecer el departamento después del filtrado
          this.usuarioForm.get('departamento')?.setValue(user.departamentoId);
        }
      },
      error: (error) => {
        console.error('Error al cargar usuario:', error);
      },
    });
  }

  onDireccionChange(): void {
    const direccionSeleccionada = this.usuarioForm.get('direccion')?.value;

    this.departamentosFiltrados = this.departamentos.filter((dept) => {
      // Si direccionId es un objeto (viene populated del backend)
      if (typeof dept.direccionId === 'object' && dept.direccionId !== null) {
        return dept.direccionId._id === direccionSeleccionada;
      }
      // Si direccionId es un string (ID simple)
      return dept.direccionId === direccionSeleccionada;
    });

    // Limpiar el departamento seleccionado si cambia la dirección
    this.usuarioForm.get('departamento')?.setValue('');
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.usuarioForm.get(fieldName);

    // Validación especial para confirmPassword
    if (fieldName === 'confirmPassword') {
      const password = this.usuarioForm.get('password')?.value;
      const confirmPassword = this.usuarioForm.get('confirmPassword')?.value;
      return !!(field && field.touched && password !== confirmPassword);
    }

    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.usuarioForm.valid) {
      if (!this.isEditing) {
        const password = this.usuarioForm.get('password')?.value;
        const confirmPassword = this.usuarioForm.get('confirmPassword')?.value;

        if (password !== confirmPassword) {
          this.usuarioForm
            .get('confirmPassword')
            ?.setErrors({ mismatch: true });
          return;
        }
      }

      this.loading = true;
      const formData = this.usuarioForm.value;

      // Crear objeto para la API
      const userData = {
        name: `${formData.nombres} ${formData.apellidos}`,
        email: formData.email,
        password: formData.password,
        departamentoId: formData.departamento,
        roleIds: [formData.rol],
      };

      if (this.isEditing) {
        this.userService.update(this.usuarioId!, userData).subscribe({
          next: (response) => {
            console.log('Usuario actualizado:', response);
            this.loading = false;
            this.goBack();
          },
          error: (error) => {
            console.error('Error al actualizar usuario:', error);
            this.loading = false;
          },
        });
      } else {
        this.userService.create(userData).subscribe({
          next: (response) => {
            console.log('Usuario creado:', response);
            this.loading = false;
            this.goBack();
          },
          error: (error) => {
            console.error('Error al crear usuario:', error);
            this.loading = false;
          },
        });
      }
    } else {
      Object.keys(this.usuarioForm.controls).forEach((key) => {
        this.usuarioForm.get(key)?.markAsTouched();
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/usuarios']);
  }
}
