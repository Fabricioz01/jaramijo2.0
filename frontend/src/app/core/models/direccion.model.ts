export interface Direccion {
  _id: string;
  name: string;
  descripcion?: string;
  ubicacion?: string;
  activo?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
