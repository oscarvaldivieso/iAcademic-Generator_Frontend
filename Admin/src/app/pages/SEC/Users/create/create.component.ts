import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/Modelos/sec/user.model';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent {
  @Output() closeModal = new EventEmitter<void>();
  
  userForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  
  // API URL
  private apiUrl = `${environment.apiBaseUrl}/api/Users`;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.userForm = this.fb.group({
      usu_codigo: ['', [Validators.required]],
      usu_nombre: ['', [Validators.required]],
      usu_email: ['', [Validators.required, Validators.email]],
      usu_password: ['', [Validators.required, Validators.minLength(6)]],
      usu_activo: [true],
      est_codigo: [''],
      doc_codigo: ['']
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

    const userData: User = this.userForm.value;
    
    this.http.post<{ success: boolean; message: string }>(this.apiUrl, userData).subscribe({
      next: (response) => {
        this.successMessage = 'Usuario creado exitosamente';
        this.userForm.reset({ usu_activo: true });
        setTimeout(() => {
          this.closeModal.emit();
        }, 1500);
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
        this.errorMessage = error.error?.message || 'Error al crear el usuario. Por favor, intente nuevamente.';
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
