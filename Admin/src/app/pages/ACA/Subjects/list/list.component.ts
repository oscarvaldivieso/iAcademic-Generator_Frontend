import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { TableModule } from 'src/app/pages/table/table.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { Subject } from 'src/app/Modelos/uni/subject.model';
//import { CreateComponent } from '../create/create.component';
//import { EditComponent } from '../edit/edit.component';
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
    //CreateComponent,
    //EditComponent,
    SkeletonCardComponent
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  // Overlay de carga
  mostrarOverlayCarga = false;
  
  // Estado de carga
  isLoading = true;

  // bread crumb items
  breadCrumbItems!: Array<{}>;

  // Estado de exportación
  exportando = false;
  tipoExportacion: 'excel' | 'pdf' | 'csv' | null = null;

  constructor(
    public table: ReactiveTableService<Subject>, 
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
  materiaEditando: Subject | null = null;
  materiaDetalle: Subject | null = null;
  
  // Propiedades para alertas
  mostrarAlertaExito = false;
  mensajeExito = '';
  mostrarAlertaError = false;
  mensajeError = '';
  mostrarAlertaWarning = false;
  mensajeWarning = '';
  
  // Propiedades para confirmación de eliminación
  mostrarConfirmacionEliminar = false;
  materiaAEliminar: Subject | null = null;

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'UNI' },
      { label: 'Materias', active: true }
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

  editar(materia: Subject): void {
    console.log('Editando materia:', materia);
    
    // Cerrar otros formularios
    this.showCreateForm = false;
    this.showDetailsForm = false;
    
    // Crear una copia del objeto a editar
    this.materiaEditando = { ...materia };
    
    console.log('Materia a editar (copia):', this.materiaEditando);
    
    // Mostrar el formulario de edición
    this.showEditForm = true;
    
    // Desplazarse al formulario de edición
    setTimeout(() => {
      const editFormElement = document.getElementById('editFormCollapse');
      if (editFormElement) {
        editFormElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  /**
   * Maneja el evento cuando se actualiza una materia
   * @param materia La materia que se acaba de actualizar
   */
  onMateriaActualizada(materia: Subject): void {
    // Cerrar el formulario de edición
    this.cerrarFormularioEdicion();
    
    // Mostrar mensaje de éxito
    this.mostrarMensaje('success', 'Materia actualizada exitosamente');
    
    // Recargar los datos
    this.cargarDatos(false);
  }

  detalles(materia: Subject): void {
    this.materiaDetalle = { ...materia };
    this.showDetailsForm = true;
    this.showCreateForm = false;
    this.showEditForm = false;
  }

  cerrarFormulario(): void {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.showDetailsForm = false;
    this.materiaEditando = null;
    this.materiaDetalle = null;
    this.cerrarAlerta();
  }

  cerrarFormularioEdicion(): void {
    this.mostrarOverlayCarga = false;
    this.showEditForm = false;
    this.materiaEditando = null;
  }

  cerrarFormularioDetalles(): void {
    this.showDetailsForm = false;
    this.materiaDetalle = null;
  }

  /**
   * Maneja el evento cuando se guarda una nueva materia
   * @param materia La materia que se acaba de guardar
   */
  onMateriaSaved(materia: Subject): void {
    // Cerrar el formulario de creación
    this.cerrarFormulario();
    
    // Mostrar mensaje de éxito
    this.mostrarMensaje('success', 'Materia creada exitosamente');
    
    // Recargar los datos
    this.cargarDatos(false);
  }

  guardarMateria(materia: Subject): void {
    console.log('Materia guardada exitosamente:', materia);
    this.mostrarMensaje('success', 'Materia creada exitosamente');
    this.cargarDatos(false);
    this.showCreateForm = false;
  }

  actualizarMateria(materia: Subject): void {
    console.log('Materia actualizada exitosamente:', materia);
    this.mostrarMensaje('success', 'Materia actualizada exitosamente');
    this.cargarDatos(false);
    this.showEditForm = false;
  }

  confirmarEliminar(materia: Subject): void {
    this.materiaAEliminar = materia;
    this.mostrarConfirmacionEliminar = true;
  }

  cancelarEliminar(): void {
    this.mostrarConfirmacionEliminar = false;
    this.materiaAEliminar = null;
  }

  eliminar(): void {
    if (!this.materiaAEliminar) return;
    
    console.log('Eliminando materia:', this.materiaAEliminar);
    
    this.mostrarOverlayCarga = true;
    
    const url = `${environment.apiBaseUrl}/Subjects/delete?matCodigo=${this.materiaAEliminar.mat_codigo}`;
    
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
          console.log('Materia eliminada exitosamente');
          this.mostrarMensaje('success', `Materia "${this.materiaAEliminar!.mat_nombre}" eliminada exitosamente`);
          // Forzar recarga de datos
          this.cargarDatos(false);
          this.cancelarEliminar();
        } else {
          // Manejar diferentes códigos de estado si es necesario
          const errorMessage = response?.data?.message_Status || response?.message || 'Error al eliminar la materia.';
          console.error('Error al eliminar:', errorMessage);
          this.mostrarMensaje('error', errorMessage);
          this.cancelarEliminar();
        }
      },
      error: (error) => {
        console.error('Error en la solicitud de eliminación:', error);
        this.mostrarOverlayCarga = false;
        this.mostrarMensaje('error', 'Error de conexión al eliminar la materia.');
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

  // Método para cargar datos de materias
  private cargarDatos(state: boolean): void {
    this.isLoading = true;
    this.mostrarOverlayCarga = state;
    
    const url = `${environment.apiBaseUrl}/Subjects/list`;
    
    this.http.get<ApiResponse<Subject[]>>(url, {
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
          console.log('Datos de materias:', response.data);
          setTimeout(() => {
            this.table.setData(response.data);
            this.table.setPage(1);
            this.isLoading = false;
            this.mostrarOverlayCarga = false;
          }, 500);
        } else {
          console.error('Respuesta de API no exitosa:', response);
          this.mostrarMensaje('error', response.message || 'Error al cargar las materias.');
          this.isLoading = false;
          this.mostrarOverlayCarga = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar las materias:', error);
        
        // Mensaje más específico según el tipo de error
        let mensaje = 'Error al cargar las materias. Por favor, intente de nuevo.';
        if (error.status === 401) {
          mensaje = 'Error de autorización. Verifique la API Key.';
        } else if (error.status === 0) {
          mensaje = 'Error de conexión. Verifique que la API esté funcionando.';
        }
        
        this.mostrarMensaje('error', mensaje);
        this.isLoading = false;
        this.mostrarOverlayCarga = false;
      }
    });
  }
}