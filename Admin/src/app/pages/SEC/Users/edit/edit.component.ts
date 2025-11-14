import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { User } from 'src/app/Modelos/sec/user.model';

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
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  @Input() user: User | undefined;
  @Output() closeModal = new EventEmitter<void>();
  
  userForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  esEstudiante: boolean = false;
  
  private apiUrl = `${environment.apiBaseUrl}/User/update`;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.userForm = this.fb.group({
      usu_codigo: [{value: '', disabled: true}],
      usu_nombre: ['', [Validators.required]],
      usu_email: ['', [Validators.required, Validators.email]],
      usu_password: ['', [Validators.minLength(6)]],
      usu_activo: [true]
    });
  }

  ngOnInit(): void {
    if (this.user) {
      this.userForm.patchValue({
        usu_codigo: this.user.usu_codigo,
        usu_nombre: this.user.usu_nombre,
        usu_email: this.user.usu_email,
        usu_activo: this.user.usu_activo
      });
      
      this.esEstudiante = !!this.user.est_codigo;
    } else {
      this.onClose();
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formValue = this.userForm.getRawValue();
    const codigoUsuario = formValue.usu_codigo;

    const userData: any = {
      usu_codigo: codigoUsuario,
      usu_nombre: formValue.usu_nombre.trim(),
      usu_email: formValue.usu_email.trim(),
      usu_activo: formValue.usu_activo,
      updated_by: 'admin'
    };

    // ← ESTA PARTE ES LA CLAVE
    if (formValue.usu_password && formValue.usu_password.trim() !== '') {
      userData.usu_password = formValue.usu_password.trim();
    }

    if (this.esEstudiante) {
      userData.est_codigo = codigoUsuario;
      userData.doc_codigo = null;
    } else {
      userData.doc_codigo = codigoUsuario;
      userData.est_codigo = null;
    }

    console.log('Actualizando usuario:', userData);

    this.http.post<ApiResponse>(this.apiUrl, userData, {
      headers: new HttpHeaders({
        'XApiKey': environment.apiKey,
        'Content-Type': 'application/json',
        'accept': '*/*'
      })
    }).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.isLoading = false;
        
        if (response && response.success) {
          this.successMessage = response.data?.messageStatus || 'Usuario actualizado exitosamente';
          setTimeout(() => {
            this.closeModal.emit();
          }, 1500);
        } else {
          this.errorMessage = response?.message || 'Error al actualizar el usuario.';
        }
      },
      error: (error) => {
        console.error('Error al actualizar usuario:', error);
        this.errorMessage = error.error?.message || 'Error al actualizar el usuario.';
        this.isLoading = false;
      }
    });
  }

  onClose(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.closeModal.emit();
  }
}