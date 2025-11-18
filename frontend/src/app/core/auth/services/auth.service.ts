import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../api/api.service';
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from 'shared/types';

const TOKEN_KEY = 'auth_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiService = inject(ApiService);

  /**
   * Register a new user
   */
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('auth/register', request).pipe(
      tap((response) => this.storeToken(response.access_token))
    );
  }

  /**
   * Login user
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('auth/login', request).pipe(
      tap((response) => this.storeToken(response.access_token))
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    this.clearToken();
  }

  /**
   * Get current user profile
   */
  getProfile(): Observable<User> {
    return this.apiService.get<User>('auth/profile');
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Store token in localStorage
   */
  private storeToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Clear token from localStorage
   */
  private clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }
}
