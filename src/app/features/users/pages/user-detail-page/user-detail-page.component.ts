import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
  styleUrls: ['./user-detail-page.component.scss']
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

  showRenewModal = signal(false);
  selectedMonths = signal(1);
  selectedStartDate = signal('');
  isRenewingSubscription = signal(false);

  previewEndDate = computed(() => {
    const startDate = this.selectedStartDate();
    const months = this.selectedMonths();

    if (!startDate || !months) {
      return null;
    }

    const date = new Date(startDate);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    date.setMonth(date.getMonth() + months);
    return date;
  });

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
        this.user.update(user => (user ? { ...user, active: newStatus } : user));
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
    const currentUser = this.user();
    if (!currentUser?.subscriptionEndDate) return false;

    const endDate = new Date(currentUser.subscriptionEndDate);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() - 2);

    return endDate >= today;
  }

  openRenewModal(months: number): void {
    this.successMessage.set('');
    this.formErrorMessage.set('');
    this.selectedMonths.set(months);

    const subscriptionEndDate = this.user()?.subscriptionEndDate;

    if (subscriptionEndDate) {
      this.selectedStartDate.set(this.toDateInputValue(subscriptionEndDate));
    } else {
      this.selectedStartDate.set(this.getTodayDateString());
    }

    this.showRenewModal.set(true);
  }

  closeRenewModal(): void {
    if (this.isRenewingSubscription()) {
      return;
    }

    this.showRenewModal.set(false);
    this.selectedMonths.set(1);
    this.selectedStartDate.set('');
    this.formErrorMessage.set('');
  }

  onRenewMonthsChange(value: string): void {
    this.selectedMonths.set(Number(value));
  }

  onRenewStartDateChange(value: string): void {
    this.selectedStartDate.set(value);
  }

  confirmRenewSubscription(): void {
    const currentUser = this.user();
    const userId = currentUser?.id;
    const months = this.selectedMonths();
    const startDate = this.selectedStartDate();

    this.successMessage.set('');
    this.formErrorMessage.set('');

    if (!userId) {
      return;
    }

    if (!startDate) {
      this.formErrorMessage.set('Seleziona una data di inizio');
      return;
    }

    if (!months || months <= 0) {
      this.formErrorMessage.set('Seleziona una durata valida');
      return;
    }

    if (this.isRenewingSubscription()) {
      return;
    }

    this.isRenewingSubscription.set(true);

    this.userService.renewSubscription(userId, {
      months,
      startDate
    }).subscribe({
      next: () => {
        this.isRenewingSubscription.set(false);
        this.showRenewModal.set(false);
        this.selectedMonths.set(1);
        this.selectedStartDate.set('');
        this.loadUser(userId);
        this.successMessage.set('Abbonamento aggiornato con successo');
      },
      error: err => {
        console.error('Errore rinnovo abbonamento', err);
        this.isRenewingSubscription.set(false);
        this.formErrorMessage.set(
          err?.error?.message || 'Errore durante il rinnovo abbonamento'
        );
      }
    });
  }

  formatPreviewDate(date: Date | null): string {
    if (!date) {
      return '';
    }

    return new Intl.DateTimeFormat('it-IT').format(date);
  }

  private getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toDateInputValue(dateValue: string | Date): string {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
}