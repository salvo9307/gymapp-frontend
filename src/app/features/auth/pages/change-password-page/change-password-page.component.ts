import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TokenService } from '../../../../core/services/token.service';

@Component({
  selector: 'app-change-password-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password-page.component.html',
  styleUrl: './change-password-page.component.scss'
})
export class ChangePasswordPageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  errorMessage = '';
  successMessage = '';
  isLoading = false;

  changePasswordForm = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    },
    {
      validators: [this.passwordMatchValidator]
    }
  );

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    this.authService.changePassword({
      currentPassword: this.changePasswordForm.value.currentPassword!,
      newPassword: this.changePasswordForm.value.newPassword!,
      confirmPassword: this.changePasswordForm.value.confirmPassword!
    }).subscribe({
      next: () => {
        this.successMessage = 'Password aggiornata con successo. Reindirizzamento in corso...';

        const role = this.tokenService.getUserRole();

        setTimeout(() => {
          if (role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else if (role === 'MANAGER') {
            this.router.navigate(['/manager/dashboard']);
          } else if (role === 'USER') {
            this.router.navigate(['/app/workout']);
          } else {
            this.router.navigate(['/login']);
          }
        }, 800);
      },
      error: err => {
        this.isLoading = false;
        console.error('CHANGE PASSWORD ERROR', err);
        this.errorMessage =
          err?.error?.message || `Errore cambio password - status: ${err?.status ?? 'sconosciuto'}`;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}