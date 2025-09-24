import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Modality } from 'src/app/Modelos/uni/modalities.model';
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
  @Output() onSave = new EventEmitter<Modality>();

  mostrarErrores = false;
  mostrarAlertaExito = false;
  mensajeExito = '';
  mostrarAlertaError = false;
  mensajeError = '';
  mostrarAlertaWarning = false;
  mensajeWarning = '';
  
  constructor(private http: HttpClient) {}
  
  modality: Modality = {
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
  
  cancelar(): void {
    this.mostrarErrores = false;
    this.mostrarAlertaExito = false;
    this.mensajeExito = '';
    this.mostrarAlertaError = false;
    this.mensajeError = '';
    this.mostrarAlertaWarning = false;
    this.mensajeWarning = '';
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
    
    if (this.modality.mod_codigo?.trim() && this.modality.mod_nombre?.trim()) {
      // Limpiar alertas previas
      this.mostrarAlertaWarning = false;
      this.mostrarAlertaError = false;
      
      const modalidadGuardar = {
        mod_codigo: this.modality.mod_codigo.trim(),
        mod_nombre: this.modality.mod_nombre.trim(),
        active: true, // Siempre se crea como activo
        created_by: 'admin', // TODO: Reemplazar con el usuario logueado
        created_at: new Date(),
        updated_by: '',
        updated_at: null
      };

      console.log('Guardando modalidad:', modalidadGuardar);
      
      this.http.post<any>(`${environment.apiBaseUrl}/Modalities/create`, modalidadGuardar, {
        headers: { 
          'XApiKey': environment.apiKey,
          'Content-Type': 'application/json',
          'accept': '*/*'
        }
      }).subscribe({
        next: (response) => {
          console.log('Modalidad guardada exitosamente:', response);
          this.mensajeExito = `Modalidad "${this.modality.mod_nombre}" guardada exitosamente`;
          this.mostrarAlertaExito = true;
          this.mostrarErrores = false;
          
          // Ocultar la alerta después de 3 segundos
          setTimeout(() => {
            this.mostrarAlertaExito = false;
            this.onSave.emit(this.modality);
            this.cancelar();
          }, 3000);
        },
        error: (error) => {
          console.error('Error al guardar la modalidad:', error);
          this.mostrarAlertaError = true;
          this.mensajeError = 'Error al guardar la modalidad. Por favor, intente nuevamente.';
          this.mostrarAlertaExito = false;
          
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
}
