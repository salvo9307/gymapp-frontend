import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TokenService } from '../../../core/services/token.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  private tokenService = inject(TokenService);
  private authService = inject(AuthService);
  private router = inject(Router);

  get userEmail(): string {
    return this.tokenService.getUserEmail() ?? '';
  }

  get userRole(): string {
    return this.tokenService.getUserRole() ?? '';
  }

  get isAdmin(): boolean {
  return this.userRole === 'ADMIN';
  }

  get isManager(): boolean {
    return this.userRole === 'MANAGER';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}