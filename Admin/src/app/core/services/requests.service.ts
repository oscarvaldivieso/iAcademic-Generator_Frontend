import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RequestsList } from 'src/app/Modelos/pre/requests-list.model';

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
export class RequestsService {
  private apiUrl = `${environment.apiBaseUrl}/Requests`;

  constructor(private http: HttpClient) {}

  getRequestsByStudent(estCodigo: string): Observable<ApiResponse<RequestsList[]>> {
    const headers = new HttpHeaders({
      'XApiKey': environment.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    const url = `${this.apiUrl}/List?est_codigo=${encodeURIComponent(estCodigo)}`;

    return this.http.get<ApiResponse<RequestsList[]>>(url, {
      headers,
      withCredentials: true
    });
  }
}
