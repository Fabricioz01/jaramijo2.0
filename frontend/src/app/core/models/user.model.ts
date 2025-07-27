export interface User {
  _id: string;
  name: string;
  email: string;
  departamentoId: string;
  roleIds: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  departamentoId: string;
  roleIds?: string[];
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  departamentoId?: string;
  roleIds?: string[];
}
