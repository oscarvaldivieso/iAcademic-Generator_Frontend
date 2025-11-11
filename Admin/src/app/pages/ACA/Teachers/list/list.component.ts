import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { TableModule } from 'src/app/pages/table/table.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { Teachers } from 'src/app/Modelos/aca/teacher.model';
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
    
    this.mostrarOverlayCarga = true;
    
    const url = `${environment.apiBaseUrl}/Teachers/delete?docCodigo=${this.docenteAEliminar.doc_codigo}`;
    
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
          this.mostrarMensaje('success', `Docente "${this.docenteAEliminar!.doc_nombre}" eliminado exitosamente`);
          this.cargarDatos(false);
          this.cancelarEliminar();
        } else {
          const errorMessage = response?.data?.message_Status || response?.message || 'Error al eliminar el docente.';
          this.mostrarMensaje('error', errorMessage);
          this.cancelarEliminar();
        }
      },
      error: (error) => {
        this.mostrarOverlayCarga = false;
        this.mostrarMensaje('error', 'Error de conexión al eliminar el docente.');
        this.cancelarEliminar();
      }
    });
  }

  cerrarAlerta(): void {
    this.mostrarAlertaExito = false;
    this.mostrarAlertaError = false;
    this.mostrarAlertaWarning = false;
  }

  private cargarDatos(state: boolean): void {
    this.mostrarOverlayCarga = state;
    this.isLoading = true;
    
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
        if (response.success && response.data) {
          setTimeout(() => {
            this.table.setData(response.data);
            this.table.setPage(1);
            this.mostrarOverlayCarga = false;
            this.isLoading = false;
          }, 500);
        } else {
          this.mostrarMensaje('error', response.message || 'Error al cargar los docentes.');
          this.mostrarOverlayCarga = false;
          this.isLoading = false;
        }
      },
      error: (error) => {
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
