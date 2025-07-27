import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ReactiveFormsModule],
  template: `
    <app-header></app-header>

    <div class="container-fluid p-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-gear me-2"></i>Configuración del Sistema</h2>
            <button
              type="button"
              class="btn btn-outline-secondary"
              (click)="goBack()"
            >
              <i class="bi bi-arrow-left me-1"></i>Volver
            </button>
          </div>

          <div class="row">
            <!-- Configuración General -->
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h5 class="mb-0">
                    <i class="bi bi-sliders me-2"></i>Configuración General
                  </h5>
                </div>
                <div class="card-body">
                  <form [formGroup]="configForm">
                    <div class="mb-3">
                      <label class="form-label">Tema de la aplicación</label>
                      <select class="form-select" formControlName="theme">
                        <option value="light">Claro</option>
                        <option value="dark">Oscuro</option>
                        <option value="auto">Automático</option>
                      </select>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Idioma</label>
                      <select class="form-select" formControlName="language">
                        <option value="es">Español</option>
                        <option value="en">Inglés</option>
                      </select>
                    </div>

                    <div class="mb-3">
                      <div class="form-check form-switch">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="notifications"
                          formControlName="enableNotifications"
                        />
                        <label class="form-check-label" for="notifications">
                          Habilitar notificaciones
                        </label>
                      </div>
                    </div>

                    <div class="mb-3">
                      <div class="form-check form-switch">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="emailNotifications"
                          formControlName="emailNotifications"
                        />
                        <label
                          class="form-check-label"
                          for="emailNotifications"
                        >
                          Notificaciones por correo
                        </label>
                      </div>
                    </div>

                    <div class="d-flex justify-content-end">
                      <button
                        type="button"
                        class="btn btn-primary"
                        (click)="saveGeneralSettings()"
                        [disabled]="loading"
                      >
                        <span
                          *ngIf="loading"
                          class="spinner-border spinner-border-sm me-2"
                        ></span>
                        <i class="bi bi-check-lg me-1"></i>Guardar Configuración
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <!-- Configuración de Seguridad -->
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h5 class="mb-0">
                    <i class="bi bi-shield-check me-2"></i>Configuración de
                    Seguridad
                  </h5>
                </div>
                <div class="card-body">
                  <form [formGroup]="securityForm">
                    <div class="mb-3">
                      <label class="form-label"
                        >Tiempo de sesión (minutos)</label
                      >
                      <input
                        type="number"
                        class="form-control"
                        formControlName="sessionTimeout"
                        min="5"
                        max="480"
                      />
                      <small class="form-text text-muted">
                        Entre 5 y 480 minutos (8 horas)
                      </small>
                    </div>

                    <div class="mb-3">
                      <div class="form-check form-switch">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="twoFactor"
                          formControlName="twoFactorAuth"
                        />
                        <label class="form-check-label" for="twoFactor">
                          Autenticación de dos factores
                        </label>
                      </div>
                    </div>

                    <div class="mb-3">
                      <div class="form-check form-switch">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="lockScreen"
                          formControlName="lockScreenEnabled"
                        />
                        <label class="form-check-label" for="lockScreen">
                          Bloqueo automático de pantalla
                        </label>
                      </div>
                    </div>

                    <div class="d-flex justify-content-end">
                      <button
                        type="button"
                        class="btn btn-warning"
                        (click)="saveSecuritySettings()"
                        [disabled]="loadingSecurity"
                      >
                        <span
                          *ngIf="loadingSecurity"
                          class="spinner-border spinner-border-sm me-2"
                        ></span>
                        <i class="bi bi-shield me-1"></i>Guardar Seguridad
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <!-- Configuración del Sistema -->
          <div class="row mt-4">
            <div class="col-12">
              <div class="card">
                <div class="card-header">
                  <h5 class="mb-0">
                    <i class="bi bi-server me-2"></i>Información del Sistema
                  </h5>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-3">
                      <div class="text-center p-3 border rounded">
                        <i
                          class="bi bi-speedometer2 text-primary"
                          style="font-size: 2rem;"
                        ></i>
                        <h6 class="mt-2">Rendimiento</h6>
                        <span class="badge bg-success">Óptimo</span>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="text-center p-3 border rounded">
                        <i
                          class="bi bi-database text-info"
                          style="font-size: 2rem;"
                        ></i>
                        <h6 class="mt-2">Base de Datos</h6>
                        <span class="badge bg-success">Conectada</span>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="text-center p-3 border rounded">
                        <i
                          class="bi bi-people text-warning"
                          style="font-size: 2rem;"
                        ></i>
                        <h6 class="mt-2">Usuarios Activos</h6>
                        <span class="badge bg-info">{{ activeUsers }}</span>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="text-center p-3 border rounded">
                        <i
                          class="bi bi-graph-up text-success"
                          style="font-size: 2rem;"
                        ></i>
                        <h6 class="mt-2">Uptime</h6>
                        <span class="badge bg-success">99.8%</span>
                      </div>
                    </div>
                  </div>

                  <hr class="my-4" />

                  <div class="row">
                    <div class="col-md-6">
                      <h6>
                        <i class="bi bi-info-circle me-2"></i>Información de
                        Versión
                      </h6>
                      <ul class="list-unstyled">
                        <li><strong>Versión Frontend:</strong> 1.0.0</li>
                        <li><strong>Versión Backend:</strong> 1.0.0</li>
                        <li>
                          <strong>Última actualización:</strong>
                          {{ lastUpdate | date : 'dd/MM/yyyy HH:mm' }}
                        </li>
                      </ul>
                    </div>
                    <div class="col-md-6">
                      <h6>
                        <i class="bi bi-tools me-2"></i>Herramientas de
                        Mantenimiento
                      </h6>
                      <div class="d-flex flex-wrap gap-2">
                        <button
                          class="btn btn-outline-primary btn-sm"
                          (click)="clearCache()"
                        >
                          <i class="bi bi-trash me-1"></i>Limpiar Caché
                        </button>
                        <button
                          class="btn btn-outline-info btn-sm"
                          (click)="generateBackup()"
                        >
                          <i class="bi bi-download me-1"></i>Generar Backup
                        </button>
                        <button
                          class="btn btn-outline-warning btn-sm"
                          (click)="restartSystem()"
                        >
                          <i class="bi bi-arrow-clockwise me-1"></i>Reiniciar
                          Sistema
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./configuracion.component.scss'],
})
export class ConfiguracionComponent implements OnInit {
  configForm: FormGroup;
  securityForm: FormGroup;
  loading = false;
  loadingSecurity = false;
  activeUsers = 12;
  lastUpdate = new Date();

  constructor(private fb: FormBuilder, private router: Router) {
    this.configForm = this.fb.group({
      theme: ['light'],
      language: ['es'],
      enableNotifications: [true],
      emailNotifications: [false],
    });

    this.securityForm = this.fb.group({
      sessionTimeout: [30],
      twoFactorAuth: [false],
      lockScreenEnabled: [true],
    });
  }

  ngOnInit(): void {
    this.loadCurrentSettings();
  }

  loadCurrentSettings(): void {
    // Cargar configuración actual desde localStorage o servicio
    const savedConfig = localStorage.getItem('appConfig');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      this.configForm.patchValue(config);
    }

    const savedSecurity = localStorage.getItem('securityConfig');
    if (savedSecurity) {
      const security = JSON.parse(savedSecurity);
      this.securityForm.patchValue(security);
    }
  }

  saveGeneralSettings(): void {
    this.loading = true;

    // Simular llamada a API
    setTimeout(() => {
      localStorage.setItem('appConfig', JSON.stringify(this.configForm.value));
      this.loading = false;
      alert('Configuración general guardada correctamente');
      this.applySettings();
    }, 1000);
  }

  saveSecuritySettings(): void {
    this.loadingSecurity = true;

    // Simular llamada a API
    setTimeout(() => {
      localStorage.setItem(
        'securityConfig',
        JSON.stringify(this.securityForm.value)
      );
      this.loadingSecurity = false;
      alert('Configuración de seguridad guardada correctamente');
    }, 1000);
  }

  applySettings(): void {
    const theme = this.configForm.get('theme')?.value;
    document.documentElement.setAttribute(
      'data-bs-theme',
      theme === 'auto' ? 'light' : theme
    );
  }

  clearCache(): void {
    if (
      confirm(
        '¿Está seguro de que desea limpiar el caché? Esto puede afectar el rendimiento temporalmente.'
      )
    ) {
      localStorage.clear();
      sessionStorage.clear();
      alert('Caché limpiado correctamente');
    }
  }

  generateBackup(): void {
    alert(
      'Generando backup del sistema... Esta funcionalidad estará disponible próximamente.'
    );
  }

  restartSystem(): void {
    if (
      confirm(
        '¿Está seguro de que desea reiniciar el sistema? Todos los usuarios serán desconectados.'
      )
    ) {
      alert(
        'Reiniciando sistema... Esta funcionalidad estará disponible próximamente.'
      );
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
