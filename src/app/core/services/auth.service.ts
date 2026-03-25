import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, JwtPayload } from '../models/auth.models';
import { TokenService } from './token.service';
import { environment } from '../../../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);

  private readonly baseUrl = `${environment.apiUrl}/auth`;

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, request).pipe(
      tap(response => {
        if (!response?.token) {
          throw new Error('Token mancante nella response di login');
        }

        this.tokenService.setToken(response.token);
      })
    );
  }

  logout(): void {
    this.tokenService.logout();
  }

  isAuthenticated(): boolean {
    return this.tokenService.isLoggedIn();
  }

  getTokenPayload(): JwtPayload | null {
    return this.tokenService.getPayload();
  }

  getCurrentUserId(): number | null {
    return this.tokenService.getUserId();
  }

  getCurrentRole(): 'ADMIN' | 'MANAGER' | 'USER' | null {
    const role = this.tokenService.getUserRole();
    return role === 'ADMIN' || role === 'MANAGER' || role === 'USER' ? role : null;
  }

  isUser(): boolean {
    return this.getCurrentRole() === 'USER';
  }

  isManager(): boolean {
    return this.getCurrentRole() === 'MANAGER';
  }

  isAdmin(): boolean {
    return this.getCurrentRole() === 'ADMIN';
  }
}