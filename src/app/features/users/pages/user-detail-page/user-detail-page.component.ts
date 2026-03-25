import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { WorkoutService } from '../../../../core/services/workout.service';
import { UserDetailResponse } from '../../../../core/models/user.models';

@Component({
  selector: 'app-user-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-detail-page.component.html',
  styleUrl: './user-detail-page.component.scss'
})
export class UserDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private workoutService = inject(WorkoutService);

  user = signal<UserDetailResponse | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');
  userId = signal<number | null>(null);
  isUpdatingStatus = signal(false);
  showResetPasswordForm = signal(false);
  newPassword = signal('');
  isResettingPassword = signal(false);
  successMessage = signal('');
  formErrorMessage = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || Number.isNaN(id)) {
      this.errorMessage.set('ID utente non valido');
      this.isLoading.set(false);
      return;
    }

    this.userId.set(id);
    this.loadUser(id);
  }

  loadUser(userId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userService.getUserDetail(userId).subscribe({
      next: response => {
        this.user.set(response);
        this.isLoading.set(false);
      },
      error: err => {
        console.error('USER DETAIL ERROR', err);
        this.errorMessage.set(err?.error?.message || 'Errore nel caricamento dettaglio utente');
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/manager/users']);
  }

  openWorkoutPlan(): void {
    const userId = this.userId();
    if (!userId) return;

    this.router.navigate(['/manager/users', userId, 'workout-plan']);
  }

  createWorkoutPlan(): void {
    const userId = this.userId();
    if (!userId) return;

    this.router.navigate(['/manager/users', userId, 'workout-plan', 'new']);
  }

  editWorkoutPlan(): void {
    const userId = this.userId();
    if (!userId) return;

    this.router.navigate(['/manager/users', userId, 'workout-plan', 'edit']);
  }

  duplicateWorkoutPlan(): void {
    const currentUser = this.user();
    const workoutPlanId = currentUser?.latestWorkoutPlanId;
    const userId = currentUser?.id;

    if (!workoutPlanId || !userId) {
      return;
    }

    this.workoutService.duplicateWorkoutPlan(workoutPlanId).subscribe({
      next: () => {
        this.router.navigate(['/manager/users', userId, 'workout-plan', 'edit']);
      },
      error: err => {
        console.error('Errore duplicazione scheda', err);
        alert('Errore durante la duplicazione della scheda');
      }
    });
  }

  toggleUserStatus(): void {
    const currentUser = this.user();
    const userId = currentUser?.id;

    if (!currentUser || !userId || this.isUpdatingStatus()) {
      return;
    }

    const newStatus = !currentUser.active;

    this.isUpdatingStatus.set(true);

    this.userService.updateUserStatus(userId, { active: newStatus }).subscribe({
      next: () => {
        this.user.update(user =>
          user ? { ...user, active: newStatus } : user
        );
        this.isUpdatingStatus.set(false);
      },
      error: err => {
        console.error('Errore aggiornamento stato utente', err);
        alert(err?.error?.message || 'Errore durante l’aggiornamento dello stato utente');
        this.isUpdatingStatus.set(false);
      }
    });
  }

  toggleResetPasswordForm(): void {
    this.showResetPasswordForm.update(value => !value);
    this.newPassword.set('');
    this.formErrorMessage.set('');
    this.successMessage.set('');
  }

  onNewPasswordChange(value: string): void {
    this.newPassword.set(value);
  }

  submitResetPassword(): void {
    const currentUser = this.user();
    const userId = currentUser?.id;
    const password = this.newPassword().trim();

    this.successMessage.set('');
    this.formErrorMessage.set('');

    if (!userId) {
      return;
    }

    if (!password) {
      this.formErrorMessage.set('Inserisci una nuova password');
      return;
    }

    if (password.length < 6) {
      this.formErrorMessage.set('La password deve contenere almeno 6 caratteri');
      return;
    }

    if (this.isResettingPassword()) {
      return;
    }
    

    this.isResettingPassword.set(true);

    this.userService.resetUserPassword(userId, { newPassword: password }).subscribe({
      next: () => {
        this.isResettingPassword.set(false);
        this.showResetPasswordForm.set(false);
        this.newPassword.set('');
        this.formErrorMessage.set('');
        this.successMessage.set('Password aggiornata con successo');
      },
      error: err => {
        console.error('Errore reset password', err);
        this.isResettingPassword.set(false);
        this.formErrorMessage.set(
          err?.error?.message || 'Errore durante il reset password'
        );
      }
    });
  }

  isSubscriptionActive(): boolean {
    const user = this.user();
    if (!user?.subscriptionEndDate) return false;

    const endDate = new Date(user.subscriptionEndDate);
    const today = new Date();

    // tolleranza 2 giorni
    today.setDate(today.getDate() - 2);

    return endDate >= today;
  }

  renew(months: number): void {
    const currentUser = this.user();
    const userId = currentUser?.id;

    if (!userId) return;

    this.userService.renewSubscription(userId, months).subscribe({
      next: () => {
        this.loadUser(userId); // 🔥 refresh dati
        this.successMessage.set('Abbonamento aggiornato');
      },
      error: err => {
        console.error('Errore rinnovo abbonamento', err);
        this.formErrorMessage.set(
          err?.error?.message || 'Errore durante il rinnovo abbonamento'
        );
      }
    });
  }
}