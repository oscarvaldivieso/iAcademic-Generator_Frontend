import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OffersService } from '../../../core/services/offers.service';
import { OfferList } from '../../../Modelos/uni/academic-offer.model';

@Component({
  selector: 'app-academic-offer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './academic-offer.component.html',
  styleUrl: './academic-offer.component.scss'
})
export class AcademicOfferComponent implements OnInit {
  offers: OfferList[] = [];
  filteredOffers: OfferList[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  searchTerm: string = '';
  selectedCampus: string = 'all';
  campusOptions: string[] = [];

  constructor(private offersService: OffersService) {}

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.offersService.getOfferList().subscribe({
      next: (response) => {
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
    this.offers.forEach((offer) => {
      if (offer.campus) {
        campusSet.add(offer.campus);
      }
    });
    this.campusOptions = Array.from(campusSet);
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredOffers = this.offers.filter((offer) => {
      const matchesTerm = !term ||
        offer.materia.toLowerCase().includes(term) ||
        offer.codigo.toLowerCase().includes(term) ||
        offer.docente.toLowerCase().includes(term);

      const matchesCampus = this.selectedCampus === 'all' || offer.campus === this.selectedCampus;

      return matchesTerm && matchesCampus;
    });
  }

  onSearchTermChange(): void {
    this.applyFilters();
  }

  onCampusChange(): void {
    this.applyFilters();
  }

  get totalSubjects(): number {
    return this.filteredOffers.length;
  }

  get totalSeats(): number {
    return this.filteredOffers.reduce((sum, offer) => sum + (offer.cupos || 0), 0);
  }
}
