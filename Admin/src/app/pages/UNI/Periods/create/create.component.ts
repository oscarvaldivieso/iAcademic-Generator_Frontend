import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Period } from 'src/app/Modelos/uni/period.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Period>();

  mostrarErrores = false;
  mostrarAlertaExito = false;
  mensajeExito = '';
  mostrarAlertaError = false;
  mensajeError = '';
  mostrarAlertaWarning = false;
  mensajeWarning = '';
  
  period: Period = new Period();
  currentYear = new Date().getFullYear();
  
  constructor(private http: HttpClient) {}
  
  // Handle start date change
  onStartDateChange(event: any): void {
    const dateString = event?.target?.value;
    this.period.per_inicio = dateString ? new Date(dateString) : new Date();
  }

  // Handle end date change
  onEndDateChange(event: any): void {
    const dateString = event?.target?.value;
    this.period.per_fin = dateString ? new Date(dateString) : new Date();
  }

  cancelar(): void {
    this.mostrarErrores = false;
    this.mostrarAlertaExito = false;
    this.mostrarAlertaError = false;
    this.mostrarAlertaWarning = false;
    this.period = new Period();
    this.onCancel.emit();
  }

  cerrarAlerta(): void {
    this.mostrarAlertaExito = false;
    this.mostrarAlertaError = false;
    this.mostrarAlertaWarning = false;
  }
  
  private validarCampos(): boolean {
    if (!this.period.per_codigo?.trim() || 
        !this.period.per_modulo?.trim() || 
        !this.period.per_anio ||
        !this.period.per_inicio ||
        !this.period.per_fin) {
      return false;
    }

    // Validar que el año sea válido
    if (this.period.per_anio < 2000 || this.period.per_anio > this.currentYear + 5) {
      return false;
    }

    // Validar que la fecha de fin sea posterior a la de inicio
    if (this.period.per_fin <= this.period.per_inicio) {
      return false;
    }

    return true;
  }
  
  // Convert string date to Date object
  parseDate(dateString: string): Date {
    if (!dateString) return new Date();
    return new Date(dateString);
  }

  // Format Date object to 'YYYY-MM-DD' string for date inputs
  formatDateForInput(date: Date | null | undefined): string {
    if (!date) return '';
    // Ensure we have a valid Date object
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toISOString().substring(0, 10);
  }

  private formatDate(date: Date): string {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
      
      const periodGuardar = {
        per_codigo: this.period.per_codigo.trim(),
        per_modulo: this.period.per_modulo.trim(),
        per_anio: this.period.per_anio,
        per_inicio: fechaInicio,
        per_fin: fechaFin,
        active: true,
        created_by: 'admin', // TODO: Reemplazar con el usuario logueado
        created_at: new Date()
      };

      console.log('Creando período:', periodGuardar);
      
      this.http.post<any>(`${environment.apiBaseUrl}/Periods/create`, periodGuardar, {
        headers: { 
          'XApiKey': environment.apiKey,
          'Content-Type': 'application/json',
          'accept': '*/*'
        }
      }).subscribe({
        next: (response) => {
          console.log('Período creado exitosamente:', response);
          if (response.success) {
            this.mostrarAlertaExito = true;
            this.mensajeExito = response.data?.messageStatus || 'Período creado exitosamente';
            
            // Actualizar el modelo local con los datos de respuesta
            const periodoCreado: Period = {
              ...this.period,
              code_Status: response.data?.codeStatus || 0,
              message_Status: response.data?.messageStatus || ''
            };
            
            // Emitir el período creado al componente padre
            this.onSave.emit(periodoCreado);
            
            // Cerrar automáticamente después de 2 segundos
            setTimeout(() => {
              this.cancelar();
            }, 2000);
          } else {
            this.mostrarAlertaError = true;
            this.mensajeError = response.message || 'Error al crear el período';
          }
        },
        error: (error) => {
          console.error('Error al crear el período:', error);
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
            this.mensajeError = 'Error al crear el período. Por favor, intente nuevamente.';
          }
          
          // Ocultar la alerta de error después de 5 segundos
          setTimeout(() => {
            this.mostrarAlertaError = false;
            this.mensajeError = '';
          }, 5000);
        }
      });
    } else {
      // Mostrar alerta de warning para campos vacíos o inválidos
      this.mostrarAlertaWarning = true;
      this.mensajeWarning = 'Por favor complete todos los campos requeridos correctamente.';
      this.mostrarAlertaError = false;
      this.mostrarAlertaExito = false;
      
      // Ocultar la alerta de warning después de 4 segundos
      setTimeout(() => {
        this.mostrarAlertaWarning = false;
        this.mensajeWarning = '';
      }, 4000);
    }
  }
}
