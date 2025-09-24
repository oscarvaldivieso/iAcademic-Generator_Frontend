import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Campus } from 'src/app/Modelos/uni/campus.model';
import { environment } from 'src/environments/environment';

interface ApiResponse {
  type: number;
  code: number;
  success: boolean;
  message: string;
  data: any;
}

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'] // Fix: Renamed styleUrl to styleUrls
})
export class CreateComponent {
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Campus>();

  mostrarErrores = false;
  mostrarAlertaExito = false;
  mensajeExito = '';
  mostrarAlertaError = false;
  mensajeError = '';
  mostrarAlertaWarning = false;
  mensajeWarning = '';

  campus: Campus = new Campus({
    cam_codigo: '',
    cam_nombre: '',
    cam_ciudad: '',
    active: true,
    created_by: 'admin', // TODO: Reemplazar con el usuario logueado
    created_at: new Date(),
    updated_by: '',
    updated_at: null
  });

  constructor(private http: HttpClient) {}

  cancelar(): void {
    this.mostrarErrores = false;
    this.mostrarAlertaExito = false;
    this.mostrarAlertaError = false;
    this.mostrarAlertaWarning = false;
    this.campus = new Campus({
      cam_codigo: '',
      cam_nombre: '',
      cam_ciudad: '',
      active: true,
      created_by: 'admin',
      created_at: new Date(),
      updated_by: '',
      updated_at: new Date()
    });
    this.onCancel.emit();
  }

  cerrarAlerta(): void {
    this.mostrarAlertaExito = false;
    this.mostrarAlertaError = false;
    this.mostrarAlertaWarning = false;
  }

  guardar(): void {
    this.mostrarErrores = true;

    if (this.validarCampos()) {
      // Limpiar alertas previas
      this.mostrarAlertaWarning = false;
      this.mostrarAlertaError = false;

      const campusGuardar = {
        cam_codigo: this.campus.cam_codigo.trim(),
        cam_nombre: this.campus.cam_nombre.trim(),
        cam_ciudad: this.campus.cam_ciudad.trim(),
        active: true,
        created_by: 'admin', // TODO: Reemplazar con el usuario logueado
        created_at: new Date(),
        updated_by: '',
        updated_at: new Date()
      };

      console.log('Guardando campus:', campusGuardar);

      this.http.post<ApiResponse>(`${environment.apiBaseUrl}/Campus/create`, campusGuardar, {
        headers: {
          'XApiKey': environment.apiKey,
          'Content-Type': 'application/json',
          'accept': '*/*'
        }
      }).subscribe({
        next: (response) => {
          console.log('Campus guardado exitosamente:', response);
          this.mostrarAlertaExito = true;
          this.mensajeExito = `Campus "${this.campus.cam_nombre}" creado exitosamente`;
          this.mostrarErrores = false;

          // Emitir el evento de guardado exitoso con los datos del campus
          this.onSave.emit(response.data);

          // Cerrar automáticamente después de 2 segundos
          setTimeout(() => {
            this.cancelar();
          }, 2000);
        },
        error: (error) => {
          console.error('Error al guardar el campus:', error);
          this.mostrarAlertaError = true;

          if (error.status === 400) {
            this.mensajeError = error.error?.message || 'Error en los datos enviados';
          } else if (error.status === 401) {
            this.mensajeError = 'No autorizado. Por favor, inicie sesión nuevamente.';
          } else if (error.status === 403) {
            this.mensajeError = 'No tiene permisos para realizar esta acción';
          } else if (error.status === 0) {
            this.mensajeError = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
          } else {
            this.mensajeError = 'Error al guardar el campus. Por favor, intente nuevamente.';
          }

          // Ocultar la alerta de error después de 5 segundos
          setTimeout(() => {
            this.mostrarAlertaError = false;
            this.mensajeError = '';
          }, 5000);
        }
      });
    } else {
      // Mostrar alerta de warning para campos vacíos
      this.mostrarAlertaWarning = true;
      this.mensajeWarning = 'Por favor complete todos los campos requeridos antes de guardar.';
      this.mostrarAlertaError = false;
      this.mostrarAlertaExito = false;

      // Ocultar la alerta de warning después de 4 segundos
      setTimeout(() => {
        this.mostrarAlertaWarning = false;
        this.mensajeWarning = '';
      }, 4000);
    }
  }

  private validarCampos(): boolean {
    return !!(this.campus.cam_codigo?.trim() &&
             this.campus.cam_nombre?.trim() &&
             this.campus.cam_ciudad?.trim());
  }
}
