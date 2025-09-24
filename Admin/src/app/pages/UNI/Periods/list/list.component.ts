import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { TableModule } from 'src/app/pages/table/table.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { Period } from 'src/app/Modelos/uni/period.model';
import { CreateComponent } from '../create/create.component';
import { EditComponent } from '../edit/edit.component';
import { BreadcrumbsComponent } from 'src/app/shared/breadcrumbs/breadcrumbs.component';
import { ReactiveTableService } from 'src/app/shared/reactive-table.service';

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
    EditComponent
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  // Overlay de carga
  mostrarOverlayCarga = false;
  
  // bread crumb items
  breadCrumbItems!: Array<{}>;

  // Estado de exportación
  exportando = false;
  tipoExportacion: 'excel' | 'pdf' | 'csv' | null = null;

  constructor(
    public table: ReactiveTableService<Period>, 
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
  periodoEditando: Period | null = null;
  periodoDetalle: Period | null = null;
  
  // Propiedades para alertas
  mostrarAlertaExito = false;
  mensajeExito = '';
  mostrarAlertaError = false;
  mensajeError = '';
  mostrarAlertaWarning = false;
  mensajeWarning = '';
  
  // Propiedades para confirmación de eliminación
  mostrarConfirmacionEliminar = false;
  periodoAEliminar: Period | null = null;

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'UNI' },
      { label: 'Períodos', active: true }
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

  editar(periodo: Period): void {
    this.periodoEditando = { ...periodo };
    this.showEditForm = true;
    this.showCreateForm = false;
    this.showDetailsForm = false;
  }

  detalles(periodo: Period): void {
    this.periodoDetalle = { ...periodo };
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
    this.periodoEditando = null;
  }

  cerrarFormularioDetalles(): void {
    this.showDetailsForm = false;
    this.periodoDetalle = null;
  }

  guardarPeriodo(periodo: Period): void {
    console.log('Período guardado exitosamente:', periodo);
    this.mostrarMensaje('success', 'Período creado exitosamente');
    this.cargarDatos(false);
    this.showCreateForm = false;
  }

  actualizarPeriodo(periodo: Period): void {
    console.log('Período actualizado exitosamente:', periodo);
    this.mostrarMensaje('success', 'Período actualizado exitosamente');
    this.cargarDatos(false);
    this.showEditForm = false;
  }

  confirmarEliminar(periodo: Period): void {
    this.periodoAEliminar = periodo;
    this.mostrarConfirmacionEliminar = true;
  }

  cancelarEliminar(): void {
    this.mostrarConfirmacionEliminar = false;
    this.periodoAEliminar = null;
  }

  eliminar(): void {
    if (!this.periodoAEliminar) return;
    
    console.log('Eliminando período:', this.periodoAEliminar);
    
    this.mostrarOverlayCarga = true;
    
    const url = `${environment.apiBaseUrl}/Periods/delete?perCodigo=${this.periodoAEliminar.per_codigo}`;
    
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
          console.log('Período eliminado exitosamente');
          this.mostrarMensaje('success', `Período "${this.periodoAEliminar!.per_modulo} - ${this.periodoAEliminar!.per_anio}" eliminado exitosamente`);
          // Forzar recarga de datos
          this.cargarDatos(false);
          this.cancelarEliminar();
        } else {
          // Manejar diferentes códigos de estado si es necesario
          const errorMessage = response?.data?.message_Status || response?.message || 'Error al eliminar el período.';
          console.error('Error al eliminar:', errorMessage);
          this.mostrarMensaje('error', errorMessage);
          this.cancelarEliminar();
        }
      },
      error: (error) => {
        console.error('Error en la solicitud de eliminación:', error);
        this.mostrarOverlayCarga = false;
        this.mostrarMensaje('error', 'Error de conexión al eliminar el período.');
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

  // Método para cargar datos de períodos
  private cargarDatos(state: boolean): void {
    this.mostrarOverlayCarga = state;
    
    const url = `${environment.apiBaseUrl}/Periods/list`;
    
    this.http.get<ApiResponse<Period[]>>(url, {
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
          console.log('Datos de períodos:', response.data);
          setTimeout(() => {
            this.table.setData(response.data);
            this.table.setPage(1);
            this.mostrarOverlayCarga = false;
          }, 500);
        } else {
          console.error('Respuesta de API no exitosa:', response);
          this.mostrarMensaje('error', response.message || 'Error al cargar los períodos.');
          this.mostrarOverlayCarga = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar los períodos:', error);
        
        // Mensaje más específico según el tipo de error
        let mensaje = 'Error al cargar los períodos. Por favor, intente de nuevo.';
        if (error.status === 401) {
          mensaje = 'Error de autorización. Verifique la API Key.';
        } else if (error.status === 0) {
          mensaje = 'Error de conexión. Verifique que la API esté funcionando.';
        }
        
        this.mostrarMensaje('error', mensaje);
        this.mostrarOverlayCarga = false;
      }
    });
  }
}