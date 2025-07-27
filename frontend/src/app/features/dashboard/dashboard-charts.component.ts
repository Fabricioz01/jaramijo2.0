import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-charts.component.html',
  styleUrls: ['./dashboard-charts.component.scss'],
})
export class DashboardChartsComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @Input() tareasPorEstado: { estado: string; cantidad: number }[] = [];
  @Input() tareasPorMes: { mes: string; cantidad: number }[] = [];
  @Input() archivosPorTipo: { tipo: string; cantidad: number }[] = [];
  @Input() usuariosPorRol: { rol: string; cantidad: number }[] = [];

  private chart1: Chart | undefined;
  private chart2: Chart | undefined;
  private chart3: Chart | undefined;
  private chart4: Chart | undefined;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.renderCharts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart1 || this.chart2 || this.chart3 || this.chart4) {
      this.updateCharts();
    }
  }

  private renderCharts(): void {
    // 1. Tareas por Estado (Barra horizontal)
    const ctx1 = document.getElementById('chart1') as HTMLCanvasElement;
    if (ctx1) {
      this.chart1 = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: this.tareasPorEstado.map((e) => e.estado),
          datasets: [
            {
              label: 'Tareas',
              data: this.tareasPorEstado.map((e) => e.cantidad),
              backgroundColor: '#0d6efd',
              borderRadius: 6,
              barPercentage: 0.7,
              categoryPercentage: 0.6,
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: false },
          },
          scales: {
            x: { beginAtZero: true },
            y: { ticks: { color: '#333', font: { size: 13, weight: 'bold' } } },
          },
        },
      });
    }

    // 2. Tareas completadas por mes (Línea)
    const ctx2 = document.getElementById('chart2') as HTMLCanvasElement;
    if (ctx2) {
      this.chart2 = new Chart(ctx2, {
        type: 'line',
        data: {
          labels: this.tareasPorMes.map((e) => e.mes),
          datasets: [
            {
              label: 'Completadas',
              data: this.tareasPorMes.map((e) => e.cantidad),
              borderColor: '#198754',
              backgroundColor: 'rgba(25,135,84,0.2)',
              tension: 0.3,
              fill: true,
              pointRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: false },
          },
          scales: {
            x: { ticks: { color: '#333' } },
            y: { beginAtZero: true, ticks: { color: '#333' } },
          },
        },
      });
    }

    // 3. Archivos por tipo (Doughnut)
    const ctx3 = document.getElementById('chart3') as HTMLCanvasElement;
    if (ctx3) {
      this.chart3 = new Chart(ctx3, {
        type: 'doughnut',
        data: {
          labels: this.archivosPorTipo.map((e) => e.tipo),
          datasets: [
            {
              data: this.archivosPorTipo.map((e) => e.cantidad),
              backgroundColor: [
                '#0dcaf0',
                '#ffc107',
                '#dc3545',
                '#20c997',
                '#6f42c1',
                '#fd7e14',
              ],
              borderWidth: 2,
              borderColor: '#fff',
              hoverOffset: 8,
            },
          ],
        },
        options: {
          responsive: true,
          cutout: '65%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#333', font: { size: 13 } },
            },
            title: { display: false },
          },
        },
      });
    }

    // 4. Usuarios por rol (Barra)
    const ctx4 = document.getElementById('chart4') as HTMLCanvasElement;
    if (ctx4) {
      this.chart4 = new Chart(ctx4, {
        type: 'bar',
        data: {
          labels: this.usuariosPorRol.map((e) => e.rol),
          datasets: [
            {
              label: 'Usuarios',
              data: this.usuariosPorRol.map((e) => e.cantidad),
              backgroundColor: '#6610f2',
              borderRadius: 6,
              barPercentage: 0.7,
              categoryPercentage: 0.6,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: false },
          },
          scales: {
            x: { ticks: { color: '#333' } },
            y: { beginAtZero: true, ticks: { color: '#333' } },
          },
        },
      });
    }
  }

  private updateCharts(): void {
    if (this.chart1) {
      this.chart1.data.labels = this.tareasPorEstado.map((e) => e.estado);
      (this.chart1.data.datasets[0].data as number[]) =
        this.tareasPorEstado.map((e) => e.cantidad);
      this.chart1.update();
    }
    if (this.chart2) {
      this.chart2.data.labels = this.tareasPorMes.map((e) => e.mes);
      (this.chart2.data.datasets[0].data as number[]) = this.tareasPorMes.map(
        (e) => e.cantidad
      );
      this.chart2.update();
    }
    if (this.chart3) {
      this.chart3.data.labels = this.archivosPorTipo.map((e) => e.tipo);
      (this.chart3.data.datasets[0].data as number[]) =
        this.archivosPorTipo.map((e) => e.cantidad);
      this.chart3.update();
    }
    if (this.chart4) {
      this.chart4.data.labels = this.usuariosPorRol.map((e) => e.rol);
      (this.chart4.data.datasets[0].data as number[]) = this.usuariosPorRol.map(
        (e) => e.cantidad
      );
      this.chart4.update();
    }
  }
}
