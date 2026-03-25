import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-user-app-login-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-app-login-page.component.html',
  styleUrl: './user-app-login-page.component.scss'
})
export class UserAppLoginPageComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  isLoading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    if (this.authService.isUser()) {
      this.router.navigate(['/app/workout']);
    }
  }

  onEmailChange(value: string): void {
    this.email.set(value);
  }

  onPasswordChange(value: string): void {
    this.password.set(value);
  }

  submitLogin(): void {
    const email = this.email().trim();
    const password = this.password().trim();

    this.errorMessage.set('');

    if (!email || !password) {
      this.errorMessage.set('Inserisci email e password');
      return;
    }

    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.isLoading.set(false);

        if (!this.authService.isUser()) {
          this.errorMessage.set('Questa area è riservata agli utenti finali');
          this.authService.logout();
          return;
        }

        this.router.navigate(['/app/workout']);
      },
      error: err => {
        console.error('APP LOGIN ERROR', err);
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'Credenziali non valide');
      }
    });
  }
}