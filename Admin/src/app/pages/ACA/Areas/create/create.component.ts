import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Areas } from 'src/app/Modelos/aca/area.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent implements OnInit {
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Areas>();

  mostrarErrores = false;
  mostrarAlertaExito = false;
  mensajeExito = '';
  mostrarAlertaError = false;
  mensajeError = '';
  mostrarAlertaWarning = false;
  mensajeWarning = '';
  
  constructor(private http: HttpClient) {}
  
  area: Areas = {
    are_codigo: '',
    are_nombre: '',
    active: true,
    created_by: '',
    created_at: new Date(),
    updated_by: '',
    updated_at: new Date(),
    code_Status: 0,
    message_Status: ''
  };

  ngOnInit(): void {
    // Limpiar alertas al inicializar el componente
    this.limpiarAlertas();
  }

  /**
   * Método para limpiar todas las alertas y errores
   */
  private limpiarAlertas(): void {
    this.mostrarErrores = false;
    this.mostrarAlertaExito = false;
    this.mensajeExito = '';
    this.mostrarAlertaError = false;
    this.mensajeError = '';
    this.mostrarAlertaWarning = false;
    this.mensajeWarning = '';
  }

  /**
   * Método para resetear el formulario completamente
   */
  private resetearFormulario(): void {
    this.limpiarAlertas();
    this.area = new Areas();
  }
  
  cancelar(): void {
    // Limpiar todo antes de cerrar
    this.resetearFormulario();
    this.onCancel.emit();
  }

  cerrarAlerta(): void {
    this.limpiarAlertas();
  }
  
  guardar(): void {
    this.mostrarErrores = true;
    
    if (this.area.are_codigo?.trim() && this.area.are_nombre?.trim()) {
      // Limpiar alertas previas
      this.limpiarAlertas();
      
      const areaSave = {
        are_codigo: this.area.are_codigo.trim(),
        are_nombre: this.area.are_nombre.trim(),
        active: true,
        created_by: 'admin', // TODO: Reemplazar con el usuario logueado
        created_at: new Date(),
        updated_by: '',
        updated_at: null
      };

      console.log('Guardando área:', areaSave);
      
      this.http.post<any>(`${environment.apiBaseUrl}/Areas/Create`, areaSave, {
        headers: { 
          'XApiKey': environment.apiKey,
          'Content-Type': 'application/json',
          'accept': '*/*'
        }
      }).subscribe({
        next: (response) => {
          console.log('Área guardada exitosamente:', response);
          if (response.success) {
            this.mostrarAlertaExito = true;
            this.mensajeExito = response.data.messageStatus;
            
            const areaCreated: Areas = {
              ...this.area,
              code_Status: response.data.codeStatus,
              message_Status: response.data.messageStatus
            };
            
            // Emitir el área creada al componente padre
            this.onSave.emit(areaCreated);
            
            // Esperar un momento para que se vea el mensaje y luego limpiar
            setTimeout(() => {
              this.cancelar();
            }, 2000);
          } else {
            this.mostrarAlertaError = true;
            this.mensajeError = response.message || 'Error al crear el área.';
          }
        },
        error: (error) => {
          console.error('Error al guardar el área:', error);
          this.mostrarAlertaError = true;
          this.mensajeError = 'Error al guardar el área. Por favor, intente nuevamente.';
          
          // Ocultar la alerta de error después de 5 segundos
          setTimeout(() => {
            this.limpiarAlertas();
          }, 5000);
        }
      });
    } else {
      // Mostrar alerta de warning para campos vacíos
      this.mostrarAlertaWarning = true;
      this.mensajeWarning = 'Por favor complete todos los campos requeridos antes de guardar.';
      
      // Ocultar la alerta de warning después de 4 segundos
      setTimeout(() => {
        this.limpiarAlertas();
      }, 4000);
    }
  }
}