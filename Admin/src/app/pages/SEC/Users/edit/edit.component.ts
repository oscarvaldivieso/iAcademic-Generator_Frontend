import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/Modelos/sec/user.model';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnChanges {
  @Input() user: User | null = null;
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
      usu_codigo: [{ value: '', disabled: true }],
      usu_nombre: ['', [Validators.required]],
      usu_email: ['', [Validators.required, Validators.email]],
      usu_password: ['', [Validators.minLength(6)]],
      usu_activo: [true],
      est_codigo: [''],
      doc_codigo: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.userForm.patchValue({
        usu_codigo: this.user.usu_codigo || '',
        usu_nombre: this.user.usu_nombre || '',
        usu_email: this.user.usu_email || '',
        usu_activo: this.user.usu_activo || false,
        est_codigo: this.user.est_codigo || '',
        doc_codigo: this.user.doc_codigo || ''
      });
      // Clear password field
      this.userForm.get('usu_password')?.setValue('');
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid || !this.user) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    // Prepare data for update (exclude empty password if not changed)
    const formData = { ...this.userForm.value };
    if (!formData.usu_password) {
      delete formData.usu_password;
    }

    this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/${this.user.usu_codigo}`, formData).subscribe({
      next: (response) => {
        this.successMessage = 'Usuario actualizado exitosamente';
        setTimeout(() => {
          this.closeModal.emit();
        }, 1500);
      },
      error: (error) => {
        console.error('Error al actualizar usuario:', error);
        this.errorMessage = error.error?.message || 'Error al actualizar el usuario. Por favor, intente nuevamente.';
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
