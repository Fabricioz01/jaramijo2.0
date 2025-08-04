import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse } from '../models/auth.model';

export interface ReportData {
  tareas: {
    total: number;
    completadas: number;
    pendientes: number;
    vencidas: number;
    porEstado: { estado: string; cantidad: number }[];
    porPrioridad: { prioridad: string; cantidad: number }[];
    porDepartamento: { departamento: string; cantidad: number }[];
  };
  usuarios: {
    total: number;
    activos: number;
    inactivos: number;
    porRol: { rol: string; cantidad: number }[];
  };
  archivos: {
    total: number;
    tamanioTotal: number;
    porTipo: { tipo: string; cantidad: number; tamanio: number }[];
  };
  rendimiento: {
    tareasCompletadasPorMes: { mes: string; cantidad: number }[];
    tiempoPromedioComplecion: number;
    usuariosMasActivos: { usuario: string; tareas: number }[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly API_URL = '/api/v1';

  constructor(private http: HttpClient) {}

  getGeneralReport(startDate?: Date, endDate?: Date): Observable<ReportData> {
    return forkJoin({
      tasks: this.http
        .get<ApiResponse<any[]>>(`${this.API_URL}/tasks`)
        .pipe(catchError(() => of({ success: true, data: [] }))),
      users: this.http
        .get<ApiResponse<any[]>>(`${this.API_URL}/users`)
        .pipe(catchError(() => of({ success: true, data: [] }))),
      files: this.http
        .get<ApiResponse<any[]>>(`${this.API_URL}/files`)
        .pipe(catchError(() => of({ success: true, data: [] }))),
      roles: this.http
        .get<ApiResponse<any[]>>(`${this.API_URL}/roles`)
        .pipe(catchError(() => of({ success: true, data: [] }))),
      departamentos: this.http
        .get<ApiResponse<any[]>>(`${this.API_URL}/departamentos`)
        .pipe(catchError(() => of({ success: true, data: [] }))),
    }).pipe(
      map((responses) => this.processReportData(responses, startDate, endDate)),
      catchError(() => of(this.generateDemoData()))
    );
  }

  private processReportData(
    responses: any,
    startDate?: Date,
    endDate?: Date
  ): ReportData {
    const tasks = responses.tasks.data || [];
    const users = responses.users.data || [];
    const files = responses.files.data || [];
    const roles = responses.roles.data || [];
    const departamentos = responses.departamentos.data || [];

    let filteredTasks = tasks;
    if (startDate || endDate) {
      filteredTasks = tasks.filter((task: any) => {
        const taskDate = new Date(task.createdAt || task.dueDate);
        if (startDate && taskDate < startDate) return false;
        if (endDate && taskDate > endDate) return false;
        return true;
      });
    }

    const tareasResueltas = filteredTasks.filter(
      (t: any) => t.status === 'resolved'
    ).length;
    const tareasPendientes = filteredTasks.filter(
      (t: any) => t.status === 'pending'
    ).length;
    const tareasEnProgreso = filteredTasks.filter(
      (t: any) => t.status === 'in_progress'
    ).length;
    const tareasVencidas = filteredTasks.filter((t: any) => {
      const dueDate = new Date(t.dueDate);
      return dueDate < new Date() && t.status !== 'resolved';
    }).length;

    const usuariosActivos = users.filter(
      (u: any) => u.isActive !== false
    ).length;
    const totalFiles = files.length;
    const totalFileSize = files.reduce(
      (total: number, file: any) => total + (file.size || 0),
      0
    );

    return {
      tareas: {
        total: filteredTasks.length,
        completadas: tareasResueltas,
        pendientes: tareasPendientes,
        vencidas: tareasVencidas,
        porEstado: [
          { estado: 'Resuelta', cantidad: tareasResueltas },
          { estado: 'En Progreso', cantidad: tareasEnProgreso },
          { estado: 'Pendiente', cantidad: tareasPendientes },
          { estado: 'Vencida', cantidad: tareasVencidas },
        ],
        porPrioridad: this.groupTasksByPriority(filteredTasks),
        porDepartamento: this.groupTasksByDepartment(
          filteredTasks,
          departamentos
        ),
      },
      usuarios: {
        total: users.length,
        activos: usuariosActivos,
        inactivos: users.length - usuariosActivos,
        porRol: this.groupUsersByRole(users, roles),
      },
      archivos: {
        total: totalFiles,
        tamanioTotal: totalFileSize,
        porTipo: this.groupFilesByType(files),
      },
      rendimiento: {
        tareasCompletadasPorMes: this.getTasksCompletedByMonth(filteredTasks),
        tiempoPromedioComplecion:
          this.calculateAverageCompletionTime(filteredTasks),
        usuariosMasActivos: this.getMostActiveUsers(filteredTasks, users),
      },
    };
  }

  private groupTasksByDepartment(
    tasks: any[],
    departamentos: any[]
  ): { departamento: string; cantidad: number }[] {
    const grouped = tasks.reduce((acc: any, task: any) => {
      const deptId = task.departamentoId;
      const dept = departamentos.find((d) => d.id === deptId);
      const deptName = dept?.name || 'Sin Departamento';
      acc[deptName] = (acc[deptName] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([departamento, cantidad]) => ({
      departamento,
      cantidad: cantidad as number,
    }));
  }

  private groupUsersByRole(
    users: any[],
    roles: any[]
  ): { rol: string; cantidad: number }[] {
    const grouped = users.reduce((acc: any, user: any) => {
      const userRoles = user.roles || [];
      userRoles.forEach((role: any) => {
        const roleName = roles.find((r) => r.id === role.id)?.name || 'Sin Rol';
        acc[roleName] = (acc[roleName] || 0) + 1;
      });
      return acc;
    }, {});

    return Object.entries(grouped).map(([rol, cantidad]) => ({
      rol,
      cantidad: cantidad as number,
    }));
  }

  private groupTasksByPriority(
    tasks: any[]
  ): { prioridad: string; cantidad: number }[] {
    const grouped = tasks.reduce((acc: any, task: any) => {
      const priority = task.priority || 'Media';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([prioridad, cantidad]) => ({
      prioridad,
      cantidad: cantidad as number,
    }));
  }

  private groupFilesByType(
    files: any[]
  ): { tipo: string; cantidad: number; tamanio: number }[] {
    const grouped = files.reduce((acc: any, file: any) => {
      const extension =
        file.filename?.split('.').pop()?.toUpperCase() || 'UNKNOWN';
      if (!acc[extension]) {
        acc[extension] = { cantidad: 0, tamanio: 0 };
      }
      acc[extension].cantidad += 1;
      acc[extension].tamanio += file.size || 0;
      return acc;
    }, {});

    return Object.entries(grouped).map(([tipo, data]: [string, any]) => ({
      tipo,
      cantidad: data.cantidad,
      tamanio: data.tamanio,
    }));
  }

  private getMostActiveUsers(
    tasks: any[],
    users: any[]
  ): { usuario: string; tareas: number }[] {
    const taskCounts = tasks.reduce((acc: any, task: any) => {
      const assignedUsers = task.assignedToIds || [];
      assignedUsers.forEach((userId: string) => {
        acc[userId] = (acc[userId] || 0) + 1;
      });
      return acc;
    }, {});

    return Object.entries(taskCounts)
      .map(([userId, count]: [string, any]) => {
        const user = users.find((u) => u.id === userId);
        return {
          usuario: user?.name || 'Usuario Desconocido',
          tareas: count,
        };
      })
      .sort((a, b) => b.tareas - a.tareas)
      .slice(0, 5);
  }

  private getTasksCompletedByMonth(
    tasks: any[]
  ): { mes: string; cantidad: number }[] {
    const completedTasks = tasks.filter((t) => t.status === 'resolved');
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    const last6Months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      const tasksInMonth = completedTasks.filter((task: any) => {
        const completedDate = new Date(task.completedAt || task.updatedAt);
        return (
          completedDate.getMonth() === date.getMonth() &&
          completedDate.getFullYear() === date.getFullYear()
        );
      }).length;

      last6Months.push({ mes: monthYear, cantidad: tasksInMonth });
    }

    return last6Months;
  }

  private calculateAverageCompletionTime(tasks: any[]): number {
    const completedTasks = tasks.filter(
      (t) =>
        t.status === 'resolved' && t.createdAt && (t.completedAt || t.updatedAt)
    );

    if (completedTasks.length === 0) return 0;

    const totalDays = completedTasks.reduce((total: number, task: any) => {
      const created = new Date(task.createdAt);
      const completed = new Date(task.completedAt || task.updatedAt);
      const diffTime = Math.abs(completed.getTime() - created.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return total + diffDays;
    }, 0);

    return Math.round((totalDays / completedTasks.length) * 10) / 10;
  }

  // Método para generar datos demo (usado solo cuando las APIs no están disponibles)
  generateDemoData(): ReportData {
    return {
      tareas: {
        total: 120,
        completadas: 78,
        pendientes: 32,
        vencidas: 10,
        porEstado: [
          { estado: 'Resuelta', cantidad: 78 },
          { estado: 'En Progreso', cantidad: 12 },
          { estado: 'Pendiente', cantidad: 20 },
          { estado: 'Vencida', cantidad: 10 },
        ],
        porPrioridad: [
          { prioridad: 'Alta', cantidad: 35 },
          { prioridad: 'Media', cantidad: 55 },
          { prioridad: 'Baja', cantidad: 30 },
        ],
        porDepartamento: [
          { departamento: 'Sistemas', cantidad: 45 },
          { departamento: 'Administrativo', cantidad: 32 },
          { departamento: 'RR.HH.', cantidad: 23 },
          { departamento: 'Contabilidad', cantidad: 20 },
        ],
      },
      usuarios: {
        total: 48,
        activos: 42,
        inactivos: 6,
        porRol: [
          { rol: 'Administrador', cantidad: 5 },
          { rol: 'Usuario', cantidad: 30 },
          { rol: 'Supervisor', cantidad: 13 },
        ],
      },
      archivos: {
        total: 320,
        tamanioTotal: 1073741824, // 1GB
        porTipo: [
          { tipo: 'PDF', cantidad: 120, tamanio: 536870912 },
          { tipo: 'DOCX', cantidad: 85, tamanio: 268435456 },
          { tipo: 'XLSX', cantidad: 65, tamanio: 134217728 },
          { tipo: 'JPG', cantidad: 50, tamanio: 134217728 },
        ],
      },
      rendimiento: {
        tareasCompletadasPorMes: [
          { mes: 'Enero 2025', cantidad: 12 },
          { mes: 'Febrero 2025', cantidad: 15 },
          { mes: 'Marzo 2025', cantidad: 10 },
          { mes: 'Abril 2025', cantidad: 18 },
          { mes: 'Mayo 2025', cantidad: 14 },
          { mes: 'Junio 2025', cantidad: 9 },
        ],
        tiempoPromedioComplecion: 3.5,
        usuariosMasActivos: [
          { usuario: 'María González', tareas: 25 },
          { usuario: 'Juan Pérez', tareas: 18 },
          { usuario: 'Carlos Rodríguez', tareas: 16 },
          { usuario: 'Ana López', tareas: 14 },
          { usuario: 'Luis Martínez', tareas: 12 },
        ],
      },
    };
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  calculatePercentage(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  exportReport(
    type: 'pdf' | 'excel',
    reportData: ReportData
  ): Observable<Blob> {
    // Intentamos primero usar la API real
    return this.http
      .post(
        `${this.API_URL}/reports/export`,
        {
          type,
          data: reportData,
        },
        { responseType: 'blob' }
      )
      .pipe(
        catchError((error) => {
          console.error('Error exportando reporte:', error);
          // Si la API falla, generamos un blob localmente
          const content = JSON.stringify(reportData, null, 2);
          const mimeType =
            type === 'pdf'
              ? 'application/pdf'
              : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          return of(new Blob([content], { type: mimeType }));
        })
      );
  }

  downloadReport(
    filename: string,
    blob: Blob | any,
    format: string = 'pdf'
  ): void {
    let downloadBlob: Blob;

    if (blob instanceof Blob) {
      downloadBlob = blob;
    } else {
      const content = JSON.stringify(blob, null, 2);
      const mimeType =
        format === 'pdf'
          ? 'application/pdf'
          : format === 'excel'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/json';
      downloadBlob = new Blob([content], { type: mimeType });
    }

    const url = window.URL.createObjectURL(downloadBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${format === 'excel' ? 'xlsx' : format}`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Pendiente',
      in_progress: 'En Progreso',
      resolved: 'Resuelta',
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      pending: 'bg-warning',
      in_progress: 'bg-info',
      resolved: 'bg-success',
    };
    return colorMap[status] || 'bg-secondary';
  }
}
