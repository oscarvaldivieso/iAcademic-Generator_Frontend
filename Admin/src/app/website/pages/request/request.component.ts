import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CampusService } from '../../../core/services/campus.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { SubjectService } from '../../../core/services/subject.service';
import { ModalityService } from 'src/app/core/services/modality.service';
import { Campus } from '../../../Modelos/uni/campus.model';
import { Teachers } from '../../../Modelos/aca/teacher.model';
import { Subject } from '../../../Modelos/uni/subject.model';
import { Modality } from '../../../Modelos/uni/modalities.model';
import { ScheduleService } from '../../../core/services/schedule.service';
import { Schedule } from '../../../Modelos/uni/schedule.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { AuthenticationService } from 'src/app/core/services/auth.service';

interface ApiResponse<T> {
  type: number;
  code: number;
  success: boolean;
  message: string;
  data: T;
  
}

interface Prerequisite {
  code: string;
  name: string;
  completed: boolean;
  
}

interface SelectedSubjectRequest {
  subject: Subject;
  teacher: Teachers;
  campus?: string;
  modality?: string;
  period?: string;
  observations?: string;
  schedule?: {
    scheduleCode?: number;
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
  styleUrls: ['./request.component.scss']
})
export class RequestComponent implements OnInit {
  requestForm: FormGroup;
  selectedSubject: Subject | null = null;
  allPrerequisitesMet: boolean = false;
isSubmitting: boolean = false;
  // Lista de materias seleccionadas para la solicitud
  selectedSubjects: SelectedSubjectRequest[] = [];

  // Subjects (Materias)
  availableSubjects: Subject[] = [];
  filteredSubjects: Subject[] = [];
  isLoadingSubjects: boolean = false;
  subjectSearchTerm: string = '';
  showSubjectDropdown: boolean = false;

  //Teachers (Docentes)
  availableTeachers: Teachers[] = [];
  filteredTeachers: Teachers[] = [];
  isLoadingTeachers: boolean = false;
  teacherSearchTerm: string = '';
  showTeacherDropdown: boolean = false;

  //Campus
  availableCampus: Campus[] = [];
  isLoadingCampus: boolean = false;

  //Modalities
  availableModalities: Modality[] = [];
  isLoadingModality: boolean = false;

  //Periods
  availablePeriods: any[] = [];
  isLoadingPeriods: boolean = false;

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
  
  // Para editar una materia específica (todos los campos)
  editingSubjectIndex: number = -1;
  tempDayPattern: any = null;
  tempStartTime: string = '';
  tempEndTime: string = '';
  tempCampus: string = '';
  tempModality: string = '';
  tempPeriod: string = '';
  tempObservations: string = '';
  // Nuevo: selección de horario desde API
  availableSchedules: Schedule[] = [];
  isLoadingSchedules: boolean = false;
  tempScheduleCode: number | null = null;

 constructor(
  private fb: FormBuilder,
  private router: Router,
  private http: HttpClient,
  private campusService: CampusService,
  private teacherService: TeacherService,
  private subjectService: SubjectService,
  private modalityService: ModalityService,
  private scheduleService: ScheduleService,
  private authService: AuthenticationService  // Add this line
) {
    this.requestForm = this.fb.group({
      classCode: ['', Validators.required],
      teacher: ['', Validators.required]
    });
  }

