import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OfferList } from 'src/app/Modelos/uni/academic-offer.model';

interface ApiResponse<T> {
  type: number;
  code: number;
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class OffersService {
  private apiUrl = `${environment.apiBaseUrl}/Offers`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de todas las materias
   */
  getOfferList(): Observable<ApiResponse<OfferList[]>> {
    const headers = new HttpHeaders({
      'XApiKey': environment.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.get<ApiResponse<OfferList[]>>(`${this.apiUrl}/List`, {
      headers,
      withCredentials: true
    });
  }
}
