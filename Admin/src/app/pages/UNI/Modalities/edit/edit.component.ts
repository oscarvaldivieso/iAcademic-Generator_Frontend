import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Modality } from 'src/app/Modelos/uni/modalities.model';
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
export class EditComponent {
  @Input() modalityData: Modality | undefined;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Modality>();

  mostrarErrores = false;
  mostrarAlertaExito = false;
  mensajeExito = '';
  mostrarAlertaError = false;
  mensajeError = '';
  mostrarAlertaWarning = false;
  mensajeWarning = '';
  
  modality: Modality;
  
  constructor(private http: HttpClient) {
    this.modality = {
      mod_codigo: '',
      mod_nombre: '',
      active: true,
      created_by: '',
      created_at: new Date(),
      updated_by: '',
      updated_at: null,
      code_Status: 0,
      message_Status: ''
    };
  }

  ngOnInit(): void {
    if (this.modalityData) {
      // Asegurarnos de que tenemos todas las propiedades necesarias
      this.modality = {
        mod_codigo: this.modalityData.mod_codigo,
        mod_nombre: this.modalityData.mod_nombre,
        active: this.modalityData.active,
        created_by: this.modalityData.created_by || '',
        created_at: this.modalityData.created_at,
        updated_by: this.modalityData.updated_by || '',
        updated_at: this.modalityData.updated_at,
        code_Status: this.modalityData.code_Status,
        message_Status: this.modalityData.message_Status
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
    
    if (this.modality.mod_nombre?.trim()) {
      // Limpiar alertas previas
      this.mostrarAlertaWarning = false;
      this.mostrarAlertaError = false;
      
      // Construir el objeto de actualización según el formato requerido por la API
      const modalidadActualizar = {
        mod_codigo: this.modality.mod_codigo,
        mod_nombre: this.modality.mod_nombre.trim(),
        active: this.modality.active,
        created_at: this.modality.created_at,
        created_by: this.modality.created_by,
        updated_at: new Date(),
        updated_by: 'admin' // TODO: Reemplazar con el usuario logueado
      };

      console.log('Actualizando modalidad:', modalidadActualizar);
      
      const updateData = {
        mod_codigo: this.modality.mod_codigo,
        mod_nombre: this.modality.mod_nombre,
        active: this.modality.active,
        created_at: this.modality.created_at,
        updated_at: new Date(),
        created_by: this.modality.created_by,
        updated_by: 'admin' // TODO: Reemplazar con el usuario logueado
      };

      this.http.post<ApiResponse>(`${environment.apiBaseUrl}/Modalities/update`, updateData, {
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
            const modalidadActualizada: Modality = {
              ...this.modality,
              code_Status: response.data.codeStatus,
              message_Status: response.data.messageStatus
            };
            
            // Emitir la modalidad actualizada al componente padre
            this.onSave.emit(modalidadActualizada);
          } else {
            // Manejar caso de error en la respuesta
            this.mostrarAlertaError = true;
            this.mensajeError = response.message || 'Error al actualizar la modalidad.';
          }
        },
        error: (error) => {
          console.error('Error en la solicitud:', error);
          this.mostrarAlertaError = true;
          this.mensajeError = 'Ha ocurrido un error al actualizar la modalidad. Por favor, inténtalo de nuevo.';
        },
        complete: () => {
          // Opcional: realizar alguna acción cuando la solicitud se complete
        }
      });
    } else {
      this.mostrarAlertaWarning = true;
      this.mensajeWarning = 'Por favor, completa todos los campos requeridos.';
    }
  }
}
