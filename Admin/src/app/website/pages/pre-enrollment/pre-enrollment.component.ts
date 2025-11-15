import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OffersService } from '../../../core/services/offers.service';
import { OfferList } from '../../../Modelos/uni/academic-offer.model';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pre-enrollment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pre-enrollment.component.html',
  styleUrl: './pre-enrollment.component.scss'
})
export class PreEnrollmentComponent implements OnInit {
  offers: OfferList[] = [];
  filteredOffers: OfferList[] = [];
  selectedOffers: OfferList[] = [];

  isLoading: boolean = false;
  errorMessage: string = '';

  searchTerm: string = '';
  selectedCampus: string = 'all';
  campusOptions: string[] = [];

  submitting: boolean = false;

  constructor(
    private offersService: OffersService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.offersService.getOfferList().subscribe({
      next: (response: any) => {
        this.offers = response?.data || [];
        this.buildCampusOptions();
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Ocurrió un error al cargar la oferta académica. Intente nuevamente.';
        this.isLoading = false;
      }
    });
  }

  buildCampusOptions(): void {
    const campusSet = new Set<string>();
    this.offers.forEach(o => { if (o.campus) campusSet.add(o.campus); });
    this.campusOptions = Array.from(campusSet);
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredOffers = this.offers.filter(o => {
      const matchesTerm = !term
        || o.materia.toLowerCase().includes(term)
        || o.codigo.toLowerCase().includes(term)
        || (o.docente || '').toLowerCase().includes(term);
      const matchesCampus = this.selectedCampus === 'all' || o.campus === this.selectedCampus;
      return matchesTerm && matchesCampus;
    });
  }

  onSearchTermChange(): void { this.applyFilters(); }
  onCampusChange(): void { this.applyFilters(); }

  getOfferKey(o: OfferList): string { return `${o.codigo}|${o.seccion}|${o.campus}`; }
  isSelected(o: OfferList): boolean { return this.selectedOffers.some(s => this.getOfferKey(s) === this.getOfferKey(o)); }

  toggleSelect(o: OfferList): void {
    const key = this.getOfferKey(o);
    const idx = this.selectedOffers.findIndex(s => this.getOfferKey(s) === key);
    if (idx >= 0) {
      this.selectedOffers.splice(idx, 1);
      this.toastr.info('Se quitó de tu prematrícula');
    } else {
      if ((o.cupos ?? 0) <= 0) {
        this.toastr.warning('No hay cupos disponibles para esta sección');
        return;
      }
      this.selectedOffers.push(o);
      this.toastr.success('Agregada a tu prematrícula');
    }
  }

  removeSelected(o: OfferList): void {
    const key = this.getOfferKey(o);
    this.selectedOffers = this.selectedOffers.filter(s => this.getOfferKey(s) !== key);
    this.toastr.info('Se quitó de tu prematrícula');
  }

  clearSelection(): void {
    this.selectedOffers = [];
    this.toastr.info('Selección vaciada');
  }

  submitPreEnrollment(): void {
    if (this.selectedOffers.length === 0) {
      this.toastr.warning('Por favor selecciona al menos una materia');
      return;
    }
    Swal.fire({
      title: 'Enviar prematrícula',
      text: `Se enviarán ${this.selectedOffers.length} materia(s) seleccionada(s). ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#141a2f',
      cancelButtonColor: '#9ca3af',
      reverseButtons: true
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.submitting = true;
      setTimeout(() => {
        this.submitting = false;
        this.toastr.success('¡Prematrícula enviada!');
        this.selectedOffers = [];
      }, 600);
    });
  }

  trackByOffer = (_: number, o: OfferList) => this.getOfferKey(o);
}
