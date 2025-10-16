import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {Classroom} from 'src/app/Modelos/uni/classrooms.model';
import { environment } from 'src/environments/environment';
import { Campus } from 'src/app/Modelos/uni/campus.model';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent implements OnInit {
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
  
  constructor(private http: HttpClient) {}
  
  classroom: Classroom = {
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

  ngOnInit(): void {
    this.getCampus();
    // Limpiar alertas al inicializar el componente
    this.limpiarAlertas();
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
      }
    });
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
    this.classroom = new Classroom();
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
    
    if (this.classroom.auc_codigo?.trim() && this.classroom.cam_codigo?.trim()) {
      // Limpiar alertas previas
      this.limpiarAlertas();
      
      const classroomSave = {
        auc_codigo: this.classroom.auc_codigo.trim(),
        cam_codigo: this.classroom.cam_codigo.trim(),
        active: true,
        created_by: 'admin', // TODO: Reemplazar con el usuario logueado
        created_at: new Date(),
        updated_by: '',
        updated_at: null
      };

      console.log('Guardando aula:', classroomSave);
      
      this.http.post<any>(`${environment.apiBaseUrl}/Classrooms/Create`, classroomSave, {
        headers: { 
          'XApiKey': environment.apiKey,
          'Content-Type': 'application/json',
          'accept': '*/*'
        }
      }).subscribe({
        next: (response) => {
          console.log('Aula guardada exitosamente:', response);
          if (response.success) {
            this.mostrarAlertaExito = true;
            this.mensajeExito = response.data.messageStatus;
            
            const classroomCreated: Classroom = {
              ...this.classroom,
              code_Status: response.data.codeStatus,
              message_Status: response.data.messageStatus
            };
            
            // Emitir la aula creada al componente padre
            this.onSave.emit(classroomCreated);
            
            // Esperar un momento para que se vea el mensaje y luego limpiar
            setTimeout(() => {
              this.cancelar();
            }, 2000);
          } else {
            this.mostrarAlertaError = true;
            this.mensajeError = response.message || 'Error al crear el aula.';
          }
        },
        error: (error) => {
          console.error('Error al guardar el aula:', error);
          this.mostrarAlertaError = true;
          this.mensajeError = 'Error al guardar el aula. Por favor, intente nuevamente.';
          
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