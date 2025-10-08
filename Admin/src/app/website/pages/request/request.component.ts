import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CampusService } from '../../../core/services/campus.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { SubjectService } from '../../../core/services/subject.service';
import { Campus } from '../../../Modelos/uni/campus.model';
import { Teacher } from '../../../Modelos/uni/teacher.model';
import { Subject } from '../../../Modelos/uni/subject.model';

interface Prerequisite {
  code: string;
  name: string;
  completed: boolean;
}

interface SelectedSubjectRequest {
  subject: Subject;
  teacher: Teacher;
  schedule?: {
    dayPattern: string;
    startTime: string;
    endTime: string;
    formatted: string;
  };
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
  selectedSubject: Subject | null = null;
  allPrerequisitesMet: boolean = false;

  // Lista de materias seleccionadas para la solicitud
  selectedSubjects: SelectedSubjectRequest[] = [];

  // Subjects (Materias)
  availableSubjects: Subject[] = [];
  filteredSubjects: Subject[] = [];
  isLoadingSubjects: boolean = false;
  subjectSearchTerm: string = '';
  showSubjectDropdown: boolean = false;

  availableTeachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];
  isLoadingTeachers: boolean = false;
  teacherSearchTerm: string = '';
  showTeacherDropdown: boolean = false;

  availableCampus: Campus[] = [];
  isLoadingCampus: boolean = false;

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

  // Opciones de días
  dayPatterns = [
    { 
      value: 'lunes-miercoles', 
      label: 'Lunes y Miércoles', 
      duration: 1.5,
      description: '1 hora 30 minutos cada día'
    },
    { 
      value: 'martes-jueves', 
      label: 'Martes y Jueves', 
      duration: 1.5,
      description: '1 hora 30 minutos cada día'
    },
    { 
      value: 'viernes', 
      label: 'Viernes', 
      duration: 3,
      description: '3 horas continuas'
    },
    { 
      value: 'sabado', 
      label: 'Sábado', 
      duration: 3,
      description: '3 horas continuas'
    },
    { 
      value: 'domingo', 
      label: 'Domingo', 
      duration: 3,
      description: '3 horas continuas'
    }
  ];

  selectedDayPattern: any = null;
  selectedStartTime: string = '';
  selectedEndTime: string = '';
  
  // Para editar horario de una materia específica
  editingScheduleIndex: number = -1;
  tempDayPattern: any = null;
  tempStartTime: string = '';
  tempEndTime: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private campusService: CampusService,
    private teacherService: TeacherService,
    private subjectService: SubjectService
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
    this.loadCampusList();
    this.loadTeachersList();
    this.loadSubjectsList();
  }

  /**
   * Carga la lista de campus desde el API
   */
  loadCampusList() {
    this.isLoadingCampus = true;
    this.campusService.getCampusList().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Filtrar solo los campus activos
          this.availableCampus = response.data.filter(campus => campus.active);
        }
        this.isLoadingCampus = false;
      },
      error: (error) => {
        console.error('Error al cargar la lista de campus:', error);
        this.isLoadingCampus = false;
        // Opcional: mostrar mensaje de error al usuario
      }
    });
  }

  /**
   * Carga la lista de materias desde el API
   */
  loadSubjectsList() {
    this.isLoadingSubjects = true;
    this.subjectService.getSubjectsList().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Filtrar solo las materias activas y ordenar alfabéticamente
          this.availableSubjects = response.data
            .filter(subject => subject.active)
            .sort((a, b) => a.mat_nombre.localeCompare(b.mat_nombre));
          this.filteredSubjects = [...this.availableSubjects];
        }
        this.isLoadingSubjects = false;
      },
      error: (error) => {
        console.error('Error al cargar la lista de materias:', error);
        this.isLoadingSubjects = false;
      }
    });
  }

  /**
   * Carga la lista de docentes desde el API
   */
  loadTeachersList() {
    this.isLoadingTeachers = true;
    this.teacherService.getTeachersList().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Filtrar solo los docentes activos y ordenar alfabéticamente
          this.availableTeachers = response.data
            .filter(teacher => teacher.active)
            .sort((a, b) => a.doc_nombre.localeCompare(b.doc_nombre));
          this.filteredTeachers = [...this.availableTeachers];
        }
        this.isLoadingTeachers = false;
      },
      error: (error) => {
        console.error('Error al cargar la lista de docentes:', error);
        this.isLoadingTeachers = false;
      }
    });
  }

  /**
   * Filtra los docentes según el término de búsqueda
   */
  filterTeachers() {
    const searchTerm = this.teacherSearchTerm.toLowerCase().trim();
    
    if (!searchTerm) {
      this.filteredTeachers = [...this.availableTeachers];
    } else {
      this.filteredTeachers = this.availableTeachers.filter(teacher => 
        teacher.doc_nombre.toLowerCase().includes(searchTerm) ||
        teacher.doc_codigo.toLowerCase().includes(searchTerm)
      );
    }
  }

  /**
   * Selecciona un docente del dropdown
   */
  selectTeacher(teacher: Teacher) {
    this.requestForm.patchValue({ teacher: teacher.doc_codigo });
    this.teacherSearchTerm = teacher.doc_nombre;
    this.showTeacherDropdown = false;
  }

  /**
   * Muestra el dropdown de docentes
   */
  onTeacherInputFocus() {
    this.showTeacherDropdown = true;
    this.filterTeachers();
  }

  /**
   * Maneja el input de búsqueda de docentes
   */
  onTeacherSearchInput() {
    this.showTeacherDropdown = true;
    this.filterTeachers();
    // Limpiar la selección si el usuario está escribiendo
    if (this.requestForm.get('teacher')?.value) {
      this.requestForm.patchValue({ teacher: '' });
    }
  }

  /**
   * Obtiene el nombre del docente seleccionado
   */
  getSelectedTeacherName(): string {
    const teacherCode = this.requestForm.get('teacher')?.value;
    if (teacherCode) {
      const teacher = this.availableTeachers.find(t => t.doc_codigo === teacherCode);
      return teacher ? teacher.doc_nombre : '';
    }
    return '';
  }

  /**
   * Filtra las materias según el término de búsqueda
   */
  filterSubjects() {
    const searchTerm = this.subjectSearchTerm.toLowerCase().trim();
    
    if (!searchTerm) {
      this.filteredSubjects = [...this.availableSubjects];
    } else {
      this.filteredSubjects = this.availableSubjects.filter(subject => 
        subject.mat_nombre.toLowerCase().includes(searchTerm) ||
        subject.mat_codigo.toLowerCase().includes(searchTerm)
      );
    }
  }

  /**
   * Selecciona una materia del dropdown
   */
  selectSubject(subject: Subject) {
    this.requestForm.patchValue({ classCode: subject.mat_codigo });
    this.subjectSearchTerm = `${subject.mat_codigo} - ${subject.mat_nombre}`;
    this.showSubjectDropdown = false;
    this.selectedSubject = subject;
  }

  /**
   * Agrega una materia a la lista de solicitudes
   */
  addSubjectToRequest() {
    const subjectCode = this.requestForm.get('classCode')?.value;
    const teacherCode = this.requestForm.get('teacher')?.value;

    if (!subjectCode || !teacherCode) {
      alert('Por favor seleccione una materia y un docente');
      return;
    }

    const subject = this.availableSubjects.find(s => s.mat_codigo === subjectCode);
    const teacher = this.availableTeachers.find(t => t.doc_codigo === teacherCode);

    if (!subject || !teacher) {
      alert('Error al obtener la información de la materia o docente');
      return;
    }

    // Verificar si la materia ya está en la lista
    const exists = this.selectedSubjects.some(s => s.subject.mat_codigo === subjectCode);
    if (exists) {
      alert('Esta materia ya está en tu lista de solicitudes');
      return;
    }

    // Agregar a la lista
    this.selectedSubjects.push({ subject, teacher });

    // Limpiar los campos
    this.requestForm.patchValue({ 
      classCode: '', 
      teacher: '' 
    });
    this.subjectSearchTerm = '';
    this.teacherSearchTerm = '';
    this.selectedSubject = null;
  }

  /**
   * Elimina una materia de la lista de solicitudes
   */
  removeSubjectFromRequest(index: number) {
    this.selectedSubjects.splice(index, 1);
  }

  /**
   * Muestra el dropdown de materias
   */
  onSubjectInputFocus() {
    this.showSubjectDropdown = true;
    this.filterSubjects();
  }

  /**
   * Maneja el input de búsqueda de materias
   */
  onSubjectSearchInput() {
    this.showSubjectDropdown = true;
    this.filterSubjects();
    // Limpiar la selección si el usuario está escribiendo
    if (this.requestForm.get('classCode')?.value) {
      this.requestForm.patchValue({ classCode: '' });
    }
  }

  onClassSelect() {
    const selectedCode = this.requestForm.get('classCode')?.value;
    this.selectedSubject = this.availableSubjects.find(s => s.mat_codigo === selectedCode) || null;
  }

  onSubmit() {
    if (!this.requestForm.valid) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (this.selectedSubjects.length === 0) {
      alert('Por favor agregue al menos una materia a su solicitud');
      return;
    }

    // Preparar los datos de la solicitud
    const requestData = {
      subjects: this.selectedSubjects.map(s => ({
        subjectCode: s.subject.mat_codigo,
        subjectName: s.subject.mat_nombre,
        teacherCode: s.teacher.doc_codigo,
        teacherName: s.teacher.doc_nombre
      })),
      campus: this.requestForm.get('campus')?.value,
      modality: this.requestForm.get('modality')?.value,
      period: this.requestForm.get('period')?.value,
      schedule: this.requestForm.get('schedule')?.value,
      observations: this.requestForm.get('observations')?.value
    };

    console.log('Solicitud enviada:', requestData);
    alert(`Solicitud enviada con éxito. Total de materias: ${this.selectedSubjects.length}`);
    this.router.navigate(['/website']);
  }

  

  onCancel() {
    this.router.navigate(['/website']);
  }

  /**
   * Abre el modal de horario para una materia
   */
  openScheduleModal(index: number) {
    this.editingScheduleIndex = index;
    const item = this.selectedSubjects[index];
    
    if (item.schedule) {
      // Cargar horario existente
      this.tempDayPattern = this.dayPatterns.find(p => p.value === item.schedule!.dayPattern);
      this.tempStartTime = item.schedule.startTime;
      this.tempEndTime = item.schedule.endTime;
    } else {
      // Limpiar para nuevo horario
      this.tempDayPattern = null;
      this.tempStartTime = '';
      this.tempEndTime = '';
    }
  }

  /**
   * Cierra el modal de horario
   */
  closeScheduleModal() {
    this.editingScheduleIndex = -1;
    this.tempDayPattern = null;
    this.tempStartTime = '';
    this.tempEndTime = '';
  }

  /**
   * Selecciona un patrón de días (temporal)
   */
  selectTempDayPattern(pattern: any) {
    this.tempDayPattern = pattern;
    this.tempStartTime = '';
    this.tempEndTime = '';
  }

  /**
   * Maneja el cambio de hora de inicio (temporal)
   */
  onTempStartTimeChange(time: string) {
    this.tempStartTime = time;
    if (time && this.tempDayPattern) {
      this.calculateTempEndTime();
    }
  }

  /**
   * Calcula la hora de fin temporal
   */
  calculateTempEndTime() {
    if (!this.tempStartTime || !this.tempDayPattern) return;

    const [hours, minutes] = this.tempStartTime.split(':').map(Number);
    const duration = this.tempDayPattern.duration;
    
    let endHours = hours + Math.floor(duration);
    let endMinutes = minutes + (duration % 1) * 60;
    
    if (endMinutes >= 60) {
      endHours += 1;
      endMinutes -= 60;
    }
    
    this.tempEndTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }

  /**
   * Guarda el horario para la materia
   */
  saveScheduleForSubject() {
    if (!this.tempDayPattern || !this.tempStartTime || !this.tempEndTime) {
      alert('Por favor completa la selección del horario');
      return;
    }

    if (this.editingScheduleIndex >= 0) {
      this.selectedSubjects[this.editingScheduleIndex].schedule = {
        dayPattern: this.tempDayPattern.value,
        startTime: this.tempStartTime,
        endTime: this.tempEndTime,
        formatted: `${this.tempDayPattern.label}: ${this.formatTime(this.tempStartTime)} - ${this.formatTime(this.tempEndTime)}`
      };
    }

    this.closeScheduleModal();
  }

  /**
   * Obtiene el texto formateado del horario temporal
   */
  getTempFormattedSchedule(): string {
    if (!this.tempDayPattern || !this.tempStartTime || !this.tempEndTime) {
      return '';
    }
    
    return `${this.tempDayPattern.label}: ${this.formatTime(this.tempStartTime)} - ${this.formatTime(this.tempEndTime)}`;
  }

  /**
   * Formatea la hora en formato 12 horas
   */
  formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  }

  /**
   * Cierra el dropdown cuando se hace clic fuera
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.teacher-search-container')) {
      this.showTeacherDropdown = false;
    }
    if (!target.closest('.subject-search-container')) {
      this.showSubjectDropdown = false;
    }
  }
}
