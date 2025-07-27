export type PermissionAction = 'create' | 'read' | 'update' | 'delete';

export interface Permission {
  _id: string;
  action: PermissionAction;
  resource: string;
  direccionId?: string;
  departamentoId?: string;
  createdAt: Date;
  updatedAt: Date;
}
