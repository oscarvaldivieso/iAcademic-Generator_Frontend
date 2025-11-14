import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Schedule } from '../../Modelos/uni/schedule.model';

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
export class ScheduleService {
  private apiUrl = `${environment.apiBaseUrl}/Schedules`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de horarios
   */
  getSchedulesList(): Observable<ApiResponse<Schedule[]>> {
    const headers = new HttpHeaders({
      'XApiKey': environment.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.get<ApiResponse<Schedule[]>>(`${this.apiUrl}/List`, {
      headers,
      withCredentials: true
    });
  }
}
