import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Class {
  code: string;
  name: string;
  prerequisites: Prerequisite[];
}

interface Prerequisite {
  code: string;
  name: string;
  completed: boolean;
}

@Component({
  selector: 'app-request',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './request.component.html',
  styleUrl: './request.component.scss'
})
export class RequestComponent implements OnInit {
  requestForm: FormGroup;
  selectedClass: Class | null = null;
  allPrerequisitesMet: boolean = false;

  // Datos de ejemplo
  availableClasses: Class[] = [
    {
      code: 'MAT201',
      name: 'Cálculo I',
      prerequisites: [
        { code: 'MAT101', name: 'Álgebra', completed: true },
        { code: 'MAT102', name: 'Trigonometría', completed: true }
      ]
    },
    {
      code: 'MAT301',
      name: 'Cálculo II',
      prerequisites: [
        { code: 'MAT201', name: 'Cálculo I', completed: false }
      ]
    },
    {
      code: 'PRG101',
      name: 'Programación I',
      prerequisites: []
    },
    {
      code: 'PRG201',
      name: 'Programación II',
      prerequisites: [
        { code: 'PRG101', name: 'Programación I', completed: true }
      ]
    }
  ];

  availableDays = [
    { value: 'monday', label: 'Lunes' },
    { value: 'tuesday', label: 'Martes' },
    { value: 'wednesday', label: 'Miércoles' },
    { value: 'thursday', label: 'Jueves' },
    { value: 'friday', label: 'Viernes' },
    { value: 'saturday', label: 'Sábado' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.requestForm = this.fb.group({
      classCode: ['', Validators.required],
      schedule: ['', Validators.required],
      monday: [false],
      tuesday: [false],
      wednesday: [false],
      thursday: [false],
      friday: [false],
      saturday: [false],
      comments: ['', [Validators.required, Validators.minLength(10)]]
    });

    // Agregar validación para asegurar que al menos un día está seleccionado
    const daysControls = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    daysControls.forEach(day => {
      this.requestForm.get(day)?.valueChanges.subscribe(() => {
        const anyDaySelected = daysControls.some(d => this.requestForm.get(d)?.value);
        if (!anyDaySelected) {
          this.requestForm.setErrors({ noDaySelected: true });
        } else {
          const currentErrors = this.requestForm.errors;
          if (currentErrors) {
            delete currentErrors['noDaySelected'];
            this.requestForm.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
          }
        }
      });
    });
  }

  ngOnInit() {
    // Inicialización adicional si es necesaria
  }

  onClassSelect() {
    const selectedCode = this.requestForm.get('classCode')?.value;
    this.selectedClass = this.availableClasses.find(c => c.code === selectedCode) || null;
    
    if (this.selectedClass) {
      this.allPrerequisitesMet = this.selectedClass.prerequisites.every(p => p.completed);
    }
  }

  onSubmit() {
    if (this.requestForm.valid && this.allPrerequisitesMet) {
      // Aquí iría la lógica para enviar la solicitud
      console.log('Formulario enviado:', this.requestForm.value);
      alert('Solicitud enviada con éxito');
      this.router.navigate(['/website']);
    }
  }

  onCancel() {
    this.router.navigate(['/website']);
  }
}
