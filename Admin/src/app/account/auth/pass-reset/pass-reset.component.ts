import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-pass-reset',
  templateUrl: './pass-reset.component.html',
  styleUrls: ['./pass-reset.component.scss']
})
export class PassResetComponent implements OnInit, OnDestroy {
  // Formularios separados para cada paso
  resetRequestForm!: FormGroup;
  verifyCodeForm!: FormGroup;
  newPasswordForm!: FormGroup;
  
  // Control de pasos
  currentStep: 'request' | 'verify' | 'reset' | 'success' = 'request';
  isLoading: boolean = false;
  userEmail: string = '';
  maskedEmail: string = '';
  
  // Control de contraseñas
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  // Control de reenvío
  resendCooldown: number = 0;
  private timerSubscription?: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
    // Aquí puedes inyectar tu servicio de autenticación
    // private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.setupPasswordValidation();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  private initializeForms(): void {
    // Formulario para solicitar reset
    this.resetRequestForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Formulario para verificar código
    this.verifyCodeForm = this.formBuilder.group({
      digit1: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit2: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit3: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit4: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit5: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit6: ['', [Validators.required, Validators.pattern(/^\d$/)]]
    });

    // Formulario para nueva contraseña
    this.newPasswordForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private setupPasswordValidation(): void {
    // Escuchar cambios en el campo de nueva contraseña para mostrar requisitos
    this.newPasswordForm.get('newPassword')?.valueChanges.subscribe(password => {
      // Los requisitos se actualizan automáticamente con los métodos get
    });
  }

  // Validador personalizado para la contraseña
  private passwordValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.value as string;
    if (!password) return null;

    const hasNumber = /\d/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasMinLength = password.length >= 8;

