import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Teachers } from 'src/app/Modelos/aca/teacher.model';
import { environment } from 'src/environments/environment';

interface Group {
  gru_codigo: string;
  gru_nombre: string;
}

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent implements OnInit {
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Teachers>();

  groupsList: Group[] = [];

  mostrarErrores = false;
  mostrarAlertaExito = false;
  mensajeExito = '';
  mostrarAlertaError = false;
  mensajeError = '';
  mostrarAlertaWarning = false;
  mensajeWarning = '';
  
  constructor(private http: HttpClient) {}
  
  teacher: Teachers = {
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

  ngOnInit(): void {
    this.getGroups();
    // Limpiar alertas al inicializar el componente
    this.limpiarAlertas();
  }

  getGroups(): void {
    this.http.get<any>(`${environment.apiBaseUrl}/Groups/list`, {
      headers: { 
        'XApiKey': environment.apiKey
      }
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.groupsList = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar grupos:', error);
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
    this.teacher = new Teachers();
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
    
    if (this.teacher.doc_codigo?.trim() && 
        this.teacher.doc_nombre?.trim()) {
      // Limpiar alertas previas
      this.limpiarAlertas();
      
      const teacherSave = {
        doc_codigo: this.teacher.doc_codigo.trim(),
        doc_nombre: this.teacher.doc_nombre.trim(),
        gru_codigo: 'DOCENTES',
        active: true,
        created_by: 'admin', // TODO: Reemplazar con el usuario logueado
        created_at: new Date(),
        updated_by: '',
        updated_at: new Date()
      };

      console.log('Guardando docente:', teacherSave);
      
      this.http.post<any>(`${environment.apiBaseUrl}/Teachers/Create`, teacherSave, {
        headers: { 
          'XApiKey': environment.apiKey,
          'Content-Type': 'application/json',
          'accept': '*/*'
        }
      }).subscribe({
        next: (response) => {
          console.log('Docente guardado exitosamente:', response);
          if (response.success) {
            this.mostrarAlertaExito = true;
            this.mensajeExito = response.data.messageStatus;
            
            const teacherCreated: Teachers = {
              ...this.teacher,
              code_Status: response.data.codeStatus,
              message_Status: response.data.messageStatus
            };
            
            // Emitir el docente creado al componente padre
            this.onSave.emit(teacherCreated);
            
            // Esperar un momento para que se vea el mensaje y luego limpiar
            setTimeout(() => {
              this.cancelar();
            }, 2000);
          } else {
            this.mostrarAlertaError = true;
            this.mensajeError = response.message || 'Error al crear el docente.';
          }
        },
        error: (error) => {
          console.error('Error al guardar el docente:', error);
          this.mostrarAlertaError = true;
          this.mensajeError = 'Error al guardar el docente. Por favor, intente nuevamente.';
          
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