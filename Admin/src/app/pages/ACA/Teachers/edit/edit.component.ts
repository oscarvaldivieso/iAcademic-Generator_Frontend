import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Teachers } from 'src/app/Modelos/aca/teacher.model';
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
  @Input() teacherData: Teachers | undefined;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Teachers>();

  mostrarErrores = false;
  mostrarAlertaExito = false;
  mensajeExito = '';
  mostrarAlertaError = false;
  mensajeError = '';
  mostrarAlertaWarning = false;
  mensajeWarning = '';
  
  teacher: Teachers;
  
  constructor(private http: HttpClient) {
    this.teacher = {
      doc_codigo: '',
      doc_nombre: '',
      gru_codigo: '',
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
    if (this.teacherData) {
      // Asegurarnos de que tenemos todas las propiedades necesarias
      this.teacher = {
        doc_codigo: this.teacherData.doc_codigo,
        doc_nombre: this.teacherData.doc_nombre,
        gru_codigo: this.teacherData.gru_codigo,
        active: this.teacherData.active,
        created_by: this.teacherData.created_by || '',
        created_at: this.teacherData.created_at,
        updated_by: this.teacherData.updated_by || '',
        updated_at: this.teacherData.updated_at,
        code_Status: this.teacherData.code_Status,
        message_Status: this.teacherData.message_Status
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
    
    if (this.teacher.doc_nombre?.trim()) {
      // Limpiar alertas previas
      this.mostrarAlertaWarning = false;
      this.mostrarAlertaError = false;
      
      // Construir el objeto de actualización según el formato requerido por la API
      const docenteActualizar = {
        doc_codigo: this.teacher.doc_codigo,
        doc_nombre: this.teacher.doc_nombre.trim(),
        gru_codigo: this.teacher.gru_codigo,
        active: this.teacher.active,
        created_at: this.teacher.created_at,
        created_by: this.teacher.created_by,
        updated_at: new Date(),
        updated_by: 'admin' // TODO: Reemplazar con el usuario logueado
      };

      console.log('Actualizando docente:', docenteActualizar);

      this.http.post<ApiResponse>(`${environment.apiBaseUrl}/Teachers/Update`, docenteActualizar, {
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
            const docenteActualizado: Teachers = {
              ...this.teacher,
              doc_nombre: this.teacher.doc_nombre.trim(),
              code_Status: response.data.codeStatus,
              message_Status: response.data.messageStatus,
              updated_at: new Date(),
              updated_by: 'admin'
            };
            
            // Emitir el docente actualizado al componente padre
            this.onSave.emit(docenteActualizado);
          } else {
            // Manejar caso de error en la respuesta
            this.mostrarAlertaError = true;
            this.mensajeError = response.message || 'Error al actualizar el docente.';
          }
        },
        error: (error) => {
          console.error('Error en la solicitud:', error);
          this.mostrarAlertaError = true;
          this.mensajeError = 'Ha ocurrido un error al actualizar el docente. Por favor, inténtalo de nuevo.';
        },
        complete: () => {
          // Opcional: realizar alguna acción cuando la solicitud se complete
        }
      });
    } else {
      this.mostrarAlertaWarning = true;
      this.mensajeWarning = 'Por favor, ingresa el nombre del docente.';
    }
  }
}