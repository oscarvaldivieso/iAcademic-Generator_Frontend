import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Classroom } from 'src/app/Modelos/uni/classrooms.model';
import { Campus } from 'src/app/Modelos/uni/campus.model';
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
  @Input() classroomData: Classroom | undefined;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Classroom>();

  campusList: Campus[] = [];

  mostrarErrores = false;
  mostrarAlertaExito = false;
  mensajeExito = '';
  mostrarAlertaError = false;
  mensajeError = '';
  mostrarAlertaWarning = false;
  mensajeWarning = '';
  
  classroom: Classroom;
  
  constructor(private http: HttpClient) {
    this.classroom = {
      auc_codigo: '',
      cam_codigo: '',
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
    // Cargar la lista de campus
    this.getCampus();
    
    if (this.classroomData) {
      // Asegurarnos de que tenemos todas las propiedades necesarias
      this.classroom = {
        auc_codigo: this.classroomData.auc_codigo,
        cam_codigo: this.classroomData.cam_codigo,
        active: this.classroomData.active,
        created_by: this.classroomData.created_by || '',
        created_at: this.classroomData.created_at,
        updated_by: this.classroomData.updated_by || '',
        updated_at: this.classroomData.updated_at,
        code_Status: this.classroomData.code_Status,
        message_Status: this.classroomData.message_Status
      };
    } else {
      this.cancelar(); // Si no hay datos, cerramos el formulario
    }
  }

  getCampus(): void {
    this.http.get<any>(`${environment.apiBaseUrl}/Campus/list`, {
      headers: { 
        'XApiKey': environment.apiKey
      }
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.campusList = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar campus:', error);
        this.mostrarAlertaError = true;
        this.mensajeError = 'Error al cargar la lista de campus.';
      }
    });
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
    
    if (this.classroom.cam_codigo?.trim()) {
      // Limpiar alertas previas
      this.mostrarAlertaWarning = false;
      this.mostrarAlertaError = false;
      
      // Construir el objeto de actualización según el formato requerido por la API
      const aulaActualizar = {
        auc_codigo: this.classroom.auc_codigo,
        cam_codigo: this.classroom.cam_codigo.trim(),
        active: this.classroom.active,
        created_at: this.classroom.created_at,
        created_by: this.classroom.created_by,
        updated_at: new Date(),
        updated_by: 'admin' // TODO: Reemplazar con el usuario logueado
      };

      console.log('Actualizando aula:', aulaActualizar);

      this.http.post<ApiResponse>(`${environment.apiBaseUrl}/Classrooms/update`, aulaActualizar, {
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
            const aulaActualizada: Classroom = {
              ...this.classroom,
              code_Status: response.data.codeStatus,
              message_Status: response.data.messageStatus,
              updated_at: new Date(),
              updated_by: 'admin'
            };
            
            // Emitir el aula actualizada al componente padre
            this.onSave.emit(aulaActualizada);
          } else {
            // Manejar caso de error en la respuesta
            this.mostrarAlertaError = true;
            this.mensajeError = response.message || 'Error al actualizar el aula.';
          }
        },
        error: (error) => {
          console.error('Error en la solicitud:', error);
          this.mostrarAlertaError = true;
          this.mensajeError = 'Ha ocurrido un error al actualizar el aula. Por favor, inténtalo de nuevo.';
        },
        complete: () => {
          // Opcional: realizar alguna acción cuando la solicitud se complete
        }
      });
    } else {
      this.mostrarAlertaWarning = true;
      this.mensajeWarning = 'Por favor, selecciona un campus.';
    }
  }
}