import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { User } from 'src/app/Modelos/sec/user.model';

interface ApiResponse<T> {
  type: number;
  code: number;
  success: boolean;
  message: string;
  data: T;
}

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent {
  @Output() closeModal = new EventEmitter<void>();
  
  userForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  esEstudiante: boolean = false;
  
  // API URL
  private apiUrl = `${environment.apiBaseUrl}/User/create`;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.userForm = this.fb.group({
      usu_codigo: ['', [Validators.required]],
      usu_nombre: ['', [Validators.required]],
      usu_email: ['', [Validators.required, Validators.email]],
      usu_password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formValue = this.userForm.value;
    const codigoUsuario = formValue.usu_codigo;

    // Construir el objeto userData según el tipo de usuario
    const userData: any = {
      usu_codigo: formValue.usu_codigo,
      usu_nombre: formValue.usu_nombre,
      usu_email: formValue.usu_email,
      usu_password: formValue.usu_password,
      usu_activo: true,
      created_by: 'admin',
      created_at: new Date()
    };

    // Asignar el código de usuario al campo correspondiente según si es estudiante
    if (this.esEstudiante) {
      userData.est_codigo = codigoUsuario;
      userData.doc_codigo = null;
    } else {
      userData.doc_codigo = codigoUsuario;
      userData.est_codigo = null;
    }
    
    this.http.post<ApiResponse<User>>(this.apiUrl, userData, {
      headers: new HttpHeaders({
        'XApiKey': environment.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    }).subscribe({
      next: (response) => {
        if (response && response.success) {
          this.successMessage = 'Usuario creado exitosamente';
          this.userForm.reset();
          this.esEstudiante = false;
          setTimeout(() => {
            this.closeModal.emit();
          }, 1500);
        } else {
          this.errorMessage = response?.message || 'Error al crear el usuario.';
        }
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
        this.errorMessage = error.error?.message || 'Error al crear el usuario. Por favor, intente nuevamente.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onClose(): void {
    this.closeModal.emit();
  }
}