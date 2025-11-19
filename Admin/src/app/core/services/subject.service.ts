import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Subject } from '../../Modelos/uni/subject.model';
import { CareerSubject } from '../../Modelos/uni/career-subject.model';

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
export class SubjectService {
  private apiUrl = `${environment.apiBaseUrl}/Subjects`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de todas las materias
   */
  getSubjectsList(): Observable<ApiResponse<Subject[]>> {
    const headers = new HttpHeaders({
      'XApiKey': environment.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.get<ApiResponse<Subject[]>>(`${this.apiUrl}/List`, {
      headers,
      withCredentials: true
    });
  }

  /**
   * Obtiene las materias del plan de la carrera para un estudiante específico
   */
  getCareerSubjects(studentId: string, careerCode: string): Observable<ApiResponse<CareerSubject[]>> {
    const headers = new HttpHeaders({
      'XApiKey': environment.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.get<ApiResponse<CareerSubject[]>>(
      `${this.apiUrl}/career-subjects/${studentId}/${careerCode}`,
      {
        headers,
        withCredentials: true
      }
    );
  }
}
