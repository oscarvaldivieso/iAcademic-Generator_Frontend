import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { TableModule } from 'src/app/pages/table/table.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { Areas } from 'src/app/Modelos/aca/area.model';
import { CreateComponent } from '../create/create.component';
import { EditComponent } from '../edit/edit.component';
import { BreadcrumbsComponent } from 'src/app/shared/breadcrumbs/breadcrumbs.component';
import { ReactiveTableService } from 'src/app/shared/reactive-table.service';
import { SkeletonCardComponent } from 'src/app/shared/skeleton-card/skeleton-card.component';

interface ApiResponse<T> {
  type: number;
  code: number;
  success: boolean;
  message: string;
  data: T;
}

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    BreadcrumbsComponent,
    TableModule,
    PaginationModule,
    CreateComponent,
    EditComponent,
    SkeletonCardComponent
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  // Estados de carga
  mostrarOverlayCarga = false;
  isLoading = true; // Para controlar los skeletons
  
  // bread crumb items
  breadCrumbItems!: Array<{}>;

  // Estado de exportación
  exportando = false;
  tipoExportacion: 'excel' | 'pdf' | 'csv' | null = null;

  constructor(
    public table: ReactiveTableService<Areas>, 
    private http: HttpClient, 
    private router: Router, 
    private route: ActivatedRoute
  ) {
    this.cargarDatos(true);
  }   

  // Propiedades de control de formularios
  showCreateForm = false;
  showEditForm = false;
  showDetailsForm = false;
  areaEditando: Areas | null = null;
  areaDetalle: Areas | null = null;
  
  // Propiedades para alertas
  mostrarAlertaExito = false;
  mensajeExito = '';
  mostrarAlertaError = false;
  mensajeError = '';
  mostrarAlertaWarning = false;
  mensajeWarning = '';
  
  // Propiedades para confirmación de eliminación
  mostrarConfirmacionEliminar = false;
  areaAEliminar: Areas | null = null;

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'UNI' },
      { label: 'Áreas', active: true }
    ];
  }

  /**
   * Sistema de mensajes mejorado con tipos adicionales
   */
  private mostrarMensaje(tipo: 'success' | 'error' | 'warning' | 'info', mensaje: string): void {
    this.cerrarAlerta();
    
    const duracion = tipo === 'error' ? 5000 : 3000;
    
    switch (tipo) {
      case 'success':
        this.mostrarAlertaExito = true;
        this.mensajeExito = mensaje;
        setTimeout(() => this.mostrarAlertaExito = false, duracion);
        break;
        
      case 'error':
        this.mostrarAlertaError = true;
        this.mensajeError = mensaje;
        setTimeout(() => this.mostrarAlertaError = false, duracion);
        break;
        
      case 'warning':
      case 'info':
        this.mostrarAlertaWarning = true;
        this.mensajeWarning = mensaje;
        setTimeout(() => this.mostrarAlertaWarning = false, duracion);
        break;
    }
  }

  // Métodos para los botones de acción principales
  crear(): void {
    this.showCreateForm = !this.showCreateForm;
    this.showEditForm = false;
    this.showDetailsForm = false;
  }

  editar(area: Areas): void {
    this.areaEditando = { ...area };
    this.showEditForm = true;
    this.showCreateForm = false;
    this.showDetailsForm = false;
  }

  detalles(area: Areas): void {
    this.areaDetalle = { ...area };
    this.showDetailsForm = true;
    this.showCreateForm = false;
    this.showEditForm = false;
  }

  cerrarFormulario(): void {
    this.showCreateForm = false;
  }

  cerrarFormularioEdicion(): void {
    this.mostrarOverlayCarga = false;
    this.showEditForm = false;
    this.areaEditando = null;
  }

  cerrarFormularioDetalles(): void {
    this.showDetailsForm = false;
    this.areaDetalle = null;
  }

  guardarArea(area: Areas): void {
    console.log('Área guardada exitosamente:', area);
    this.mostrarMensaje('success', 'Área creada exitosamente');
    this.cargarDatos(false);
    this.cerrarFormulario();
  }

  actualizarArea(area: Areas): void {
    console.log('Área actualizada exitosamente:', area);
    // Mostrar mensaje de éxito
    this.mostrarMensaje('success', 'Área actualizada exitosamente');
    // Recargamos los datos para actualizar la tabla con los últimos cambios
    this.cargarDatos(false);
    // Cerramos el formulario de edición
    this.cerrarFormularioEdicion();
  }

  confirmarEliminar(area: Areas): void {
    this.areaAEliminar = area;
    this.mostrarConfirmacionEliminar = true;
  }

  cancelarEliminar(): void {
    this.mostrarConfirmacionEliminar = false;
    this.areaAEliminar = null;
  }

  eliminar(): void {
    if (!this.areaAEliminar) return;
    
    console.log('Eliminando área:', this.areaAEliminar);
    
    this.mostrarOverlayCarga = true;
    
    const url = `${environment.apiBaseUrl}/Areas/delete?areCode=${this.areaAEliminar.are_codigo}`;
    
    this.http.delete<ApiResponse<any>>(url, {
      headers: new HttpHeaders({
        'XApiKey': environment.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    }).subscribe({
      next: (response) => {
        this.mostrarOverlayCarga = false;
        
        if (response && response.success) {
          console.log('Área eliminada exitosamente');
          this.mostrarMensaje('success', `Área "${this.areaAEliminar!.are_nombre}" eliminada exitosamente`);
          // Forzar recarga de datos
          this.cargarDatos(false);
          this.cancelarEliminar();
        } else {
          // Manejar diferentes códigos de estado si es necesario
          const errorMessage = response?.data?.message_Status || response?.message || 'Error al eliminar el área.';
          console.error('Error al eliminar:', errorMessage);
          this.mostrarMensaje('error', errorMessage);
          this.cancelarEliminar();
        }
      },
      error: (error) => {
        console.error('Error en la solicitud de eliminación:', error);
        this.mostrarOverlayCarga = false;
        this.mostrarMensaje('error', 'Error de conexión al eliminar el área.');
        this.cancelarEliminar();
      },
      complete: () => {
        // Código de finalización si es necesario
      }
    });
  }

  cerrarAlerta(): void {
    this.mostrarAlertaExito = false;
    this.mostrarAlertaError = false;
    this.mostrarAlertaWarning = false;
  }

  // Método para cargar datos de áreas
  private cargarDatos(state: boolean): void {
    this.mostrarOverlayCarga = state;
    this.isLoading = true; // Mostrar skeletons
    
    const url = `${environment.apiBaseUrl}/Areas/List`;
    
    this.http.get<ApiResponse<Areas[]>>(url, {
      headers: { 
        'XApiKey': environment.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true
    }).subscribe({
      next: (response) => {
        console.log('Respuesta completa de la API:', response);
        
        if (response.success && response.data) {
          console.log('Datos de áreas:', response.data);
          setTimeout(() => {
            this.table.setData(response.data);
            this.table.setPage(1);
            this.mostrarOverlayCarga = false;
            this.isLoading = false; // Ocultar skeletons cuando los datos estén listos
          }, 500);
        } else {
          console.error('Respuesta de API no exitosa:', response);
          this.mostrarMensaje('error', response.message || 'Error al cargar las áreas.');
          this.mostrarOverlayCarga = false;
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar las áreas:', error);
        
        // Mensaje más específico según el tipo de error
        let mensaje = 'Error al cargar las áreas. Por favor, intente de nuevo.';
        if (error.status === 401) {
          mensaje = 'Error de autorización. Verifique la API Key.';
        } else if (error.status === 0) {
          mensaje = 'Error de conexión. Verifique que la API esté funcionando.';
        }
        
        this.mostrarMensaje('error', mensaje);
        this.mostrarOverlayCarga = false;
        this.isLoading = false;
      }
    });
  }
}