export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  status: TaskStatus;
  departamentoId: string;
  assignedToIds: string[];
  attachmentIds: string[];
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
