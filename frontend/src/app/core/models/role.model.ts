export interface Role {
  _id: string;
  name: string;
  permissionIds: string[];
  createdAt: Date;
  updatedAt: Date;
}
