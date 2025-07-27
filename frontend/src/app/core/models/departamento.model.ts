export interface Departamento {
  _id: string;
  name: string;
  direccionId:
    | string
    | {
        _id: string;
        name: string;
      };
  createdAt: Date;
  updatedAt: Date;
}
