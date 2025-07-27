export type FileMimeType =
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export interface FileModel {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: FileMimeType;
  size: number;
  uploaderId: string;
  taskId?: string;
  createdAt: Date;
}