    const valid = hasNumber && hasUpper && hasLower && hasMinLength;
    return valid ? null : { invalidPassword: true };
  }

  // Validador para confirmar que las contraseñas coincidan
  private passwordMatchValidator(form: AbstractControl): { passwordMismatch: boolean } | null {
    if (!form.get('newPassword') || !form.get('confirmPassword')) return null;

    const newPassword = form.get('newPassword')?.value as string;
    const confirmPassword = form.get('confirmPassword')?.value as string;
    
    if (!newPassword || !confirmPassword) return null;
    
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  // Método principal para enviar formularios
  onRequestSubmit(): void {
    if (this.resetRequestForm.invalid || this.isLoading) return;
    this.sendVerificationCode();
  }

  onVerifySubmit(): void {
    if (this.verifyCodeForm.invalid || this.isLoading) return;
    this.verifyCode();
  }

  onResetSubmit(): void {
    if (this.newPasswordForm.invalid || this.isLoading) return;
    this.resetPassword();
  }

  private sendVerificationCode(): void {
    this.isLoading = true;
    const email = this.resetRequestForm.get('email')?.value;

    // Simular llamada al API
    setTimeout(() => {
      // Aquí harías la llamada real al servicio
      // this.authService.sendResetCode(email).subscribe({
      //   next: (response) => {
      //     this.userEmail = email;
      //     this.maskedEmail = this.maskEmail(email);
      //     this.goToStep('verify');
      //     this.isLoading = false;
      //   },
      //   error: (error) => {
      //     console.error('Error sending code:', error);
      //     this.isLoading = false;
      //     // Mostrar mensaje de error
      //   }
      // });

      // Simulación
      this.userEmail = email;
      this.maskedEmail = this.maskEmail(email);
      this.goToStep('verify');
      this.isLoading = false;
      console.log('Código enviado a:', email);
    }, 2000);
  }

  private verifyCode(): void {
    this.isLoading = true;
    const code = this.getVerificationCode();

    // Simular verificación
    setTimeout(() => {
      // Aquí harías la verificación real
      // this.authService.verifyResetCode(this.userEmail, code).subscribe({
      //   next: (response) => {
      //     this.goToStep('reset');
      //     this.isLoading = false;
      //   },
      //   error: (error) => {
      //     console.error('Error verifying code:', error);
      //     this.isLoading = false;
      //     // Mostrar mensaje de error
      //   }
      // });

      // Simulación
      this.goToStep('reset');
      this.isLoading = false;
      console.log('Código verificado:', code);
    }, 1500);
  }

  private resetPassword(): void {
    this.isLoading = true;
    const newPassword = this.newPasswordForm.get('newPassword')?.value;

    // Simular reset de contraseña
    setTimeout(() => {
      // Aquí harías el reset real
      // this.authService.resetPassword(this.userEmail, newPassword, verificationToken).subscribe({
      //   next: (response) => {
      //     this.goToStep('success');
      //     this.isLoading = false;
      //   },
      //   error: (error) => {
      //     console.error('Error resetting password:', error);
      //     this.isLoading = false;
      //     // Mostrar mensaje de error
      //   }
      // });

      // Simulación
      this.goToStep('success');
      this.isLoading = false;
      console.log('Contraseña restablecida para:', this.userEmail);
    }, 2000);
  }

  // Navegación entre pasos
  goToStep(step: 'request' | 'verify' | 'reset' | 'success'): void {
    this.currentStep = step;
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  // Control de contraseñas
  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Manejo del código de verificación
  onCodeInput(event: Event, index: number): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    // Solo permitir números
    if (!/^\d$/.test(value)) {
      target.value = '';
      return;
    }

    // Auto-focus al siguiente campo
    if (value && index < 5) {
      const nextInput = target.parentElement?.children[index + 1] as HTMLInputElement;
      nextInput?.focus();
    }
  }

  onCodeKeydown(event: KeyboardEvent, index: number): void {
    const target = event.target as HTMLInputElement;

    // Backspace: limpiar campo actual y mover al anterior
    if (event.key === 'Backspace' && !target.value && index > 0) {
      const prevInput = target.parentElement?.children[index - 1] as HTMLInputElement;
      prevInput?.focus();
    }
  }

  private getVerificationCode(): string {
    const form = this.verifyCodeForm;
    return [
      form.get('digit1')?.value,
      form.get('digit2')?.value,
      form.get('digit3')?.value,
      form.get('digit4')?.value,
      form.get('digit5')?.value,
      form.get('digit6')?.value
    ].join('');
  }

  resendCode(): void {
    if (this.resendCooldown > 0) return;

    // Iniciar cooldown de 60 segundos
    this.resendCooldown = 60;
    this.timerSubscription = interval(1000).subscribe(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        this.timerSubscription?.unsubscribe();
      }
    });

    // Simular reenvío de código
    // this.authService.sendResetCode(this.userEmail).subscribe({
    //   next: (response) => {
    //     console.log('Código reenviado');
    //     // Mostrar mensaje de éxito
    //   },
    //   error: (error) => {
    //     console.error('Error resending code:', error);
    //     // Mostrar mensaje de error
    //   }
    // });

    console.log('Código reenviado a:', this.userEmail);
  }

  // Utilidades
  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) return email;
    
    const maskedLocal = localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1];
    return `${maskedLocal}@${domain}`;
  }

  // Métodos para validación de contraseña en el template
  hasMinLength(): boolean {
    const password = this.newPasswordForm.get('newPassword')?.value || '';
    return password.length >= 8;
  }

  hasUppercase(): boolean {
    const password = this.newPasswordForm.get('newPassword')?.value || '';
    return /[A-Z]/.test(password);
  }

  hasLowercase(): boolean {
    const password = this.newPasswordForm.get('newPassword')?.value || '';
    return /[a-z]/.test(password);
  }

  hasNumber(): boolean {
    const password = this.newPasswordForm.get('newPassword')?.value || '';
    return /\d/.test(password);
  }

  // Método para obtener clase de fortaleza de contraseña
  getPasswordStrengthClass(): string {
    const password = this.newPasswordForm.get('newPassword')?.value || '';
    if (!password) return '';

    const conditions = [
      this.hasMinLength(),
      this.hasUppercase(),
      this.hasLowercase(),
      this.hasNumber()
    ];

    const metConditions = conditions.filter(Boolean).length;

    switch (metConditions) {
      case 1: return 'weak';
      case 2: return 'fair';
      case 3: return 'good';
      case 4: return 'strong';
      default: return '';
    }
  }

  // Método para obtener texto de fortaleza de contraseña
  getPasswordStrengthText(): string {
    const strengthClass = this.getPasswordStrengthClass();
    
    switch (strengthClass) {
      case 'weak': return 'Débil';
      case 'fair': return 'Regular';
      case 'good': return 'Buena';
      case 'strong': return 'Fuerte';
      default: return '';
    }
  }

  // Getters para validación en template
  get emailValid(): boolean {
    const emailControl = this.resetRequestForm.get('email');
    return Boolean(emailControl?.valid);
  }

  get codeValid(): boolean {
    return this.verifyCodeForm.valid;
  }

  get passwordsMatch(): boolean {
    return !this.newPasswordForm.hasError('passwordMismatch');
  }

  get canResetPassword(): boolean {
    const newPassword = this.newPasswordForm.get('newPassword');
    const confirmPassword = this.newPasswordForm.get('confirmPassword');
    return Boolean(newPassword?.valid && confirmPassword?.valid && this.passwordsMatch);
  }
}