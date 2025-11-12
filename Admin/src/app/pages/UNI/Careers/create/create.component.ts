import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Careers } from 'src/app/Modelos/uni/career.model';
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
  @Output() onSave = new EventEmitter<Careers>();

  mostrarErrores = false;
  mostrarAlertaExito = false;
  mensajeExito = '';
  mostrarAlertaError = false;
  mensajeError = '';
  mostrarAlertaWarning = false;
  mensajeWarning = '';
  
  constructor(private http: HttpClient) {}
  
  career: Careers = {
    car_codigo: '',
    car_nombre: '',
    car_orientacion: '',
    car_anio_plan: 0,
    active: true,
    created_by: '',
    created_at: new Date(),
    updated_by: '',
    updated_at: new Date(),
    code_Status: 0,
    message_Status: '',
  };
  
  cancelar(): void {
    this.mostrarErrores = false;
    this.mostrarAlertaExito = false;
    this.mensajeExito = '';
    this.mostrarAlertaError = false;
    this.mensajeError = '';
    this.mostrarAlertaWarning = false;
    this.mensajeWarning = '';
    this.career = {
      car_codigo: '',
      car_nombre: '',
      car_orientacion: '',
      car_anio_plan: 0,
      active: true,
      created_by: '',
      created_at: new Date(),
      updated_by: '',
      updated_at: new Date(),
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
    
    if (this.career.car_nombre.trim()) {
      // Limpiar alertas previas
      this.mostrarAlertaWarning = false;
      this.mostrarAlertaError = false;
      
      const careerGuardar = {
        car_codigo: this.career.car_codigo.trim(),
        car_nombre: this.career.car_nombre.trim(),
        car_orientacion: this.career.car_orientacion.trim(),
        car_anio_plan: this.career.car_anio_plan,
        active: this.career.active,
        created_by: 'oscar',// varibale global, obtiene el valor del environment, esto por mientras
        created_at: new Date(),
        updated_by: '',// varibale global, obtiene el valor del environment, esto por mientras
        updated_at: new Date()
      };

      console.log('Guardando estado civil:', careerGuardar);
      
      this.http.post<any>(`${environment.apiBaseUrl}/Careers/create`, careerGuardar, {
        headers: { 
          'XApiKey': environment.apiKey,
          'Content-Type': 'application/json',
          'accept': '*/*'
        }
      }).subscribe({
        next: (response) => {
          console.log('Carrera guardada exitosamente:', response);
          this.mensajeExito = `Carrera "${this.career.car_nombre}" guardada exitosamente`;
          this.mostrarAlertaExito = true;
          this.mostrarErrores = false;
          
          // Ocultar la alerta después de 3 segundos
          setTimeout(() => {
            this.mostrarAlertaExito = false;
            this.onSave.emit(this.career);
            this.cancelar();
          }, 3000);
        },
        error: (error) => {
          console.error('Error al guardar la carrera:', error);
          this.mostrarAlertaError = true;
          this.mensajeError = 'Error al guardar la carrera. Por favor, intente nuevamente.';
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
