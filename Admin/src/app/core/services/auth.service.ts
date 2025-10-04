import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LoginRequest, LoginResponse, AuthData } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<AuthData | null>;
    public currentUser$: Observable<AuthData | null>;
    private apiUrl = environment.apiBaseUrl;
    private headers: HttpHeaders;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<AuthData | null>(
            this.getStoredUserData()
        );
        this.currentUser$ = this.currentUserSubject.asObservable();
        this.headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('XApiKey', environment.apiKey);
    }

    public get currentUserValue(): AuthData | null {
        return this.currentUserSubject.value;
    }

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/Auth/login`, credentials, { headers: this.headers })
            .pipe(
                map(response => {
                    if (response.success && response.data) {
                        // Store user details and jwt token in local storage
                        localStorage.setItem('currentUser', JSON.stringify(response.data));
                        this.currentUserSubject.next(response.data);
                    }
                    return response;
                }),
                catchError(error => {
                    if (error.error && error.error.data) {
                        // Formatear el mensaje de error para incluir los intentos restantes
                        const errorMessage = error.error.data.message || error.error.message;
                        return throwError(() => ({
                            message: errorMessage,
                            intentosRestantes: error.error.data.intentosRestantes
                        }));
                    }
                    return throwError(() => ({ 
                        message: 'Error al intentar iniciar sesión. Por favor, intente nuevamente.'
                    }));
                })
            );
    }

    logout(): void {
        // Remove user from local storage
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }

    private getStoredUserData(): AuthData | null {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    }

    getToken(): string | null {
        const currentUser = this.currentUserValue;
        return currentUser ? currentUser.token : null;
    }

    isLoggedIn(): boolean {
        return this.getToken() !== null;
    }
            

}