export interface Notification {
  _id?: string;
  message: string;
  taskId: string;
  read: boolean;
  createdAt: Date;
  type: 'task_assigned' | 'task_due_today' | 'task_overdue';
  task?: {
    _id: string;
    title: string;
    description?: string;
    dueDate?: Date;
    status: string;
  };
}

export interface NotificationResponse {
  message: string;
  data: {
    notifications: Notification[];
    unreadCount: number;
  };
}
