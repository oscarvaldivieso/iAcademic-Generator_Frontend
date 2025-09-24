import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Period } from 'src/app/Modelos/uni/period.model';
import { environment } from 'src/environments/environment';

interface ApiResponse {
  type: number;
  code: number;
  success: boolean;
  message: string;
  data: {
    codeStatus: number;
    messageStatus: string;
    data: any;
  };
}

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnInit {
  @Input() periodData: Period | null = null;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Period>();

  mostrarErrores = false;
  mostrarAlertaExito = false;
  mensajeExito = '';
  mostrarAlertaError = false;
  mensajeError = '';
  mostrarAlertaWarning = false;
  mensajeWarning = '';
  
  period: Period;
  
  constructor(private http: HttpClient) {
    this.period = new Period();
  }

  ngOnInit(): void {
    console.log('EditComponent - ngOnInit');
    console.log('Datos recibidos:', this.periodData);
    
    if (!this.periodData) {
      console.error('No se recibieron datos del período a editar');
      this.cancelar(); // Si no hay datos, cerramos el formulario
      return;
    }

    try {
      // Hacer una copia profunda de los datos
      this.period = new Period({
        ...this.periodData,
        per_inicio: new Date(this.periodData.per_inicio),
        per_fin: new Date(this.periodData.per_fin)
      });
      
      console.log('Período inicializado:', this.period);
      console.log('Fecha inicio:', this.period.per_inicio);
      console.log('Fecha fin:', this.period.per_fin);
    } catch (error) {
      console.error('Error al inicializar el período:', error);
      this.mostrarAlertaError = true;
      this.mensajeError = 'Error al cargar los datos del período';
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
      
      // Formatear fechas para el envío
      const fechaInicio = this.formatDate(this.period.per_inicio);
      const fechaFin = this.formatDate(this.period.per_fin);
      
      const periodActualizar = {
        per_codigo: this.period.per_codigo,
        per_modulo: this.period.per_modulo,
        per_anio: this.period.per_anio,
        per_inicio: fechaInicio,
        per_fin: fechaFin,
        active: this.period.active,
        created_at: this.period.created_at,
        created_by: this.period.created_by || '',
        updated_at: new Date(),
        updated_by: 'admin' // TODO: Reemplazar con el usuario logueado
      };

      console.log('Actualizando período:', periodActualizar);
      
      const url = `${environment.apiBaseUrl}/Periods/update`;
      
      this.http.post<ApiResponse>(url, periodActualizar, {
        headers: { 
          'XApiKey': environment.apiKey,
          'Content-Type': 'application/json',
          'accept': '*/*'
        }
      }).subscribe({
        next: (response) => {
          console.log('Período actualizado exitosamente:', response);
          this.mostrarAlertaExito = true;
          this.mensajeExito = `Período "${this.period.per_modulo}" actualizado exitosamente`;
          this.mostrarErrores = false;
          
          // Emitir el evento de guardado exitoso
          this.onSave.emit(response.data.data);
          
          // Cerrar automáticamente después de 2 segundos
          setTimeout(() => {
            this.cancelar();
          }, 2000);
        },
        error: (error) => {
          console.error('Error al actualizar el período:', error);
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
            this.mensajeError = 'Error al actualizar el período. Por favor, intente nuevamente.';
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
    return !!(this.period.per_codigo?.trim() && 
             this.period.per_modulo?.trim() && 
             this.period.per_anio &&
             this.period.per_inicio &&
             this.period.per_fin);
  }
  
  // Handle start date change
  onStartDateChange(event: any): void {
    const dateString = event?.target?.value;
    if (dateString) {
      this.period.per_inicio = new Date(dateString);
      // If end date is before start date, update it to match start date
      if (this.period.per_fin < this.period.per_inicio) {
        this.period.per_fin = new Date(this.period.per_inicio);
      }
    }
  }

  // Handle end date change
  onEndDateChange(event: any): void {
    const dateString = event?.target?.value;
    if (dateString) {
      this.period.per_fin = new Date(dateString);
    }
  }

  // Format date for input field (YYYY-MM-DD)
  formatDateForInput(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Format date for API (YYYY-MM-DD)
  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
