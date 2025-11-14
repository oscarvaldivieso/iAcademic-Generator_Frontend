import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestsList } from '../../../Modelos/pre/requests-list.model';
import { RequestsService } from '../../../core/services/requests.service';

@Component({
  selector: 'app-requests-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './requests-list.component.html',
  styleUrl: './requests-list.component.scss'
})
export class RequestsListComponent implements OnInit {
  requests: RequestsList[] = [];
  filteredRequests: RequestsList[] = [];

  searchTerm: string = '';
  statusFilter: string = 'all';
  priorityFilter: string = 'all';

  isLoading: boolean = false;
  errorMessage: string = '';

  // TODO: reemplazar este valor por el código del estudiante autenticado
  private readonly studentCode: string = '62341129';

  constructor(private requestsService: RequestsService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.requestsService.getRequestsByStudent(this.studentCode).subscribe({
      next: (response) => {
        if (response && response.success && Array.isArray(response.data)) {
          this.requests = response.data.map((item: any) =>
            new RequestsList({
              ...item,
              pre_prioridad: !!item.pre_prioridad,
              pre_fecha: item.pre_fecha ? new Date(item.pre_fecha) : undefined,
              created_at: item.created_at ? new Date(item.created_at) : undefined,
              updated_at: item.updated_at ? new Date(item.updated_at) : null
            })
          );
          this.applyFilters();
        } else {
          this.requests = [];
          this.filteredRequests = [];
          this.errorMessage = response?.message || 'No se pudo obtener el listado de solicitudes.';
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar solicitudes:', error);
        this.requests = [];
        this.filteredRequests = [];
        this.errorMessage = 'Ocurrió un error al cargar tus solicitudes. Intenta nuevamente.';
        this.isLoading = false;
      }
    });
  }

  get totalRequests(): number {
    return this.filteredRequests.length;
  }

  get pendingRequests(): number {
    return this.filteredRequests.filter(r => (r.pre_estado || '').toUpperCase() === 'PENDIENTE').length;
  }

  get highPriorityRequests(): number {
    return this.filteredRequests.filter(r => !!r.pre_prioridad).length;
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();
    const status = this.statusFilter;
    const priority = this.priorityFilter;

    this.filteredRequests = this.requests.filter(request => {
      const matchesTerm = !term ||
        request.mat_nombre.toLowerCase().includes(term) ||
        request.mat_codigo.toLowerCase().includes(term) ||
        request.doc_nombre.toLowerCase().includes(term) ||
        request.periodo.toLowerCase().includes(term) ||
        request.pre_codest.toLowerCase().includes(term);

      const normalizedStatus = (request.pre_estado || '').toUpperCase();
      const matchesStatus = status === 'all' || normalizedStatus === status.toUpperCase();

      const isHighPriority = !!request.pre_prioridad;
      const matchesPriority =
        priority === 'all' ||
        (priority === 'high' && isHighPriority) ||
        (priority === 'normal' && !isHighPriority);

      return matchesTerm && matchesStatus && matchesPriority;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onPriorityFilterChange(): void {
    this.applyFilters();
  }

  getStatusClass(status: string): string {
    const value = (status || '').toUpperCase();
    if (value === 'PENDIENTE') {
      return 'status-pill-pending';
    }
    if (value === 'APROBADA' || value === 'APROBADO') {
      return 'status-pill-approved';
    }
    if (value === 'RECHAZADA' || value === 'RECHAZADO') {
      return 'status-pill-rejected';
    }
    return 'status-pill-default';
  }
}
