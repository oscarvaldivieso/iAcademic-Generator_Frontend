import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CreateComponent } from '../create/create.component';
import { EditComponent } from '../edit/edit.component';
import { User } from 'src/app/Modelos/sec/user.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PaginationModule,
    CreateComponent,
    EditComponent
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  // Breadcrumbs
  pageTitle = 'Usuarios';
  breadCrumbItems: Array<{ label: string; active?: boolean }> = [
    { label: 'Seguridad' },
    { label: 'Usuarios', active: true }
  ];

  // Lista de usuarios
  users: User[] = [];
  filteredUsers: User[] = [];
  pagedUsers: User[] = [];

  // Filtros y búsqueda
  searchTerm: string = '';

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  selectedUser: User | null = null;

  // API URL
  private apiUrl = `${environment.apiBaseUrl}/api/Users`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // Cargar usuarios desde la API
  loadUsers(): void {
    this.http.get<{data: User[]}>(this.apiUrl).subscribe({
      next: (response) => {
        this.users = response.data || [];
        this.filterUsers();
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
      }
    });
  }

  // Filtrar usuarios
  filterUsers(): void {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users];
    } else {
      const searchTermLower = this.searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(user => 
        (user.usu_nombre?.toLowerCase().includes(searchTermLower)) ||
        (user.usu_email?.toLowerCase().includes(searchTermLower)) ||
        (user.usu_codigo?.toLowerCase().includes(searchTermLower))
      );
    }
    this.currentPage = 1;
    this.updatePagedUsers();
  }

  // Actualizar la lista paginada
  updatePagedUsers(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.pagedUsers = this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Cambiar página
  pageChanged(event: any): void {
    this.currentPage = event.page;
    this.updatePagedUsers();
  }

  // Abrir modal de creación
  openCreateModal(): void {
    this.showCreateModal = true;
  }

  // Cerrar modal de creación
  onCloseCreateModal(): void {
    this.showCreateModal = false;
    this.loadUsers();
  }

  // Abrir modal de edición
  openEditModal(user: User): void {
    this.selectedUser = { ...user };
    this.showEditModal = true;
  }

  // Cerrar modal de edición
  onCloseEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
    this.loadUsers();
  }

  // Eliminar usuario
  deleteUser(user: User): void {
    if (confirm(`¿Está seguro de eliminar al usuario ${user.usu_nombre}?`)) {
      this.http.delete(`${this.apiUrl}/${user.usu_codigo}`).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error al eliminar usuario:', error);
        }
      });
    }
  }

  // Formatear fecha
  formatDate(dateString: string | Date | undefined | null): string {
    if (!dateString) return 'Nunca';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Fecha inválida' : date.toLocaleString();
    } catch (e) {
      return 'Fecha inválida';
    }
  }
}
