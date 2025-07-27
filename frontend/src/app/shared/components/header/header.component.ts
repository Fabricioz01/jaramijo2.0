import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
      <div class="container-fluid">
        <a
          class="navbar-brand fw-bold"
          [routerLink]="['/dashboard']"
          style="cursor: pointer;"
        >
          <i class="bi bi-building me-2"></i>
          Municipio Jaramijó
        </a>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a
                class="nav-link active"
                [routerLink]="['/dashboard']"
                style="cursor: pointer;"
              >
                <i class="bi bi-speedometer2 me-1"></i>Dashboard
              </a>
            </li>

            <!-- Organización -->
            <li
              class="nav-item dropdown"
              *ngIf="
                canAccessModule('direcciones') ||
                canAccessModule('departamentos')
              "
            >
              <a
                class="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                style="cursor: pointer;"
              >
                <i class="bi bi-people me-1"></i>Organización
              </a>
              <ul class="dropdown-menu">
                <li *ngIf="canAccessModule('direcciones')">
                  <a
                    class="dropdown-item"
                    (click)="navigateTo('/direcciones')"
                    style="cursor: pointer;"
                  >
                    <i class="bi bi-building me-2"></i>Direcciones
                  </a>
                </li>
                <li *ngIf="canAccessModule('departamentos')">
                  <a
                    class="dropdown-item"
                    (click)="navigateTo('/departamentos')"
                    style="cursor: pointer;"
                  >
                    <i class="bi bi-diagram-3 me-2"></i>Departamentos
                  </a>
                </li>
              </ul>
            </li>

            <!-- Usuarios y Permisos -->
            <li
              class="nav-item dropdown"
              *ngIf="canAccessModule('usuarios') || canAccessModule('roles')"
            >
              <a
                class="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                style="cursor: pointer;"
              >
                <i class="bi bi-person-gear me-1"></i>Usuarios y Permisos
              </a>
              <ul class="dropdown-menu">
                <li *ngIf="canAccessModule('usuarios')">
                  <a
                    class="dropdown-item"
                    (click)="navigateTo('/usuarios')"
                    style="cursor: pointer;"
                  >
                    <i class="bi bi-people me-2"></i>Usuarios
                  </a>
                </li>
                <li *ngIf="canAccessModule('roles')">
                  <a
                    class="dropdown-item"
                    (click)="navigateTo('/roles')"
                    style="cursor: pointer;"
                  >
                    <i class="bi bi-shield-check me-2"></i>Roles
                  </a>
                </li>
              </ul>
            </li>

            <!-- Tareas -->
            <li class="nav-item" *ngIf="canAccessModule('tareas')">
              <a
                class="nav-link"
                (click)="navigateTo('/tareas')"
                style="cursor: pointer;"
              >
                <i class="bi bi-list-task me-1"></i>Tareas
              </a>
            </li>

            <!-- Archivos -->
            <li class="nav-item" *ngIf="canAccessModule('archivos')">
              <a
                class="nav-link"
                (click)="navigateTo('/archivos')"
                style="cursor: pointer;"
              >
                <i class="bi bi-files me-1"></i>Archivos
              </a>
            </li>

            <!-- Reportes -->
            <li class="nav-item" *ngIf="canAccessModule('reportes')">
              <a
                class="nav-link"
                (click)="navigateTo('/reportes')"
                style="cursor: pointer;"
              >
                <i class="bi bi-graph-up me-1"></i>Reportes
              </a>
            </li>
          </ul>

          <div class="navbar-nav">
            <!-- Notificaciones -->
            <div class="nav-item dropdown">
              <a
                class="nav-link position-relative"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                style="cursor: pointer;"
                (click)="showNotifications()"
              >
                <i class="bi bi-bell"></i>
                <span
                  class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                >
                  3
                  <span class="visually-hidden">notificaciones no leídas</span>
                </span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end" style="width: 300px;">
                <li>
                  <h6 class="dropdown-header">Notificaciones</h6>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <a class="dropdown-item" href="#" style="cursor: pointer;">
                    <div class="d-flex align-items-start">
                      <i class="bi bi-info-circle text-primary me-2 mt-1"></i>
                      <div>
                        <strong>Nueva tarea asignada</strong>
                        <small class="text-muted d-block">Hace 2 horas</small>
                      </div>
                    </div>
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" href="#" style="cursor: pointer;">
                    <div class="d-flex align-items-start">
                      <i class="bi bi-check-circle text-success me-2 mt-1"></i>
                      <div>
                        <strong>Documento aprobado</strong>
                        <small class="text-muted d-block">Hace 4 horas</small>
                      </div>
                    </div>
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" href="#" style="cursor: pointer;">
                    <div class="d-flex align-items-start">
                      <i
                        class="bi bi-exclamation-triangle text-warning me-2 mt-1"
                      ></i>
                      <div>
                        <strong>Recordatorio de reunión</strong>
                        <small class="text-muted d-block">Hace 1 día</small>
                      </div>
                    </div>
                  </a>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <a
                    class="dropdown-item text-center"
                    href="#"
                    style="cursor: pointer;"
                  >
                    Ver todas las notificaciones
                  </a>
                </li>
              </ul>
            </div>

            <!-- Usuario -->
            <div class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle d-flex align-items-center"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                style="cursor: pointer;"
              >
                <i class="bi bi-person-circle me-2"></i>
                <span>{{ user?.name || 'Usuario' }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <h6 class="dropdown-header">{{ user?.email }}</h6>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <a
                    class="dropdown-item"
                    (click)="navigateToProfile()"
                    style="cursor: pointer;"
                  >
                    <i class="bi bi-person me-2"></i>Perfil
                  </a>
                </li>
                <li>
                  <a
                    class="dropdown-item"
                    (click)="navigateToSettings()"
                    style="cursor: pointer;"
                  >
                    <i class="bi bi-gear me-2"></i>Configuración
                  </a>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <a
                    class="dropdown-item text-danger"
                    (click)="logout()"
                    style="cursor: pointer;"
                  >
                    <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  user: any = null;
  userPermissions: string[] = [];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      console.log('🔍 HeaderComponent - Usuario recibido:', user);
      this.user = user;
      this.loadUserPermissions();
    });
  }

  private loadUserPermissions(): void {
    console.log(
      '🔍 HeaderComponent - Cargando permisos para usuario:',
      this.user
    );

    if (this.user?.roles) {
      // La estructura del backend usa 'roles' no 'roleIds'
      const permissions = this.user.roles.flatMap(
        (role: any) => role.permissionIds?.map((permId: string) => permId) || []
      );
      this.userPermissions = [...new Set(permissions)].filter(
        (p) => typeof p === 'string'
      ) as string[];

      console.log(
        '🔍 HeaderComponent - Permisos extraídos:',
        this.userPermissions
      );
      console.log('🔍 HeaderComponent - Roles del usuario:', this.user.roles);
    } else {
      console.warn(
        '⚠️ HeaderComponent - No se encontraron roles en el usuario'
      );
    }
  }

  canAccessModule(module: string): boolean {
    console.log(`🔍 HeaderComponent - Verificando acceso a módulo: ${module}`);

    // Si es admin, puede acceder a todo
    if (this.isAdmin()) {
      console.log(
        '✅ HeaderComponent - Usuario es administrador, acceso permitido'
      );
      return true;
    }

    // Por ahora, permitir acceso a todos los módulos hasta configurar permisos específicos
    console.log('✅ HeaderComponent - Acceso permitido (temporal)');
    return true;

    // TODO: Implementar verificación específica de permisos cuando esté configurado
    // return this.userPermissions.includes(module);
  }

  private isAdmin(): boolean {
    const isAdmin =
      this.user?.roles?.some(
        (role: any) => role.name?.toLowerCase() === 'administrador'
      ) || false;

    console.log('🔍 HeaderComponent - ¿Es administrador?:', isAdmin);
    return isAdmin;
  }

  navigateTo(route: string): void {
    console.log('🔍 HeaderComponent - Navegando a:', route);
    // Agregar /dashboard como prefijo para las rutas que lo necesitan
    if (route.startsWith('/usuarios') || route.startsWith('/roles')) {
      this.router.navigate([`/dashboard${route}`]);
    } else {
      this.router.navigate([route]);
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      complete: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  navigateToProfile(): void {
    this.router.navigate(['/dashboard/usuarios/perfil']);
  }

  navigateToSettings(): void {
    this.router.navigate(['/dashboard/configuracion']);
  }

  showNotifications(): void {
    // Implementar lógica para mostrar notificaciones
    console.log('Mostrando notificaciones...');
    // Aquí puedes agregar la lógica para cargar y mostrar notificaciones
  }
}
