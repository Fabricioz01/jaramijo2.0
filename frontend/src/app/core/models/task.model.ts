export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  status: TaskStatus;
  departamentoId: {
    _id: string;
    name: string;
  };
  assignedToIds: {
    _id: string;
    name: string;
    email: string;
  }[];
  attachmentIds: {
    _id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}


export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: Date;
  status?: TaskStatus;
  departamentoId: string;
  assignedToIds?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: Date;
  status?: TaskStatus;
  departamentoId?: string;
  assignedToIds?: string[];
}
