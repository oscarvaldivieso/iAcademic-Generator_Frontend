import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsComponent } from 'src/app/shared/breadcrumbs/breadcrumbs.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { Students } from 'src/app/Modelos/exp/student.model';
import { Careers } from 'src/app/Modelos/uni/career.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CreateComponent } from '../create/create.component';
import { EditComponent } from '../edit/edit.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BreadcrumbsComponent,
    PaginationModule,
    CreateComponent,
    EditComponent
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  // Breadcrumbs
  breadCrumbItems = [
    { label: 'Estudiantes', active: true }
  ];

  // Lista de estudiantes y carreras
  students: Students[] = [];
  careers: Careers[] = [];
  filteredStudents: Students[] = [];
  pagedStudents: Students[] = [];

  // Filtros y búsqueda
  searchTerm: string = '';
  selectedCareer: string = '';

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDetailsModal = false;
  showUploadModal = false;

  // Upload states
  isDragging = false;
  selectedFile: File | null = null;
  isUploading = false;
  selectedStudent: Students | null = null;

  // Alert states
  mostrarAlertaExito = false;
  mensajeExito = '';
  mostrarAlertaError = false;
  mensajeError = '';
  mostrarAlertaWarning = false;
  mensajeWarning = '';

  constructor(private http: HttpClient) {}

  // Métodos para el modal de carga
  openUploadModal(): void {
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.selectedFile = null;
    this.isDragging = false;
  }

  // Métodos para el manejo de archivos
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File): void {
    // Verificar el tipo de archivo
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(file.type)) {
      this.mostrarAlertaWarning = true;
      this.mensajeWarning = 'Por favor, seleccione un archivo Excel válido (.xls o .xlsx)';
      setTimeout(() => {
        this.mostrarAlertaWarning = false;
      }, 3000);
      return;
    }

    this.selectedFile = file;
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const workBook = XLSX.read(e.target.result, { type: 'binary' });
        const sheetName = workBook.SheetNames[0];
        const workSheet = workBook.Sheets[sheetName];
        const excelData = XLSX.utils.sheet_to_json(workSheet);

        // Transformar los datos al formato esperado por la API
        const formattedData = {
          estudiantes: excelData.map((row: any) => ({
            est_codigo: row.est_codigo?.toString() || '',
            est_nombre: row.est_nombre?.toString() || '',
            est_genero: row.est_genero?.toString() || '',
            est_indice_general: parseFloat(row.est_indice_general) || 0,
            est_indice_graduacion: parseFloat(row.est_indice_graduacion) || 0,
            car_codigo: row.car_codigo?.toString() || '',
            cam_codigo: row.cam_codigo?.toString() || '',
            gru_codigo: row.gru_codigo?.toString() || '',
            car_nombre: row.car_nombre?.toString() || '',
            car_anio_plan: parseInt(row.car_anio_plan) || 0,
            car_orientacion: row.car_orientacion?.toString() || '',
            cam_nombre: row.cam_nombre?.toString() || '',
            cam_ciudad: row.cam_ciudad?.toString() || ''
          }))
        };

        // Enviar los datos al endpoint
        this.http.post<any>(`${environment.apiBaseUrl}/Students/BulkInsert`, formattedData, {
          headers: {
            'XApiKey': environment.apiKey,
            'Content-Type': 'application/json'
          }
        }).subscribe({
          next: (response) => {
            this.isUploading = false;
            this.closeUploadModal();

            const result = response.data;
            
            if (result.erroresEncontrados > 0) {
              // Si hay errores, mostrar alerta de warning con detalles
              this.mostrarAlertaWarning = true;
              this.mensajeWarning = `Proceso completado con advertencias.\n` +
                `Procesados: ${result.estudiantesInsertados + result.estudiantesActualizados} estudiantes\n` +
                `Insertados: ${result.estudiantesInsertados}\n` +
                `Actualizados: ${result.estudiantesActualizados}\n` +
                `Errores: ${result.erroresEncontrados}\n` +
                (result.errores.length > 0 ? `Detalles: ${result.errores.join(', ')}` : '');
              setTimeout(() => {
                this.mostrarAlertaWarning = false;
              }, 5000);
            } else {
              // Si no hay errores, mostrar alerta de éxito
              this.mostrarAlertaExito = true;
              this.mensajeExito = `${result.message}\n` +
                (result.carrerasCreadas > 0 ? `Carreras creadas: ${result.carrerasCreadas}\n` : '') +
                (result.campusCreados > 0 ? `Campus creados: ${result.campusCreados}` : '');
              setTimeout(() => {
                this.mostrarAlertaExito = false;
              }, 3000);
            }

            this.loadStudents(); // Recargar la lista después de la carga exitosa
          },
          error: (error) => {
            this.isUploading = false;
            console.error('Error uploading students:', error);
            this.mostrarAlertaError = true;
            this.mensajeError = error.error?.message || 'Error al procesar el archivo. Por favor, verifique el formato de los datos e intente nuevamente.';
            setTimeout(() => {
              this.mostrarAlertaError = false;
            }, 3000);
          }
        });
      } catch (error) {
        this.isUploading = false;
        console.error('Error reading Excel file:', error);
        this.mostrarAlertaError = true;
        this.mensajeError = 'Error al leer el archivo Excel. Por favor, verifique que el formato sea correcto.';
        setTimeout(() => {
          this.mostrarAlertaError = false;
        }, 3000);
      }
    };

    reader.onerror = (error) => {
      this.isUploading = false;
      console.error('Error reading file:', error);
      this.mostrarAlertaError = true;
      this.mensajeError = 'Error al leer el archivo. Por favor, intente nuevamente.';
      setTimeout(() => {
        this.mostrarAlertaError = false;
      }, 3000);
    };

    reader.readAsBinaryString(this.selectedFile);
  }

  ngOnInit(): void {
    this.loadStudents();
    this.loadCareers();
  }

  // Cargar datos
  loadStudents(): void {
    this.http.get<any>(`${environment.apiBaseUrl}/Students/list`, {
      headers: {
        'XApiKey': environment.apiKey,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    }).subscribe({
      next: (response) => {
        this.students = response.data;
        this.filterStudents();
      },
      error: (error) => {
        console.error('Error loading students:', error);
      }
    });
  }

  loadCareers(): void {
    this.http.get<any>(`${environment.apiBaseUrl}/Careers/getAll`, {
      headers: {
        'XApiKey': environment.apiKey,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    }).subscribe({
      next: (response) => {
        this.careers = response.data;
      },
      error: (error) => {
        console.error('Error loading careers:', error);
      }
    });
  }

  // Filtros
  filterStudents(): void {
    this.filteredStudents = this.students.filter(student => {
      const matchesSearch = this.searchTerm ?
        (student.est_nombre).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.est_codigo.toLowerCase().includes(this.searchTerm.toLowerCase()) :
        true;

      const matchesCareer = this.selectedCareer ?
        student.car_codigo === this.selectedCareer :
        true;

      return matchesSearch && matchesCareer;
    });

    this.updatePagedStudents();
  }

  // Paginación
  updatePagedStudents(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.pagedStudents = this.filteredStudents.slice(startIndex, startIndex + this.itemsPerPage);
  }

  pageChanged(event: any): void {
    this.currentPage = event.page;
    this.updatePagedStudents();
  }

  // Obtener nombre de carrera
  getCareerName(careerCode: string): string {
    const career = this.careers.find(c => c.car_codigo === careerCode);
    return career ? career.car_nombre : 'N/A';
  }

  // Acciones CRUD
  openCreate(): void {
    this.showCreateModal = true;
  }

  openEdit(student: Students): void {
    this.selectedStudent = student;
    this.showEditModal = true;
  }

  openDetails(student: Students): void {
    this.selectedStudent = student;
    this.showDetailsModal = true;
  }

  confirmDelete(student: Students): void {
    if (confirm(`¿Está seguro de eliminar al estudiante ${student.est_nombre}?`)) {
      this.deleteStudent(student);
    }
  }

  deleteStudent(student: Students): void {
    this.http.delete<any>(`${environment.apiBaseUrl}/Students/delete/${student.est_codigo}`, {
      headers: {
        'XApiKey': environment.apiKey,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    }).subscribe({
      next: (response) => {
        this.loadStudents();
      },
      error: (error) => {
        console.error('Error deleting student:', error);
      }
    });
  }

  // Modal callbacks
  onCreateSuccess(): void {
    this.showCreateModal = false;
    this.loadStudents();
  }

  onEditSuccess(): void {
    this.showEditModal = false;
    this.selectedStudent = null;
    this.loadStudents();
  }

  onModalClose(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDetailsModal = false;
    this.selectedStudent = null;
  }
}
