import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Teachers } from '../../Modelos/aca/teacher.model';

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
export class TeacherService {
  private apiUrl = `${environment.apiBaseUrl}/Teachers`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de todos los docentes
   */
  getTeachersList(): Observable<ApiResponse<Teachers[]>> {
    const headers = new HttpHeaders({
      'XApiKey': environment.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.get<ApiResponse<Teachers[]>>(`${this.apiUrl}/List`, {
      headers,
      withCredentials: true
    });
  }
}
