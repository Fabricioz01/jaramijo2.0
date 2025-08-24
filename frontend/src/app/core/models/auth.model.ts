export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data: {
    user: AuthUser;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export interface AuthUser {
  _id?: string;  // ID de MongoDB
  id?: string;   // ID alternativo (para compatibilidad)
  name: string;
  email: string;
  departamentoId: any;
  roleIds: any[];
  roles?: any[]; // Roles poblados
  departamento?: any; // Departamento poblado
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
  details?: string[];
}
