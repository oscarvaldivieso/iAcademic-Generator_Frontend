import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Subject } from '../../Modelos/uni/subject.model';
import { Modality } from 'src/app/Modelos/uni/modalities.model';

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
export class ModalityService {
  private apiUrl = `${environment.apiBaseUrl}/Modalities`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de todas las materias
   */
  getModalitiesList(): Observable<ApiResponse<Modality[]>> {
    const headers = new HttpHeaders({
      'XApiKey': environment.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.get<ApiResponse<Modality[]>>(`${this.apiUrl}/List`, {
      headers,
      withCredentials: true
    });
  }
}
