import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

// Register Auth
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { UserProfileService } from 'src/app/core/services/user.service';
import { Register } from 'src/app/store/Authentication/authentication.actions';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

// Register Component
export class RegisterComponent {
  // Register Form
  registerForm!: UntypedFormGroup;
  submitted = false;
  successmsg = false;
  error = '';
  // set the current year
  year: number = new Date().getFullYear();

  showPassword = false;

  constructor(private formBuilder: UntypedFormBuilder,  public store: Store) { }

  ngOnInit(): void {
    /**
     * Form Validation
     */
    this.registerForm = this.formBuilder.group({
      fullName: ['', [Validators.required]],
      studentId: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      gender: [''],
      institutionalEmail: ['', [Validators.required, Validators.email, Validators.pattern(/.*@ceutec\.edu\.hn$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      alternateEmail: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{4}$/)]],
      alternatePhone: ['', [Validators.pattern(/^\d{4}-\d{4}$/)]],
      campus: ['', [Validators.required]],
      career: ['', [Validators.required]],
      planYear: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    });
  }

    // convenience getter for easy access to form fields
    get f() { return this.registerForm.controls; }

  /**
   * Register submit form
   */
  onSubmit() {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    const formValue = this.registerForm.value;

    // Dispatch Action with all form values
    this.store.dispatch(Register({ 
      email: formValue.institutionalEmail,
      first_name: formValue.fullName,
      password: formValue.password,
      student_id: formValue.studentId,
      gender: formValue.gender,
      alternate_email: formValue.alternateEmail,
      phone: formValue.phone,
      alternate_phone: formValue.alternatePhone,
      campus: formValue.campus,
      career: formValue.career,
      plan_year: formValue.planYear
    }));
  }

  /**
   * Password Hide/Show
   */
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

}
