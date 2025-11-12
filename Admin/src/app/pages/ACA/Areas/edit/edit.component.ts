import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Areas } from 'src/app/Modelos/aca/area.model';
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
  @Input() areaData: Areas | undefined;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Areas>();

  mostrarErrores = false;
  mostrarAlertaExito = false;
  mensajeExito = '';
  mostrarAlertaError = false;
  mensajeError = '';
  mostrarAlertaWarning = false;
  mensajeWarning = '';
  
  area: Areas;
  
  constructor(private http: HttpClient) {
    this.area = {
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
  }

  ngOnInit(): void {
    if (this.areaData) {
      // Asegurarnos de que tenemos todas las propiedades necesarias
      this.area = {
        are_codigo: this.areaData.are_codigo,
        are_nombre: this.areaData.are_nombre,
        active: this.areaData.active,
        created_by: this.areaData.created_by || '',
        created_at: this.areaData.created_at,
        updated_by: this.areaData.updated_by || '',
        updated_at: this.areaData.updated_at,
        code_Status: this.areaData.code_Status,
        message_Status: this.areaData.message_Status
      };
    } else {
      this.cancelar(); // Si no hay datos, cerramos el formulario
    }
  }
  
  cancelar(): void {
    this.mostrarErrores = false;
    this.mostrarAlertaExito = false;
    this.mensajeExito = '';
    this.mostrarAlertaError = false;
    this.mensajeError = '';
    this.mostrarAlertaWarning = false;
    this.mensajeWarning = '';
    this.onCancel.emit();
  }

  cerrarAlerta(): void {
    this.mostrarAlertaExito = false;
    this.mensajeExito = '';
    this.mostrarAlertaError = false;
    this.mensajeError = '';
    this.mostrarAlertaWarning = false;
    this.mensajeWarning = '';
  }
  
  guardar(): void {
    this.mostrarErrores = true;
    
    if (this.area.are_nombre?.trim()) {
      // Limpiar alertas previas
      this.mostrarAlertaWarning = false;
      this.mostrarAlertaError = false;
      
      // Construir el objeto de actualización según el formato requerido por la API
      const areaActualizar = {
        are_codigo: this.area.are_codigo,
        are_nombre: this.area.are_nombre.trim(),
        active: this.area.active,
        created_at: this.area.created_at,
        created_by: this.area.created_by,
        updated_at: new Date(),
        updated_by: 'admin' // TODO: Reemplazar con el usuario logueado
      };

      console.log('Actualizando área:', areaActualizar);

      this.http.post<ApiResponse>(`${environment.apiBaseUrl}/Areas/update`, areaActualizar, {
        headers: { 
          'XApiKey': environment.apiKey,
          'Content-Type': 'application/json',
          'accept': '*/*'
        }
      }).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          
          if (response.success) {
            // La actualización fue exitosa
            this.mostrarAlertaExito = true;
            this.mensajeExito = response.data.messageStatus;
            
            // Actualizar el modelo local con los datos de respuesta
            const areaActualizada: Areas = {
              ...this.area,
              code_Status: response.data.codeStatus,
              message_Status: response.data.messageStatus,
              updated_at: new Date(),
              updated_by: 'admin'
            };
            
            // Emitir el área actualizada al componente padre
            this.onSave.emit(areaActualizada);
          } else {
            // Manejar caso de error en la respuesta
            this.mostrarAlertaError = true;
            this.mensajeError = response.message || 'Error al actualizar el área.';
          }
        },
        error: (error) => {
          console.error('Error en la solicitud:', error);
          this.mostrarAlertaError = true;
          this.mensajeError = 'Ha ocurrido un error al actualizar el área. Por favor, inténtalo de nuevo.';
        },
        complete: () => {
          // Opcional: realizar alguna acción cuando la solicitud se complete
        }
      });
    } else {
      this.mostrarAlertaWarning = true;
      this.mensajeWarning = 'Por favor, completa el nombre del área.';
    }
  }
}