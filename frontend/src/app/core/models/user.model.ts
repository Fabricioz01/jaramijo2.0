export interface User {
  _id: string;
  name: string;
  lastName: string;
  cedula: string;
  phone: string;
  position: string;
  email: string;
  direccionId: string | { _id: string; name: string };
  departamentoId: string | { _id: string; name: string; direccionId?: string };
  roleIds: (string | { _id: string; name: string })[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  name: string;
  lastName: string;
  cedula: string;
  phone: string;
  position: string;
  email: string;
  password: string;
  departamentoId: string;
  roleIds?: string[];
}

export interface UpdateUserRequest {
  name?: string;
  lastName?: string;
  cedula?: string;
  phone?: string;
  position?: string;
  email?: string;
  password?: string;
  departamentoId?: string;
  roleIds?: string[];
}
