export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
  };
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface VerifyTokenResponse {
  success: boolean;
  message: string;
  data?: {
    valid: boolean;
    user: {
      name: string;
      email: string;
    };
    expiresAt: Date;
  };
}
