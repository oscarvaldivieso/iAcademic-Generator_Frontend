import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authService: AuthenticationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Always add API key
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'XApiKey': environment.apiKey
        };

        // Add authorization token if available
        const token = this.authService.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Clone the request with all headers
        request = request.clone({
            setHeaders: headers
        });

        return next.handle(request);
    }
}
