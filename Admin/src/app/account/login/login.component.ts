import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: UntypedFormGroup;
  submitted = false;
  fieldTextType!: boolean;
  error = '';

  constructor(
    private formBuilder: UntypedFormBuilder,
    private authService: AuthenticationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Redirigir si ya está autenticado
    if (this.authService.isLoggedIn()) {
      const userData = this.authService.currentUserValue;
      if (userData?.tipo_usuario === 'ESTUDIANTE') {
        this.router.navigate(['/website']);
      } else {
        this.router.navigate(['/']);
      }
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    if (this.submitted) {
      return; // Evitar múltiples envíos
    }

    this.submitted = true;
    this.error = '';

    if (this.loginForm.invalid) {
      this.submitted = false;
      return;
    }

    const loginData = {
      user: this.f['email'].value,
      password: this.f['password'].value
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        if (response.success) {
          // Redirección basada en el tipo de usuario
          if (response.data.tipo_usuario === 'ESTUDIANTE') {
            this.router.navigate(['/website']);
          } else if (response.data.tipo_usuario === 'DOCENTE') {
            this.router.navigate(['/']);
          }
        } else {
          this.error = response.message;
          this.submitted = false; // Resetear estado del botón
        }
      },
      error: (error) => {
        if (error.data?.message) {
          // Si tenemos un mensaje detallado en data
          this.error = error.data.message;
        } else if (error.message) {
          // Si tenemos un mensaje general
          this.error = error.message;
        } else {
          // Mensaje por defecto
          this.error = 'Error al iniciar sesión. Por favor, intente nuevamente.';
        }
        this.submitted = false; // Resetear estado del botón
      }
    });
  }

  /**
   * Password Hide/Show
   */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
}