  /**
   * Carga la lista de horarios desde el API
   */
  loadSchedulesList() {
    this.isLoadingSchedules = true;
    this.scheduleService.getSchedulesList().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.availableSchedules = response.data.filter(s => s.active);
        }
        this.isLoadingSchedules = false;
      },
      error: (error) => {
        console.error('Error al cargar la lista de horarios:', error);
        this.isLoadingSchedules = false;
      }
    });
  }

  ngOnInit() {

      console.log('=== VERIFICACIÓN INICIAL ===');
  console.log('currentUserValue:', this.authService.currentUserValue);
  console.log('localStorage:', localStorage.getItem('currentUser'));

    this.loadCampusList();
    this.loadTeachersList();
    this.loadSubjectsList();
    this.loadModalitiesList();
    this.loadPeriodsList();
    this.loadSchedulesList();
  }

  /**
   * Carga la lista de campus desde el API
   */
  loadCampusList() {
    this.isLoadingCampus = true;
    const url = `${environment.apiBaseUrl}/Campus/list`;
    
    this.http.get<ApiResponse<Campus[]>>(url, {
      headers: { 
        'XApiKey': environment.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true
    }).subscribe({
      next: (response) => {
        console.log('Respuesta completa de la API:', response);
        
        if (response.success && response.data) {
          console.log('Datos de campus:', response.data);
          this.availableCampus = response.data.filter(campus => campus.active);
        } else {
          console.error('Respuesta de API no exitosa:', response);
        }
        this.isLoadingCampus = false;
      },
      error: (error) => {
        console.error('Error al cargar la lista de campus:', error);
        
        if (error.status === 401) {
          console.error('Error de autorización. Verifique la API Key.');
        } else if (error.status === 0) {
          console.error('Error de conexión. Verifique que la API esté funcionando.');
        }
        
        this.isLoadingCampus = false;
      }
    });
  }

  /**
   * Carga la lista de modalidades desde el API
   */
  loadModalitiesList() {
    this.isLoadingModality = true;
    const url = `${environment.apiBaseUrl}/Modalities/list`;
    
    this.http.get<ApiResponse<Modality[]>>(url, {
      headers: { 
        'XApiKey': environment.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true
    }).subscribe({
      next: (response) => {
        console.log('Respuesta completa de modalidades:', response);
        
        if (response.success && response.data) {
          console.log('Datos de modalidades:', response.data);
          this.availableModalities = response.data.filter(modality => modality.active);
        } else {
          console.error('Respuesta de API no exitosa:', response);
        }
        this.isLoadingModality = false;
      },
      error: (error) => {
        console.error('Error al cargar la lista de modalidades:', error);
        
        if (error.status === 401) {
          console.error('Error de autorización. Verifique la API Key.');
        } else if (error.status === 0) {
          console.error('Error de conexión. Verifique que la API esté funcionando.');
        }
        
        this.isLoadingModality = false;
      }
    });
  }

  /**
   * Carga la lista de períodos desde el API
   */
  loadPeriodsList() {
    this.isLoadingPeriods = true;
    const url = `${environment.apiBaseUrl}/Periods/list`;
    
    this.http.get<ApiResponse<any[]>>(url, {
      headers: { 
        'XApiKey': environment.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true
    }).subscribe({
      next: (response) => {
        console.log('Respuesta completa de períodos:', response);
        
        if (response.success && response.data) {
          console.log('Datos de períodos:', response.data);
          this.availablePeriods = response.data.filter(period => period.active);
        } else {
          console.error('Respuesta de API no exitosa:', response);
        }
        this.isLoadingPeriods = false;
      },
      error: (error) => {
        console.error('Error al cargar la lista de períodos:', error);
        
        if (error.status === 401) {
          console.error('Error de autorización. Verifique la API Key.');
        } else if (error.status === 0) {
          console.error('Error de conexión. Verifique que la API esté funcionando.');
        }
        
        this.isLoadingPeriods = false;
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
 * Formatea el label del período para mostrarlo de forma amigable
 */
formatPeriodLabel(period: any): string {
  // Convertir trimestre a Q (Quarter)
  const quarter = `Q${period.per_trimestre}`;
  
  // Formatear fechas
  const inicio = new Date(period.per_inicio).toLocaleDateString('es-HN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  
  const fin = new Date(period.per_fin).toLocaleDateString('es-HN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  
  return `${quarter} - ${period.per_anio} (${inicio} - ${fin})`;
}


  /**
   * Selecciona un docente del dropdown
   */
  selectTeacher(teacher: Teachers) {
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

    const exists = this.selectedSubjects.some(s => s.subject.mat_codigo === subjectCode);
    if (exists) {
      alert('Esta materia ya está en tu lista de solicitudes');
      return;
    }

    this.selectedSubjects.push({ subject, teacher });

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
    if (this.requestForm.get('classCode')?.value) {
      this.requestForm.patchValue({ classCode: '' });
    }
  }

  onClassSelect() {
    const selectedCode = this.requestForm.get('classCode')?.value;
    this.selectedSubject = this.availableSubjects.find(s => s.mat_codigo === selectedCode) || null;
  }


  /** Retorna true si se puede habilitar el botón de envío */
canSubmit(): boolean {
  // Evita múltiples envíos
  if (this.isSubmitting) return false;

  // Debe haber al menos una materia añadida
  if (this.selectedSubjects.length === 0) return false;

  // Todas las materias deben tener campus, modalidad, período y scheduleCode
  const incomplete = this.selectedSubjects.some(s =>
    !s.campus || !s.modality || !s.period || !s.schedule?.scheduleCode
  );

  return !incomplete;
}
onSubmit() {
  if (this.selectedSubjects.length === 0) {
    alert('Por favor agregue al menos una materia a su solicitud');
    return;
  }

  // Verificar que todas las materias tengan la configuración necesaria
  const incompleteSubjects = this.selectedSubjects.some(subject => 
    !subject.campus || !subject.modality || !subject.period || !subject.schedule?.scheduleCode
  );

  if (incompleteSubjects) {
    alert('Por favor complete la configuración de todas las materias antes de enviar la solicitud.');
    return;
  }

  if (this.isSubmitting) {
    return;
  }

  if (confirm('¿Está seguro que desea enviar la solicitud de apertura de clases?')) {
    this.isSubmitting = true;

    // Obtener el usuario actual del servicio de autenticación
    const currentUser = this.authService.currentUserValue;

    // Debug completo
    console.log('=== DEBUG USUARIO ===');
    console.log('currentUser:', currentUser);
    console.log('localStorage currentUser:', localStorage.getItem('currentUser'));
    
    // Verificar si el usuario existe
    if (!currentUser) {
      console.error('No se encontró la sesión del usuario');
      
      // Intentar recuperar de localStorage como fallback
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        console.log('Intentando recuperar de localStorage...');
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('Usuario recuperado de localStorage:', parsedUser);
          
          if (parsedUser.usu_codigo) {
            // Usar el usuario recuperado
            this.processRequest(parsedUser);
            return;
          }
        } catch (e) {
          console.error('Error al parsear usuario de localStorage:', e);
        }
      }
      
      alert('No se pudo identificar su cuenta. Por favor, inicie sesión nuevamente.');
      this.isSubmitting = false;
      this.router.navigate(['/auth/login']);
      return;
    }

    // Verificar que tenga el código de usuario
    if (!currentUser.usu_codigo) {
      console.error('El usuario no tiene código:', currentUser);
      alert('Error: No se encontró el código de usuario. Por favor, inicie sesión nuevamente.');
      this.isSubmitting = false;
      this.router.navigate(['/auth/login']);
      return;
    }

    // Si todo está bien, procesar la solicitud
    this.processRequest(currentUser);
  }
}

/**
 * Procesa la solicitud de apertura de clases
 */
private processRequest(user: any) {
  const requestData = {
    pre_codest: user.usu_codigo,
    created_by: user.usu_nombre || user.usu_email || 'USUARIO_DESCONOCIDO',
    materias: this.selectedSubjects.map((subject, index) => ({
      mat_codigo: subject.subject.mat_codigo,
      hor_codigo: subject.schedule?.scheduleCode?.toString() || '',
      doc_codigo: subject.teacher.doc_codigo,
      mod_codigo: subject.modality || '',
      cam_codigo: subject.campus || '',
      per_codigo: subject.period || '',
      pre_prioridad: index + 1,
      pre_observacion: subject.observations || ''
    }))
  };

  console.log('=== DATOS A ENVIAR ===');
  console.log('Request Data:', JSON.stringify(requestData, null, 2));
  console.log('URL:', `${environment.apiBaseUrl}/Requests/CreateAssignment`);

  const apiUrl = `${environment.apiBaseUrl}/Requests/CreateAssignment`;

  this.http.post<ApiResponse<any>>(apiUrl, requestData, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'XApiKey': environment.apiKey
    },
    withCredentials: true
  }).subscribe({
    next: (response) => {
      console.log('=== RESPUESTA DEL SERVIDOR ===');
      console.log(response);
      this.isSubmitting = false;

      if (response && response.success) {
        alert('¡Solicitud enviada con éxito!');
        this.router.navigate(['/dashboard']);
      } else {
        const errorMessage = response?.message || 'Error al procesar la solicitud';
        console.error('Error en la respuesta:', response);
        alert(errorMessage);
      }
    },
    error: (error) => {
      console.error('=== ERROR EN LA PETICIÓN ===');
      console.error('Error completo:', error);
      console.error('Status:', error.status);
      console.error('Error details:', error.error);
      
      this.isSubmitting = false;
      
      let errorMessage = 'Error al enviar la solicitud. Por favor, intente nuevamente.';
      if (error.status === 0) {
        errorMessage = 'No se pudo conectar al servidor. Verifique su conexión a internet.';
      } else if (error.status === 401) {
        errorMessage = 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
        this.router.navigate(['/auth/login']);
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  });
}


  onCancel() {
    this.router.navigate(['/website']);
  }

  goToMyRequests() {
    this.router.navigate(['/website/myrequests']);
  }

  /**
   * Abre el modal para editar todos los datos de una materia
   */
  openSubjectModal(index: number) {
    this.editingSubjectIndex = index;
    const item = this.selectedSubjects[index];
    
    if (item.schedule) {
      this.tempDayPattern = this.dayPatterns.find(p => p.value === item.schedule!.dayPattern);
      this.tempStartTime = item.schedule.startTime;
      this.tempEndTime = item.schedule.endTime;
      this.tempScheduleCode = item.schedule.scheduleCode ?? null;
    } else {
      this.tempDayPattern = null;
      this.tempStartTime = '';
      this.tempEndTime = '';
      this.tempScheduleCode = null;
    }
    
    this.tempCampus = item.campus || '';
    this.tempModality = item.modality || '';
    this.tempPeriod = item.period || '';
    this.tempObservations = item.observations || '';
  }

  /**
   * Cierra el modal de edición de materia
   */
  closeSubjectModal() {
    this.editingSubjectIndex = -1;
    this.tempDayPattern = null;
    this.tempStartTime = '';
    this.tempEndTime = '';
    this.tempCampus = '';
    this.tempModality = '';
    this.tempPeriod = '';
    this.tempObservations = '';
    this.tempScheduleCode = null;
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
   * Guarda todos los datos de la materia
   */
  saveSubjectData() {
    if (!this.tempScheduleCode) {
      alert('Por favor selecciona un horario');
      return;
    }

    if (!this.tempCampus || !this.tempModality || !this.tempPeriod) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (this.editingSubjectIndex >= 0) {
      const schedule = this.availableSchedules.find(s => s.hor_codigo === this.tempScheduleCode!);
      if (!schedule) {
        alert('Horario seleccionado no válido');
        return;
      }

      this.selectedSubjects[this.editingSubjectIndex].schedule = {
        scheduleCode: schedule.hor_codigo,
        dayPattern: schedule.hor_dia_semana_nombre,
        startTime: schedule.hor_hora_inicio,
        endTime: schedule.hor_hora_fin,
        formatted: `${schedule.hor_dia_semana_nombre}: ${this.formatTime(schedule.hor_hora_inicio)} - ${this.formatTime(schedule.hor_hora_fin)}`
      };
      this.selectedSubjects[this.editingSubjectIndex].campus = this.tempCampus;
      this.selectedSubjects[this.editingSubjectIndex].modality = this.tempModality;
      this.selectedSubjects[this.editingSubjectIndex].period = this.tempPeriod;
      this.selectedSubjects[this.editingSubjectIndex].observations = this.tempObservations;
    }

    this.closeSubjectModal();
  }

  /**
   * Obtiene el texto formateado del horario temporal
   */
  getTempFormattedSchedule(): string {
    if (this.tempScheduleCode) {
      const schedule = this.availableSchedules.find(s => s.hor_codigo === this.tempScheduleCode!);
      if (!schedule) return '';
      return `${schedule.hor_dia_semana_nombre}: ${this.formatTime(schedule.hor_hora_inicio)} - ${this.formatTime(schedule.hor_hora_fin)}`;
    }

    if (this.tempDayPattern && this.tempStartTime && this.tempEndTime) {
      return `${this.tempDayPattern.label}: ${this.formatTime(this.tempStartTime)} - ${this.formatTime(this.tempEndTime)}`;
    }

    return '';
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
   * Obtiene el nombre del campus por código
   */
  getCampusName(code: string): string {
    const campus = this.availableCampus.find(c => c.cam_codigo === code);
    return campus ? `${campus.cam_nombre} - ${campus.cam_ciudad}` : code;
  }

  /**
   * Obtiene el nombre de la modalidad por código
   */
  getModalityName(code: string): string {
    const modality = this.availableModalities.find(m => m.mod_codigo === code);
    return modality ? modality.mod_nombre : code;
  }

/**
 * Obtiene el nombre del período por código
 */
getPeriodName(code: string): string {
  const period = this.availablePeriods.find(p => p.per_codigo === code);
  return period ? this.formatPeriodLabel(period) : code;
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