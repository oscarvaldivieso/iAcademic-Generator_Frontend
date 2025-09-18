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
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { TableModule } from 'src/app/pages/table/table.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { Careers } from 'src/app/Modelos/uni/career.model';
import { CreateComponent } from '../create/create.component';
import { EditComponent } from '../edit/edit.component';
import { FloatingMenuService } from 'src/app/shared/floating-menu.service';

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
  // Overlay de carga animado
  mostrarOverlayCarga = false;
  // bread crumb items
  breadCrumbItems!: Array<{}>;

  constructor(
    public table: ReactiveTableService<Careers>, 
    private http: HttpClient, 
    private router: Router, 
    private route: ActivatedRoute,
    public floatingMenuService: FloatingMenuService
  ) {
    this.cargardatos(true);
  }   

  activeActionRow: number | null = null;
  showEdit = true;
  showDetails = true;
  showDelete = true;
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

  // Estado de exportación
  exportando = false;
  tipoExportacion: 'excel' | 'pdf' | 'csv' | null = null;

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
    this.activeActionRow = null;
  }

  editar(carrera: Careers): void {
    console.log('Abriendo formulario de edición para:', carrera);
    this.carreraEditando = { ...carrera };
    this.showEditForm = true;
    this.showCreateForm = false;
    this.showDetailsForm = false;
    this.activeActionRow = null;
  }

  detalles(carrera: Careers): void {
    console.log('Abriendo detalles para:', carrera);
    this.carreraDetalle = { ...carrera };
    this.showDetailsForm = true;
    this.showCreateForm = false;
    this.showEditForm = false;
    this.activeActionRow = null;
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
    console.log('Carrera guardada exitosamente:', carrera);
    this.cargardatos(false);
    this.cerrarFormulario();
  }

  actualizarCarrera(carrera: Careers): void {
    console.log('Carrera actualizada exitosamente:', carrera);
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
    
    const url = `https://localhost:7228/Careers/Eliminar/${this.carreraAEliminar.car_codigo}`;
    
    this.http.post<ApiResponse<any>>(url, {}, {
      headers: { 
        'XApiKey': environment.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true
    }).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        
        if (response.success && response.data) {
          if (response.data.code_Status === 1) {
            console.log('Carrera eliminada exitosamente');
            this.mostrarMensaje('success', `Carrera "${this.carreraAEliminar!.car_nombre}" eliminada exitosamente`);
            this.cargardatos(false);
            this.cancelarEliminar();
          } else if (response.data.code_Status === -1) {
            console.log('Carrera está siendo utilizada');
            this.mostrarMensaje('error', response.data.message_Status || 'No se puede eliminar: la carrera está siendo utilizada.');
            this.cancelarEliminar();
          } else {
            console.log('Error general al eliminar');
            this.mostrarMensaje('error', response.data.message_Status || 'Error al eliminar la carrera.');
            this.cancelarEliminar();
          }
        } else {
          console.log('Respuesta inesperada del servidor');
          this.mostrarMensaje('error', response.message || 'Error inesperado al eliminar la carrera.');
          this.cancelarEliminar();
        }
      },
      error: (error) => {
        console.error('Error en la solicitud de eliminación:', error);
        this.mostrarMensaje('error', 'Error de conexión al eliminar la carrera.');
        this.cancelarEliminar();
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

  

  private cargardatos(state: boolean): void {
    this.mostrarOverlayCarga = state;
    
    const url = 'https://localhost:7228/Careers/list';
    
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
            this.mostrarOverlayCarga = false;
          }, 500);
        } else {
          console.error('Respuesta de API no exitosa:', response);
          this.mostrarMensaje('error', response.message || 'Error al cargar las carreras.');
          this.mostrarOverlayCarga = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar las carreras:', error);
        
        // Mensaje más específico basado en el error
        let mensaje = 'Error al cargar las carreras. Por favor, intente de nuevo.';
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