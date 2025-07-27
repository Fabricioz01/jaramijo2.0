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
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log(
      '🔑 AuthService: Attempting login with URL:',
      `${this.API_URL}/login`
    );
    console.log('🔑 AuthService: Credentials:', credentials);

    return this.http
      .post<LoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap((response) => {
          console.log('✅ AuthService: Login successful:', response);
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
}
