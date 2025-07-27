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
  _id: string;
  name: string;
  email: string;
  departamentoId: any;
  roleIds: any[];
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
