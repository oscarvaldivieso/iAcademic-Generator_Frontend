import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Careers } from 'src/app/Modelos/uni/career.model';
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
  @Input() careerData: Careers | null = null;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Careers>();

  mostrarErrores = false;
  mostrarAlertaExito = false;
  mensajeExito = '';
  mostrarAlertaError = false;
  mensajeError = '';
  mostrarAlertaWarning = false;
  mensajeWarning = '';
  
  career: Careers = {
    car_codigo: '',
    car_nombre: '',
    car_orientacion: '',
    car_anio_plan: 0,
    active: true,
    created_by: '',
    created_at: new Date(),
    updated_by: '',
    updated_at: new Date(),
    code_Status: 0,
    message_Status: ''
  };
  
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (this.careerData) {
      // Hacer una copia profunda de los datos para no modificar el original directamente
      this.career = { ...this.careerData };
    }
  }
  
  cancelar(): void {
    this.mostrarErrores = false;
    this.mostrarAlertaExito = false;
    this.mostrarAlertaError = false;
    this.mostrarAlertaWarning = false;
    this.mensajeError = '';
    this.mensajeExito = '';
    this.mensajeWarning = '';
    this.onCancel.emit();
  }
  
  guardar(): void {
    this.mostrarErrores = true;
    
    if (this.validarCampos()) {
      // Limpiar alertas previas
      this.mostrarAlertaWarning = false;
      this.mostrarAlertaError = false;
      
      const careerActualizar = {
        ...this.career,
        updated_by: 'oscar', // TODO: Reemplazar con variable global del usuario
        updated_at: new Date()
      };

      console.log('Actualizando carrera:', careerActualizar);
      
      const url = `${environment.apiBaseUrl}/Careers/update`;
      
      // Formatear el objeto según lo especificado
      const requestBody = {
        car_codigo: careerActualizar.car_codigo,
        car_nombre: careerActualizar.car_nombre,
        car_anio_plan: careerActualizar.car_anio_plan,
        car_orientacion: careerActualizar.car_orientacion || '',
        active: careerActualizar.active,
        created_at: careerActualizar.created_at,
        updated_at: careerActualizar.updated_at,
        created_by: careerActualizar.created_by || '',
        updated_by: careerActualizar.updated_by || ''
      };
      
      this.http.post<ApiResponse>(url, requestBody, {
        headers: { 
          'XApiKey': environment.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true
      }).subscribe({
        next: (response) => {
          console.log('Carrera actualizada exitosamente:', response);
          this.mostrarAlertaExito = true;
          this.mensajeExito = `Carrera "${this.career.car_nombre}" actualizada exitosamente`;
          this.mostrarErrores = false;
          
          // Emitir el evento de guardado exitoso
          this.onSave.emit(response.data);
          
          // Cerrar automáticamente después de 2 segundos
          setTimeout(() => {
            this.cancelar();
          }, 2000);
        },
        error: (error) => {
          console.error('Error al actualizar la carrera:', error);
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
            this.mensajeError = 'Error al actualizar la carrera. Por favor, intente nuevamente.';
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
    return !!(this.career.car_codigo?.trim() && 
             this.career.car_nombre?.trim() && 
             (this.career.car_anio_plan || this.career.car_anio_plan === 0));
  }
  
  cerrarAlerta(): void {
    this.mostrarAlertaExito = false;
    this.mostrarAlertaError = false;
    this.mostrarAlertaWarning = false;
    this.mensajeError = '';
    this.mensajeExito = '';
    this.mensajeWarning = '';
  }
}
