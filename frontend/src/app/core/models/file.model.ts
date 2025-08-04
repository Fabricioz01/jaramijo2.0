export type FileMimeType =
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export interface FileModel {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: FileMimeType;
  size: number;
  uploaderId:
    | {
        _id: string;
        name: string;
        email: string;
      }
    | string;
  taskId?: {
    _id: string;
    title: string;
  };
  fileType: 'attachment' | 'resolution';
  createdAt: Date | string;
}
