import { Component, OnInit, HostListener } from '@angular/core';
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
          (click)="toggleMobileMenu()"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div
          class="collapse navbar-collapse"
          [class.show]="showMobileMenu"
          id="navbarNav"
        >
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
              class="nav-item dropdown position-relative"
              *ngIf="
                canAccessModule('direcciones') ||
                canAccessModule('departamentos')
              "
            >
              <a
                class="nav-link dropdown-toggle"
                href="#"
                role="button"
                (click)="toggleDropdown('organizacion', $event)"
                style="cursor: pointer;"
              >
                <i class="bi bi-people me-1"></i>Organización
              </a>
              <ul
                class="dropdown-menu"
                [class.show]="activeDropdown === 'organizacion'"
              >
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
            <ng-container
              *ngIf="canAccessModule('usuarios') || canAccessModule('roles')"
            >
              <li
                class="nav-item dropdown position-relative"
                *ngIf="canAccessModule('usuarios') || canAccessModule('roles')"
              >
                <a
                  class="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  (click)="toggleDropdown('usuarios', $event)"
                  style="cursor: pointer;"
                >
                  <i class="bi bi-person-gear me-1"></i>Usuarios y Permisos
                </a>
                <ul
                  class="dropdown-menu"
                  [class.show]="activeDropdown === 'usuarios'"
                >
                  <ng-container *ngIf="canAccessModule('usuarios')">
                    <li>
                      <a
                        class="dropdown-item"
                        (click)="navigateTo('/usuarios')"
                        style="cursor: pointer;"
                      >
                        <i class="bi bi-people me-2"></i>Usuarios
                      </a>
                    </li>
                  </ng-container>
                  <ng-container *ngIf="canAccessModule('roles')">
                    <li>
                      <a
                        class="dropdown-item"
                        (click)="navigateTo('/roles')"
                        style="cursor: pointer;"
                      >
                        <i class="bi bi-shield-check me-2"></i>Roles
                      </a>
                    </li>
                  </ng-container>
                </ul>
              </li>
            </ng-container>

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
            <div class="nav-item dropdown position-relative">
              <a
                class="nav-link position-relative"
                href="#"
                role="button"
                (click)="toggleDropdown('notificaciones', $event)"
                style="cursor: pointer;"
              >
                <i class="bi bi-bell"></i>
                <span
                  class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                >
                  3
                  <span class="visually-hidden">notificaciones no leídas</span>
                </span>
              </a>
              <ul
                class="dropdown-menu dropdown-menu-end"
                [class.show]="activeDropdown === 'notificaciones'"
                style="width: 300px;"
              >
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
            <div class="nav-item dropdown position-relative">
              <a
                class="nav-link dropdown-toggle d-flex align-items-center"
                href="#"
                role="button"
                (click)="toggleDropdown('usuario', $event)"
                style="cursor: pointer;"
              >
                <i class="bi bi-person-circle me-2"></i>
                <span>{{ user?.name || 'Usuario' }}</span>
              </a>
              <ul
                class="dropdown-menu dropdown-menu-end"
                [class.show]="activeDropdown === 'usuario'"
              >
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
  showMobileMenu = false;
  activeDropdown: string | null = null;

  constructor(public authService: AuthService, private router: Router) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Cerrar dropdowns cuando se hace clic fuera de ellos
    this.activeDropdown = null;
  }

  ngOnInit(): void {
    console.log('🔧 HeaderComponent - Inicializando componente');
    this.authService.currentUser$.subscribe((user) => {
      console.log('🔍 HeaderComponent - Usuario recibido:', user);
      this.user = user;
    });
  }

  // Eliminar lógica local de permisos. Usar solo AuthService

  // ---

  // Getters para exponer los métodos de AuthService al template
  canAccessModule(resource: string): boolean {
    return this.authService.canAccessModule(resource);
  }
  canAccessAction(
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete'
  ): boolean {
    return this.authService.canAccessAction(resource, action);
  }

  // ---
  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    console.log(
      '📱 HeaderComponent - Mobile menu toggled:',
      this.showMobileMenu
    );
  }

  toggleDropdown(dropdownName: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.activeDropdown === dropdownName) {
      this.activeDropdown = null;
      console.log(`🔽 HeaderComponent - Cerrando dropdown: ${dropdownName}`);
    } else {
      this.activeDropdown = dropdownName;
      console.log(`🔽 HeaderComponent - Abriendo dropdown: ${dropdownName}`);
    }
  }

  navigateTo(route: string): void {
    console.log('🔍 HeaderComponent - Navegando a:', route);
    this.activeDropdown = null; // Cerrar dropdown después de navegar
    this.router.navigate([route]);
  }

  navigateToProfile(): void {
    console.log('👤 HeaderComponent - Navegando a perfil');
    this.activeDropdown = null;
    this.router.navigate(['/usuarios/perfil']);
  }

  navigateToSettings(): void {
    console.log('⚙️ HeaderComponent - Navegando a configuración');
    this.activeDropdown = null;
    this.router.navigate(['/configuracion']);
  }

  logout(): void {
    console.log('🚪 HeaderComponent - Cerrando sesión');
    this.activeDropdown = null;
    this.authService.logout().subscribe({
      complete: () => {
        this.router.navigate(['/login']);
      },
    });
  }
}
