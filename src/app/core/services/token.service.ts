import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { JwtPayload } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly MUST_CHANGE_PASSWORD_KEY = 'must_change_password';

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private decodeBase64Url(value: string): string {
    let base64 = value.replace(/-/g, '+').replace(/_/g, '/');

    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    return atob(base64);
  }

  setToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearToken(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  setMustChangePassword(value: boolean): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.MUST_CHANGE_PASSWORD_KEY, String(value));
    }
  }

  getMustChangePassword(): boolean {
    if (!this.isBrowser()) return false;
    return localStorage.getItem(this.MUST_CHANGE_PASSWORD_KEY) === 'true';
  }

  clearMustChangePassword(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.MUST_CHANGE_PASSWORD_KEY);
    }
  }

  getPayload(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payloadJson = this.decodeBase64Url(parts[1]);
      return JSON.parse(payloadJson) as JwtPayload;
    } catch (error) {
      console.error('Errore parsing JWT', error);
      return null;
    }
  }

  isLoggedIn(): boolean {
    const payload = this.getPayload();
    if (!payload?.exp) return false;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  }

  getUserId(): number | null {
    return this.getPayload()?.userId ?? null;
  }

  getUserRole(): string | null {
    return this.getPayload()?.role ?? null;
  }

  getUserEmail(): string | null {
    return this.getPayload()?.sub ?? null;
  }

  logout(): void {
    this.clearToken();
    this.clearMustChangePassword();
  }
}