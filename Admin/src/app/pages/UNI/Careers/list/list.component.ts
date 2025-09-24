import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { BreadcrumbsComponent } from 'src/app/shared/breadcrumbs/breadcrumbs.component';
import { ReactiveTableService } from 'src/app/shared/reactive-table.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { TableModule } from 'src/app/pages/table/table.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { Careers } from 'src/app/Modelos/uni/career.model';
import { CreateComponent } from '../create/create.component';
import { EditComponent } from '../edit/edit.component';
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
  styleUrls: ['./list.component.scss'],
  animations: [
    trigger('fadeExpand', [
      transition(':enter', [
        style({
          height: '0',
          opacity: 0,
          transform: 'scaleY(0.90)',
          overflow: 'hidden'
        }),
        animate(
          '300ms ease-out',
          style({
            height: '*',
            opacity: 1,
            transform: 'scaleY(1)',
            overflow: 'hidden'
          })
        )
      ]),
      transition(':leave', [
        style({ overflow: 'hidden' }),
        animate(
          '300ms ease-in',
          style({
            height: '0',
            opacity: 0,
            transform: 'scaleY(0.95)'
          })
        )
      ])
    ])
  ]
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
    public table: ReactiveTableService<Careers>, 
    private http: HttpClient, 
    private router: Router, 
    private route: ActivatedRoute
  ) {
    this.cargardatos(true);
  }   

  // Propiedades de control de formularios
  showCreateForm = false;
  showEditForm = false;
  showDetailsForm = false;
  carreraEditando: Careers | null = null;
  carreraDetalle: Careers | null = null;
  
  // Propiedades para alertas
  mostrarAlertaExito = false;
  mensajeExito = '';
  mostrarAlertaError = false;
  mensajeError = '';
  mostrarAlertaWarning = false;
  mensajeWarning = '';
  
  // Propiedades para confirmación de eliminación
  mostrarConfirmacionEliminar = false;
  carreraAEliminar: Careers | null = null;

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'UNI' },
      { label: 'Carreras', active: true }
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
    console.log('Toggleando formulario de creación...');
    this.showCreateForm = !this.showCreateForm;
    this.showEditForm = false;
    this.showDetailsForm = false;
  }

  editar(carrera: Careers): void {
    console.log('Abriendo formulario de edición para:', carrera);
    console.log('Datos específicos:', {
      codigo: carrera.car_codigo,
      nombre: carrera.car_nombre
    });
    this.carreraEditando = { ...carrera };
    this.showEditForm = true;
    this.showCreateForm = false;
    this.showDetailsForm = false;
  }

  detalles(carrera: Careers): void {
    console.log('Abriendo detalles para:', carrera);
    this.carreraDetalle = { ...carrera };
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
    this.carreraEditando = null;
  }

  cerrarFormularioDetalles(): void {
    this.showDetailsForm = false;
    this.carreraDetalle = null;
  }

  guardarCarrera(carrera: Careers): void {
    console.log('Carrera guardada exitosamente desde create component:', carrera);
    this.mostrarMensaje('success', 'Carrera creada exitosamente');
    this.cargardatos(false);
    this.cerrarFormulario();
  }

  actualizarCarrera(carrera: Careers): void {
    console.log('Carrera actualizada exitosamente desde edit component:', carrera);
    this.mostrarMensaje('success', 'Carrera actualizada exitosamente');
    this.cargardatos(false);
    this.cerrarFormularioEdicion();
  }

  confirmarEliminar(carrera: Careers): void {
    console.log('Solicitando confirmación para eliminar:', carrera);
    this.carreraAEliminar = carrera;
    this.mostrarConfirmacionEliminar = true;
  }

  cancelarEliminar(): void {
    this.mostrarConfirmacionEliminar = false;
    this.carreraAEliminar = null;
  }

  eliminar(): void {
    if (!this.carreraAEliminar) return;
    
    console.log('Eliminando carrera:', this.carreraAEliminar);
    
    this.mostrarOverlayCarga = true;
    
    const url = `${environment.apiBaseUrl}/Careers/delete?carCodigo=${this.carreraAEliminar.car_codigo}`;
    
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
          console.log('Carrera eliminada exitosamente');
          this.mostrarMensaje('success', `Carrera "${this.carreraAEliminar!.car_nombre}" eliminada exitosamente`);
          // Forzar recarga de datos
          this.cargardatos(false);
          this.cancelarEliminar();
        } else {
          // Manejar diferentes códigos de estado si es necesario
          const errorMessage = response?.data?.message_Status || response?.message || 'Error al eliminar la carrera.';
          console.error('Error al eliminar:', errorMessage);
          this.mostrarMensaje('error', errorMessage);
          this.cancelarEliminar();
        }
      },
      error: (error) => {
        console.error('Error en la solicitud de eliminación:', error);
        this.mostrarOverlayCarga = false;
        this.mostrarMensaje('error', 'Error de conexión al eliminar la carrera.');
        this.cancelarEliminar();
      },
      complete: () => {
        // Código de finalización si es necesario
      }
    });
  }

  cerrarAlerta(): void {
    this.mostrarAlertaExito = false;
    this.mensajeExito = '';
    this.mostrarAlertaError = false;
    this.mensajeError = '';
    this.mostrarAlertaWarning = false;
    this.mensajeWarning = '';
  }

  // Método para cargar datos de carreras
  private cargardatos(state: boolean): void {
    this.mostrarOverlayCarga = state;
    this.isLoading = true; // Mostrar skeletons
    
    const url = `${environment.apiBaseUrl}/Careers/list`;
    
    this.http.get<ApiResponse<Careers[]>>(url, {
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
          console.log('Datos de carreras:', response.data);
          setTimeout(() => {
            this.table.setData(response.data);
            this.table.setPage(1);
            this.mostrarOverlayCarga = false;
            this.isLoading = false; // Ocultar skeletons cuando los datos estén listos
          }, 500);
        } else {
          console.error('Respuesta de API no exitosa:', response);
          this.mostrarMensaje('error', response.message || 'Error al cargar las carreras.');
          this.mostrarOverlayCarga = false;
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar las carreras:', error);
        
        // Mensaje más específico según el tipo de error
        let mensaje = 'Error al cargar las carreras. Por favor, intente de nuevo.';
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