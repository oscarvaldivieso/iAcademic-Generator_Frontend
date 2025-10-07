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

interface Teacher {
  id: string;
  name: string;
}

interface Campus {
  id: string;
  name: string;
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

  availableTeachers: Teacher[] = [
    { id: '1', name: 'Dr. Juan Pérez' },
    { id: '2', name: 'Dra. María González' },
    { id: '3', name: 'Ing. Carlos Rodríguez' },
    { id: '4', name: 'Lic. Ana Martínez' }
  ];

  availableCampus: Campus[] = [
    { id: '1', name: 'Campus Tegucigalpa' },
    { id: '2', name: 'Campus San Pedro Sula' },
    { id: '3', name: 'Campus La Ceiba' },
    { id: '4', name: 'Campus Choluteca' }
  ];

  modalities = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'virtual', label: 'Virtual' },
    { value: 'hibrida', label: 'Híbrida' }
  ];

  periods = [
    { value: '1', label: 'Periodo 1' },
    { value: '2', label: 'Periodo 2' },
    { value: '3', label: 'Periodo 3' },
    { value: '4', label: 'Periodo 4' }
  ];

  scheduleOptions = [
    { value: 'lunes-miercoles', label: 'Lunes y Miércoles - 1:30 horas cada día' },
    { value: 'martes-jueves', label: 'Martes y Jueves - 1:30 horas cada día' },
    { value: 'viernes', label: 'Viernes - 3 horas' },
    { value: 'sabado', label: 'Sábado - 3 horas' },
    { value: 'domingo', label: 'Domingo - 3 horas' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.requestForm = this.fb.group({
      classCode: ['', Validators.required],
      teacher: ['', Validators.required],
      modality: ['', Validators.required],
      campus: ['', Validators.required],
      period: ['', Validators.required],
      schedule: ['', Validators.required],
      observations: ['', [Validators.required, Validators.minLength(10)]]
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
    if (this.requestForm.valid) {
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
