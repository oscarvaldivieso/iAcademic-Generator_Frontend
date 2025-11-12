import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
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
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  @Input() campusData: Campus | undefined;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Campus>();

  mostrarErrores = false;
  mostrarAlertaExito = false;
  mensajeExito = '';
  mostrarAlertaError = false;
  mensajeError = '';
  mostrarAlertaWarning = false;
  mensajeWarning = '';

  // Lista de ciudades disponibles
  ciudades: string[] = [
    'San Pedro Sula',
    'Tegucigalpa',
    'Comayagua'
  ];

  campus: Campus = new Campus({
    cam_codigo: '',
    cam_nombre: '',
    cam_ciudad: '',
    active: true,
    created_by: '',
    created_at: new Date(),
    updated_by: 'admin',
    updated_at: new Date()
  });

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (this.campusData) {
      // Crear una copia profunda de los datos del campus
      this.campus = new Campus({
        ...this.campusData,
        updated_at: new Date()
      });
    } else {
      this.cancelar(); // Si no hay datos, cerramos el formulario
    }
  }

  cancelar(): void {
    this.mostrarErrores = false;
    this.mostrarAlertaExito = false;
    this.mostrarAlertaError = false;
    this.mostrarAlertaWarning = false;
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

      const campusActualizado = {
        cam_codigo: this.campus.cam_codigo,
        cam_nombre: this.campus.cam_nombre,
        cam_ciudad: this.campus.cam_ciudad,
        active: this.campus.active,
        created_at: this.campus.created_at,
        updated_at: new Date().toISOString(),
        created_by: this.campus.created_by || 'admin',
        updated_by: 'admin' // TODO: Reemplazar con el usuario logueado
      };

      console.log('Actualizando campus:', campusActualizado);

      this.http.post<ApiResponse>(`${environment.apiBaseUrl}/Campus/update`, campusActualizado, {
        headers: { 
          'XApiKey': environment.apiKey,
          'Content-Type': 'application/json',
          'accept': '*/*'
        }
      }).subscribe({
        next: (response) => {
          console.log('Campus actualizado exitosamente:', response);
          this.mostrarAlertaExito = true;
          this.mensajeExito = `Campus "${this.campus.cam_nombre}" actualizado exitosamente`;
          this.mostrarErrores = false;

          // Emitir el evento de guardado exitoso con los datos actualizados
          this.onSave.emit(response.data);

          // Cerrar automáticamente después de 2 segundos
          setTimeout(() => {
            this.cancelar();
          }, 2000);
        },
        error: (error) => {
          console.error('Error al actualizar el campus:', error);
          this.mostrarAlertaError = true;

          if (error.status === 400) {
            this.mensajeError = error.error?.message || 'Error en los datos enviados';
          } else if (error.status === 401) {
            this.mensajeError = 'No autorizado. Por favor, inicie sesión nuevamente.';
          } else if (error.status === 403) {
            this.mensajeError = 'No tiene permisos para realizar esta acción';
          } else if (error.status === 404) {
            this.mensajeError = 'El campus no fue encontrado';
          } else if (error.status === 0) {
            this.mensajeError = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
          } else {
            this.mensajeError = 'Error al actualizar el campus. Por favor, intente nuevamente.';
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
