import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../constants';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'blog_jwt_token';

  constructor(private http: HttpClient, private router: Router) {}

  register(payload: RegisterRequest): Observable<string> {
    return this.http.post(`${API_BASE_URL}/auth/register`, payload, { responseType: 'text' });
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/login`, payload).pipe(
      tap((response) => localStorage.setItem(this.tokenKey, response.token))
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  logout(redirectToLogin = true): void {
    localStorage.removeItem(this.tokenKey);
    if (redirectToLogin) {
      this.router.navigate(['/login']);
    }
  }

  logoutIfTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    if (this.isTokenExpired(token)) {
      this.logout();
      return true;
    }
    return false;
  }

  isTokenExpired(token: string): boolean {
    const payload = this.parseTokenPayload(token);
    if (!payload?.exp) {
      return true;
    }
    return Date.now() >= payload.exp * 1000;
  }

  getLoggedInUsername(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    const payload = this.parseTokenPayload(token);
    return payload?.sub ?? null;
  }

  private parseTokenPayload(token: string): { exp?: number; sub?: string } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      // JWT payload uses base64url encoding; convert before decoding.
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const payload = atob(padded);
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }
}
