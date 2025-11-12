import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { TableModule } from 'src/app/pages/table/table.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { Teachers } from 'src/app/Modelos/aca/teacher.model';
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
  isLoading = true;
  
  breadCrumbItems!: Array<{}>;

  constructor(
    public table: ReactiveTableService<Teachers>, 
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
  docenteEditando: Teachers | null = null;
  docenteDetalle: Teachers | null = null;
  
  // Propiedades para alertas
  mostrarAlertaExito = false;
  mensajeExito = '';
  mostrarAlertaError = false;
  mensajeError = '';
  mostrarAlertaWarning = false;
  mensajeWarning = '';
  
  // Propiedades para confirmación de eliminación
  mostrarConfirmacionEliminar = false;
  docenteAEliminar: Teachers | null = null;

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'ACA' },
      { label: 'Docentes', active: true }
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

  editar(docente: Teachers): void {
    this.docenteEditando = { ...docente };
    this.showEditForm = true;
    this.showCreateForm = false;
    this.showDetailsForm = false;
  }

  detalles(docente: Teachers): void {
    this.docenteDetalle = { ...docente };
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
    this.docenteEditando = null;
  }

  cerrarFormularioDetalles(): void {
    this.showDetailsForm = false;
    this.docenteDetalle = null;
  }

  guardarDocente(docente: Teachers): void {
    console.log('Docente guardado exitosamente:', docente);
    this.mostrarMensaje('success', 'Docente creado exitosamente');
    this.cargarDatos(false);
    this.cerrarFormulario();
  }

  actualizarDocente(docente: Teachers): void {
    console.log('Docente actualizado exitosamente:', docente);
    // Mostrar mensaje de éxito
    this.mostrarMensaje('success', 'Docente actualizado exitosamente');
    // Recargamos los datos para actualizar la tabla con los últimos cambios
    this.cargarDatos(false);
    // Cerramos el formulario de edición
    this.cerrarFormularioEdicion();
  }

  confirmarEliminar(docente: Teachers): void {
    this.docenteAEliminar = docente;
    this.mostrarConfirmacionEliminar = true;
  }

  cancelarEliminar(): void {
    this.mostrarConfirmacionEliminar = false;
    this.docenteAEliminar = null;
  }

  eliminar(): void {
    if (!this.docenteAEliminar) return;
    
    console.log('Eliminando docente:', this.docenteAEliminar);
    
    this.mostrarOverlayCarga = true;
    
    const url = `${environment.apiBaseUrl}/Teachers/delete?id=${this.docenteAEliminar.doc_codigo}`;
    
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
          console.log('Docente eliminado exitosamente');
          this.mostrarMensaje('success', `Docente "${this.docenteAEliminar!.doc_nombre}" eliminado exitosamente`);
          // Forzar recarga de datos
          this.cargarDatos(false);
          this.cancelarEliminar();
        } else {
          // Manejar diferentes códigos de estado si es necesario
          const errorMessage = response?.data?.message_Status || response?.message || 'Error al eliminar el docente.';
          console.error('Error al eliminar:', errorMessage);
          this.mostrarMensaje('error', errorMessage);
          this.cancelarEliminar();
        }
      },
      error: (error) => {
        console.error('Error en la solicitud de eliminación:', error);
        this.mostrarOverlayCarga = false;
        this.mostrarMensaje('error', 'Error de conexión al eliminar el docente.');
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

  // Método para cargar datos de docentes
  private cargarDatos(state: boolean): void {
    this.mostrarOverlayCarga = state;
    this.isLoading = true; // Mostrar skeletons
    
    const url = `${environment.apiBaseUrl}/Teachers/list`;
    
    this.http.get<ApiResponse<Teachers[]>>(url, {
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
          console.log('Datos de docentes:', response.data);
          setTimeout(() => {
            this.table.setData(response.data);
            this.table.setPage(1);
            this.mostrarOverlayCarga = false;
            this.isLoading = false; // Ocultar skeletons cuando los datos estén listos
          }, 500);
        } else {
          console.error('Respuesta de API no exitosa:', response);
          this.mostrarMensaje('error', response.message || 'Error al cargar los docentes.');
          this.mostrarOverlayCarga = false;
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar los docentes:', error);
        
        // Mensaje más específico según el tipo de error
        let mensaje = 'Error al cargar los docentes. Por favor, intente de nuevo.';
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