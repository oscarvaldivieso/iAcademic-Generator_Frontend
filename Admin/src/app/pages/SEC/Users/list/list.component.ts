import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { CreateComponent } from '../create/create.component';
import { EditComponent } from '../edit/edit.component';
import { User } from 'src/app/Modelos/sec/user.model';
import { RouterModule } from '@angular/router';
import { ReactiveTableService } from 'src/app/shared/reactive-table.service';
import { TableModule } from 'src/app/pages/table/table.module';

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
    TableModule,
    PaginationModule,
    CreateComponent,
    EditComponent
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  // Breadcrumbs
  pageTitle = 'Usuarios';
  breadCrumbItems: Array<{ label: string; active?: boolean }> = [
    { label: 'Seguridad' },
    { label: 'Usuarios', active: true }
  ];

  // Estados de carga
  mostrarOverlayCarga = false;
  isLoading = true;

  // Propiedades de control de formularios
  showCreateForm = false;
  showEditForm = false;
  selectedUser: User | null = null;

  // Propiedades para alertas
  mostrarAlertaExito = false;
  mensajeExito = '';
  mostrarAlertaError = false;
  mensajeError = '';
  mostrarAlertaWarning = false;
  mensajeWarning = '';

  // Propiedades para confirmación de eliminación
  mostrarConfirmacionEliminar = false;
  usuarioAEliminar: User | null = null;

  constructor(
    public table: ReactiveTableService<User>,
    private http: HttpClient
  ) {
    this.cargarDatos(true);
  }

  ngOnInit(): void {}

  /**
   * Sistema de mensajes mejorado
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

  // Abrir formulario de creación
  openCreateForm(): void {
    this.showCreateForm = true;
    this.showEditForm = false;
    this.selectedUser = null;
  }

  // Cerrar formulario de creación
  onCloseCreateForm(): void {
    this.showCreateForm = false;
    this.mostrarOverlayCarga = false;
    this.cargarDatos(false);
  }

  // Método para guardar usuario (llamado desde el componente hijo)
  guardarUsuario(usuario: User): void {
    console.log('Usuario guardado exitosamente:', usuario);
    this.mostrarMensaje('success', 'Usuario creado exitosamente');
    this.showCreateForm = false;
    this.cargarDatos(false);
  }

  // Abrir formulario de edición
  openEditForm(user: User): void {
    this.selectedUser = { ...user };
    this.showEditForm = true;
    this.showCreateForm = false;
  }

  // Cerrar formulario de edición
  onCloseEditForm(): void {
    this.mostrarOverlayCarga = false;
    this.showEditForm = false;
    this.selectedUser = null;
    this.cargarDatos(false);
  }

  // Método para actualizar usuario (llamado desde el componente hijo)
  actualizarUsuario(usuario: User): void {
    console.log('Usuario actualizado exitosamente:', usuario);
    this.mostrarMensaje('success', 'Usuario actualizado exitosamente');
    this.showEditForm = false;
    this.selectedUser = null;
    this.cargarDatos(false);
  }

  // Confirmar eliminación
  confirmarEliminar(user: User): void {
    this.usuarioAEliminar = user;
    this.mostrarConfirmacionEliminar = true;
  }

  // Cancelar eliminación
  cancelarEliminar(): void {
    this.mostrarConfirmacionEliminar = false;
    this.usuarioAEliminar = null;
  }

  // Eliminar usuario
  deleteUser(): void {
    if (!this.usuarioAEliminar) return;
    
    console.log('Eliminando usuario:', this.usuarioAEliminar);
    
    this.mostrarOverlayCarga = true;
    
    const url = `${environment.apiBaseUrl}/User/delete?id=${this.usuarioAEliminar.usu_codigo}`;
    
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
          console.log('Usuario eliminado exitosamente');
          this.mostrarMensaje('success', `Usuario "${this.usuarioAEliminar!.usu_nombre}" eliminado exitosamente`);
          this.cargarDatos(false);
          this.cancelarEliminar();
        } else {
          const errorMessage = response?.data?.message_Status || response?.message || 'Error al eliminar el usuario.';
          console.error('Error al eliminar:', errorMessage);
          this.mostrarMensaje('error', errorMessage);
          this.cancelarEliminar();
        }
      },
      error: (error) => {
        console.error('Error en la solicitud de eliminación:', error);
        this.mostrarOverlayCarga = false;
        this.mostrarMensaje('error', 'Error de conexión al eliminar el usuario.');
        this.cancelarEliminar();
      }
    });
  }

  cerrarAlerta(): void {
    this.mostrarAlertaExito = false;
    this.mostrarAlertaError = false;
    this.mostrarAlertaWarning = false;
  }

  // Método para cargar datos de usuarios
  private cargarDatos(state: boolean): void {
    this.mostrarOverlayCarga = state;
    this.isLoading = true;
    
    const url = `${environment.apiBaseUrl}/User/list`;
    
    this.http.get<ApiResponse<User[]>>(url, {
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
          console.log('Datos de usuarios:', response.data);
          setTimeout(() => {
            this.table.setData(response.data);
            this.table.setPage(1);
            this.mostrarOverlayCarga = false;
            this.isLoading = false;
          }, 500);
        } else {
          console.error('Respuesta de API no exitosa:', response);
          this.mostrarMensaje('error', response.message || 'Error al cargar los usuarios.');
          this.mostrarOverlayCarga = false;
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar los usuarios:', error);
        
        let mensaje = 'Error al cargar los usuarios. Por favor, intente de nuevo.';
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

  // Formatear fecha
  formatDate(dateString: string | Date | undefined | null): string {
    if (!dateString) return 'Nunca';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Fecha inválida' : date.toLocaleString();
    } catch (e) {
      return 'Fecha inválida';
    }
  }
}