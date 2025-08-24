import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { AuthService } from './auth.service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionSyncService {
  private refreshingSubject = new BehaviorSubject<boolean>(false);
  public refreshing$ = this.refreshingSubject.asObservable();
  private lastUserUpdate: Date | null = null;

  constructor(
    private authService: AuthService,
    private alertService: AlertService
  ) {
    // Iniciar verificación periódica cada 30 segundos
    this.startPeriodicCheck();
  }

  private startPeriodicCheck(): void {
    // Verificar cada 30 segundos si hay cambios
    interval(30000).subscribe(() => {
      this.checkForUpdates();
    });
  }

  private checkForUpdates(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    // Obtener la información actual del usuario desde el backend
    this.authService.refreshCurrentUser().subscribe({
      next: (success) => {
        if (success) {
          const updatedUser = this.authService.getCurrentUser();

          // Comparar timestamps de actualización
          if (updatedUser?.updatedAt && this.lastUserUpdate) {
            const updatedTime = new Date(updatedUser.updatedAt);
            if (updatedTime > this.lastUserUpdate) {
              // Los permisos fueron actualizados, mostrar notificación
              this.alertService.info(
                'Tus permisos han sido actualizados automáticamente.'
              );
            }
          }

          if (updatedUser?.updatedAt) {
            this.lastUserUpdate = new Date(updatedUser.updatedAt);
          }
        }
      },
      error: (error) => {
        // Error silencioso, no molestar al usuario
        console.debug('Error verificando actualizaciones de permisos:', error);
      },
    });
  }

  /**
   * Refresca los permisos del usuario actual
   * Debe llamarse cuando se modifiquen roles o permisos que puedan afectar al usuario actual
   */
  refreshUserPermissions(showNotification = true): Observable<boolean> {
    this.refreshingSubject.next(true);

    // Verificación adicional del usuario
    let currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        try {
          currentUser = JSON.parse(userData);
          this.authService.setCurrentUserFromDashboard(currentUser);
        } catch (error) {
          console.error('❌ Error restaurando usuario:', error);
        }
      }
    }

    return new Observable((observer) => {
      this.authService.refreshCurrentUser().subscribe({
        next: (success) => {
          this.refreshingSubject.next(false);

          if (success && showNotification) {
            this.alertService.info(
              'Tus permisos han sido actualizados. Los cambios se reflejarán inmediatamente.'
            );
          }

          // Actualizar el timestamp para futuras comparaciones
          const updatedUser = this.authService.getCurrentUser();
          if (updatedUser?.updatedAt) {
            this.lastUserUpdate = new Date(updatedUser.updatedAt);
          }

          observer.next(success);
          observer.complete();
        },
        error: (error) => {
          this.refreshingSubject.next(false);
          console.error('❌ Error refrescando permisos:', error);

          observer.next(false);
          observer.complete();
        },
      });
    });
  }

  /**
   * Notifica que un rol fue modificado y refresca permisos si es necesario
   */
  notifyRoleUpdated(): void {
    // Verificar que tenemos el usuario antes de intentar refrescar
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      console.warn(
        '⚠️ No hay usuario actual, intentando recargar desde localStorage'
      );
      // Forzar recarga desde localStorage
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          this.authService.setCurrentUserFromDashboard(user);
        } catch (error) {
          console.error(
            '❌ Error parseando usuario desde localStorage:',
            error
          );
          return;
        }
      } else {
        console.error('❌ No hay datos de usuario en localStorage tampoco');
        return;
      }
    }

    // Ahora intentar refrescar con notificación visible
    this.refreshUserPermissions(true).subscribe({
      next: (success) => {
        if (success) {
        } else {
          console.warn('⚠️ No se pudieron actualizar los permisos');
        }
      },
    });
  }

  /**
   * Notifica que un usuario fue modificado y refresca si es el usuario actual
   */
  notifyUserUpdated(userId: string): void {
    const currentUser = this.authService.getCurrentUser();
    const currentUserId = currentUser?._id || currentUser?.id;

    if (currentUserId === userId) {
      // Refrescar inmediatamente sin notificación visible
      this.refreshUserPermissions(false).subscribe();
    }
  }

  /**
   * Inicializa el timestamp de última actualización
   */
  initializeLastUpdate(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.updatedAt) {
      this.lastUserUpdate = new Date(currentUser.updatedAt);
    }
  }
}
