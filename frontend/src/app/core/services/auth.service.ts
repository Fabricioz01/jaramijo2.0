import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  AuthUser,
  ApiResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyTokenResponse,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /**
   * Verifica si el usuario actual tiene permiso para una acción específica sobre un recurso.
   * @param resource El recurso (ej: 'tareas', 'usuarios', etc)
   * @param action La acción (ej: 'read', 'create', 'update', 'delete')
   */
  // Mapeo dinámico de permisos por recurso y acción (igual que en header)
  private permissionMap: { [resource: string]: { [action: string]: string } } =
    {
      usuarios: {
        create: '688280813f95573aed48feeb',
        read: '688280813f95573aed48feec',
        update: '688280813f95573aed48feed',
        delete: '688280813f95573aed48feee',
      },
      roles: {
        create: '688280813f95573aed48feef',
        read: '688280813f95573aed48fef0',
        update: '688280813f95573aed48fef1',
        delete: '688280813f95573aed48fef2',
      },
      tareas: {
        create: '688280813f95573aed48fef3',
        read: '688280813f95573aed48fef4',
        update: '688280813f95573aed48fef5',
        delete: '688280813f95573aed48fef6',
        resolve: '6890f58cc8d9b62df20beb23',
      },
      departamentos: {
        create: '688280813f95573aed48fef7',
        read: '688280813f95573aed48fef8',
        update: '688280813f95573aed48fef9',
        delete: '688280813f95573aed48fefa',
      },
      archivos: {
        read: '688280813f95573aed48fefc',
        delete: '688280813f95573aed48fefd',
      },
      direcciones: {
        create: '68911e142ea99c5dc5e45fc3',
        read: '68911dff2ea99c5dc5e45fbf',
        update: '68911e212ea99c5dc5e45fc7',
        delete: '68911e362ea99c5dc5e45fcb',
      },
    };

  /**
   * Verifica si el usuario actual tiene permiso para una acción específica sobre un recurso.
   */
  public canAccessAction(resource: string, action: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    // Si es admin, acceso total
    if (this.isAdmin(user)) return true;
    const permId = this.permissionMap[resource]?.[action];
    if (!permId) return false;
    const userPerms = this.getUserPermissions(user);
    return userPerms.includes(permId);
  }

  /**
   * Verifica si el usuario actual tiene acceso a un módulo (por ejemplo, para mostrar/ocultar menús o secciones).
   */
  public canAccessModule(resource: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (this.isAdmin(user)) return true;
    const permId = this.permissionMap[resource]?.['read'];
    if (!permId) return false;
    const userPerms = this.getUserPermissions(user);
    return userPerms.includes(permId);
  }

  private isAdmin(user: any): boolean {
    // Verificar si tiene roles poblados
    const roles = user.roles || user.roleIds || [];
    return roles.some(
      (role: any) => role.name?.toLowerCase() === 'administrador'
    );
  }

  private getUserPermissions(user: any): string[] {
    // Si el usuario tiene roles anidados con permisos poblados
    if (user.roles) {
      return user.roles.flatMap(
        (role: any) =>
          role.permissionIds?.map((perm: any) =>
            typeof perm === 'string' ? perm : perm._id
          ) || []
      );
    }
    // Si tiene roleIds poblados con permisos
    if (user.roleIds) {
      return user.roleIds.flatMap(
        (role: any) =>
          role.permissionIds?.map((perm: any) =>
            typeof perm === 'string' ? perm : perm._id
          ) || []
      );
    }
    return [];
  }
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();

    // Verificar estado inicial
    setTimeout(() => {
     
    }, 100);

    // Verificar si hay cambios de permisos pendientes al cargar
    this.checkForPendingUpdates();

    // Función global para debugging (temporal)
    (window as any).debugAuth = () => {
      
    };
  }

  private checkForPendingUpdates(): void {
    // Esperar un poco para que la app se inicialice completamente
    setTimeout(() => {
      if (this.isAuthenticated() && this.getCurrentUser()?._id) {
        this.refreshCurrentUser().subscribe({
          next: (success) => {
            if (success) {
              
            }
          },
          error: (error) => {
            console.debug('Error verificando permisos al inicializar:', error);
          },
        });
      }
    }, 2000);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap((response) => {
          if (response.data) {
            this.setCurrentUser(response.data.user);
            this.setTokens(response.data.tokens);
          }
        }),
        tap(null, (error) => {
          console.error('❌ AuthService: Login error:', error);
        })
      );
  }

  refresh(refreshToken: RefreshTokenRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.API_URL}/refresh`, refreshToken)
      .pipe(
        tap((response) => {
          if (response.data) {
            this.setCurrentUser(response.data.user);
            this.setTokens(response.data.tokens);
          }
        })
      );
  }

  logout(): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/logout`, {}).pipe(
      tap(() => {
        this.clearAuth();
      })
    );
  }

  getCurrentUser(): AuthUser | null {
    let user = this.currentUserSubject.value;

    // Si no hay usuario en el BehaviorSubject, intentar desde localStorage
    if (!user) {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        try {
          user = JSON.parse(userData);
          this.currentUserSubject.next(user);
        } catch (error) {
          console.error(
            '❌ Error parseando usuario desde localStorage:',
            error
          );
        }
      }
    }

    return user;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getCurrentUser();
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  private setCurrentUser(user: AuthUser): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Permite actualizar el usuario logueado desde fuera del AuthService (por ejemplo, tras refrescar desde el backend)
   */
  public setCurrentUserFromDashboard(user: any): void {
    this.setCurrentUser(user);
  }

  /**
   * Obtiene el ID del usuario actual de manera consistente
   * Maneja tanto _id como id para compatibilidad
   */
  private getUserId(user: AuthUser | null): string | null {
    if (!user) return null;
    return user._id || user.id || null;
  }

  /**
   * Refresca los datos del usuario actual desde el backend
   * Útil para actualizar permisos en tiempo real sin hacer logout/login
   */
  public refreshCurrentUser(): Observable<boolean> {
    const currentUser = this.getCurrentUser();

    // Obtener el ID del usuario de manera consistente
    const userId = this.getUserId(currentUser);

    if (!currentUser || !userId) {
      console.warn('❌ No hay usuario actual o ID de usuario para refrescar');
      return new Observable((observer) => {
        observer.next(false);
        observer.complete();
      });
    }


    return this.http.get<ApiResponse<AuthUser>>(`/api/v1/users/${userId}`).pipe(
      tap((response) => {
        if (response.data) {
          this.setCurrentUser(response.data);
        } else {
          console.warn('⚠️ No se recibió data del servidor');
        }
      }),
      map((response) => !!response.data),
      tap(null, (error) => {
        console.error('❌ AuthService: Error refrescando usuario:', error);
        console.error('❌ Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error,
        });
      })
    );
  }

  private setTokens(tokens: {
    accessToken: string;
    refreshToken: string;
  }): void {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('currentUser');

    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('❌ Error parsing user data from localStorage:', error);
        this.clearAuth();
      }
    } else {
      console.warn('⚠️ No hay datos de usuario en localStorage');
    }
  }

  private clearAuth(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Métodos para recuperación de contraseña
  requestPasswordReset(
    email: ForgotPasswordRequest
  ): Observable<ForgotPasswordResponse> {
    return this.http
      .post<ForgotPasswordResponse>(
        `${this.API_URL}/request-password-reset`,
        email
      )
      .pipe(
        tap((response) => {}),
        tap(null, (error) => {
          console.error(
            '❌ AuthService: Error en solicitud de recuperación:',
            error
          );
        })
      );
  }

  verifyResetToken(token: string): Observable<VerifyTokenResponse> {
    return this.http
      .get<VerifyTokenResponse>(`${this.API_URL}/verify-reset-token/${token}`)
      .pipe(
        tap((response) => {}),
        tap(null, (error) => {
          console.error('❌ AuthService: Error verificando token:', error);
        })
      );
  }

  resetPassword(
    resetData: ResetPasswordRequest
  ): Observable<ResetPasswordResponse> {
    return this.http
      .post<ResetPasswordResponse>(`${this.API_URL}/reset-password`, resetData)
      .pipe(
        tap((response) => {}),
        tap(null, (error) => {
          console.error(
            '❌ AuthService: Error restableciendo contraseña:',
            error
          );
        })
      );
  }
}
