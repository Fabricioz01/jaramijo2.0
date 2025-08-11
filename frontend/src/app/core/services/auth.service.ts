import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, BehaviorSubject, tap } from 'rxjs';
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
    // Si el usuario tiene un rol llamado 'administrador'
    return user.roles?.some(
      (role: any) => role.name?.toLowerCase() === 'administrador'
    );
  }

  private getUserPermissions(user: any): string[] {
    // Si el usuario tiene roles anidados (como en header), extraer los permissionIds
    if (user.roles) {
      return user.roles.flatMap((role: any) => role.permissionIds || []);
    }
    // Si solo tiene roleIds, no se puede mapear permisos
    return [];
  }
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
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
    return this.currentUserSubject.value;
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
        console.error('Error parsing user data from localStorage:', error);
        this.clearAuth();
      }
    }
  }

  private clearAuth(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Métodos para recuperación de contraseña
  requestPasswordReset(email: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
    
    return this.http
      .post<ForgotPasswordResponse>(`${this.API_URL}/request-password-reset`, email)
      .pipe(
        tap((response) => {
        }),
        tap(null, (error) => {
          console.error('❌ AuthService: Error en solicitud de recuperación:', error);
        })
      );
  }

  verifyResetToken(token: string): Observable<VerifyTokenResponse> {
    
    return this.http
      .get<VerifyTokenResponse>(`${this.API_URL}/verify-reset-token/${token}`)
      .pipe(
        tap((response) => {
        }),
        tap(null, (error) => {
          console.error('❌ AuthService: Error verificando token:', error);
        })
      );
  }

  resetPassword(resetData: ResetPasswordRequest): Observable<ResetPasswordResponse> {
    
    return this.http
      .post<ResetPasswordResponse>(`${this.API_URL}/reset-password`, resetData)
      .pipe(
        tap((response) => {
        }),
        tap(null, (error) => {
          console.error('❌ AuthService: Error restableciendo contraseña:', error);
        })
      );
  }
}
