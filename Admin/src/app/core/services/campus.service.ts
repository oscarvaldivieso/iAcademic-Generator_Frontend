import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalComponent } from '../../global-component';
import { Campus } from '../../Modelos/uni/campus.model';

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
export class CampusService {
  private apiUrl = GlobalComponent.API_URL;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista de campus activos
   */
  getCampusList(): Observable<ApiResponse<Campus[]>> {
    const headerToken = {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
    return this.http.get<ApiResponse<Campus[]>>(
      `${this.apiUrl}Campus/list`,
      { headers: headerToken }
    );
  }

  /**
   * Obtiene un campus por código
   */
  getCampusByCode(code: string): Observable<ApiResponse<Campus>> {
    const headerToken = {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
    return this.http.get<ApiResponse<Campus>>(
      `${this.apiUrl}Campus/${code}`,
      { headers: headerToken }
    );
  }
}
