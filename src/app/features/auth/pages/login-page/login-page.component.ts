import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TokenService } from '../../../../core/services/token.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  errorMessage = '';
  sessionMessage = '';
  isLoading = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  ngOnInit(): void {
    const reason = this.route.snapshot.queryParamMap.get('reason');

    if (reason === 'expired') {
      this.sessionMessage = 'Sessione scaduta. Effettua di nuovo il login.';
    } else if (reason === 'disabled') {
      this.sessionMessage = 'Il tuo account o la tua palestra è stata disattivata.';
    } else if (reason === 'must-change-password') {
      this.sessionMessage = 'Devi cambiare la password prima di continuare.';
    } else {
      this.sessionMessage = '';
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.sessionMessage = '';
    this.isLoading = true;

    this.authService.login({
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password!
    }).subscribe({
      next: response => {
        if (response.mustChangePassword) {
          this.router.navigate(['/change-password']);
          return;
        }

        const role = this.tokenService.getUserRole();

        if (role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (role === 'MANAGER') {
          this.router.navigate(['/manager/dashboard']);
        } else if (role === 'USER') {
          this.router.navigate(['/app/workout']);
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: err => {
        this.isLoading = false;
        console.error('LOGIN ERROR', err);
        this.errorMessage =
          err?.error?.message || `Errore login - status: ${err?.status ?? 'sconosciuto'}`;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}