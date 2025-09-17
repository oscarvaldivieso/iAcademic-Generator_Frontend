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
import { EstadoCivil } from 'src/app/Modelos/general/EstadoCivil.Model';
import { Careers } from 'src/app/Modelos/uni/career.model';
import { CreateComponent } from '../create/create.component';
import { EditComponent } from '../edit/edit.component';
import { FloatingMenuService } from 'src/app/shared/floating-menu.service';

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

  

  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [
      { label: 'General' },
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


  // Métodos para los botones de acción principales (crear, editar, detalles)
  crear(): void {
    console.log('Toggleando formulario de creación...');
    this.showCreateForm = !this.showCreateForm;
    this.showEditForm = false; // Cerrar edit si está abierto
    this.showDetailsForm = false; // Cerrar details si está abierto
    this.activeActionRow = null; // Cerrar menú de acciones
  }

  editar(estadoCivil: EstadoCivil): void {
    console.log('Abriendo formulario de edición para:', estadoCivil);
    console.log('Datos específicos:', {
      id: estadoCivil.esCv_Id,
      descripcion: estadoCivil.esCv_Descripcion,
      completo: estadoCivil
    });
    this.estadoCivilEditando = { ...estadoCivil }; // Hacer copia profunda
    this.showEditForm = true;
    this.showCreateForm = false; // Cerrar create si está abierto
    this.showDetailsForm = false; // Cerrar details si está abierto
    this.activeActionRow = null; // Cerrar menú de acciones
  }

  detalles(estadoCivil: EstadoCivil): void {
    console.log('Abriendo detalles para:', estadoCivil);
    this.estadoCivilDetalle = { ...estadoCivil }; // Hacer copia profunda
    this.showDetailsForm = true;
    this.showCreateForm = false; // Cerrar create si está abierto
    this.showEditForm = false; // Cerrar edit si está abierto
    this.activeActionRow = null; // Cerrar menú de acciones
  }
  // Estado de exportación
  exportando = false;
  tipoExportacion: 'excel' | 'pdf' | 'csv' | null = null;

   constructor(public table: ReactiveTableService<Careers>, 
    private http: HttpClient, 
    private router: Router, 
    private route: ActivatedRoute,
    public floatingMenuService: FloatingMenuService
  )
    {
    this.cargardatos(true);
  }   

  activeActionRow: number | null = null;
  showEdit = true;
  showDetails = true;
  showDelete = true;
  showCreateForm = false; // Control del collapse
  showEditForm = false; // Control del collapse de edición
  showDetailsForm = false; // Control del collapse de detalles
  estadoCivilEditando: EstadoCivil | null = null;
  estadoCivilDetalle: EstadoCivil | null = null;
  
  // Propiedades para alertas
  mostrarAlertaExito = false;
  mensajeExito = '';
  mostrarAlertaError = false;
  mensajeError = '';
  mostrarAlertaWarning = false;
  mensajeWarning = '';
  
  // Propiedades para confirmación de eliminación
  mostrarConfirmacionEliminar = false;
  estadoCivilAEliminar: EstadoCivil | null = null;

  cerrarFormulario(): void {
    this.showCreateForm = false;
  }

  cerrarFormularioEdicion(): void {
    this.mostrarOverlayCarga = false;
    this.showEditForm = false;
    this.estadoCivilEditando = null;
  }

  cerrarFormularioDetalles(): void {
    this.showDetailsForm = false;
    this.estadoCivilDetalle = null;
  }

  guardarEstadoCivil(estadoCivil: EstadoCivil): void {
    console.log('Estado civil guardado exitosamente desde create component:', estadoCivil);
    // Recargar los datos de la tabla sin overlay
    this.cargardatos(false);
    this.cerrarFormulario();
  }

  actualizarEstadoCivil(estadoCivil: EstadoCivil): void {
    console.log('Estado civil actualizado exitosamente desde edit component:', estadoCivil);
    // Recargar los datos de la tabla sin overlay
    this.cargardatos(false);
    this.cerrarFormularioEdicion();
  }

  confirmarEliminar(estadoCivil: EstadoCivil): void {
    console.log('Solicitando confirmación para eliminar:', estadoCivil);
    this.estadoCivilAEliminar = estadoCivil;
    this.mostrarConfirmacionEliminar = true;
  }

  cancelarEliminar(): void {
    this.mostrarConfirmacionEliminar = false;
    this.estadoCivilAEliminar = null;
  }

  eliminar(): void {
    if (!this.estadoCivilAEliminar) return;
    
    console.log('Eliminando estado civil:', this.estadoCivilAEliminar);
    
    // Usar el proxy configurado
    const url = `/api/EstadosCiviles/Eliminar/${this.estadoCivilAEliminar.esCv_Id}`;
    
    this.http.post(url, {}, {
      headers: { 
        'x-api-key': environment.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true
    }).subscribe({
      next: (response: any) => {
        console.log('Respuesta del servidor:', response);
        
        // Verificar el código de estado en la respuesta
        if (response.success && response.data) {
          if (response.data.code_Status === 1) {
            // Éxito: eliminado correctamente
            console.log('Estado civil eliminado exitosamente');
            this.mensajeExito = `Estado civil "${this.estadoCivilAEliminar!.esCv_Descripcion}" eliminado exitosamente`;
            this.mostrarAlertaExito = true;
            
            // Ocultar la alerta después de 3 segundos
            setTimeout(() => {
              this.mostrarAlertaExito = false;
              this.mensajeExito = '';
            }, 3000);
            

            this.cargardatos(false);
            this.cancelarEliminar();
          } else if (response.data.code_Status === -1) {
            //result: está siendo utilizado
            console.log('Estado civil está siendo utilizado');
            this.mostrarAlertaError = true;
            this.mensajeError = response.data.message_Status || 'No se puede eliminar: el estado civil está siendo utilizado.';
            
            setTimeout(() => {
              this.mostrarAlertaError = false;
              this.mensajeError = '';
            }, 5000);
            
            // Cerrar el modal de confirmación
            this.cancelarEliminar();
          } else if (response.data.code_Status === 0) {
            // Error general
            console.log('Error general al eliminar');
            this.mostrarAlertaError = true;
            this.mensajeError = response.data.message_Status || 'Error al eliminar el estado civil.';
            
            setTimeout(() => {
              this.mostrarAlertaError = false;
              this.mensajeError = '';
            }, 5000);
            
            // Cerrar el modal de confirmación
            this.cancelarEliminar();
          }
        } else {
          // Respuesta inesperada
          console.log('Respuesta inesperada del servidor');
          this.mostrarAlertaError = true;
          this.mensajeError = response.message || 'Error inesperado al eliminar el estado civil.';
          
          setTimeout(() => {
            this.mostrarAlertaError = false;
            this.mensajeError = '';
          }, 5000);
          
          // Cerrar el modal de confirmación
          this.cancelarEliminar();
        }
      },
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

  // AQUI EMPIEZA LO BUENO PARA LAS ACCIONES
  private cargarAccionesUsuario(): void {
    // OBTENEMOS PERMISOSJSON DEL LOCALSTORAGE
    const permisosRaw = localStorage.getItem('permisosJson');
    console.log('Valor bruto en localStorage (permisosJson):', permisosRaw);
    let accionesArray: string[] = [];
    if (permisosRaw) {
      try {
        const permisos = JSON.parse(permisosRaw);
        // BUSCAMOS EL MÓDULO DE ESTADOS CIVILES
        let modulo = null;
        if (Array.isArray(permisos)) {
          // BUSCAMOS EL MÓDULO DE ESTADOS CIVILES POR ID
          modulo = permisos.find((m: any) => m.Pant_Id === 14);
        } else if (typeof permisos === 'object' && permisos !== null) {
          // ESTO ES PARA CUANDO LOS PERMISOS ESTÁN EN UN OBJETO CON CLAVES
          modulo = permisos['Estados Civiles'] || permisos['estados civiles'] || null;
        }
        if (modulo && modulo.Acciones && Array.isArray(modulo.Acciones)) {
          // AQUI SACAMOS SOLO EL NOMBRE DE LA ACCIÓN
          accionesArray = modulo.Acciones.map((a: any) => a.Accion).filter((a: any) => typeof a === 'string');
          console.log('Acciones del módulo:', accionesArray);
        }
      } catch (e) {
        console.error('Error al parsear permisosJson:', e);
      }
    } 
    
  }

  private cargardatos(state: boolean): void {
    this.mostrarOverlayCarga = state;
    
    // Usar el proxy configurado
    const url = '/Careers/list';
    
    this.http.get<Careers[]>(url, {
      headers: { 
        'x-api-key': environment.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true  // Importante para enviar cookies si es necesario
    }).subscribe({
      next: (data) => {
        setTimeout(() => {
          this.table.setData(data);
          this.mostrarOverlayCarga = false;
        }, 500);
      },
      error: (error) => {
        console.error('Error al cargar las carreras:', error);
        this.mostrarMensaje('error', 'Error al cargar las carreras. Por favor, intente de nuevo.');
        this.mostrarOverlayCarga = false;
      }
    });
  }
}