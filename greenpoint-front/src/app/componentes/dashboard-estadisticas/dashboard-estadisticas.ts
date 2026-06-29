import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Publicaciones } from '../../servicios/publicaciones';
import { RouterLink } from '@angular/router';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-estadisticas',
  imports: [CommonModule, ReactiveFormsModule, BaseChartDirective, RouterLink],
  templateUrl: './dashboard-estadisticas.html',
  styleUrl: './dashboard-estadisticas.css',
})
export class DashboardEstadisticas implements OnInit {
  private PublicacionesService = inject(Publicaciones); 

  cargando = signal<boolean>(false);
  formularioFechas: FormGroup;

  // ---  CONFIGURACIÓN GRÁFICO 1: BARRAS (Pubs x Usuario) ---
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: true, labels: { color: 'white' } },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', titleFont: { size: 14 }, bodyFont: { size: 14 } }
    },
    scales: { 
      y: { beginAtZero: true, ticks: { color: '#9ca3af', stepSize: 1 } }, 
      x: { ticks: { color: '#9ca3af' } } 
    }
  };
  public pubPorUsuarioData = signal<ChartConfiguration['data']>({
    labels: [],
    datasets: [{ data: [], label: 'Publicaciones', backgroundColor: '#22c55e', borderRadius: 4 }]
  });

  // --- CONFIGURACIÓN GRÁFICO 2: DONA (Comentarios Totales) ---
  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { position: 'bottom', labels: { color: 'white', font: { size: 14 } } },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', bodyFont: { size: 16 }, padding: 12 }
    }
  };
  public comentariosTotalesData = signal<ChartConfiguration['data']>({
    labels: ['Comentarios Realizados'],
    datasets: [{ data: [0], backgroundColor: ['#a855f7'], hoverBackgroundColor: ['#9333ea'], borderWidth: 0 }]
  });

  // --- CONFIGURACIÓN GRÁFICO 3: LÍNEAS (Comentarios x Pub) ---
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: true, labels: { color: 'white' } },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.8)' }
    },
    scales: { 
      y: { beginAtZero: true, ticks: { color: '#9ca3af', stepSize: 1 } }, 
      x: { ticks: { color: '#9ca3af', maxRotation: 45, minRotation: 45 } } 
    }
  };
  public comPorPubData = signal<ChartConfiguration['data']>({
    labels: [],
    datasets: [{ data: [], label: 'Comentarios', borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.2)', fill: true, tension: 0.4 }]
  });

  constructor() {
    // Fechas por defecto: últimos 30 días
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setDate(hoy.getDate() - 30);

    this.formularioFechas = new FormGroup({
      inicio: new FormControl(haceUnMes.toISOString().split('T')[0], Validators.required),
      fin: new FormControl(hoy.toISOString().split('T')[0], Validators.required)
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    if(this.formularioFechas.invalid) return;

    this.cargando.set(true);
    const { inicio, fin } = this.formularioFechas.value;

    // --- Cargar publicaciones por usuario ---
    this.PublicacionesService.obtenerEstadisticasPublicaciones(inicio, fin).subscribe({
      next: (data: any[]) => {
        this.pubPorUsuarioData.set({
          labels: data.map(item => item.nombreUsuario),
          datasets: [{ ...this.pubPorUsuarioData().datasets[0], data: data.map(item => item.cantidad) }]
        });
      }
    });

    //--- Cargar comentarios totales ---
    this.PublicacionesService.obtenerEstadisticasComentariosTotales(inicio, fin).subscribe({
      next: (data: any) => {
        this.comentariosTotalesData.set({
          labels: ['Total de Comentarios'],
          datasets: [{ ...this.comentariosTotalesData().datasets[0], data: [data.totalComentarios || 0] }]
        });
      }
    });

    //--- Cargar comentarios por publicación ---
    this.PublicacionesService.obtenerEstadisticasComentariosPorPublicacion(inicio, fin).subscribe({
      next: (data: any[]) => {
        // Recortamos el título a 15 caracteres para que no rompa el gráfico
        this.comPorPubData.set({
          labels: data.map(item => item.titulo.length > 15 ? item.titulo.substring(0, 15) + '...' : item.titulo),
          datasets: [{ ...this.comPorPubData().datasets[0], data: data.map(item => item.cantidadComentarios) }]
        });
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}